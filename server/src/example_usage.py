"""
Ejemplo de uso del workflow con los tres agentes:
1. Agente Simple: Responde preguntas conceptuales rápidamente
2. Agente Principal: Genera predicciones de trading
3. Agente ReAct: Analiza y evalúa predicciones

El sistema detecta automáticamente el tipo de pregunta y elige el agente más apropiado.
"""

from main2 import run_workflow

# Ejemplo 1: Pregunta SIMPLE - Usa el agente simple (respuesta rápida ⚡)
print("\n" + "="*70)
print("EJEMPLO 1: Pregunta Simple")
print("="*70)
resultado1 = run_workflow(
    user_input="¿Qué es el RSI y cómo se interpreta?",
    ejecutar_react=False
)
print("\n📋 Respuesta:")
print(resultado1.get("feedback", "No hay respuesta"))

# Ejemplo 2: Pregunta SIMPLE - Concepto de trading
print("\n" + "="*70)
print("EJEMPLO 2: Pregunta sobre concepto")
print("="*70)
resultado2 = run_workflow(
    user_input="Explica la diferencia entre trading técnico y fundamental",
    ejecutar_react=False
)
print("\n📋 Respuesta:")
print(resultado2.get("feedback", "No hay respuesta"))

# Ejemplo 3: Pregunta SIMPLE - Definición
print("\n" + "="*70)
print("EJEMPLO 3: Definición de concepto")
print("="*70)
resultado3 = run_workflow(
    user_input="¿Qué es el Kelly Criterion?",
    ejecutar_react=False
)
print("\n📋 Respuesta:")
print(resultado3.get("feedback", "No hay respuesta"))

# Ejemplo 4: Pregunta COMPLEJA - Cálculo de riesgo
print("\n" + "="*70)
print("EJEMPLO 4: Pregunta Compleja - Cálculo")
print("="*70)
resultado4 = run_workflow(
    user_input="Si tengo un capital de 10000 dólares y quiero arriesgar máximo 2% por operación, ¿cuál es mi riesgo máximo?",
    ejecutar_react=True
)
print("\n📋 Respuesta:")
print(resultado4.get("feedback", "No hay respuesta"))

# Ejemplo 5: Pregunta COMPLEJA - Ganancia
print("\n" + "="*70)
print("EJEMPLO 5: Pregunta Compleja - Ganancia")
print("="*70)
resultado5 = run_workflow(
    user_input="Si compré a 100 dólares y vendí a 150 dólares con un lote de 2, ¿cuál fue mi ganancia?",
    ejecutar_react=True
)
print("\n📋 Respuesta:")
print(resultado5.get("feedback", "No hay respuesta"))

print("\n" + "="*70)
print("✨ Ejemplos completados")
print("="*70)
