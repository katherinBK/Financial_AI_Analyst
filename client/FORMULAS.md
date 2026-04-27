# Fórmulas Cuantitativas Implementadas

## Indicadores Técnicos

### 1. RSI (Relative Strength Index)
**Propósito**: Medir la fuerza del momentum e identificar condiciones de sobrecompra/sobreventa.

**Fórmula**:
```
RSI = 100 - (100 / (1 + RS))
RS = Average Gain / Average Loss
```

**Interpretación**:
- RSI > 70: Sobrecomprado (posible reversión bajista)
- RSI < 30: Sobrevendido (posible reversión alcista)
- RSI = 50: Neutral

**Uso**: Identificar puntos de entrada/salida basados en momentum extremo.

---

### 2. MACD (Moving Average Convergence Divergence)
**Propósito**: Detectar cambios de tendencia y momentum.

**Fórmula**:
```
MACD Line = EMA(12) - EMA(26)
Signal Line = EMA(9) of MACD Line
Histogram = MACD Line - Signal Line
```

**Interpretación**:
- Histogram > 0: Momentum alcista
- Histogram < 0: Momentum bajista
- Cruce de líneas: Señal de cambio de tendencia

**Uso**: Confirmar tendencias y generar señales de trading.

---

### 3. Bollinger Bands
**Propósito**: Medir volatilidad y identificar niveles de sobrecompra/sobreventa relativos.

**Fórmula**:
```
Middle Band = SMA(20)
Upper Band = Middle + (2 * Standard Deviation)
Lower Band = Middle - (2 * Standard Deviation)
Bandwidth = ((Upper - Lower) / Middle) * 100
```

**Interpretación**:
- Precio cerca de banda superior: Posible sobrecompra
- Precio cerca de banda inferior: Posible sobreventa
- Bandwidth alto: Alta volatilidad
- Bandwidth bajo: Baja volatilidad (posible breakout próximo)

**Uso**: Identificar niveles extremos de precio y anticipar volatilidad.

---

### 4. ATR (Average True Range)
**Propósito**: Medir volatilidad absoluta del mercado.

**Fórmula**:
```
True Range = max[(High - Low), |High - Close_prev|, |Low - Close_prev|]
ATR = Average of True Range over 14 periods
Volatility % = (ATR / Current Price) * 100
```

**Interpretación**:
- ATR alto: Alta volatilidad (mayor riesgo/recompensa)
- ATR bajo: Baja volatilidad (mercado tranquilo)

**Uso**: 
- Calcular stop-loss dinámicos (e.g., 2x ATR)
- Ajustar tamaño de posición según volatilidad
- Identificar periodos de consolidación vs expansión

---

### 5. Sharpe Ratio
**Propósito**: Evaluar rendimiento ajustado por riesgo de una estrategia.

**Fórmula**:
```
Sharpe Ratio = (Return - Risk Free Rate) / Standard Deviation of Returns

Annualized (daily data):
Annual Return = Average Daily Return * 252
Annual Std Dev = Daily Std Dev * √252
```

**Interpretación**:
- Sharpe > 2: Excelente (rendimiento muy superior al riesgo)
- Sharpe > 1: Bueno (rendimiento justifica el riesgo)
- Sharpe > 0: Aceptable (mejor que tasa libre de riesgo)
- Sharpe < 0: Pobre (perdiendo dinero o no compensa el riesgo)

**Uso**: Comparar estrategias y evaluar eficiencia de riesgo/retorno.

---

## Simulaciones

### Monte Carlo para Predicción de Precios
**Propósito**: Proyectar posibles trayectorias futuras de precio usando simulación estocástica.

**Fórmula** (Geometric Brownian Motion):
```
S(t+1) = S(t) * exp(μ*Δt + σ*√Δt*Z)

Donde:
- S(t) = Precio en tiempo t
- μ = Drift (tendencia esperada)
- σ = Volatilidad (ATR/Current Price)
- Δt = Intervalo de tiempo (1/252 para días)
- Z = Variable aleatoria normal estándar N(0,1)
```

**Estadísticas Generadas**:
- Media: Precio esperado
- Mediana: Precio más probable
- Percentil 95: Escenario optimista
- Percentil 5: Escenario pesimista

**Uso**:
- Estimar rangos de precio futuros
- Calcular probabilidades de alcanzar targets
- Análisis de riesgo (Value at Risk)

---

### Backtest de Estrategias
**Propósito**: Evaluar performance histórica de señales de trading.

**Métricas Calculadas**:
```
Returns = ((Final Capital - Initial Capital) / Initial Capital) * 100
Win Rate = (Winning Trades / Total Trades) * 100
Max Drawdown = max((Peak Capital - Current Capital) / Peak Capital)
```

**Interpretación**:
- Returns positivos: Estrategia rentable
- Win Rate > 50%: Más operaciones ganadoras que perdedoras
- Max Drawdown: Peor pérdida acumulada (menor es mejor)

**Uso**: Validar estrategias antes de implementarlas en vivo.

---

## Estrategias de Trading Implementables

### 1. Mean Reversion (Reversión a la Media)
**Lógica**:
- Comprar cuando precio < Bollinger Band inferior + RSI < 30
- Vender cuando precio > Bollinger Band superior + RSI > 70

### 2. Trend Following (Seguimiento de Tendencia)
**Lógica**:
- Comprar cuando MACD histogram > 0 + RSI > 50
- Vender cuando MACD histogram < 0 + RSI < 50

### 3. Volatility Breakout
**Lógica**:
- Esperar Bollinger Bandwidth bajo (< 2%)
- Comprar en breakout alcista con volumen
- Usar ATR para stop-loss dinámico

---

## Gestión de Riesgo

### Kelly Criterion (Por implementar)
**Fórmula**:
```
f* = (p*b - q) / b

Donde:
- f* = Fracción óptima de capital a arriesgar
- p = Probabilidad de ganar (Win Rate)
- q = Probabilidad de perder (1 - p)
- b = Ratio ganancia/pérdida promedio
```

### Position Sizing
**Recomendación**:
```
Position Size = (Account Equity * Risk %) / (Stop Loss Distance * ATR)
```

---

## Próximos Pasos

1. **Modelos de Machine Learning**:
   - LSTM para series temporales
   - Transformers para análisis de sentimiento
   - Reinforcement Learning para optimización de estrategias

2. **Indicadores Adicionales**:
   - Fibonacci Retracements
   - Ichimoku Cloud
   - Volume Profile

3. **Análisis Fundamental**:
   - Integración de news sentiment
   - Calendario económico
   - Correlaciones de mercado