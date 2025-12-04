from main import app

client = app.test_client()
resp = client.post('/api/login', json={'username':'demo','password':'demo123'})
print('STATUS', resp.status_code)
print(resp.get_data(as_text=True))
