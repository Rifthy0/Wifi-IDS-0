@echo off
echo ========================================================
echo Starting Smart Wi-Fi IDS Engine...
echo ========================================================
echo.
echo NOTE: For "Real Mode" to properly scan Wi-Fi networks, 
echo it is highly recommended to right-click this file and 
echo select "Run as Administrator".
echo.

:: Activate python environment
call venv\Scripts\activate

:: Wait 3 seconds then open browser
timeout /t 3 /nobreak > NUL
start http://localhost:3000

:: Start the stack
echo Starting backend and frontend...
call npm run dev

pause
