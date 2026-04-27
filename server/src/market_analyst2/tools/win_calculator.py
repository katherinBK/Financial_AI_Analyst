from langchain_openai import ChatOpenAI
from langchain import chains,agents
from langchain.agents import AgentExecutor,create_tool_calling_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


@tool
def win_calculator_long(entry_price:float,close_price :float,lot_size:float): #close_price = TP
    """close_price = TP"""
    final_price = close_price - entry_price
    win = lot_size * final_price
    return win