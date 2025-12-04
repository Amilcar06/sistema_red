#!/bin/bash

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@entel-educativo.bo","contrasena":"admin123"}' | jq -r '.data.accessToken')

echo "Token: $TOKEN"

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 1
fi

echo "--- Categories ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/products/categories | jq .

echo "--- Plans ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/clients/plans | jq .

echo "--- Segments ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/promotions/segments | jq .
