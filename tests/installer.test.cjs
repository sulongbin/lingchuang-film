'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseArgs, verifyArchive, validatePython, powershellEnv, ARCHIVE } = require('../bin/install.cjs');
const root = path.resolve(__dirname, '..');
const archive = path.join(root, 'distributions', 'v0.1.5', ARCHIVE);

test('host selection is explicit; missing, dual, duplicate and injected arguments stop', () => {
  for (const args of [[], ['--app','both'], ['--app','codex','--app','workbuddy'],
    ['--app','codex;Write-Output bad'], ['--app','codex','--skip-dependencies']])
    assert.throws(() => parseArgs(args));
  assert.equal(parseArgs(['--app','workbuddy']).app, 'workbuddy');
  assert.equal(parseArgs(['--app','codex','--python','C:\\My Python\\python.exe']).python, 'C:\\My Python\\python.exe');
});
test('old and malformed Python versions are rejected', () => {
  for (const v of ['[3,10]', '[2,7]', '{}', 'unknown']) assert.throws(() => validatePython(v));
  validatePython('[3,11]');
  validatePython('[3,14]');
});
test('archive corruption is rejected', () => {
  verifyArchive(archive);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-checksum-test-'));
  const corrupt = path.join(dir, 'corrupt.zip');
  fs.writeFileSync(corrupt, 'not the package');
  assert.throws(() => verifyArchive(corrupt), /mismatch/);
});
test('help works without installation and invalid arguments return failure', () => {
  const cli = path.join(root, 'bin', 'install.cjs');
  const help = spawnSync(process.execPath, [cli, '--help'], {encoding:'utf8'});
  assert.equal(help.status, 0);
  assert.match(help.stdout, /https:\/\/lczyai.com/);
  const bad = spawnSync(process.execPath, [cli, '--app','both'], {encoding:'utf8'});
  assert.notEqual(bad.status, 0);
});
test('real Windows extraction, host isolation, upgrade backup and unknown-directory protection', {
  skip: process.platform !== 'win32', timeout: 120000
}, () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-install-test-'));
  const powershell = path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe');
  let n = 0;
  const run = (app, userRoot) => spawnSync(powershell, [
    '-NoProfile','-File',path.join(root,'scripts/install-from-archive.ps1'),
    '-Archive',archive,'-Destination',path.join(temp,`staging-${++n}`),
    '-App',app,'-UserRoot',userRoot,'-SkipDependencies'
  ], {encoding:'utf8',timeout:45000,env:powershellEnv()});
  for (const app of ['Codex','WorkBuddy']) {
    const userRoot = path.join(temp, app);
    fs.mkdirSync(userRoot);
    const host = app === 'Codex' ? '.agents' : '.workbuddy';
    const other = app === 'Codex' ? '.workbuddy' : '.agents';
    const sentinel = path.join(userRoot, other, 'skills','keep.txt');
    fs.mkdirSync(path.dirname(sentinel), {recursive:true});
    fs.writeFileSync(sentinel, 'other host unchanged');
    const first = run(app,userRoot);
    assert.equal(first.status,0,first.stdout + first.stderr);
    const skill = path.join(userRoot,host,'skills','lingchuang-film');
    const before = fs.readFileSync(path.join(skill,'SKILL.md'));
    const second = run(app,userRoot);
    assert.equal(second.status,0,second.stdout + second.stderr);
    assert.deepEqual(fs.readFileSync(path.join(skill,'SKILL.md')), before);
    assert.equal(fs.readFileSync(sentinel,'utf8'), 'other host unchanged');
    const backups = fs.readdirSync(path.join(userRoot,'.lingchuang-skill-backups'));
    assert.ok(backups.some(b => fs.existsSync(path.join(userRoot,'.lingchuang-skill-backups',b,'lingchuang-film','SKILL.md'))));
    const log = JSON.parse(fs.readFileSync(path.join(skill,'installation.json'),'utf8').replace(/^\uFEFF/,''));
    assert.equal(log.app,app);
    assert.equal(log.dependenciesChecked,false);
  }
  const unknown = path.join(temp,'unknown-user');
  const target = path.join(unknown,'.agents','skills','lingchuang-film');
  fs.mkdirSync(target,{recursive:true});
  fs.writeFileSync(path.join(target,'unrelated.txt'),'preserve');
  assert.notEqual(run('Codex',unknown).status,0);
  assert.equal(fs.readFileSync(path.join(target,'unrelated.txt'),'utf8'),'preserve');
});
