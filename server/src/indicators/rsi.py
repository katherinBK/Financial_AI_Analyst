import json

def calcular_rsi(rs):
    rs = 5
    a = 1 + rs
    rsi = 100 - a
    return rsi

def get_rsi(rsi):
    if rsi > 70:
        return f"sobrecomprado"
    elif rsi < 30:
        return f"Sobrevendido"
    elif rsi == 50:
        return f"Neutral"
    else:
        return f"No se ha podido calcular el rsi"