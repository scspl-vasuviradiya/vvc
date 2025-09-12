@echo off
title System Check - Collection Management
color 0F

echo.
echo ================================================================
echo            SYSTEM CHECK - COLLECTION MANAGEMENT
echo ================================================================
echo.

echo [INFO] Checking system requirements...
echo.

:: Check Python
echo Checking Python:
python --version >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('python --version 2^>&1') do echo   ✓ FOUND: %%i
    set PYTHON_OK=1
) else (
    echo   ❌ NOT FOUND
    set PYTHON_OK=0
)

:: Alternative Python check
py --version >nul 2>&1
if %errorlevel% == 0 (
    if not defined PYTHON_OK (
        for /f "tokens=*" %%i in ('py --version 2^>&1') do echo   ✓ FOUND (py): %%i
        set PYTHON_OK=1
    )
)

echo.

:: Check Node.js
echo Checking Node.js:
node --version >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('node --version 2^>&1') do echo   ✓ FOUND: %%i
    set NODE_OK=1
) else (
    echo   ❌ NOT FOUND
    set NODE_OK=0
)

echo.

:: Check PHP
echo Checking PHP:
php --version >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=1,2" %%i in ('php --version 2^>&1') do echo   ✓ FOUND: %%i %%j && goto php_done
) else (
    echo   ❌ NOT FOUND
)
:php_done

echo.

:: Check required files
echo Checking required files:

if exist "server.py" (
    echo   ✓ server.py found
) else (
    echo   ❌ server.py missing
)

if exist "server.js" (
    echo   ✓ server.js found
) else (
    echo   ❌ server.js missing
)

if exist "collection-management.html" (
    echo   ✓ collection-management.html found
) else (
    echo   ❌ collection-management.html missing
)

if exist "collections.json" (
    echo   ✓ collections.json found
) else (
    echo   ⚠️ collections.json missing (will be created)
)

if exist "img\collections" (
    echo   ✓ img\collections folder found
) else (
    echo   ⚠️ img\collections folder missing (will be created)
)

echo.
echo ================================================================
echo                         RECOMMENDATIONS
echo ================================================================
echo.

if %PYTHON_OK%==1 (
    if exist "server.py" (
        echo ✅ BEST OPTION: Use Python server
        echo    Command: python server.py
        echo    Or run: Quick-Start.bat
        echo.
    )
)

if %NODE_OK%==1 (
    if exist "server.js" (
        echo ✅ GOOD OPTION: Use Node.js server
        echo    Command: node server.js
        echo    Or run: Node-Start.bat
        echo.
    )
)

if %PYTHON_OK%==0 (
    if %NODE_OK%==0 (
        echo ❌ NO SERVERS AVAILABLE
        echo.
        echo Please install one of the following:
        echo 1. Python: https://python.org/downloads
        echo 2. Node.js: https://nodejs.org
        echo.
        echo After installation, copy the appropriate server file:
        echo - For Python: copy server.py from main PC
        echo - For Node.js: copy server.js from main PC
        echo.
    )
)

echo ================================================================
echo.

pause