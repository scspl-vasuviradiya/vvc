@echo off
echo Starting Vivah Villa Collection Server (Node.js)...
echo.
echo Killing any existing processes...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo.
echo Starting Enhanced Node.js server on port 8888...
echo Features: Full gallery management + collection management
echo.
node server.js
pause
