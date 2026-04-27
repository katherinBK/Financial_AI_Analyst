from agent import build_agent
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import concurrent.futures
import os

app = FastAPI()
origins = ["http://localhost:8080"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["POST","GET","PUT"],
    allow_headers = ["*"],
)
agent = build_agent()

class QueryRequest(BaseModel):
    prompt: str
    tool: str | None = None
    market: str | None = None
    metadata: dict = None
    context: list | None = None

class QueryResponse(BaseModel):
    raw: dict
    text: str

def run_agent_sync(agent, payload):
    return agent.invoke(payload)

@app.post("/api/agent/query", response_model=QueryResponse)
async def query_agent(req: QueryRequest):
    payload = payload = {
    "input": req.prompt,
    "metadata": {
        "market": req.market,
        "context": req.context,
        "tool": req.tool
    }
}
    if req.metadata:
        payload["metadata"] = req.metadata
    loop =  asyncio.get_event_loop()
    try:
        with concurrent.futures.ThreadPoolExecutor() as pool:
            result = await loop.run_in_executor(pool, run_agent_sync, agent, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return QueryResponse(raw=result, text=str(result))


