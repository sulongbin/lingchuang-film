[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Archive,
    [Parameter(Mandatory=$true)][string]$Destination,
    [Parameter(Mandatory=$true)][ValidateSet('Codex','WorkBuddy')][string]$App,
    [string]$PythonExecutable = 'python',
    [string]$UserRoot = $env:USERPROFILE,
    [switch]$SkipDependencies
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ((Get-FileHash -LiteralPath $Archive -Algorithm SHA256).Hash -ne '13e69fa232a691e550060dccd3645ad681881eb5578c27238aa08448051cf2f4') {
    throw 'Archive checksum mismatch.'
}
if (-not [IO.Path]::IsPathRooted($Destination) -or (Test-Path -LiteralPath $Destination)) {
    throw 'Extraction destination must be a new absolute path.'
}
Expand-Archive -LiteralPath $Archive -DestinationPath $Destination
$source = Join-Path $Destination 'lingchuang-film'
# Add a UTF-8 BOM to staged PowerShell scripts for Windows PowerShell 5.1.
# The original ZIP and all skill files remain byte-for-byte unchanged.
foreach ($name in @('install.ps1', 'install-codex.ps1', 'install-workbuddy.ps1')) {
    $file = Join-Path $source $name
    $text = [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8)
    [IO.File]::WriteAllText($file, $text, [Text.UTF8Encoding]::new($true))
}
$entry = if ($App -eq 'Codex') { 'install-codex.ps1' } else { 'install-workbuddy.ps1' }
& (Join-Path $source $entry) -UserRoot $UserRoot -PythonExecutable $PythonExecutable -SkipDependencies:$SkipDependencies
