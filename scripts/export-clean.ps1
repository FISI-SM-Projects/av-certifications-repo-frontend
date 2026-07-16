$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ProjectName = Split-Path $ProjectRoot -Leaf
$ExportRoot = Join-Path $ProjectRoot "dist/export"
$StageRoot = Join-Path $ExportRoot "_staging"
$StageProject = Join-Path $StageRoot $ProjectName
$ZipPath = Join-Path $ExportRoot "$ProjectName-clean.zip"

function Should-Exclude([string] $RelativePath, [bool] $IsDirectory) {
    $normalized = $RelativePath -replace "\\", "/"

    if ($normalized -eq "") {
        return $false
    }

    $segments = $normalized -split "/"
    $first = $segments[0]

    if ($first -in @(".git", "node_modules", ".next", "dist", "exports", ".idea", ".vscode")) {
        return $true
    }

    if ($normalized -match "(^|/)\.env(\..*)?$" -and $normalized -ne ".env.example") {
        return $true
    }

    if ($normalized -match "\.(log|tmp|temp|zip)$") {
        return $true
    }

    if ($normalized -match "(^|/)(Thumbs\.db|\.DS_Store)$") {
        return $true
    }

    return $false
}

if (Test-Path $StageRoot) {
    Remove-Item -LiteralPath $StageRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $StageProject -Force | Out-Null

Get-ChildItem -LiteralPath $ProjectRoot -Force | ForEach-Object {
    $relative = $_.Name
    if (-not (Should-Exclude $relative $_.PSIsContainer)) {
        Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $StageProject $_.Name) -Recurse -Force
    }
}

Get-ChildItem -LiteralPath $StageProject -Recurse -Force | Sort-Object FullName -Descending | ForEach-Object {
    $relative = $_.FullName.Substring($StageProject.Length).TrimStart("\", "/")
    if (Should-Exclude $relative $_.PSIsContainer) {
        Remove-Item -LiteralPath $_.FullName -Recurse -Force
    }
}

if (Test-Path $ZipPath) {
    Remove-Item -LiteralPath $ZipPath -Force
}

Compress-Archive -Path (Join-Path $StageProject "*") -DestinationPath $ZipPath -Force
Remove-Item -LiteralPath $StageRoot -Recurse -Force

Write-Host "Export created: $ZipPath"
