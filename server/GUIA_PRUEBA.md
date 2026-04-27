# Guía de Prueba - Sistema de Tres Agentes

## 🚀 Inicio Rápido

### Opción 1: Ejecutar ejemplos completos
```bash
cd src
python example_usage.py
```

Esto ejecutará 5 ejemplos automáticamente:
1. Pregunta simple: "¿Qué es el RSI?"
2. Pregunta simple: "Explica la diferencia entre trading técnico y fundamental"
3. Pregunta simple: "¿Qué es el Kelly Criterion?"
4. Pregunta compleja: Cálculo de riesgo máximo
5. Pregunta compleja: Cálculo de ganancia

---

## 🧪 Pruebas Manuales

### Prueba 1: Pregunta Simple (Agente Simple - ⚡)
```python
from src.main2 import run_workflow

resultado = run_workflow(
    user_input="¿Qué es el RSI?",
    ejecutar_react=False
)
print("Respuesta:", resultado["feedback"])
print("Tipo de agente:", resultado["resultados"][0]["tipo_agente"])
print("Tiempo esperado: < 2 segundos")
```

**Resultado esperado:**
- ✅ Respuesta rápida
- ✅ Sin llamadas a herramientas
- ✅ Explicación clara del RSI

---

### Prueba 2: Pregunta Conceptual (Agente Simple - ⚡)
```python
from src.main2 import run_workflow

resultado = run_workflow(
    user_input="Explica la diferencia entre trading técnico y fundamental",
    ejecutar_react=False
)
print("Respuesta:", resultado["feedback"])
print("Tipo de agente:", resultado["resultados"][0]["tipo_agente"])
```

**Resultado esperado:**
- ✅ Agente simple detectado
- ✅ Respuesta comparativa
- ✅ Tiempo < 2 segundos

---

### Prueba 3: Pregunta de Cálculo (Agente Principal - 🔮)
```python
from src.main2 import run_workflow

resultado = run_workflow(
    user_input="Si tengo un capital de 10000 dólares y quiero arriesgar máximo 2% por operación, ¿cuál es mi riesgo máximo?",
    ejecutar_react=False
)
print("Respuesta:", resultado["feedback"])
print("Tipo de agente:", resultado["resultados"][0]["tipo_agente"])
print("Tiempo esperado: 2-5 segundos")
```

**Resultado esperado:**
- ✅ Agente principal detectado
- ✅ Herramienta `calculate_worst_case` utilizada
- ✅ Resultado: 200 dólares (10000 * 0.02)

---

### Prueba 4: Pregunta de Ganancia (Agente Principal - 🔮)
```python
from src.main2 import run_workflow

resultado = run_workflow(
    user_input="Si compré a 100 dólares y vendí a 150 dólares con un lote de 2, ¿cuál fue mi ganancia?",
    ejecutar_react=False
)
print("Respuesta:", resultado["feedback"])
print("Tipo de agente:", resultado["resultados"][0]["tipo_agente"])
```

**Resultado esperado:**
- ✅ Agente principal detectado
- ✅ Herramienta `win_calculator_long` utilizada
- ✅ Resultado: 100 dólares ((150-100) * 2)

---

### Prueba 5: Análisis Completo (Agente ReAct - 🤖)
```python
from src.main2 import run_workflow

resultado = run_workflow(
    user_input="Analiza estas predicciones de trading",
    ejecutar_react=True
)
print("Respuesta:", resultado["feedback"])
print("Pensamientos del agente:", resultado["agent_thoughts"])
print("Tiempo esperado: 5-10 segundos")
```

**Resultado esperado:**
- ✅ Agente ReAct ejecutado
- ✅ Pasos intermedios capturados
- ✅ Análisis detallado

---

## 📊 Matriz de Pruebas

| # | Pregunta | Agente Esperado | Tiempo | Herramientas |
|---|----------|-----------------|--------|--------------|
| 1 | "¿Qué es RSI?" | Simple | <2s | 0 |
| 2 | "Explica diferencia" | Simple | <2s | 0 |
| 3 | "¿Qué es Kelly?" | Simple | <2s | 0 |
| 4 | "Calcula riesgo" | Principal | 2-5s | 1 |
| 5 | "Calcula ganancia" | Principal | 2-5s | 1 |
| 6 | "Analiza predicción" | ReAct | 5-10s | 1-2 |

