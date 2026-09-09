<#
.SYNOPSIS
    Syncs or clones upstream mirrors locally under .upstream/
#>
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$UpstreamDir = Join-Path $Root ".upstream"

$Repos = @(
    @{ Name = "caveman";  Url = "https://github.com/JuliusBrussee/caveman.git" },
    @{ Name = "ponytail"; Url = "https://github.com/DietrichGebert/ponytail.git" }
)

if (-not (Test-Path $UpstreamDir)) {
    New-Item -ItemType Directory -Path $UpstreamDir -Force | Out-Null
}

foreach ($repo in $Repos) {
    $target = Join-Path $UpstreamDir $repo.Name
    Write-Host "==> Syncing $($repo.Name) ($($repo.Url))..." -ForegroundColor Cyan
    if (Test-Path (Join-Path $target ".git")) {
        git -C $target pull --ff-only
        if ($LASTEXITCODE -ne 0) { throw "Git pull failed for $($repo.Name)" }
    } else {
        if (Test-Path $target) {
            Remove-Item -Recurse -Force $target
        }
        git clone --depth 1 $repo.Url $target
        if ($LASTEXITCODE -ne 0) { throw "Git clone failed for $($repo.Name)" }
    }
}

Write-Host "`nAll upstream mirrors synced locally in $UpstreamDir." -ForegroundColor Green
