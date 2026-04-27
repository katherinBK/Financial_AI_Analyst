from tabnanny import verbose

from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, tools
from langchain.agents.agent_types import AgentType
import os
from dotenv import load_dotenv
from utils.tools import win_calculator
#import pdb

#pdb.set_trace()
load_dotenv()
api_key = os.getenv("API_KEY")
base_url = os.getenv("BASE_URL")
temp = os.getenv("TEMPERATURE")
model = os.getenv("MODEL")
max_t = os.getenv("MAX")

llm = ChatOpenAI(temperature=temp, model=model, max_tokens=max_t)
agent = initialize_agent(tools, llm, verbose=False)
