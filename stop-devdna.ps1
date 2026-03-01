$ErrorActionPreference = "Stop"

$targets = Get-CimInstance Win32_Process | Where-Object {
    ($_.Name -eq "python.exe" -and $_.CommandLine -match "DevDNA\\backend" -and $_.CommandLine -match "app.py") -or
    ($_.Name -eq "node.exe" -and $_.CommandLine -match "DevDNA\\frontend" -and $_.CommandLine -match "vite")
}

if (-not $targets) {
    Write-Host "No DevDNA dev processes were found." -ForegroundColor Yellow
    exit 0
}

foreach ($target in $targets) {
    try {
        Stop-Process -Id $target.ProcessId -Force -ErrorAction Stop
        Write-Host "Stopped $($target.Name) (PID $($target.ProcessId))"
    } catch {
        Write-Host "Failed to stop PID $($target.ProcessId): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "DevDNA processes stopped." -ForegroundColor Green
