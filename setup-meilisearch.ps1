# Meilisearch Setup Script for Windows

Write-Host "🔍 Setting up Meilisearch..." -ForegroundColor Cyan

# Create meilisearch directory
$meilisearchDir = ".\meilisearch"
if (-not (Test-Path $meilisearchDir)) {
    New-Item -ItemType Directory -Path $meilisearchDir | Out-Null
}

# Download Meilisearch
$version = "v1.10.3"
$downloadUrl = "https://github.com/meilisearch/meilisearch/releases/download/$version/meilisearch-windows-amd64.exe"
$exePath = "$meilisearchDir\meilisearch.exe"

Write-Host "📥 Downloading Meilisearch $version..." -ForegroundColor Yellow

try {
    # Download with progress
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing
    $ProgressPreference = 'Continue'
    
    Write-Host "✅ Meilisearch downloaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Location: $exePath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To start Meilisearch, run:" -ForegroundColor Cyan
    Write-Host "  .\meilisearch\meilisearch.exe --master-key=`"MASTER_KEY_DEV_MODE`"" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the start script:" -ForegroundColor Cyan
    Write-Host "  .\start-meilisearch.ps1" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error downloading Meilisearch: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
