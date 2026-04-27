import pandas as pd
from finvizfinance.quote import finvizfinance

stock = finvizfinance('tsla')
print(stock)