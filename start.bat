@echo off
echo Starting MediDash Backend API (Port 3001)...
start cmd /k "node server.js"

echo Starting MediDash Frontend UI (Port 5000)...
start cmd /k "npx vite --port 5000"

echo Both servers are now running in separate windows!
