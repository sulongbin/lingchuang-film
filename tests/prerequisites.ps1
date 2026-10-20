param([string]$Installer, [string]$Python)
$ErrorActionPreference = 'Stop'
. $Installer

$real = Find-Python $Python
if (-not $real) { throw 'Explicit real Python detection failed.' }
if (Test-PythonCandidate 'Z:\missing-python.exe') { throw 'Missing executable was accepted.' }

$script:found = $null
$script:installCalls = 0
$script:promptCalls = 0
$script:answer = 'NO'
function Find-Python([string]$ExplicitPath) { return $script:found }
function Install-UserPython { $script:installCalls++; $script:found = 'C:\fake-python.exe' }
function Read-Host([string]$Prompt) { $script:promptCalls++; return $script:answer }
function Must-Fail([scriptblock]$Action, [string]$Message) {
    $failed = $false
    try { & $Action } catch { $failed = $true }
    if (-not $failed) { throw $Message }
}

# Check mode must not prompt or install, even when an install flag was supplied.
Must-Fail { Require-Python '' $true $true } 'Check did not fail on missing Python.'
if ($script:installCalls -or $script:promptCalls) { throw 'Check mutated dependencies or prompted.' }
Must-Fail { Require-Python '' $false $false } 'Declined installation continued.'
if ($script:installCalls -ne 0 -or $script:promptCalls -ne 1) { throw 'Decline guard failed.' }
Must-Fail { Require-Python 'bad-explicit-python' $true $false } 'Bad explicit Python was replaced silently.'
if ($script:installCalls -ne 0) { throw 'Explicit-path failure installed Python.' }
$script:answer = 'YES'
$null = Require-Python '' $false $false
if ($script:installCalls -ne 1) { throw 'Interactive consent did not invoke the installer.' }
$null = Require-Python '' $true $false
if ($script:installCalls -ne 1) { throw 'Existing Python was unnecessarily installed.' }
$script:found = $null
$null = Require-Python '' $true $false
if ($script:installCalls -ne 2) { throw 'Explicit consent did not invoke the installer.' }

# Verify the actual WinGet argument vector without installing anything.
. $Installer
$script:captured = @()
function winget.exe { $script:captured = $args; $global:LASTEXITCODE = 0 }
Install-UserPython
$expected = @('install','--id','Python.Python.3.12','--exact','--source','winget','--scope','user','--accept-package-agreements','--accept-source-agreements','--disable-interactivity')
if (($script:captured -join '|') -ne ($expected -join '|')) { throw 'WinGet arguments changed.' }
function winget.exe { $global:LASTEXITCODE = 1 }
Must-Fail { Install-UserPython } 'WinGet failure was ignored.'
Write-Output 'PREREQUISITES OK: detection, check, refusal, consent, existing runtime, exact WinGet args and failure.'
