from finvizfinance.insider import Insider
Insider = Insider(option='top week sales')
all_operations = Insider.get_insider()
print(f"{all_operations}")