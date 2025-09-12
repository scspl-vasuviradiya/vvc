@echo off
echo Testing Node.js Collection Server...
echo.

:: Check if server.js exists
if not exist "server.js" (
    echo [ERROR] server.js not found!
    pause
    exit
)

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    pause
    exit
)

echo [INFO] Node.js found. Testing server...
echo [INFO] Starting server in background...

:: Start server
start /min "Test Server" cmd /c "node server.js"

:: Wait for startup
timeout /t 3 /nobreak >nul

:: Test the endpoints
echo [INFO] Testing endpoints...

:: Test static file
echo Checking HTML file...
curl -s -o nul -w "HTML Status: %%{http_code}\n" "http://localhost:8888/collection-management.html"

:: Test collections endpoint
echo Checking collections endpoint...
curl -s -o nul -w "Collections Status: %%{http_code}\n" "http://localhost:8888/save-collections.php"

echo.
echo [INFO] If all status codes are 200, the server is working correctly!
echo [INFO] Open http://localhost:8888/collection-management.html in your browser
echo.
echo Press any key to stop test server...
pause >nul

:: Kill the test server
taskkill /f /im node.exe >nul 2>&1
echo Test completed.
pause