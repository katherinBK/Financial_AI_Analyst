from langgraph import LangGraph, langgraph
from market_analyst.react_agent import build_react_agent
from market_analyst.agent import build_agent

initial_state = {
    "predicciones": [],
    "resultados": [],
    "feedback": [],
    "iteracion": 0,
    "ejecutar_react": False  # nombre consistente
}

@langgraph.node
def agente_prediccion(state):
    nuevas_preds = ejecutar_prediccion(state)
    state["predicciones"] = nuevas_preds
    return state

@langgraph.node
def decision_react(state):
    if state.get("ejecutar_react"):
        return "agente_react"
    else:
        return "siguiente_nodo"

@langgraph.node
def agente_react(state):
    feedback = evaluar_predicciones(state["predicciones"], state["resultados"])
    state["feedback"] = feedback
    return state

@langgraph.node
def siguiente_nodo(state):
    return state

graph = LangGraph()

graph.add_node("agente_prediccion", agente_prediccion)
graph.add_node("decision_react", decision_react)
graph.add_node("agente_react", agente_react)
graph.add_node("siguiente_nodo", siguiente_nodo)

graph.add_edge("agente_prediccion", "decision_react")
graph.add_edge("decision_react", "agente_react")
graph.add_edge("decision_react", "siguiente_nodo")