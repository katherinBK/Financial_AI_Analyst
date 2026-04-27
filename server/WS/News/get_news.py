from finvizfinance.news import News
import yfinance as yf
from dotenv import load_dotenv
import os
ticker1 = os.getenv("TICKER1")
ticker2 = os.getenv("TICKEr2")
ticker3 = os.getenv("TICKER3")
ticker4 = os.getenv("TICKER4")
ticker5 = os.getenv("TICKER5")


ticker1 = yf.Ticker(os.getenv("TICKER1"))
meta = yf.Ticker('meta')
result = meta.news
fnews = News()
all_news = fnews.get_news()
print(f"{all_news}") 