from langchain_openai import ChatOpenAI
from langchain import chains,agents
from langchain.agents import AgentExecutor,create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
from langchain.tools import tool
import os

load_dotenv()

temp = os.getenv("TEMPERATURE")
llm = os.getenv("MODEL")
base_url = os.getenv("URL")


@tool
def win_calculator_long(entry_price:float,close_price :float,lot_size:float): #close_price = TP
    """Calcula la ganancia de una operación en largo. close_price = TP"""
    final_price = close_price - entry_price
    win = lot_size * final_price
    return win

@tool
def calculate_worst_case(capital:int,max_drowdown:int): 
    """Calcula el riesgo máximo por operación basado en el capital y el drawdown máximo."""
    risk = max_drowdown/100
    O_p= capital * risk
    return O_p

@tool
def kelly_Criterion_formula(win_Rate:float,loose_probability:int,win_ratio:int):
    """Calcula la fracción óptima de capital a arriesgar usando la fórmula del criterio de Kelly."""
    a = win_Rate*win_ratio
    e = a - loose_probability
    optimal_loose = e/win_ratio
    return optimal_loose

tools = [win_calculator_long, calculate_worst_case, kelly_Criterion_formula]

def build_agent():
    llm = ChatOpenAI(
        openai_api_base="http://localhost:1234/v1",
        openai_api_key="lmstudio", 
        model_name="microsoft/phi-4-mini-reasoning",  
        temperature=0.2
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Eres un asistente especializado en análisis y toma de decisiones de trading cuantitativo para mercados FX. Tu rol es razonar sobre señales, verificar comprobaciones de riesgo, explicar decisiones en lenguaje claro y producir salidas estrictamente estructuradas que el orquestador validará y ejecutará. Nunca ejecutes órdenes por tu cuenta ni reemplaces la lógica determinística del sistema. Siempre debes basarte únicamente en los datos y resultados provistos por las Tools invocadas por el Agent.
Instrucciones operativas
- Actúa como analista: sintetiza información, evalúa probabilidades y chequeos de riesgo, y propone una acción (buy / sell / hold) acompañada de sizing sugerido y justificación.
- No inventes datos: si falta información necesaria para decidir, indica explícitamente qué dato falta usando la etiqueta MISSING_DATA y no emitas una acción final.
- No modifiques ni asumas parámetros de riesgo fuera de los provistos por la Tool Risk Manager. Si la petición del usuario contradice límites de riesgo, devuelve REJECTED_WITH_REASON.
- Usa las salidas del Predictor (probabilidad, feature importances) como fuente primaria para la estimación probabilística; usa razonamiento LLM solo para explicar, dar hipótesis adicionales y proponer checks, no como reemplazo del predictor.

Formato y salida obligatoria
- Responde con dos partes en este orden:
- JSON estructurado EXACTO con las siguientes claves: decision, confidence, sizing, rationale, checks, provenance, warnings.
- Explicación detallada en texto (máximo 6 párrafos).

Estilo y tono
- Técnico, conciso y orientado a pruebas; usa lenguaje claro pero no emocional.
"""),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ])
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    return executor

if __name__ == "__main__":
    executor = build_agent()
    response = executor.invoke({
        "input": "¿Qué estrategia de trading me recomiendas para hoy considerando un capital de 10000 USD y un riesgo del 2%?",
        "chat_history": []
    })
    print("\n" + "="*50)
    print("RESPUESTA FINAL:")
    print("="*50)
    print(response["output"])
