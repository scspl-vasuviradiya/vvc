@echo off
title Vivah Villa Collection Management - Localhost Server
color 0A

echo.
echo ================================================================
echo    VIVAH VILLA COLLECTION MANAGEMENT - LOCALHOST SERVER
echo ================================================================
echo.

:: Get current directory
set "CURRENT_DIR=%~dp0"
set "HTML_FILE=%CURRENT_DIR%collection-management.html"
set "SERVER_PORT=8888"

:: Check if collection-management.html exists
if not exist "%HTML_FILE%" (
    echo [ERROR] collection-management.html not found!
    echo Please make sure this file is in the same folder as the HTML file.
    pause
    exit /b 1
)

echo [INFO] Starting Localhost Server for Collection Management...
echo.

:: Check for Python (preferred server)
echo [DEBUG] Checking for Python...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] Python found. Starting Python Collection Server...
    goto start_python_server
)

:: Check for Node.js
echo [DEBUG] Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] Node.js found. Starting Node.js Collection Server...
    goto start_node_server
)

:: Check for PHP
echo [DEBUG] Checking for PHP...
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] PHP found. Starting PHP HTTP server...
    goto start_php_server
)

:: No server found, offer to install
echo [WARNING] No suitable HTTP server found!
echo.
echo To run the collection management system with full functionality,
echo you need one of the following:
echo   - Python (Recommended) - Uses server.py
echo   - Node.js (Good alternative) - Uses server.js
echo   - PHP (If available) - Uses built-in server
echo.
echo [1] Install Python (Recommended)
echo [2] Try opening with file:// (Limited functionality)
echo [Q] Quit
echo.

set /p "choice=Choose an option [1/2/Q]: "

if "%choice%"=="1" goto install_python
if "%choice%"=="2" goto fallback_file
if /i "%choice%"=="Q" goto end

echo [ERROR] Invalid choice. Please try again.
goto choice

:install_python
echo.
echo [INFO] Opening Python download page...
echo Please download and install Python, then run this script again.
echo.
start https://www.python.org/downloads/
pause
goto end

:fallback_file
echo.
echo [INFO] Opening with file:// protocol (limited functionality)...
start "" "%HTML_FILE%"
echo.
echo [WARNING] File mode limitations:
echo - Cannot save directly to collections.json
echo - Data saved to browser storage only
echo - Use localhost server for full functionality
echo.
pause
goto end

:start_python_server
echo.
echo [INFO] Starting Python Collection Management Server on port %SERVER_PORT%...
echo [INFO] Server will run at: http://localhost:%SERVER_PORT%
echo [INFO] This server supports full PHP endpoint functionality
echo.

:: Check if our custom server exists
if not exist "%CURRENT_DIR%server.py" (
    echo [ERROR] server.py not found! Please ensure all files are present.
    pause
    goto end
)

:: Start Python server in background
start /min "Python Collection Server" cmd /c "cd /d "%CURRENT_DIR%" && python server.py"

:: Wait a moment for server to start
timeout /t 5 /nobreak >nul

:: Open in browser
echo [INFO] Opening collection management in browser...
start http://localhost:%SERVER_PORT%/collection-management.html

goto server_success

:start_php_server
echo.
echo [INFO] Starting PHP HTTP server on port %SERVER_PORT%...
echo [INFO] Server will run at: http://localhost:%SERVER_PORT%
echo.

:: Start PHP server in background
start /min "PHP HTTP Server" cmd /c "cd /d "%CURRENT_DIR%" && php -S localhost:%SERVER_PORT%"

:: Wait a moment for server to start
timeout /t 3 /nobreak >nul

:: Open in browser
echo [INFO] Opening collection management in browser...
start http://localhost:%SERVER_PORT%/collection-management.html

goto server_success

:start_node_server
echo.
echo [INFO] Starting Node.js Collection Management Server on port %SERVER_PORT%...
echo [INFO] Server will run at: http://localhost:%SERVER_PORT%
echo [INFO] This server supports full PHP endpoint functionality
echo.

:: Check if our custom server exists
if not exist "%CURRENT_DIR%server.js" (
    echo [ERROR] server.js not found! Please ensure all files are present.
    pause
    goto end
)

:: Start Node.js server in background
start /min "Node Collection Server" cmd /c "cd /d "%CURRENT_DIR%" && node server.js"

:: Wait a moment for server to start
timeout /t 5 /nobreak >nul

:: Open in browser
echo [INFO] Opening collection management in browser...
start http://localhost:%SERVER_PORT%/collection-management.html

goto server_success

:server_success
echo.
echo ================================================================
echo                        SERVER RUNNING!
echo ================================================================
echo.
echo [SUCCESS] Collection Management System is now running!
echo.
echo SERVER INFO:
echo   URL: http://localhost:%SERVER_PORT%/collection-management.html
echo   Mode: Full functionality with direct file access
echo   Port: %SERVER_PORT%
echo.
echo FEATURES AVAILABLE:
echo   ✓ Direct access to collections.json
echo   ✓ Real-time data saving
echo   ✓ Image upload to img/collections/
echo   ✓ PHP endpoint emulation (works with both Python and Node.js)
echo   ✓ Full CRUD operations with automatic backups
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
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo [INFO] Server stopped.

:end
echo.
echo Press any key to exit...
pause >nul