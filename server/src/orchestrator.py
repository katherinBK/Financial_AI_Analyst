from langgraph.graph import StateGraph, END

initial_state = {
    "predicciones": [],
    "resultados": [],
    "feedback": None,
    "iteracion": 0,
    "ejecutar_react": True,
    "messages": []
}

graf = StateGraph(dict)

def agente_prediccion(state):
    state["iteracion"] = state.get("iteracion", 0) + 1
    state.setdefault("predicciones", []).append("predicción ejemplo")
    return state

def decision_react(state):
    return "agente_react" if (state.get("ejecutar_react") or state.get("predicciones")) else "siguiente_nodo"

def agente_react(state):
    state["feedback"] = "feedback ejemplo"
    state.setdefault("resultados", []).append({"iteracion": state["iteracion"], "feedback": state["feedback"]})
    return state

def siguiente_nodo(state):
    return state

graf.add_node("agente_prediccion", agente_prediccion)
graf.add_node("agente_react", agente_react)
graf.add_node("siguiente_nodo", siguiente_nodo)
graf.set_entry_point("agente_prediccion")
graf.add_conditional_edges("agente_prediccion", decision_react, {"agente_react": "agente_react", "siguiente_nodo": "siguiente_nodo"})
graf.add_edge("agente_react", "siguiente_nodo")
graf.add_edge("siguiente_nodo", END)

compiled_graph = graf.compile()

# ejecutar
final = compiled_graph.invoke(initial_state.copy())
print(final)