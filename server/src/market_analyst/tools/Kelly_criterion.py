from langchain_openai import ChatOpenAI
from langchain import chains,agents
from langchain.agents import AgentExecutor,create_tool_calling_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


@tool
def kelly_Criterion_formula(win_Rate:float,loose_probability:int,win_ratio:int):
    """formula de Kelly Criterion donde f* = (p*b - q) / b 
    - f* = Fracción óptima de capital a arriesgar
- p = Probabilidad de ganar (Win Rate)
- q = Probabilidad de perder (1 - p)
- b = Ratio ganancia/pérdida promedio
```
"""
    a = win_Rate*win_ratio
    e = a - loose_probability
    optimal_loose = e/win_ratio
    return optimal_loose
