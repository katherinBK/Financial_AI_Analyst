from langchain_core.tools import tool

@tool
def win_calculator(entry_price:float,close_price :float,lot_size:float):
    final_price = close_price - entry_price
    win = lot_size * final_price
    return win