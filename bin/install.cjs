#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const APPS = { codex:'Codex', workbuddy:'WorkBuddy', qwenwork:'QwenWork', 'qwen-code':'QwenCode', 'claude-code':'ClaudeCode', cursor:'Cursor', 'gemini-cli':'GeminiCLI', portable:'Portable' };
const SHA256 = 'e6e6e1733222486aaf10c07a25cc2d5d80de5521043ac5f80567f320faca6272';
const ARCHIVE = 'lingchuang-film-v0.1.6-windows.zip';
const HELP = `灵创智影影视全流程 v0.1.6 — Windows
官网: https://lczyai.com

npx github:sulongbin/lingchuang-film --app codex
npx github:sulongbin/lingchuang-film --app workbuddy

Options:
  --app NAME            codex|workbuddy|qwenwork|qwen-code|claude-code|cursor|gemini-cli|portable (required).
  --python PATH         Python 3.11+ executable (default: auto-detect).
  --install-python      Consent to per-user Python 3.12 installation via WinGet if missing.
  --check               Check the archive and prerequisites without installing.
  --help                Show this help.

Register your own account at https://lczyai.com and configure your personal
LCZYAI_API_KEY after installation. Installation does not generate media or
spend platform credits. Paid generation requires a separate confirmed quote.
`;

function parseArgs(args) {
  const result = { check: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (seen.has(arg)) throw new Error(`Duplicate option: ${arg}`);
    seen.add(arg);
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--check') result.check = true;
    else if (arg === '--install-python') result.installPython = true;
    else if (arg === '--app' || arg === '--python') {
      const value = args[++i];
      if (!value || value.startsWith('-')) throw new Error(`Missing value: ${arg}`);
      result[arg.slice(2)] = value;
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!result.help && !Object.hasOwn(APPS, result.app))
    throw new Error('Choose exactly one host with --app; see --help.');
  return result;
}

function verifyArchive(file) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (actual !== SHA256) throw new Error('Package SHA-256 mismatch; installation stopped.');
}

function validatePython(output) {
  let version;
  try { version = JSON.parse(output); } catch { throw new Error('Could not determine Python version.'); }
  if (!Array.isArray(version) || !Number.isInteger(version[0]) || !Number.isInteger(version[1])
      || version[0] < 3 || (version[0] === 3 && version[1] < 11))
    throw new Error('Python 3.11+ is required; use --python PATH to select it.');
}

function powershellEnv() {
  const env = { ...process.env, PYTHONUTF8: '1' };
  // A PowerShell 7 parent can pass incompatible module paths to Windows PS 5.1.
  for (const key of Object.keys(env))
    if (key.toLowerCase() === 'psmodulepath') delete env[key];
  return env;
}

function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  if (options.help) { console.log(HELP); return; }
  if (process.platform !== 'win32') throw new Error('This installer supports Windows only.');
  const root = path.resolve(__dirname, '..');
  const archive = path.join(root, 'distributions', 'v0.1.6', ARCHIVE);
  verifyArchive(archive);
  const powershell = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  if (!fs.existsSync(powershell)) throw new Error('Windows PowerShell is unavailable.');
  const policy = spawnSync(powershell, ['-NoProfile', '-Command', 'Get-ExecutionPolicy'],
    { encoding: 'utf8', timeout: 30000, windowsHide: true, env: powershellEnv() });
  if (policy.error || policy.status !== 0) throw new Error('Could not check the Windows PowerShell script policy.');
  if (['Restricted','AllSigned'].includes(policy.stdout.trim()))
    throw new Error(`PowerShell policy is ${policy.stdout.trim()}; scripts cannot run. See INSTALL.md. No policy was changed.`);
  const extra = [];
  if (options.python) extra.push('-PythonExecutable', options.python);
  if (options.installPython) extra.push('-InstallPython');
  if (options.check) extra.push('-Check');
  const result = spawnSync(powershell, [
    '-NoLogo', '-NoProfile', '-File', path.join(root, 'install.ps1'),
    '-Archive', archive, '-App', APPS[options.app], ...extra
  ], { stdio: 'inherit', shell: false, env: powershellEnv() });
  if (result.error) throw new Error(`Could not start PowerShell: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Installation failed (${result.status ?? result.signal}). See the installer output; no execution-policy bypass was applied.`);
  if (!options.check) console.log('Restart your selected app. Configure your own member API Key using INSTALL.md.');
}

module.exports = { APPS, parseArgs, verifyArchive, validatePython, powershellEnv, SHA256, ARCHIVE };
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
