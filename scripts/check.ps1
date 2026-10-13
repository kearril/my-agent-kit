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
    $pkgJson = Get-Content -Raw -Encoding utf8 $pkg | ConvertFrom-Json
    if ($plugin.version -and $plugin.version -ne $pkgJson.version) {
        throw "Catalog version $($plugin.version) != package.json version $($pkgJson.version) for $($plugin.name)"
    }
    # Skills hidden from the model are only reachable through a Chinese command wrapper.
    $skillsDir = Join-Path $src "skills"
    if (Test-Path $skillsDir) {
        foreach ($skill in Get-ChildItem -Directory $skillsDir) {
            $md = Join-Path $skill.FullName "SKILL.md"
            if (-not (Test-Path $md)) { continue }
            $text = Get-Content -Raw -Encoding utf8 $md
            if ($text -match '(?s)\A---\r?\n(.*?)\r?\n---' -and $Matches[1] -match '(?m)^disable-model-invocation:\s*true\s*$' -and
                -not (Test-Path (Join-Path $src "commands/$($skill.Name).md"))) {
                throw "$($plugin.name): user-only skill `"$($skill.Name)`" has no commands/$($skill.Name).md"
            }
        }
    }
}
Write-Host "  [OK] marketplace.json & plugin package.json files valid" -ForegroundColor Green

Write-Host "`nAll validation checks passed successfully." -ForegroundColor Green
