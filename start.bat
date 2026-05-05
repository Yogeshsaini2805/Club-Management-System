@echo off
title JECRC Club Portal - Full Stack
echo ===================================================
echo   JECRC Club Management Portal
echo   Starting Backend + Frontend...
echo ===================================================
echo.

:: Start backend in a new window
start "JECRC Backend" cmd /k "cd /d %~dp0backend && echo [Backend] Starting on http://localhost:8000 && python -m uvicorn main:app --reload || echo [Backend] System python not found, trying absolute path... && \"C:\Users\hp\AppData\Local\Programs\Python\Python313\python.exe\" -m uvicorn main:app --reload"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start frontend in a new window
start "JECRC Frontend" cmd /k "cd /d %~dp0club-management && echo [Frontend] Starting on http://localhost:3000 && npm start"

echo.
echo [✓] Both servers are starting in separate windows.
echo     Backend:  http://localhost:8000
echo     Frontend: http://localhost:3000
echo.
echo You can close this window.
timeout /t 5
