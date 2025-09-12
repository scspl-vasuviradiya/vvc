@echo off
title Vivah Villa Collection Management - Node.js Server
color 0A

echo.
echo ================================================================
echo    VIVAH VILLA COLLECTION MANAGEMENT - NODE.JS SERVER
echo ================================================================
echo.

:: Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found in PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo After installation, restart your command prompt and try again.
    pause
    exit /b 1
)

:: Check Node.js version
echo [INFO] Checking Node.js installation...
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
if "%NODE_VERSION%"=="" (
    echo [ERROR] Cannot get Node.js version!
    pause
    exit /b 1
)

echo [INFO] Node.js version: %NODE_VERSION%

:: Check if server.js exists
if not exist "server.js" (
    echo [ERROR] server.js not found!
    echo.
    echo Please copy server.js from the main PC to this folder.
    echo The file should be in the same folder as this batch file.
    pause
    exit /b 1
)

:: Check if HTML file exists  
if not exist "collection-management.html" (
    echo [ERROR] collection-management.html not found!
    echo.
    echo Please copy all files from the main PC to this folder.
    pause
    exit /b 1
)

echo [INFO] All required files found.
echo [INFO] Starting Node.js Collection Management Server...
echo [INFO] Server will run on port 8888
echo [INFO] URL: http://localhost:8888/collection-management.html
echo.

:: Kill any existing servers
taskkill /f /im node.exe >nul 2>&1

:: Start Node.js server
echo [INFO] Starting server...
start /min "Node Collection Server" cmd /c "node server.js"

:: Wait for server to start
echo [INFO] Waiting for server to start...
timeout /t 4 /nobreak >nul

:: Test if server is responding
echo [INFO] Testing server connection...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8888/collection-management.html' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '[SUCCESS] Server is responding!' } catch { Write-Host '[WARNING] Server may still be starting...' }" 2>nul

:: Open browser
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
echo   Server: Node.js %NODE_VERSION%
echo   Full functionality: Save collections + Upload images
echo.
echo FEATURES AVAILABLE:
echo   ✓ Collections save to collections.json file
echo   ✓ Images upload to img/collections/ folder  
echo   ✓ Automatic backups before saving
echo   ✓ Full error handling and validation
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
taskkill /f /im node.exe >nul 2>&1
echo [INFO] Server stopped.
echo.
echo Press any key to exit...
pause >nul