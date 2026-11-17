@echo off
set PATH=C:\Program Files\nodejs;%PATH%
title Nanova Platform Launcher
echo ====================================================================
echo   NANOVA DUAL-BRAND E-COMMERCE & BUSINESS AUTOMATION PLATFORM
echo ====================================================================
echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "Nanova Backend API - Port 5000" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d "%~dp0server" && node --watch src/index.js"

echo [2/2] Waiting 2 seconds then starting Frontend Dev Server (Port 5173)...
timeout /t 2 /nobreak >nul
start "Nanova Frontend - Port 5173" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d "%~dp0client" && node_modules\.bin\vite.cmd"

echo.
echo ====================================================================
echo   Both services are now running in separate windows!
echo.
echo   - Customer Storefront: http://localhost:5173
echo   - Centralized Admin:   http://localhost:5173/admin
echo     Username: admin
echo     Password: NanovaAdmin@2026
echo ====================================================================
echo.
pause
