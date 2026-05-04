@echo off
echo ========================================================
echo Smart Wi-Fi IDS - Initial Setup
echo ========================================================
echo.

echo [1/3] Setting up Python Virtual Environment...
python -m venv venv
call venv\Scripts\activate
echo Installing Python dependencies...
pip install -r requirements.txt
echo.

echo [2/3] Installing Node.js dependencies...
call npm install
echo.

echo [3/3] Setting up Environment Variables...
if not exist .env (
    copy .env.example .env
    echo Created .env file. 
    echo IMPORTANT: Please open the .env file and add your GEMINI_API_KEY before running.
) else (
    echo .env file already exists.
)
echo.

echo ========================================================
echo SETUP COMPLETE! 
echo You can now double-click "Start_IDS.bat" to run the app.
echo ========================================================
pause
