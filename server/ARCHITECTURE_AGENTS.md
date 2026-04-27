# Arquitectura de Tres Agentes - Market Analyst

## Resumen

El sistema ahora utiliza **tres agentes especializados** que se seleccionan automáticamente según el tipo de pregunta del usuario. Esto optimiza el tiempo de respuesta y los recursos.

---

## 1. Agente Simple ⚡ (Rápido)

**Archivo:** `src/simple_agent.py`

### Características:
- **Sin herramientas**: Responde directamente basándose en conocimiento
- **Tiempo de respuesta**: Muy rápido (< 2 segundos)
- **Casos de uso**:
  - Definiciones de conceptos (¿Qué es el RSI?)
  - Explicaciones teóricas (Diferencia entre trading técnico y fundamental)
  - Conceptos generales (¿Cómo funciona el Kelly Criterion?)
  - Información educativa

### Ejemplo de uso:
```python
from simple_agent import build_simple_agent

agent = build_simple_agent()
response = agent.invoke({
    "input": "¿Qué es el RSI?",
    "chat_history": []
})
print(response["output"])
```

---

## 2. Agente Principal 🔮 (Análisis)

**Archivo:** `src/agent.py`

### Características:
- **Con herramientas especializadas**: 
  - `win_calculator_long`: Calcula ganancias de operaciones
  - `calculate_worst_case`: Calcula riesgo máximo
  - `kelly_Criterion_formula`: Aplica el criterio de Kelly
- **Tiempo de respuesta**: Medio (2-5 segundos)
- **Casos de uso**:
  - Predicciones de trading
  - Análisis de riesgo
  - Cálculos cuantitativos
  - Decisiones de trading

### Herramientas disponibles:
```python
@tool
def win_calculator_long(entry_price, close_price, lot_size)
    # Calcula: (close_price - entry_price) * lot_size

@tool
def calculate_worst_case(capital, max_drowdown)
    # Calcula: capital * (max_drowdown / 100)

@tool
def kelly_Criterion_formula(win_Rate, loose_probability, win_ratio)
    # Calcula: (win_Rate * win_ratio - loose_probability) / win_ratio
```

---

## 3. Agente ReAct 🤖 (Evaluación)

**Archivo:** `src/react_agent.py`

### Características:
- **Con herramientas limitadas**: Usa las mismas herramientas del agente principal
- **Tiempo de respuesta**: Lento (5-10 segundos)
- **Casos de uso**:
  - Evaluación de predicciones
  - Análisis detallado de trading
  - Validación de estrategias
  - Feedback sobre decisiones

### Diferencia con el Agente Principal:
- El agente ReAct es más reflexivo
- Captura pasos intermedios (intermediate_steps)
- Proporciona explicaciones más detalladas
- Ideal para análisis complejos

---

## Flujo de Decisión Automática

```
Usuario proporciona entrada
        ↓
┌─────────────────────────────────┐
│ Detectar tipo de pregunta       │
│ (palabras clave)                │
└─────────────────────────────────┘
        ↓
    ¿Es simple?
    /         \
  SÍ           NO
  ↓            ↓
Agente      Agente
Simple      Principal
(⚡)        (🔮)
  ↓            ↓
Respuesta    ¿Necesita
rápida       evaluación?
             /         \
           SÍ           NO
           ↓            ↓
        Agente        Fin
        ReAct
        (🤖)
           ↓
        Análisis
        detallado
           ↓
          Fin
```

---

## Palabras Clave para Detección

### Preguntas Simples (Agente Simple):
- "qué es", "explica", "define", "diferencia"
- "ventaja", "desventaja", "cómo funciona"
- "cuál es", "cuáles son", "concepto"
- "término", "significado", "riesgo", "beneficio"

### Preguntas Complejas (Agente Principal/ReAct):
- "predice", "analiza", "calcula"
- "riesgo máximo", "kelly", "ganancia"
- "operación", "trading", "compra", "venta"
- "entrada", "salida", "stop loss", "take profit"
- "capital", "drawdown"

---

## Integración en main2.py

El workflow de LangGraph ahora incluye:

1. **Nodo: detectar_pregunta**
   - Analiza la entrada del usuario
   - Clasifica como simple o compleja

2. **Nodo: agente_simple**
   - Ejecuta si la pregunta es simple
   - Respuesta rápida sin herramientas

3. **Nodo: agente_prediccion**
   - Ejecuta si la pregunta es compleja
   - Usa herramientas de cálculo

4. **Nodo: agente_react**
   - Ejecuta si hay predicciones y se requiere evaluación
   - Análisis detallado

5. **Nodo: siguiente_nodo**
   - Procesa resultados finales
   - Logging y almacenamiento

---

## Ejemplo de Uso

```python
from main2 import run_workflow

# Pregunta simple - Respuesta rápida
resultado = run_workflow(
    user_input="¿Qué es el RSI?",
    ejecutar_react=False
)
print(resultado["feedback"])

# Pregunta compleja - Análisis completo
resultado = run_workflow(
    user_input="Si tengo 10000 dólares y quiero arriesgar 2%, ¿cuál es mi riesgo máximo?",
    ejecutar_react=True
)
print(resultado["feedback"])
```

---

## Ventajas del Sistema

| Aspecto | Beneficio |
|---------|-----------|
| **Velocidad** | Preguntas simples se responden en < 2 segundos |
| **Eficiencia** | No se usan herramientas innecesariamente |
| **Precisión** | Cada agente está optimizado para su caso de uso |
| **Escalabilidad** | Fácil agregar nuevos agentes o herramientas |
| **Experiencia** | Usuario obtiene respuesta apropiada al tiempo |

---

## Próximas Mejoras

1. **Caché de respuestas**: Almacenar respuestas comunes del agente simple
2. **Aprendizaje**: Mejorar detección de tipo de pregunta con feedback
3. **Paralelización**: Ejecutar múltiples agentes en paralelo cuando sea posible
4. **Métricas**: Rastrear tiempo de respuesta y precisión por agente
5. **Personalización**: Permitir al usuario elegir agente manualmente

---

## Archivos Relacionados

- `src/simple_agent.py` - Agente simple
- `src/agent.py` - Agente principal
- `src/react_agent.py` - Agente ReAct
- `src/main2.py` - Orquestador con LangGraph
- `src/example_usage.py` - Ejemplos de uso
