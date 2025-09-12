@echo off
title Vivah Villa Collection Management - Direct Server Start
color 0A

echo.
echo ================================================================
echo    VIVAH VILLA COLLECTION MANAGEMENT - DIRECT START
echo ================================================================
echo.

:: Get current directory
set "CURRENT_DIR=%~dp0"

:: Check if server files exist
if not exist "%CURRENT_DIR%server.py" (
    if not exist "%CURRENT_DIR%server.js" (
        echo [ERROR] Neither server.py nor server.js found!
        echo Please ensure server files are present.
        pause
        exit /b 1
    )
)

echo [INFO] Starting Collection Management Server...
echo [INFO] Server will run on port 8888
echo [INFO] URL: http://localhost:8888/collection-management.html
echo.

:: Try Python first
python --version >nul 2>&1
if %errorlevel% == 0 (
    if exist "%CURRENT_DIR%server.py" (
        echo [INFO] Starting Python server...
        start /min "Python Collection Server" cmd /c "cd /d "%CURRENT_DIR%" && python server.py"
        goto server_started
    )
)

:: Try Node.js if Python failed
node --version >nul 2>&1
if %errorlevel% == 0 (
    if exist "%CURRENT_DIR%server.js" (
        echo [INFO] Starting Node.js server...
        start /min "Node Collection Server" cmd /c "cd /d "%CURRENT_DIR%" && node server.js"
        goto server_started
    )
)

:: If we get here, nothing worked
echo [ERROR] Could not start server!
echo.
echo Please ensure either:
echo   - Python is installed and server.py exists
echo   - Node.js is installed and server.js exists
echo.
pause
exit /b 1

:server_started
echo [SUCCESS] Server starting in background...
echo.

:: Wait for server to start
echo [INFO] Waiting for server to start...
timeout /t 3 /nobreak >nul

:: Try to open browser
echo [INFO] Opening browser...
start http://localhost:8888/collection-management.html

echo.
echo ================================================================
echo                        SERVER RUNNING!
echo ================================================================
echo.
echo [SUCCESS] Collection Management System is now running!
echo.
echo SERVER INFO:
echo   URL: http://localhost:8888/collection-management.html
echo   Port: 8888
echo   Full functionality: Save collections + Upload images
echo.
echo IMPORTANT:
echo - Keep this window open to maintain the server
echo - Server will stop when you close this window
echo - Your browser should open automatically
echo.
echo [INFO] Press any key to stop the server...
pause >nul

echo.
echo [INFO] Stopping server...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo [INFO] Server stopped.
echo.
echo Press any key to exit...
pause >nul