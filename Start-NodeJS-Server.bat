@echo off
:: Vivah Villa Collection - Node.js Server

echo Starting Vivah Villa Collection Server...
echo.

:: Stop any existing servers
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is required. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting server on port 8888...

:: Start server
start "Vivah Villa Server" cmd /c "node server.js & pause"

:: Wait and open browser
timeout /t 3 /nobreak >nul
start http://localhost:8888/gallery-management.html

echo.
echo Server started successfully!
echo Gallery Management: http://localhost:8888/gallery-management.html
echo Collection Management: http://localhost:8888/collection-management.html
echo.
echo Close the server window to stop.
pause