---

## 🔍 Verificación de Detección

### Verificar que la detección funciona correctamente:

```python
from src.main2 import run_workflow

# Preguntas que DEBEN usar agente simple
preguntas_simples = [
    "¿Qué es el RSI?",
    "Explica el MACD",
    "Define stop loss",
    "¿Cuál es la diferencia entre bid y ask?",
    "¿Cuáles son los riesgos del apalancamiento?"
]

for pregunta in preguntas_simples:
    resultado = run_workflow(pregunta, ejecutar_react=False)
    tipo = resultado["resultados"][0]["tipo_agente"]
    assert tipo == "simple", f"❌ Falló: {pregunta} usó {tipo}"
    print(f"✅ {pregunta} → Agente Simple")

# Preguntas que DEBEN usar agente principal
preguntas_complejas = [
    "Si tengo 10000 y arriesgo 2%, ¿cuál es mi riesgo?",
    "Calcula mi ganancia: entrada 100, salida 150, lote 2",
    "¿Cuál es el Kelly Criterion para 60% win rate?"
]

for pregunta in preguntas_complejas:
    resultado = run_workflow(pregunta, ejecutar_react=False)
    tipo = resultado["resultados"][0]["tipo_agente"]
    assert tipo != "simple", f"❌ Falló: {pregunta} usó agente simple"
    print(f"✅ {pregunta} → Agente Principal")
```

---

## 📈 Métricas a Verificar

### Para cada prueba, verificar:

1. **Tiempo de respuesta**
   - Simple: < 2 segundos
   - Principal: 2-5 segundos
   - ReAct: 5-10 segundos

2. **Tipo de agente**
   - Correcto según la pregunta
   - Registrado en `resultados[0]["tipo_agente"]`

3. **Calidad de respuesta**
   - Respuesta coherente
   - Información correcta
   - Formato apropiado

4. **Uso de herramientas**
   - Simple: 0 herramientas
   - Principal: 1-2 herramientas
   - ReAct: 1-2 herramientas

---

## 🐛 Troubleshooting

### Problema: Agente simple no se ejecuta
**Solución:** Verificar que la pregunta contenga palabras clave simples
```python
palabras_simples = [
    "qué es", "explica", "define", "diferencia", "ventaja", "desventaja",
    "cómo funciona", "cuál es", "cuáles son", "concepto", "término",
    "significado", "riesgo", "beneficio", "estrategia general"
]
```

### Problema: Agente principal no se ejecuta
**Solución:** Verificar que la pregunta contenga palabras clave complejas
```python
palabras_complejas = [
    "predice", "analiza", "calcula", "riesgo máximo", "kelly", "ganancia",
    "operación", "trading", "compra", "venta", "entrada", "salida",
    "stop loss", "take profit", "capital", "drawdown"
]
```

### Problema: Error de conexión con LLM
**Solución:** Verificar que LM Studio está corriendo
```bash
# Verificar que el servidor está activo
curl http://localhost:1234/v1/models
```

### Problema: Herramientas no se ejecutan
**Solución:** Verificar que las herramientas están correctamente definidas
```python
# En agent.py y react_agent.py
@tool
def win_calculator_long(entry_price, close_price, lot_size):
    """Calcula ganancia"""
    return (close_price - entry_price) * lot_size
```

---

## ✅ Checklist de Validación

- [ ] Agente simple responde preguntas conceptuales en < 2s
- [ ] Agente principal usa herramientas para cálculos
- [ ] Agente ReAct captura pasos intermedios
- [ ] Detección automática funciona correctamente
- [ ] Flujo del grafo es correcto
- [ ] No hay errores en la ejecución
- [ ] Respuestas son coherentes y útiles
- [ ] Tiempos de respuesta son los esperados

---

## 📝 Notas

- Las pruebas asumen que LM Studio está corriendo en `localhost:1234`
- Los tiempos son aproximados y dependen del hardware
- La detección es heurística y puede mejorarse
- Se pueden agregar más palabras clave según sea necesario

