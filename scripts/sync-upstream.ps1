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

# Release mirrors: verified release asset ZIP for repositories too large to clone.
# Asset must ship "<Asset>.zip" + "<Asset>.sha256" with a single "<ZipRoot>/" folder.
$Releases = @(
    @{ Name = "hyperframes"; Repo = "heygen-com/hyperframes"; Asset = "hyperframes-agent-plugin"; ZipRoot = "hyperframes" }
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

foreach ($rel in $Releases) {
    $target = Join-Path $UpstreamDir $rel.Name
    $tagFile = Join-Path $target ".release-tag"
    Write-Host "==> Syncing $($rel.Name) (latest release of $($rel.Repo))..." -ForegroundColor Cyan
    $headers = @{ "User-Agent" = "my-agent-kit-sync" }
    $info = Invoke-RestMethod "https://api.github.com/repos/$($rel.Repo)/releases/latest" -Headers $headers
    $tag = $info.tag_name
    if ((Test-Path $tagFile) -and ((Get-Content -Raw $tagFile).Trim() -eq $tag)) {
        Write-Host "Already at $tag"
        continue
    }
    $zipUrl = ($info.assets | Where-Object name -eq "$($rel.Asset).zip").browser_download_url
    $shaUrl = ($info.assets | Where-Object name -eq "$($rel.Asset).sha256").browser_download_url
    if (-not $zipUrl -or -not $shaUrl) { throw "Release $tag of $($rel.Repo) lacks $($rel.Asset).zip/.sha256" }

    $tmp = Join-Path ([IO.Path]::GetTempPath()) "upstream-$($rel.Name)-$PID"
    New-Item -ItemType Directory -Path $tmp -Force | Out-Null
    try {
        $zip = Join-Path $tmp "asset.zip"
        Invoke-WebRequest $zipUrl -OutFile $zip -Headers $headers
        $shaFile = Join-Path $tmp "asset.sha256"
        Invoke-WebRequest $shaUrl -OutFile $shaFile -Headers $headers
        $expected = (([IO.File]::ReadAllText($shaFile)).Trim() -split '\s+')[0].ToLower()
        $stream = [IO.File]::OpenRead($zip)
        try { $actual = ([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($stream)) -replace '-', '').ToLower() }
        finally { $stream.Dispose() }
        if ($actual -ne $expected) { throw "SHA-256 mismatch for $($rel.Name) ${tag}: expected $expected, got $actual" }
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [IO.Compression.ZipFile]::ExtractToDirectory($zip, (Join-Path $tmp "x"))
        if (Test-Path $target) { Remove-Item -Recurse -Force $target }
        Move-Item (Join-Path $tmp "x\$($rel.ZipRoot)") $target
        Set-Content -Path $tagFile -Value $tag -NoNewline
        Write-Host "Mirrored $tag"
    } finally {
        Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    }
}

Write-Host "`nAll upstream mirrors synced locally in $UpstreamDir." -ForegroundColor Green
