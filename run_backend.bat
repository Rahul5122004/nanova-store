@echo off
set PATH=C:\Program Files\nodejs;%PATH%
title Nanova Backend Server
cd /d "%~dp0server"
echo Starting Nanova Backend API Server on http://localhost:5000 ...
node --watch src/index.js
pause
