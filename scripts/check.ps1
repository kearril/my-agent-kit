<#
.SYNOPSIS
    Lightweight validation for marketplace and plugin package JSON files
#>
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Validating marketplace and package JSON files..." -ForegroundColor Cyan

$MarketplacePath = Join-Path $Root ".omp-plugin/marketplace.json"
if (-not (Test-Path $MarketplacePath)) {
    throw "marketplace.json not found: $MarketplacePath"
}
$Marketplace = Get-Content -Raw -Encoding utf8 $MarketplacePath | ConvertFrom-Json

foreach ($plugin in $Marketplace.plugins) {
    $src = Join-Path $Root $plugin.source
    if (-not (Test-Path $src)) {
        throw "Plugin source not found: $($plugin.source)"
    }
    $pkg = Join-Path $src "package.json"
    if (-not (Test-Path $pkg)) {
        throw "package.json missing in $($plugin.source)"
    }
    Get-Content -Raw -Encoding utf8 $pkg | ConvertFrom-Json | Out-Null
}
Write-Host "  [OK] marketplace.json & plugin package.json files valid" -ForegroundColor Green

Write-Host "`nAll validation checks passed successfully." -ForegroundColor Green
