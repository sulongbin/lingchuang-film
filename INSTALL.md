# Windows 安装与会员使用 · v0.1.7

官网：**https://lczyai.com**。注册账号后登录 **https://chat.lczyai.com**，通过官方 CLI 完成浏览器会员授权，无需先申请 API Key。

## 1. 准备环境

- Windows 10/11 64 位；选一个具备本地文件、命令执行和 HTTPS 访问能力的智能体，见 [兼容表](COMPATIBILITY.md)。
- Python 3.11+（64 位）；新手入口会检测，缺失时询问是否安装 Python 3.12。安装依赖需要网络。
- 新手入口不需要 Node.js、Git；npm 入口才需要 Node.js 18+ 与 Git。
- 最终剪映交付需要 Windows 剪映专业版；脚本能运行不代表剪映草稿已经实际打开验收。

## 2. 新手安装（推荐）

在 Windows PowerShell 中下载、检查并执行。下面示例为千问办公，Codex 改成 `-App Codex`，其他值见兼容表。

```powershell
$lcInstaller = Join-Path $env:TEMP ("lingchuang-install-" + [guid]::NewGuid().ToString('N') + ".ps1")
Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/sulongbin/lingchuang-film/main/install.ps1' -OutFile $lcInstaller
& $lcInstaller -App QwenWork
```

不指定 `-App` 时询问一个目标。脚本先验证 ZIP 的 SHA-256，寻找可用 Python（包括 Python Launcher），安装技能的独立 `.venv` 及固定依赖，然后执行本地依赖自检。它不读取 API Key、不提交生成。

找不到 Python 时，只有输入 `YES` 才运行 WinGet：安装当前用户级 `Python.Python.3.12`，使用 winget 源并接受对应源与软件协议；拒绝会停止。无 WinGet 时给出 [Python 官方下载入口](https://www.python.org/downloads/windows/)。智能体没有交互终端时，应先向用户解释并取得授权，再加 `-InstallPython`；不能默认代答 YES。

只检查环境（不会安装 Python 或技能）：

```powershell
& $lcInstaller -App QwenWork -Check
```

指定已有解释器：

```powershell
& $lcInstaller -App QwenWork -PythonExecutable 'C:\你的Python目录\python.exe'
```

已有完整 ZIP：解压后阅读《安装与启动说明.md》，运行包内 `install.ps1 -App QwenWork -PythonExecutable '完整路径'`。安装依赖仍需要网络或自行提供的依赖缓存。

## 3. npm 安装（已有 Node.js、Git）

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app qwenwork
npx.cmd --yes github:sulongbin/lingchuang-film --app codex --check
```

`--app` 可选 `codex`、`workbuddy`、`qwenwork`、`qwen-code`、`claude-code`、`cursor`、`gemini-cli`、`portable`。一次选一个。`--python "完整路径"` 指定 Python；`--install-python` 表示已同意缺失时通过 WinGet 安装 Python。`--check` 始终禁止补装依赖。

这是从公开 GitHub 取得安装器，不是 npm 注册表里的同名包。`--yes` 仅确认 npm 获取安装器，不表示同意安装 Python 或付费生成。

两个入口使用同一安装逻辑。旧版移到 `%USERPROFILE%\.lingchuang-skill-backups`，安装失败恢复已备份的旧版。只写入一个选定目录，保留临时目录、失败现场和项目记录；不要并行运行安装过程。通用模式输出实际入口路径，需主动让智能体读取，未自动注册宿主。

## 4. 本机策略阻止脚本时

如果显示 Restricted / AllSigned 或“禁止运行脚本”，安装器停止，不自动修改或绕过策略。先查看：
```powershell
powershell.exe -NoProfile -Command "Get-ExecutionPolicy -List"
```

企业管理设备请遵循管理员规定。个人设备在自己明确认可安装脚本后，可由用户自行在 Windows PowerShell 中仅为当前会话设置：
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```
再在同一窗口执行安装命令。窗口关闭后该进程设置失效，不改 LocalMachine / CurrentUser。组策略、下载来源标记或签名要求仍可能阻止执行；不要使用 Bypass / Unrestricted 强行绕过。

## 5. 安装 CLI 并授权会员账号

按 [CLI 安装与会员授权](CLI.md) 安装官方 CLI 0.1.1，再执行 `lczyai login`，在灵创智影页面核对并确认授权。无需先申请 API Key，GitHub 登录不代替会员授权。浏览器显示收到回调后还需检查 CLI 登录成功。

凭据由 CLI 使用 Windows DPAPI 保存；不会写入作品目录或聊天。`lczyai login --key` 是隐藏输入 Key 的后备方式。已有用户环境变量仍可通过技能 `film_entry.py --transport key` 显式使用；不会自动回退或删除旧变量。

## 6. 启动并制作

在自己的作品目录启动 Codex，输入：

> 使用 $lingchuang-film。先检查环境和会员目录连接，不显示密钥、不提交生成。我选择商业路线，请读取我的脚本和已有素材，先核对本集需求，再给出下一阶段方案与报价。

短剧选择“短剧路线”。WorkBuddy 在技能列表选择 lingchuang-film，或自然语言指定“使用灵创智影影视全流程”。

工作顺序：需求与剧本确认 → 人物/场景/道具/分镜资产 → 图片阶段确认 → 视频方案和报价确认 → 视频生成与验收 → 必要时返修/超分另行确认 → 声音字幕短预览 → 全片与剪映交付。

安装免费；平台生成、配音配乐及后处理是否收费、所耗积分和权限以当前会员目录、报价及结算为准。任务完成不等于用户验收通过；未结算不记零。后期可在剪映按需更换音色。

## 7. 常见问题

- 找不到 `npx.cmd` / `git` / `python`：安装对应软件后重开终端，Python 可使用 `--python` 指定。
- GitHub 下载失败：先确认能打开仓库网页；不要把会员 API Key 当成 GitHub 密码。
- npm 缓存旧包：需要锁定某次更新时可使用 `github:sulongbin/lingchuang-film#提交SHA`，不要手工混合不同版本的技能文件。
- 依赖安装失败：查看原安装器日志；保留备份、失败现场及作品数据，解决网络/依赖问题后再重试。
- 401/403：检查 CLI 授权是否过期、会员及模型权限；必要时重新执行 `lczyai login`，不要改用别人的密钥。
- 余额不足：补足自己账号的积分，重新核对报价；未知任务不能通过清空记录重做。
- 模型更新：以实时会员目录为准，不依据模型名推断接口能力。

本仓库包采用 `private: true` 防止意外发布到 npm 注册表；不影响从公开 GitHub 使用 npm/npx 安装。
