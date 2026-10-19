<#
.SYNOPSIS
    Syncs or clones upstream mirrors locally under .upstream/
#>
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$Root = Split-Path -Parent $PSScriptRoot
$UpstreamDir = Join-Path $Root ".upstream"

# Git mirrors: shallow clone of the latest release tag (unreleased main commits are skipped).
$Repos = @(
    @{ Name = "matt"; Repo = "mattpocock/skills" }
)

if (-not (Test-Path $UpstreamDir)) {
    New-Item -ItemType Directory -Path $UpstreamDir -Force | Out-Null
}

foreach ($repo in $Repos) {
    $target = Join-Path $UpstreamDir $repo.Name
    $tagFile = Join-Path $target ".release-tag"
    Write-Host "==> Syncing $($repo.Name) (latest release of $($repo.Repo))..." -ForegroundColor Cyan
    $tag = (Invoke-RestMethod "https://api.github.com/repos/$($repo.Repo)/releases/latest" -Headers @{ "User-Agent" = "my-agent-kit-sync" }).tag_name
    if ((Test-Path $tagFile) -and ((Get-Content -Raw $tagFile).Trim() -eq $tag)) {
        Write-Host "Already at $tag"
        continue
    }
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
    git -c advice.detachedHead=false clone -q --depth 1 --branch $tag "https://github.com/$($repo.Repo).git" $target
    if ($LASTEXITCODE -ne 0) { throw "Git clone failed for $($repo.Name) $tag" }
    Set-Content -Path $tagFile -Value $tag -NoNewline
    Write-Host "Mirrored $tag"
}

Write-Host "`nAll upstream mirrors synced locally in $UpstreamDir." -ForegroundColor Green
