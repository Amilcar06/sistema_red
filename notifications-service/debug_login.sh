#!/bin/bash
curl -v -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@entel-educativo.bo","contrasena":"admin123"}'
