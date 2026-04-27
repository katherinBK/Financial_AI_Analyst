from react_agent import build_react_agent
from agent import build_agent  # Asegúrate de que esta función exista en agent.py
from simple_agent import build_simple_agent  # Nuevo agente simple
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Any
from typing_extensions import Annotated
import json
import re

# Definir el estado tipado
class GraphState(TypedDict):
    predicciones: List[Any]
    resultados: List[Any]
    feedback: Any
    iteracion: int
    ejecutar_react: bool
    messages: List[tuple]  # Para almacenar conversación
    agent_thoughts: List[str]  # Para almacenar pensamientos del agente
    user_input: str  # Entrada del usuario
    es_pregunta_simple: bool  # Flag para determinar si es pregunta simple

# Instanciar los agentes
react_executor = build_react_agent()
simple_executor = build_simple_agent()

# Nodo: Agente de predicción
def agente_prediccion(state: GraphState) -> GraphState:
    """Genera predicciones usando el agente principal"""
    print("🔮 Ejecutando agente de predicción...")
    
    try:
        # Opción 1: Si build_agent() no requiere argumentos
        agent = build_agent()
        
        # Crear un prompt basado en el estado actual
        input_query = "Genera predicciones de trading para el día de hoy"
        
        # Invocar el agente
        result = agent.invoke({"input": input_query})
        
        # Extraer las predicciones del resultado
        # Ajusta esto según la estructura de tu agente
        if isinstance(result, dict):
            nuevas_preds = result.get("output", result)
        else:
            nuevas_preds = result
            
        state["predicciones"] = [nuevas_preds] if not isinstance(nuevas_preds, list) else nuevas_preds
        state["iteracion"] += 1
        print(f"✅ Predicciones generadas: {nuevas_preds}")
        
    except Exception as e:
        print(f"❌ Error en agente_prediccion: {e}")
        import traceback
        traceback.print_exc()
        state["predicciones"] = []
    
    return state

# Nodo: Detectar si es pregunta simple
def detectar_pregunta_simple(state: GraphState) -> GraphState:
    """Detecta si la pregunta del usuario es simple o requiere análisis complejo"""
    print("🔍 Analizando tipo de pregunta...")
    
    user_input = state.get("user_input", "").lower()
    
    # Palabras clave para preguntas simples
    palabras_simples = [
        "qué es", "explica", "define", "diferencia", "ventaja", "desventaja",
        "cómo funciona", "cuál es", "cuáles son", "concepto", "término",
        "significado", "riesgo", "beneficio", "estrategia general"
    ]
    
    # Palabras clave para preguntas complejas
    palabras_complejas = [
        "predice", "analiza", "calcula", "riesgo máximo", "kelly", "ganancia",
        "operación", "trading", "compra", "venta", "entrada", "salida",
        "stop loss", "take profit", "capital", "drawdown"
    ]
    
    es_simple = any(palabra in user_input for palabra in palabras_simples)
    es_compleja = any(palabra in user_input for palabra in palabras_complejas)
    
    # Si tiene palabras complejas, es compleja (prioridad)
    if es_compleja and not es_simple:
        state["es_pregunta_simple"] = False
        print("   ➡️  Pregunta COMPLEJA - Requiere análisis")
    elif es_simple and not es_compleja:
        state["es_pregunta_simple"] = True
        print("   ➡️  Pregunta SIMPLE - Respuesta directa")
    else:
        # Por defecto, si es ambigua, usar agente simple (más rápido)
        state["es_pregunta_simple"] = True
        print("   ➡️  Pregunta AMBIGUA - Usando agente simple (rápido)")
    
    return state

# Nodo: Agente simple (respuesta rápida)
def agente_simple(state: GraphState) -> GraphState:
    """Ejecuta el agente simple para preguntas que no requieren herramientas"""
    print("⚡ Ejecutando agente simple (respuesta rápida)...")
    
    try:
        user_input = state.get("user_input", "")
        
        result = simple_executor.invoke({
            "input": user_input,
            "chat_history": state.get("messages", [])
        })
        
        feedback = result.get("output", str(result))
        state["feedback"] = feedback
        
        state["resultados"].append({
            "iteracion": state["iteracion"],
            "tipo_agente": "simple",
            "feedback": feedback,
            "tiempo_respuesta": "rápido"
        })
        
        print(f"✅ Respuesta simple generada: {feedback[:100]}...")
        
    except Exception as e:
        print(f"❌ Error en agente_simple: {e}")
        state["feedback"] = f"Error: {str(e)}"
        import traceback
        traceback.print_exc()
    
    return state

# Nodo: Decisión condicional para ejecutar el agente ReAct
def decision_react(state: GraphState) -> str:
    """Decide si ejecutar el agente ReAct basado en el estado"""
    print("🤔 Evaluando si ejecutar ReAct Agent...")
    
    # Lógica de decisión: ejecutar ReAct si hay predicciones o si está forzado
    tiene_predicciones = len(state.get("predicciones", [])) > 0
    forzar_react = state.get("ejecutar_react", False)
    
    print(f"   - Tiene predicciones: {tiene_predicciones}")
    print(f"   - Forzar ReAct: {forzar_react}")
    
    if forzar_react or tiene_predicciones:
        print("➡️  Ejecutando ReAct Agent")
        return "agente_react"
    else:
        print("➡️  Saltando ReAct Agent")
        return "siguiente_nodo"

