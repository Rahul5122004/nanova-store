@echo off
title NANOVA Dual-Brand E-Commerce Server
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo =======================================================
echo   Starting NANOVA E-Commerce Platform on Port 5001...
echo   Website: http://localhost:5001
echo   Admin:   http://localhost:5001/admin
echo =======================================================
"C:\Program Files\nodejs\node.exe" server/src/index.js
pause
