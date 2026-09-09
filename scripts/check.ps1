<#
.SYNOPSIS
    Lightweight syntax & type validation for extension scripts using Bun
#>
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Plugins = @("caveman", "ponytail")

Write-Host "==> Validating TypeScript extensions..." -ForegroundColor Cyan

foreach ($plugin in $Plugins) {
    $entry = Join-Path $Root "plugins/$plugin/extensions/index.ts"
    if (-not (Test-Path $entry)) {
        throw "Extension entry not found: $entry"
    }
    bun build $entry --target=bun --no-bundle > $null
    if ($LASTEXITCODE -ne 0) {
        throw "Extension build validation failed for $plugin"
    }
    Write-Host "  [OK] $plugin/extensions/index.ts" -ForegroundColor Green
}

Write-Host "`nAll extensions validated successfully." -ForegroundColor Green
