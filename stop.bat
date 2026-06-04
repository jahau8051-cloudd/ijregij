@echo off
echo Shutting down MediDash Developer Servers...
echo ------------------------------------------

taskkill /F /IM node.exe >nul 2>&1

echo.
echo All MediDash background processes have been successfully stopped!
echo You can safely close this window.
pause
