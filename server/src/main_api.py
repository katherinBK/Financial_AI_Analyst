from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import concurrent.futures
import json
import logging
from fastapi.middleware.cors import CORSMiddleware

# Importa compiled_graph e initial_state
from main2 import create_workflow

app = FastAPI()
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str
    tool: str | None = None
    market: str | None = None
    metadata: dict | None = None
    context: list | None = None
    ejecutar_react: bool | None = None

class QueryResponse(BaseModel):
    raw: dict
    text: str
    llm_text: str | None = None
    llm_react_text: str | None = None
    think_text: list[str] | None = None

def run_graph_sync(graph, state):
    return graph.invoke(state)

def _prepare_state_from_request(req: QueryRequest) -> dict:
    """Prepara el estado inicial para la solicitud"""
    state = {
        "predicciones": [],
        "resultados": [],
        "feedback": None,
        "iteracion": 0,
        "ejecutar_react": False,
        "messages": [],
        "agent_thoughts": [],
        "user_input": req.prompt,  # IMPORTANTE: Pasar user_input
        "es_pregunta_simple": False
    }
    state["input"] = req.prompt
    if req.market is not None:
        state["market"] = req.market
    if req.context is not None:
        state["context"] = req.context
    if req.tool is not None:
        state["tool"] = req.tool
    if req.metadata is not None:
        state["metadata"] = req.metadata
    if req.ejecutar_react is not None:
        state["ejecutar_react"] = bool(req.ejecutar_react)
    else:
        state["ejecutar_react"] = (req.tool == "react") or (req.prompt and "Dame una estrategia" in req.prompt)
    return state

@app.post("/api/orchestrator/query", response_model=QueryResponse)
async def query_orchestrator(req: QueryRequest):
    state = _prepare_state_from_request(req)
    loop = asyncio.get_event_loop()
    try:
        compiled_graph = create_workflow()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            result_state = await loop.run_in_executor(pool, run_graph_sync, compiled_graph, state)
    except Exception as e:
        logging.exception("Error ejecutando el grafo")
        raise HTTPException(status_code=500, detail=str(e))

    # Extraer la respuesta del agente (feedback del ReAct o predicciones)
    feedback = result_state.get("feedback") or ""
    predicciones = result_state.get("predicciones") or []
    resultados = result_state.get("resultados") or []
    agent_thoughts = result_state.get("agent_thoughts") or []
    
    # Construir el texto de respuesta del agente
    agent_response = feedback
    if not agent_response and resultados:
        agent_response = resultados[-1].get("feedback", "") if isinstance(resultados[-1], dict) else ""
    if not agent_response and predicciones:
        agent_response = str(predicciones[0]) if predicciones else ""
    
    # Fallback si no hay respuesta
    if not agent_response:
        agent_response = "No se obtuvo respuesta del agente en esta ejecución."
    
    # Recopilar pensamientos de todos los resultados
    think_items = agent_thoughts.copy()
    for resultado in resultados:
        if isinstance(resultado, dict) and "thoughts" in resultado:
            think_items.extend(resultado["thoughts"])
    
    llm_text = agent_response
    llm_react_text = feedback

    return QueryResponse(raw=result_state, text=agent_response, llm_text=llm_text, llm_react_text=llm_react_text, think_text=think_items)