# Windows 安装与会员使用

官网：**https://lczyai.com**。注册账号后登录 **https://chat.lczyai.com**，取得自己的会员 API Key。

## 1. 准备环境

- Windows，Codex 或 WorkBuddy；只选择当前使用的平台。
- Node.js 18+，建议当前 LTS（https://nodejs.org），含 npm/npx。
- Git（https://git-scm.com），用于 npm 的 GitHub 包获取。
- Python 3.11+（https://www.python.org），可用 `python --version` 检查。
- Windows PowerShell 允许执行本包的本地脚本；网络可访问 GitHub、Python 依赖源和灵创平台。
- 最终剪辑交付需要 Windows 剪映专业版。

安装和下载无需 GitHub/npm 账号。生成服务必须使用自己的灵创智影会员账号，所选模型需要相应权限和足够积分。

## 2. 安装一个平台

Codex：
```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app codex
```

WorkBuddy：
```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app workbuddy
```

以上通过 npm/npx 从 GitHub 取得包，并非 npm 注册表里的同名包。`--yes` 仅确认 npm 获取安装器，不代表同意任何付费生成。

想先只检查环境和包的完整性：
```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app codex --check
```

Python 不在 PATH 或需要指定版本时：
```powershell
npx.cmd --yes github:sulongbin/lingchuang-film --app codex --python "C:\你的Python目录\python.exe"
```

安装器核对原 ZIP 的 SHA-256，将包解压到独立临时目录，调用原平台专属安装器，并联网安装固定 Python 依赖。原包不改写。为兼容 Windows PowerShell 5.1，只对临时解压的三个安装 PS1 加 UTF-8 BOM。

Codex 目标为 `%USERPROFILE%\.agents\skills\lingchuang-film`；WorkBuddy 为 `%USERPROFILE%\.workbuddy\skills\lingchuang-film`。已有已识别旧版移至 `%USERPROFILE%\.lingchuang-skill-backups`，失败按原安装器恢复。测试目录和解压目录不自动递归删除。不能同时运行两个安装过程或把同一作品交给两个程序同时写入。

## 3. 本机策略阻止脚本时

如果显示 Restricted / AllSigned 或“禁止运行脚本”，安装器停止，不自动修改或绕过策略。先查看：
```powershell
powershell.exe -NoProfile -Command "Get-ExecutionPolicy -List"
```

企业管理设备请遵循管理员规定。个人设备在自己明确认可安装脚本后，可由用户自行在 Windows PowerShell 中仅为当前会话设置：
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```
再在同一窗口执行安装命令。窗口关闭后该进程设置失效，不改 LocalMachine / CurrentUser。组策略、下载来源标记或签名要求仍可能阻止执行；不要使用 Bypass / Unrestricted 强行绕过。

## 4. 注册并创建个人 API Key

1. 访问 **[灵创智影官网](https://lczyai.com)** 注册账号。
2. 登录 **[会员生产平台](https://chat.lczyai.com)**。
3. 打开“会员中心 → 资料与安全 → API 密钥”，创建自己的会员 API Key，入口以实际界面为准。
4. 在本机 PowerShell 隐藏输入密钥：

```powershell
$lcSecret = Read-Host '请输入你自己的灵创智影会员 API Key' -AsSecureString
$lcCredential = [System.Net.NetworkCredential]::new('', $lcSecret)
[Environment]::SetEnvironmentVariable('LCZYAI_API_KEY', $lcCredential.Password, 'User')
Remove-Variable lcCredential, lcSecret
```

密钥保存在本机用户环境变量，同一 Windows 用户运行的程序可能读取它；不要把密钥发到聊天、GitHub、截图或项目清单。安装包不附带密钥。配置后完全退出并重开所选软件，让新进程继承环境变量。

## 5. 启动并制作

在自己的作品目录启动 Codex，输入：

> 使用 $lingchuang-film。先检查环境和会员目录连接，不显示密钥、不提交生成。我选择商业路线，请读取我的脚本和已有素材，先核对本集需求，再给出下一阶段方案与报价。

短剧选择“短剧路线”。WorkBuddy 在技能列表选择 lingchuang-film，或自然语言指定“使用灵创智影影视全流程”。

工作顺序：需求与剧本确认 → 人物/场景/道具/分镜资产 → 图片阶段确认 → 视频方案和报价确认 → 视频生成与验收 → 必要时返修/超分另行确认 → 声音字幕短预览 → 全片与剪映交付。

安装免费；平台生成、配音配乐及后处理是否收费、所耗积分和权限以当前会员目录、报价及结算为准。任务完成不等于用户验收通过；未结算不记零。后期可在剪映按需更换音色。

## 6. 常见问题

- 找不到 `npx.cmd` / `git` / `python`：安装对应软件后重开终端，Python 可使用 `--python` 指定。
- GitHub 下载失败：先确认能打开仓库网页；不要把会员 API Key 当成 GitHub 密码。
- npm 缓存旧包：需要锁定某次更新时可使用 `github:sulongbin/lingchuang-film#提交SHA`，不要手工混合不同版本的技能文件。
- 依赖安装失败：查看原安装器日志；保留备份、失败现场及作品数据，解决网络/依赖问题后再重试。
- 401/403：检查个人会员 Key 和模型权限，不复制别人的密钥。
- 余额不足：补足自己账号的积分，重新核对报价；未知任务不能通过清空记录重做。
- 模型更新：以实时会员目录为准，不依据模型名推断接口能力。

本仓库包采用 `private: true` 防止意外发布到 npm 注册表；不影响从公开 GitHub 使用 npm/npx 安装。
