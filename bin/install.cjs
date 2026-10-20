#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const SHA256 = '13e69fa232a691e550060dccd3645ad681881eb5578c27238aa08448051cf2f4';
const ARCHIVE = '灵创智影影视全流程-v0.1.5-Windows通用版.zip';
const HELP = `灵创智影影视全流程 v0.1.5 — Windows
官网: https://lczyai.com

npx github:sulongbin/lingchuang-film --app codex
npx github:sulongbin/lingchuang-film --app workbuddy

Options:
  --app codex|workbuddy  Install only the selected host (required).
  --python PATH         Python 3.11+ executable (default: python).
  --check               Check the archive and prerequisites without installing.
  --help                Show this help.

Register your own account at https://lczyai.com and configure your personal
LCZYAI_API_KEY after installation. Installation does not generate media or
spend platform credits. Paid generation requires a separate confirmed quote.
`;

function parseArgs(args) {
  const result = { python: 'python', check: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (seen.has(arg)) throw new Error(`Duplicate option: ${arg}`);
    seen.add(arg);
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--check') result.check = true;
    else if (arg === '--app' || arg === '--python') {
      const value = args[++i];
      if (!value || value.startsWith('-')) throw new Error(`Missing value: ${arg}`);
      result[arg.slice(2)] = value;
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!result.help && !['codex', 'workbuddy'].includes(result.app))
    throw new Error('Choose exactly one host: --app codex OR --app workbuddy.');
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
  const archive = path.join(root, 'distributions', 'v0.1.5', ARCHIVE);
  verifyArchive(archive);
  const py = spawnSync(options.python, ['-c', 'import sys,json; print(json.dumps(list(sys.version_info[:2])))'],
    { encoding: 'utf8', timeout: 30000, windowsHide: true, shell: false });
  if (py.error || py.status !== 0) throw new Error('Python is unavailable. Install Python 3.11+ or pass --python PATH.');
  validatePython(py.stdout.trim());
  const powershell = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  if (!fs.existsSync(powershell)) throw new Error('Windows PowerShell is unavailable.');
  const policy = spawnSync(powershell, ['-NoProfile', '-Command', 'Get-ExecutionPolicy'],
    { encoding: 'utf8', timeout: 30000, windowsHide: true, env: powershellEnv() });
  if (policy.error || policy.status !== 0) throw new Error('Could not check the Windows PowerShell script policy.');
  if (['Restricted','AllSigned'].includes(policy.stdout.trim()))
    throw new Error(`PowerShell policy is ${policy.stdout.trim()}; scripts cannot run. See INSTALL.md. No policy was changed.`);
  if (options.check) {
    console.log(`CHECK OK: v0.1.5 / ${options.app} / SHA-256 / Python 3.11+ / Windows PowerShell. No installation performed.`);
    return;
  }
  const destination = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lingchuang-film-')), 'unpacked');
  console.log(`Installing only to ${options.app}. Staging directory: ${destination}`);
  const result = spawnSync(powershell, [
    '-NoLogo', '-NoProfile', '-File', path.join(root, 'scripts', 'install-from-archive.ps1'),
    '-Archive', archive, '-Destination', destination,
    '-App', options.app === 'codex' ? 'Codex' : 'WorkBuddy',
    '-PythonExecutable', options.python
  ], { stdio: 'inherit', shell: false, env: powershellEnv() });
  if (result.error) throw new Error(`Could not start PowerShell: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Installation failed (${result.status ?? result.signal}). See the installer output; no execution-policy bypass was applied.`);
  console.log('Restart your selected app. Configure your own member API Key using INSTALL.md.');
}

module.exports = { parseArgs, verifyArchive, validatePython, powershellEnv, SHA256, ARCHIVE };
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
