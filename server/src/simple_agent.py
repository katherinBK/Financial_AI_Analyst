from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
import os

load_dotenv()

# Cargar variables de entorno
temp = os.getenv("TEMPERATURE")
llm = os.getenv("MODEL")
base_url = os.getenv("URL")


def build_simple_agent():
    """
    Construye un agente simple que responde directamente sin herramientas.
    Ideal para preguntas rápidas que no requieren análisis complejos.
    """
    
    # Inicializar el LLM
    llm = ChatOpenAI(
        openai_api_base="http://localhost:1234/v1",
        openai_api_key="lmstudio", 
        model_name="microsoft/phi-4-mini-reasoning",  
        temperature=float(temp) if temp else 0.7
    )
    
    # Crear el prompt sin herramientas - respuesta directa
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Eres un asistente experto en trading y análisis financiero.

Tu tarea es responder preguntas de forma directa, clara y concisa basándose en tu conocimiento.

IMPORTANTE:
1. Responde DIRECTAMENTE sin usar herramientas
2. Sé conciso pero informativo
3. Proporciona respuestas prácticas y útiles
4. Usa lenguaje claro y profesional
5. Si la pregunta requiere cálculos específicos o datos en tiempo real, indícalo claramente
6. Estructura tu respuesta de forma clara y fácil de leer

Ejemplos de preguntas que puedes responder rápidamente:
- ¿Qué es el RSI?
- ¿Cuál es la diferencia entre trading técnico y fundamental?
- ¿Qué es el Kelly Criterion?
- Explica qué es un stop loss
- ¿Cuáles son los riesgos del apalancamiento?

Responde de forma natural y conversacional, no robótica."""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    # Crear el ejecutor del agente SIN herramientas
    agent_executor = AgentExecutor(
        agent=create_tool_calling_agent(llm, [], prompt),
        tools=[],
        verbose=False,
        handle_parsing_errors=True,
        max_iterations=1  # Solo una iteración, sin herramientas
    )
    
    return agent_executor


if __name__ == "__main__":
    # Construir el agente
    agent_executor = build_simple_agent()
    
    # Ejecutar consulta de ejemplo
    response = agent_executor.invoke({
        "input": "¿Qué es el RSI y cómo se interpreta?",
        "chat_history": []
    })
    
    print("\n" + "="*50)
    print("RESPUESTA:")
    print("="*50)
    print(response["output"])
