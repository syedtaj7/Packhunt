# Start Meilisearch Server

$exePath = ".\meilisearch\meilisearch.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "❌ Meilisearch not found. Run setup-meilisearch.ps1 first!" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting Meilisearch..." -ForegroundColor Cyan
Write-Host "📍 Dashboard: http://localhost:7700" -ForegroundColor Green
Write-Host "🔑 Master Key: MASTER_KEY_DEV_MODE" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start Meilisearch
& $exePath --master-key="MASTER_KEY_DEV_MODE" --db-path=".\meilisearch\data"
