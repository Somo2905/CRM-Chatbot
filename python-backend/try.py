import requests

url = "http://localhost:8000/api/v1/chat"

payload = {
    "query": "What is the capital of France?",
    "user_data": {"user_id": "12345"},
    "additional_context": "Provide a brief overview of the country's geography."
}

response = requests.post(url, json=payload)
print(response.json())