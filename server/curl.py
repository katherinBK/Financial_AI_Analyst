import requests

url = "http://localhost:1234/v1/chat/completions"
data = {
    "model": "microsoft/phi-4-mini-reasoning",
    "messages": [{"role": "user", "content": "Hello!"}]
}

response = requests.post(url, json=data)
print(response.json())