# Nodo: Agente ReAct
def agente_react(state: GraphState) -> GraphState:
    """Ejecuta el agente ReAct para analizar predicciones"""
    print("🤖 Ejecutando ReAct Agent...")
    
    try:
        predicciones = state.get('predicciones', [])
        input_text = f"Analiza y evalúa estas predicciones de trading: {predicciones}"
        
        result = react_executor.invoke({
            "input": input_text,
            "chat_history": []
        })
        
        # Extraer la respuesta del agente
        feedback = result.get("output", str(result))
        state["feedback"] = feedback
        
        # Capturar pasos intermedios (pensamientos del agente)
        intermediate_steps = result.get("intermediate_steps", [])
        thoughts = []
        
        for step in intermediate_steps:
            if isinstance(step, tuple) and len(step) == 2:
                action, observation = step
                # action es un AgentAction con tool, tool_input, log
                tool_name = getattr(action, 'tool', 'unknown')
                tool_input = getattr(action, 'tool_input', {})
                thought_text = f"🔧 Herramienta: {tool_name}\n📥 Entrada: {tool_input}\n📊 Resultado: {observation}"
                thoughts.append(thought_text)
        
        state["agent_thoughts"].extend(thoughts)
        
        state["resultados"].append({
            "iteracion": state["iteracion"],
            "feedback": feedback,
            "thoughts": thoughts
        })
        
        print(f"✅ Feedback recibido: {feedback[:100]}...")
    except Exception as e:
        print(f"❌ Error en agente_react: {e}")
        state["feedback"] = f"Error: {str(e)}"
        import traceback
        traceback.print_exc()
    
    return state

# Nodo: Paso siguiente (logging, almacenamiento, etc.)
def siguiente_nodo(state: GraphState) -> GraphState:
    """Procesa el estado final y realiza acciones finales"""
    print("📊 Procesando resultados finales...")
    print(f"Total de iteraciones: {state['iteracion']}")
    print(f"Total de predicciones: {len(state.get('predicciones', []))}")
    print(f"Total de resultados: {len(state.get('resultados', []))}")
    
    return state

# Nodo: Decisión entre agente simple y complejo
def decision_tipo_agente(state: GraphState) -> str:
    """Decide si usar agente simple o complejo"""
    if state.get("es_pregunta_simple", False):
        print("➡️  Usando AGENTE SIMPLE (rápido)")
        return "agente_simple"
    else:
        print("➡️  Usando AGENTE COMPLEJO (análisis)")
        return "agente_prediccion"

# Crear el grafo
def create_workflow():
    """Crea y configura el workflow de LangGraph"""
    
    # Crear el grafo con el estado tipado
    workflow = StateGraph(GraphState)
    
    # Agregar nodos
    workflow.add_node("detectar_pregunta", detectar_pregunta_simple)
    workflow.add_node("agente_simple", agente_simple)
    workflow.add_node("agente_prediccion", agente_prediccion)
    workflow.add_node("decision_react_node", lambda state: state)  # Nodo para decisión
    workflow.add_node("agente_react", agente_react)
    workflow.add_node("siguiente_nodo", siguiente_nodo)
    
    # Configurar el punto de entrada
    workflow.set_entry_point("detectar_pregunta")
    
    # Desde detección, decidir qué agente usar
    workflow.add_conditional_edges(
        "detectar_pregunta",
        decision_tipo_agente,
        {
            "agente_simple": "agente_simple",
            "agente_prediccion": "agente_prediccion"
        }
    )
    
    # Después del agente simple, ir al siguiente nodo
    workflow.add_edge("agente_simple", "siguiente_nodo")
    
    # Agregar aristas para agente complejo
    workflow.add_conditional_edges(
        "agente_prediccion",
        decision_react,
        {
            "agente_react": "agente_react",
            "siguiente_nodo": "siguiente_nodo"
        }
    )
    
    # Después de ReAct, ir al siguiente nodo
    workflow.add_edge("agente_react", "siguiente_nodo")
    
    # El siguiente nodo termina el flujo
    workflow.add_edge("siguiente_nodo", END)
    
    return workflow.compile()


def run_workflow(user_input: str = "", ejecutar_react: bool = True):
    """Ejecuta el workflow completo
    
    Args:
        user_input: Pregunta o entrada del usuario
        ejecutar_react: Si se debe ejecutar el agente ReAct
    """
    
    # Estado inicial
    initial_state = GraphState(
        predicciones=[],
        resultados=[],
        feedback=None,
        iteracion=0,
        ejecutar_react=ejecutar_react,
        messages=[],
        agent_thoughts=[],
        user_input=user_input,
        es_pregunta_simple=False
    )
    
    print("="*60)
    print("🚀 Iniciando workflow de LangGraph")
    print(f"📝 Entrada del usuario: {user_input}")
    print("="*60)
    
    # Compilar el grafo
    compiled_graph = create_workflow()
    
    # Ejecutar el workflow
    final_state = compiled_graph.invoke(initial_state)
    
    print("\n" + "="*60)
    print("✨ Workflow completado")
    print("="*60)
    
    return final_state


"""if __name__ == "__main__":
    # Ejecutar el workflow
    final_state = run_workflow(ejecutar_react=False)
    
    # Mostrar el estado final
    print("\n📋 Estado Final:")
    print(f"  - Iteraciones: {final_state['iteracion']}")
    print(f"  - Predicciones: {final_state['predicciones']}")
    print(f"  - Feedback: {final_state.get('feedback', 'N/A')}")
    print(f"  - Resultados guardados: {len(final_state['resultados'])}")
    
    # Opción: ejecutar sin ReAct
    print("\n" + "="*60)
    print("🔄 Ejecutando sin ReAct Agent...")
    print("="*60)
    final_state_no_react = run_workflow(ejecutar_react=False)"""