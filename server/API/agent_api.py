from src.market_analyst.main.agent import build_agent
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import concurrent.futures
import os

app = FastAPI()
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credencials = True,
    allow_methods = ["POST","GET","PUT"],
    allow_headers = ["*"],
)
agent = build_agent()

class QueryRequest(BaseModel):
    input: str
    metadata: dict = None

class QueryResponse(BaseModel):
    raw: dict
    text: str

@app.post("api/agent/query", response_model=QueryResponse)
async def query_agent(req: QueryRequest):
    payload = {"input": req.input}
    if req.metadata:
        payload["metadata"] = req.metadata
    loop =  asyncio.get_event_loop()
    try:
        with concurrent.futures.ThreadPoolExecutor() as pool:
            result = await loop.run_in_executor(pool, run_agent_sync, agent, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return QueryResponse(raw=result, text=str(result))


