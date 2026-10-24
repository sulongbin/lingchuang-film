'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseArgs, verifyArchive, validatePython, powershellEnv, ARCHIVE } = require('../bin/install.cjs');
const root = path.resolve(__dirname, '..');
const archive = path.join(root, 'distributions', 'v0.1.7', ARCHIVE);
const python = process.env.LC_TEST_PYTHON || 'python';

test('host selection is explicit; missing, dual, duplicate and injected arguments stop', () => {
  for (const args of [[], ['--app','both'], ['--app','codex','--app','workbuddy'],
    ['--app','codex;Write-Output bad'], ['--app','codex','--skip-dependencies']])
    assert.throws(() => parseArgs(args));
  assert.equal(parseArgs(['--app','workbuddy']).app, 'workbuddy');
  for (const app of ['qwenwork','qwen-code','claude-code','cursor','gemini-cli','portable'])
    assert.equal(parseArgs(['--app',app,'--install-python']).installPython, true);
  assert.equal(parseArgs(['--app','codex','--python','C:\\My Python\\python.exe']).python, 'C:\\My Python\\python.exe');
});

test('real prerequisite detection and mocked consent/WinGet branches', {skip:process.platform !== 'win32'}, () => {
  const ps = path.join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe');
  const result = spawnSync(ps,['-NoProfile','-File',path.join(root,'tests/prerequisites.ps1'),
    '-Installer',path.join(root,'install.ps1'),'-Python',python],
    {encoding:'utf8',timeout:45000,env:powershellEnv()});
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/PREREQUISITES OK/);
});

test('npm check uses shared bootstrap and cannot install a missing Python', {skip:process.platform !== 'win32'}, () => {
  const cli = path.join(root,'bin/install.cjs');
  const good = spawnSync(process.execPath,[cli,'--app','qwenwork','--check','--python',python],
    {encoding:'utf8',timeout:45000,env:powershellEnv()});
  assert.equal(good.status,0,good.stdout+good.stderr);
  assert.match(good.stdout,/CHECK OK/);
  const bad = spawnSync(process.execPath,[cli,'--app','portable','--check','--install-python','--python','Z:\\missing.exe'],
    {encoding:'utf8',timeout:45000,env:powershellEnv()});
  assert.notEqual(bad.status,0);
  assert.match(bad.stdout+bad.stderr,/CHECK FAILED/);
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
  skip: process.platform !== 'win32', timeout: 240000
}, () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-install-test-'));
  const powershell = path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe');

  const run = (app, userRoot) => spawnSync(powershell, [
    '-NoProfile','-File',path.join(root,'install.ps1'),
    '-Archive',archive,
    '-App',app,'-UserRoot',userRoot,'-SkipDependencies'
  ], {encoding:'utf8',timeout:45000,env:powershellEnv()});
  for (const app of ['Codex','WorkBuddy','QwenWork','QwenCode','ClaudeCode','Cursor','GeminiCLI','Portable']) {
    const userRoot = path.join(temp, app);
    fs.mkdirSync(userRoot);
    const host = {Codex:'.agents',WorkBuddy:'.workbuddy',QwenWork:'.qwenworkcn',QwenCode:'.qwen',ClaudeCode:'.claude',Cursor:'.cursor',GeminiCLI:'.gemini',Portable:'.lingchuang-film'}[app];
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

test('dependency failure restores prior skill; corrupt archive and project contents stop before replacement', {
  skip:process.platform !== 'win32', timeout:60000
}, () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'lc-rollback-'));
  const userRoot = path.join(temp,'用户 空格');
  const target = path.join(userRoot,'.qwenworkcn/skills/lingchuang-film');
  fs.mkdirSync(target,{recursive:true});
  fs.writeFileSync(path.join(target,'SKILL.md'),'---\nname: lingchuang-film\n---\nold version');
  fs.writeFileSync(path.join(target,'keep.txt'),'existing version');
  const failingPython = path.join(temp,'python-fails.cmd');
  // Permit the version probe, but fail the venv creation after backup/copy.
  fs.writeFileSync(failingPython,'@echo off\r\nif "%~1"=="-c" exit /b 0\r\nexit /b 1\r\n');
  const ps = path.join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe');
  // Extract with the normal installer, then invoke the package installer directly.
  const stageUser = path.join(temp,'stage-user');
  fs.mkdirSync(stageUser);
  const stage = spawnSync(ps,['-NoProfile','-File',path.join(root,'install.ps1'),'-Archive',archive,
    '-App','Portable','-UserRoot',stageUser,'-SkipDependencies'],
    {encoding:'utf8',timeout:45000,env:powershellEnv()});
  assert.equal(stage.status,0,stage.stdout+stage.stderr);
  const match = stage.stdout.match(/Staging retained: (.+)/);
  assert.ok(match);
  const packageEntry = path.join(match[1].trim(),'unpacked/lingchuang-film/install.ps1');
  const run = () => spawnSync(ps,['-NoProfile','-File',packageEntry,'-App','QwenWork',
    '-UserRoot',userRoot,'-PythonExecutable',failingPython],{encoding:'utf8',timeout:45000,env:powershellEnv()});
  assert.notEqual(run().status,0);
  assert.equal(fs.readFileSync(path.join(target,'keep.txt'),'utf8'),'existing version');
  assert.match(fs.readFileSync(path.join(target,'SKILL.md'),'utf8'),/old version/);
  const backups = fs.readdirSync(path.join(userRoot,'.lingchuang-skill-backups'));
  assert.ok(backups.some(b=>fs.existsSync(path.join(userRoot,'.lingchuang-skill-backups',b,'failure.txt'))));
  fs.mkdirSync(path.join(target,'.film'));
  assert.notEqual(run().status,0);
  assert.equal(fs.readFileSync(path.join(target,'keep.txt'),'utf8'),'existing version');
  const corrupt = path.join(temp,'bad.zip'); fs.writeFileSync(corrupt,'corrupt');
  const result = spawnSync(ps,['-NoProfile','-File',path.join(root,'install.ps1'),'-Archive',corrupt,
    '-App','QwenWork','-UserRoot',userRoot,'-SkipDependencies'],{encoding:'utf8',timeout:15000,env:powershellEnv()});
  assert.notEqual(result.status,0);
  assert.match(result.stdout+result.stderr,/SHA-256 mismatch/);
});
