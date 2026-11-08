#!/usr/bin/env bash
set -euo pipefail
command -v python3 >/dev/null || { echo 'Python 3.10+ is required.' >&2; exit 1; }
python3 - "$@" <<'PY'
import hashlib, os, pathlib, stat, subprocess, sys, tempfile, urllib.request, zipfile
if sys.platform != 'linux' or sys.version_info < (3,10):
    raise SystemExit('Linux and Python 3.10+ are required. Windows users should use install.ps1.')
args=sys.argv[1:]
if len(args) not in (2,3) or args[0]!='--app' or args[1] not in ('codex','workbuddy','qwen-code','claude-code','portable') or (len(args)==3 and args[2]!='--check'):
    raise SystemExit('Usage: bash install-linux.sh --app codex|workbuddy|qwen-code|claude-code|portable')
stage=pathlib.Path(tempfile.mkdtemp(prefix='lingchuang-linux-'))
archive=stage/'package.zip'
with urllib.request.urlopen('https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/lingchuang-film/v0.1.11-linux/lingchuang-film-v0.1.11-linux.zip',timeout=120) as response:
    data=response.read(10*1024*1024+1)
if len(data)>10*1024*1024 or hashlib.sha256(data).hexdigest()!='66b3fb23896af2bce722172e84a50ab252ef8389442c339d158ebba37729d118':
    raise SystemExit('Package SHA-256 mismatch. No package code executed.')
archive.write_bytes(data)
with zipfile.ZipFile(archive) as z:
    for info in z.infolist():
        dest=(stage/info.filename).resolve()
        if not dest.is_relative_to(stage) or stat.S_ISLNK(info.external_attr >> 16):
            raise SystemExit('Unsafe archive entry.')
    z.extractall(stage)
print('Verified v0.1.11 Linux archive. Staging retained: '+str(stage),flush=True)
raise SystemExit(subprocess.call([sys.executable,str(stage/'lingchuang-film/install-linux.py'),*args]))
PY
