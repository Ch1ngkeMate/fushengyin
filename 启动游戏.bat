@echo off
title 浮生引 · 启动中...
echo ==============================================
echo   Fu Shen Yin v1.0
echo   Text RPG - Ancient China x Isekai
echo ==============================================
echo.
echo Starting server on http://localhost:8888
echo Open this URL in your phone browser
echo Press Ctrl+C to stop
echo.
cd /d "%~dp0"
start "" http://localhost:8888
python -m http.server 8888
pause
