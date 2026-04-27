from langchain_openai import ChatOpenAI
from langchain import chains,agents
from langchain.agents import AgentExecutor,create_tool_calling_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


@tool
def calculate_worst_case(capital:int,max_drowdown:int): 
    """Riesgo maximo por operacion
    Formula RoP    
    """
    risk = max_drowdown/100
    O_p= capital * risk
    return O_p
