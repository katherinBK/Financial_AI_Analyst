from trader.agent import build_agent
import os
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("API_KEY")
base_url = os.getenv("BASE_URL")
temp = os.getenv("TEMPERATURE")
model = os.getenv("MODEL")
max_t = os.getenv("MAX")


build_agent()