@echo off
title Vivah Villa - Gallery Management Server
color 0A

echo Starting Gallery Management Server...
echo.
echo [INFO] This launcher will try to use PHP for full gallery functionality
echo [INFO] If PHP is not available, Python/Node.js will be used with limited features

:: Kill any existing servers
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im php.exe >nul 2>&1

:: Check for PHP first (recommended for full gallery functionality)
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] PHP found - Starting PHP server with FULL gallery functionality...
    start /min "PHP Gallery Server" cmd /c "php -S localhost:8888"
    timeout /t 3 /nobreak >nul
    goto open_browser
)

:: Try Python as fallback (limited gallery features)
python --version >nul 2>&1
if %errorlevel% == 0 (
    if exist "server.py" (
        echo [INFO] Python found - Starting Python server (limited gallery upload/delete)...
        start /min "Python Gallery Server" cmd /c "python server.py"
        timeout /t 3 /nobreak >nul
        goto open_browser
    )
)

:: Try Node.js as fallback (limited gallery features)
node --version >nul 2>&1
if %errorlevel% == 0 (
    if exist "server.js" (
        echo [INFO] Node.js found - Starting Node.js server (limited gallery upload/delete)...
        start /min "Node Gallery Server" cmd /c "node server.js"
        timeout /t 3 /nobreak >nul
        goto open_browser
    )
)

echo [ERROR] No suitable server found!
echo.
echo For FULL gallery functionality, install PHP: https://windows.php.net/download/
echo For basic functionality, install Python: https://python.org/downloads/
pause
exit /b 1

:open_browser
start http://localhost:8888/gallery-management.html
echo.
echo ================================================================
echo                   GALLERY SERVER RUNNING!
echo ================================================================
echo.
echo [SUCCESS] Gallery Management System is now running!
echo.
echo URLs:
echo   Gallery Management: http://localhost:8888/gallery-management.html
echo   Collection Management: http://localhost:8888/collection-management.html
echo   Website: http://localhost:8888/index.html
echo.
echo FUNCTIONALITY:
if exist php.exe (
    echo   ✓ FULL gallery upload/delete with PHP
) else (
    echo   ⚠ LIMITED gallery features (upload/delete disabled)
)
echo   ✓ Gallery listing and manifest management
echo   ✓ Collection management (full functionality)
echo.
echo Server is running in background. Close this window to stop.
pause >nul

echo [INFO] Stopping servers...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im php.exe >nul 2>&1