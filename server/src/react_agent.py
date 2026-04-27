from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import tool
from dotenv import load_dotenv
import os

load_dotenv()

# Cargar variables de entorno
temp = os.getenv("TEMPERATURE")
llm = os.getenv("MODEL")
base_url = os.getenv("URL")

# Definir herramientas
@tool
def win_calculator_long(entry_price: float, close_price: float, lot_size: float) -> float:
    """
    Calcula la ganancia de una operación long.
    
    Args:
        entry_price: Precio de entrada
        close_price: Precio de cierre (TP - Take Profit)
        lot_size: Tamaño del lote
    
    Returns:
        Ganancia calculada
    """
    final_price = close_price - entry_price
    win = lot_size * final_price
    return win


@tool
def calculate_worst_case(capital: int, max_drowdown: int) -> float:
    """
    Calcula el riesgo máximo por operación basado en el capital y el drawdown máximo.
    
    Args:
        capital: Capital disponible
        max_drowdown: Drawdown máximo permitido en porcentaje
    
    Returns:
        Riesgo máximo por operación
    """
    risk = max_drowdown / 100
    O_p = capital * risk
    return O_p


def build_react_agent():
    """Construye y retorna un agente Tool Calling configurado"""

    
    # Inicializar el LLM
    llm = ChatOpenAI(
        openai_api_base="http://localhost:1234/v1",
        openai_api_key="lmstudio", 
        model_name="microsoft/phi-4-mini-reasoning",  
        temperature=float(temp) if temp else 0.7
    )
    # Definir las herramientas
    tools = [calculate_worst_case, win_calculator_long]
    
    # Crear el prompt usando ChatPromptTemplate (compatible con tool calling)
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Eres un asistente experto en trading y análisis financiero.

Tu tarea es analizar predicciones y proporcionar evaluaciones claras y naturales.

Herramientas disponibles:
- calculate_worst_case: Calcula riesgo máximo (capital, max_drowdown)
- win_calculator_long: Calcula ganancias de operaciones long (entry_price, close_price, lot_size)

Instrucciones:
1. Analiza la información proporcionada
2. Usa las herramientas cuando sea necesario para obtener datos precisos
3. SIEMPRE expone claramente los RESULTADOS FINALES en tu respuesta
4. Explica tu razonamiento paso a paso de forma natural
5. Sé conciso pero conversacional (no robótico)
6. Estructura tu respuesta así:
   - Análisis inicial
   - Herramientas utilizadas y sus resultados
   - Conclusión clara con números y recomendaciones

RECUERDA: El usuario necesita ver los RESULTADOS CLAROS, no solo el análisis."""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    # Crear el agente con tool calling
    agent = create_tool_calling_agent(llm, tools, prompt)
    
    # Crear el ejecutor del agente
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5,
        return_intermediate_steps=True  # Capturar pasos intermedios
    )
    
    return agent_executor


if __name__ == "__main__":
    # Construir el agente
    agent_executor = build_react_agent()
    
    # Ejecutar consulta
    response = agent_executor.invoke({
        "input": "Si tengo un capital de 10000 dólares y quiero arriesgar máximo 2% por operación, ¿cuál es mi riesgo máximo?"
    })
    
    print("\n" + "="*50)
    print("RESPUESTA:")
    print("="*50)
    print(response["output"])
    
    # Otra consulta de ejemplo
    print("\n" + "="*50)
    response2 = agent_executor.invoke({
        "input": "Si compré a 100 dólares y vendí a 150 dólares con un lote de 2, ¿cuál fue mi ganancia?"
    })
    
    print("\n" + "="*50)
    print("RESPUESTA:")
    print("="*50)
    print(response2["output"])