from langchain_openai import ChatOpenAI
from langchain_core import prompt_values,prompts
from langchain_core import language_models
from trader.llm_config import agent,llm
from trader.load_prompts import load_json_prompt
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langchain_tavily import TavilySearch
from dotenv import load_dotenv
import os
load_dotenv()
model = os.getenv("MODEL")
api_key = os.getenv("API_KEY")
base_url = os.getenv("BASE_URL")
temp = os.getenv("TEMPERATURE")
max_t = os.getenv("MAX")

def build_agent():
    memory = MemorySaver()
    search = TavilySearch(max_results=2)
    tools = [search]
    agent_executor = create_react_agent(model, tools, checkpointer=memory)