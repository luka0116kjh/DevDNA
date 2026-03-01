$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$backendPython = Join-Path $backendDir "venv\Scripts\python.exe"
$backendLog = Join-Path $projectRoot "backend.log"
$backendErrLog = Join-Path $projectRoot "backend.err.log"
$frontendLog = Join-Path $projectRoot "frontend.log"
$frontendErrLog = Join-Path $projectRoot "frontend.err.log"

function Stop-DevDNAProcesses {
    $targets = Get-CimInstance Win32_Process | Where-Object {
        ($_.Name -eq "python.exe" -and $_.CommandLine -match "DevDNA\\backend" -and $_.CommandLine -match "app.py") -or
        ($_.Name -eq "node.exe" -and $_.CommandLine -match "DevDNA\\frontend" -and $_.CommandLine -match "vite")
    }

    foreach ($target in $targets) {
        try {
            Stop-Process -Id $target.ProcessId -Force -ErrorAction Stop
        } catch {
            Write-Host "Failed to stop PID $($target.ProcessId): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

function Test-PortOpen([int]$port) {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    return $null -ne $listener
}

function Assert-PortAvailable([int]$port, [string]$name) {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
        $procInfo = if ($proc) { "$($proc.Name) (PID $($proc.ProcessId))" } else { "PID $($listener.OwningProcess)" }
        throw "$name could not start because port $port is already in use by $procInfo."
    }
}

Write-Host "[1/4] Stopping existing DevDNA dev processes..." -ForegroundColor Cyan
Stop-DevDNAProcesses
Start-Sleep -Seconds 1

Write-Host "[2/4] Checking required ports..." -ForegroundColor Cyan
Assert-PortAvailable -port 5000 -name "Backend"
Assert-PortAvailable -port 5173 -name "Frontend"

Write-Host "[3/4] Starting backend..." -ForegroundColor Cyan
if (!(Test-Path $backendPython)) {
    throw "Backend python was not found at: $backendPython"
}

Remove-Item $backendLog, $backendErrLog -ErrorAction SilentlyContinue
$backendProcess = Start-Process `
    -FilePath $backendPython `
    -ArgumentList "app.py" `
    -WorkingDirectory $backendDir `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError $backendErrLog `
    -PassThru

Write-Host "Backend PID: $($backendProcess.Id)" -ForegroundColor DarkGray

Write-Host "[4/4] Starting frontend..." -ForegroundColor Cyan
Remove-Item $frontendLog, $frontendErrLog -ErrorAction SilentlyContinue
$frontendProcess = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173" `
    -WorkingDirectory $frontendDir `
    -RedirectStandardOutput $frontendLog `
    -RedirectStandardError $frontendErrLog `
    -PassThru

Write-Host "Frontend PID: $($frontendProcess.Id)" -ForegroundColor DarkGray

Write-Host "Waiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

$backendReady = Test-PortOpen -port 5000
$frontendReady = Test-PortOpen -port 5173

if (-not $backendReady -or -not $frontendReady) {
    throw "One or more services failed to start. Check backend.err.log / frontend.err.log in project root."
}

Write-Host ""
Write-Host "DevDNA is running." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://127.0.0.1:5000"
