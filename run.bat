@echo off
echo ================================================
echo   FraudShield - Starting Backend + Mobile App
echo ================================================

echo.
echo [1/2] Starting FastAPI backend on port 8000...
start cmd /k "cd /d %~dp0backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000 --host 0.0.0.0"

echo.
echo [2/2] Starting Expo mobile app...
timeout /t 3 /nobreak >nul
cd /d %~dp0mobile
call npm install
npx expo start --tunnel

pause
