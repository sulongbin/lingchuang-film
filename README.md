# 灵创智影影视全流程 · Windows v0.1.6

从剧本、人物/场景/道具和分镜资产，到会员 API 视频生产、声音字幕预览及 Windows 剪映交付。统一技能名称 **lingchuang-film**；随包包含短剧编剧、影视总导演和灵创生产客户端，未集成 Shotcraft。

**官网：[lczyai.com](https://lczyai.com) · 会员平台：[chat.lczyai.com](https://chat.lczyai.com)**

公开下载和安装无需仓库密码。制作需要注册自己的灵创智影会员账号并创建 API Key；平台生成按自己的权限、报价和实际积分结算。安装不会产生视频生成费用。

## 新手入口：无需 Node.js、Git

把下面这段话发给正在使用的 Windows 本地智能体：

> 请按 https://github.com/sulongbin/lingchuang-film/blob/main/INSTALL.md 安装灵创智影影视全流程，只安装到当前宿主。使用新手 PowerShell 入口；先检查 Python，缺失时向我说明安装内容并取得同意。不要修改系统级脚本策略，不提交付费生成。安装完成后检查入口和依赖，并告诉我如何配置个人 API Key。

自己操作时，在 Windows PowerShell 中**先下载一次安装器**：

```powershell
$lcInstaller = Join-Path $env:TEMP ("lingchuang-install-" + [guid]::NewGuid().ToString('N') + ".ps1")
Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/sulongbin/lingchuang-film/main/install.ps1' -OutFile $lcInstaller
```

然后在**同一个窗口**，只复制执行下列与你使用的软件对应的一条命令，无需全部执行：

**Codex**

```powershell
& $lcInstaller -App Codex
```

**WorkBuddy**

```powershell
& $lcInstaller -App WorkBuddy
```

**千问办公（QwenWork）**

```powershell
& $lcInstaller -App QwenWork
```

**Qwen Code**

```powershell
& $lcInstaller -App QwenCode
```

**Claude Code**

```powershell
& $lcInstaller -App ClaudeCode
```

**Cursor**

```powershell
& $lcInstaller -App Cursor
```

**Gemini CLI**

```powershell
& $lcInstaller -App GeminiCLI
```

**其他智能体：通用读取模式**

```powershell
& $lcInstaller -App Portable
```

通用模式不会自动注册宿主；安装后让智能体读取输出的 `SKILL.md` 完整路径。千问办公与 Qwen Code 是不同产品，请选择对应入口。

下载脚本可先打开检查再运行。缺少 Python 时会提示，只有输入 `YES` 才通过 WinGet 为当前用户安装 Python 3.12。脚本策略拦截的处理见 [安装说明](INSTALL.md)，安装器不会自动更改策略。

## 已有 Node.js 和 Git：npm 命令

**新手入口与 npm 入口二选一即可。** 使用 npm 时，直接复制与你的软件对应的一条完整命令：

**Codex**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app codex
```

**WorkBuddy**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app workbuddy
```

**千问办公（QwenWork）**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app qwenwork
```

**Qwen Code**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app qwen-code
```

**Claude Code**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app claude-code
```

**Cursor**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app cursor
```

**Gemini CLI**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app gemini-cli
```

**其他智能体：通用读取模式**

```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app portable
```

每次只选择一个目标。可在命令末尾加 `--check`，仅检查包和 Python，不安装技能或补装 Python。通过 GitHub 获取，**并非 npm 注册表的同名包**。各宿主的启动方式与验证范围见 [兼容表](COMPATIBILITY.md)。

## 安装后开始使用

1. 访问 [官网](https://lczyai.com) 注册，在会员平台创建自己的 API Key，按 [安装说明](INSTALL.md) 安全配置。
2. 重新打开智能体，选择 `lingchuang-film`。Codex 用 `$lingchuang-film`；其他宿主见 [兼容表](COMPATIBILITY.md)。
3. 提供作品目录、已有脚本和素材，选择短剧或商业路线。先确认方案，再分别确认图片和视频的有效报价。
4. 验收最终素材后，先确认声音字幕短预览，再交付全片和剪映草稿。

**验证边界：**新增智能体已做安装目录适配和隔离测试，不代表各客户端都已完成真实视频生成与剪映验收。见 [验证记录](VALIDATION-v0.1.6.md)。

## 下载与资料

- [v0.1.6 Windows 完整 ZIP](distributions/v0.1.6/lingchuang-film-v0.1.6-windows.zip)
- [SHA-256](distributions/v0.1.6/SHA256.txt)
- [完整安装说明](INSTALL.md) · [智能体兼容表](COMPATIBILITY.md) · [使用与来源](USAGE.md)
- [v0.1.6 更新说明](RELEASE-v0.1.6.md) · [历史更新](CHANGELOG.md)

旧版发行包继续保留。安装器会备份可识别的旧版并在失败时恢复，不删除作品或历史任务。
