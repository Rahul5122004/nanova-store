@echo off
set PATH=C:\Program Files\nodejs;%PATH%
title Nanova Frontend Dev Server
cd /d "%~dp0client"
echo Starting Nanova Frontend Dev Server on http://localhost:5173 ...
node_modules\.bin\vite.cmd
pause
