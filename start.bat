@echo off
echo ======================================================================
echo    MUMBAI URBAN INFRASTRUCTURE DIGITAL TWIN (PS010) - LAUNCHER
echo ======================================================================
echo.
echo Starting FastAPI Backend Engine on http://localhost:8000 ...
start "Mumbai Twin - FastAPI Backend" cmd /k "cd /d %~dp0backend && python run.py"

timeout /t 3 /nobreak >nul

echo Starting Next.js Command Center Dashboard on http://localhost:3000 ...
start "Mumbai Twin - Next.js Command Center" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo  Both services launched!
echo  -> Backend Docs: http://localhost:8000/docs
echo  -> Municipal Command Center: http://localhost:3000
echo ======================================================================
