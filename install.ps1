[CmdletBinding()]
param(
    [ValidateSet('Codex','WorkBuddy','QwenWork','QwenCode','ClaudeCode','Cursor','GeminiCLI','Portable')]
    [string]$App,
    [string]$PythonExecutable,
    [switch]$InstallPython,
    [switch]$Check,
    [string]$Archive,
    [string]$UserRoot = $env:USERPROFILE,
    [switch]$SkipDependencies
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$ReleaseVersion = '0.1.6'
$ReleaseHash = 'e6e6e1733222486aaf10c07a25cc2d5d80de5521043ac5f80567f320faca6272'
$ReleaseURL = 'https://raw.githubusercontent.com/sulongbin/lingchuang-film/main/distributions/v0.1.6/lingchuang-film-v0.1.6-windows.zip'

function Test-PythonCandidate([string]$Command, [string[]]$Prefix = @()) {
    if (-not $Command -or -not (Get-Command $Command -ErrorAction SilentlyContinue)) { return $null }
    try {
        $result = & $Command @Prefix -c "import sys,struct; print(sys.executable if sys.version_info >= (3,11) and struct.calcsize('P')==8 else '')" 2>$null
        if ($LASTEXITCODE -eq 0 -and $result -and (Test-Path -LiteralPath ([string]$result) -PathType Leaf)) {
            return ([string]$result).Trim()
        }
    } catch { return $null }
    return $null
}

function Find-Python([string]$ExplicitPath) {
    if ($ExplicitPath) { return (Test-PythonCandidate $ExplicitPath) }
    foreach ($command in @('python', 'python3')) {
        $found = Test-PythonCandidate $command
        if ($found) { return $found }
    }
    foreach ($version in @('-3.12', '-3.13', '-3.11', '-3')) {
        $found = Test-PythonCandidate 'py' @($version)
        if ($found) { return $found }
    }
    if ($env:LOCALAPPDATA) {
        $found = Test-PythonCandidate (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python312\python.exe')
        if ($found) { return $found }
    }
    return $null
}

function Install-UserPython {
    if (-not (Get-Command winget.exe -ErrorAction SilentlyContinue)) {
        throw 'WinGet is unavailable. Install 64-bit Python 3.11+ from https://www.python.org/downloads/windows/ and run this command again.'
    }
    & winget.exe install --id Python.Python.3.12 --exact --source winget --scope user --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Host
    if ($LASTEXITCODE -ne 0) { throw 'Python installation failed. Keep the output and resolve it before retrying.' }
}

function Require-Python([string]$ExplicitPath, [bool]$AllowInstall, [bool]$CheckOnly) {
    $found = Find-Python $ExplicitPath
    if ($found) { return $found }
    if ($CheckOnly) { throw 'CHECK FAILED: 64-bit Python 3.11+ was not found. No dependencies installed.' }
    if ($ExplicitPath) { throw 'The specified Python executable is unavailable, older than 3.11, or not 64-bit.' }
    if (-not $AllowInstall) {
        Write-Host '未找到 64 位 Python 3.11+；本入口不需要 Node.js 或 Git。'
        Write-Host '可选：通过 WinGet 的 winget 源为当前用户安装 Python 3.12，并接受对应源和软件协议。'
        $answer = Read-Host '是否安装 Python？同意请输入 YES，其他输入将停止'
        if ($answer -cne 'YES') { throw 'Python installation was not authorized. No skill installed.' }
    }
    Install-UserPython
    $found = Find-Python ''
    if (-not $found) { throw 'Python installed but could not be located. Reopen PowerShell or specify -PythonExecutable with its full path.' }
    return $found
}

function Assert-ReleaseArchive([string]$File) {
    if ((Get-FileHash -LiteralPath $File -Algorithm SHA256).Hash -ne $ReleaseHash) {
        throw 'Archive SHA-256 mismatch. No archive code executed; download the matching installer again.'
    }
}

function Install-LingchuangFilm {
    if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) { throw 'This package requires Windows.' }
    $selectedApp = $App
    if (-not $selectedApp) {
        $selectedApp = Read-Host '请选择一个：Codex / WorkBuddy / QwenWork(千问办公) / QwenCode / ClaudeCode / Cursor / GeminiCLI / Portable(通用)'
    }
    if ($selectedApp -notin @('Codex','WorkBuddy','QwenWork','QwenCode','ClaudeCode','Cursor','GeminiCLI','Portable')) {
        throw 'Unknown app; no installation performed.'
    }
    if ($Check -and $SkipDependencies) { throw '-Check and -SkipDependencies cannot be combined.' }
    Write-Host "Lingchuang Film v$ReleaseVersion / $selectedApp / https://lczyai.com"
    $stage = Join-Path ([IO.Path]::GetTempPath()) ('lingchuang-film-' + [guid]::NewGuid().ToString('N'))
    $null = New-Item -ItemType Directory -Path $stage
    $localArchive = $Archive
    if (-not $localArchive) {
        $localArchive = Join-Path $stage 'package.zip'
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -UseBasicParsing -Uri $ReleaseURL -OutFile $localArchive -TimeoutSec 120
    }
    Assert-ReleaseArchive $localArchive
    $env:PYTHONUTF8 = '1'
    $python = if ($SkipDependencies) { $PythonExecutable } else { Require-Python $PythonExecutable $InstallPython.IsPresent $Check.IsPresent }
    if ($Check) {
        Write-Host "CHECK OK: v$ReleaseVersion / $selectedApp / SHA-256 / Python: $python. No skill installed."
        return
    }
    $unpacked = Join-Path $stage 'unpacked'
    Expand-Archive -LiteralPath $localArchive -DestinationPath $unpacked
    & (Join-Path $unpacked 'lingchuang-film\install.ps1') -App $selectedApp -UserRoot $UserRoot -PythonExecutable $python -SkipDependencies:$SkipDependencies
    Write-Host 'Use the printed SKILL.md and .venv Python paths in your selected agent. Reopen the app if needed.'
    Write-Host 'Register at https://lczyai.com and configure your own LCZYAI_API_KEY. Installation does not authorize paid generation.'
    Write-Host "Staging retained: $stage"
}

# Dot-sourcing loads functions only, for isolated prerequisite tests.
if ($MyInvocation.InvocationName -ne '.') { Install-LingchuangFilm }
