from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import concurrent.futures
import json
from main import compiled_graph, initial_state

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

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

class QueryResponse(BaseModel):
    raw: dict
    text: str

def run_graph_sync(graph, state):
    return graph.invoke(state)

@app.post("/api/orchestrator/query", response_model=QueryResponse)
async def query_orchestrator(req: QueryRequest):
    state = initial_state.copy()
    state["input"] = req.prompt
    state["market"] = req.market
    state["context"] = req.context
    state["tool"] = req.tool

    state["ejecutar_react"] = (
        (req.tool == "react") or (req.prompt.strip() == "Dame una estrategia de trading")
    )

    if req.metadata:
        state["metadata"] = req.metadata

    loop = asyncio.get_event_loop()
    try:
        with concurrent.futures.ThreadPoolExecutor() as pool:
            result_state = await loop.run_in_executor(
                pool, run_graph_sync, compiled_graph, state
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    text = json.dumps(result_state, ensure_ascii=False, indent=2)

    return QueryResponse(raw=result_state, text=text)
