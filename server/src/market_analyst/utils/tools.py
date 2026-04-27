from langchain_core.tools import tool

@tool
def win_calculator(entry_price:float,close_price :float,lot_size:float):
    """This is a tool LoL"""
    final_price = close_price - entry_price
    win = lot_size * final_price
    return win

@tool
def drawdown_calculator(capital:float,best_price:float,entry_price:float,worst_price:float):
    """{(precio más alto (a favor) - precio más bajo (en contra) \ precio de entrada} * 100    """
    final_price = best_price - worst_price
    result = final_price/entry_price
    final_result = result * 100
    return final_result