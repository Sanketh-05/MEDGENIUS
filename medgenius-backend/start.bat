@echo off
echo.
echo ============================================
echo  MEDGENIUS Backend — Startup
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install Python 3.10+
    pause & exit /b 1
)

:: Check Ollama
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Ollama not running. Start Ollama and run: ollama pull mistral
    echo           The backend will still start — AI features need Ollama.
    echo.
)

:: Install dependencies if needed
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

call .venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt -q

:: Check if .env file exists
if not exist ".env" (
    echo.
    echo [WARNING] .env file not found. Creating template...
    echo Please edit .env and add your HuggingFace API key from https://huggingface.co/settings/tokens
)

echo.
echo Starting FastAPI server on http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo.
echo [IMPORTANT] Make sure HF_API_KEY is set in .env for image generation!
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
