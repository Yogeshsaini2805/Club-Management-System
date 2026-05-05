@echo off
title JECRC Club Portal Backend
echo ===================================================
echo Starting JECRC Club Management Backend Server...
echo ===================================================

cd /d "%~dp0backend"

:: Try using the system python first
python -m uvicorn main:app --reload

:: If that fails, it means python isn't in PATH, so fallback to the absolute path
if %ERRORLEVEL% neq 0 (
    echo System python not found, trying absolute path...
    "C:\Users\hp\AppData\Local\Programs\Python\Python313\python.exe" -m uvicorn main:app --reload
)

pause
