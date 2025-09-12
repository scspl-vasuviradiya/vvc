@echo off
:: Quick start for Collection Management System
:: Just starts server and opens browser

echo Starting Collection Management System...

:: Kill any existing servers
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

:: Start Python server if available
python --version >nul 2>&1
if %errorlevel% == 0 (
    if exist "server.py" (
        echo Starting Python server on port 8888...
        start /min "Collection Server" cmd /c "python server.py"
        timeout /t 3 /nobreak >nul
        start http://localhost:8888/collection-management.html
        echo.
        echo Collection Management is now running at:
        echo http://localhost:8888/collection-management.html
        echo.
        echo Server is running in background. Close this window to stop.
        pause >nul
        taskkill /f /im python.exe >nul 2>&1
        exit /b 0
    )
)

:: Try Node.js if Python not available
node --version >nul 2>&1
if %errorlevel% == 0 (
    if exist "server.js" (
        echo Starting Node.js server on port 8888...
        start /min "Collection Server" cmd /c "node server.js"
        timeout /t 3 /nobreak >nul
        start http://localhost:8888/collection-management.html
        echo.
        echo Collection Management is now running at:
        echo http://localhost:8888/collection-management.html
        echo.
        echo Server is running in background. Close this window to stop.
        pause >nul
        taskkill /f /im node.exe >nul 2>&1
        exit /b 0
    )
)

echo Error: No server available!
echo Please install Python or Node.js, then run again.
pause