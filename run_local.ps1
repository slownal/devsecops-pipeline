$ErrorActionPreference = "Stop"
$WorkingDir = $PSScriptRoot

Write-Host "============================" -ForegroundColor Cyan
Write-Host "Starting Local DevSecOps..." -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# 1. Start ML Service (Port 8001)
Write-Host "Spawning ML Service Installer/Runner..." -ForegroundColor Yellow
$MlScript = @"
cd `"`$WorkingDir\ml-service`"
Write-Host 'Setting up ML Service...' -ForegroundColor Green
if (!(Test-Path venv)) { python -m venv venv }
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Write-Host 'Starting ML Service on port 8001...' -ForegroundColor Green
uvicorn app.main:app --port 8001
"@
Start-Process powershell -ArgumentList "-NoExit -Command `"$MlScript`""

# 2. Start Backend API (Port 8000)
Write-Host "Spawning Backend API Installer/Runner..." -ForegroundColor Yellow
$BackendScript = @"
cd `"`$WorkingDir\backend`"
Write-Host 'Setting up Backend API...' -ForegroundColor Green
if (!(Test-Path venv)) { python -m venv venv }
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
`$env:DATABASE_URL='sqlite:///./devsecops.db'
Write-Host 'Starting Backend API on port 8000...' -ForegroundColor Green
uvicorn app.main:app --port 8000 --reload
"@
Start-Process powershell -ArgumentList "-NoExit -Command `"$BackendScript`""

# 3. Start Frontend Dashboard (Port 3000)
Write-Host "Spawning React Frontend Installer/Runner..." -ForegroundColor Yellow
$FrontendScript = @"
cd `"`$WorkingDir\frontend`"
Write-Host 'Installing Node Modules...' -ForegroundColor Green
npm install
Write-Host 'Starting React Dashboard on Port 3000...' -ForegroundColor Green
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit -Command `"$FrontendScript`""

Write-Host "All services are booting up in separate windows!" -ForegroundColor Green
