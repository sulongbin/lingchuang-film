# Windows 会员浏览器授权与 CLI 接入

> v0.1.10：仅停用 NSDD 渠道全部 H3 模型（包括海螺 H3、MiniMax H3 及其参考模式）。RH 的 H3 保留；NSDD 的 SD2.5、GK、TT Image 2.5、普通视频超分及其他非 H3 模型保留，以实时目录和能力为准。停用的 NSDD H3 历史任务仍可查询、下载，不再新建、报价或重试。

技能 v0.1.11 兼容官方 CLI 0.1.1/0.1.2；推荐 0.1.2 使用后台授权等待。CLI 与影视技能是两个安装项：CLI 自带 Node.js 和凭据运行时；影视技能仍需要 Python 3.11+；剪辑依赖按需安装。其他系统未验证。

## 安装与登录

1. 从 [会员平台官网](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/cli/v0.1.2/lczyai-cli-0.1.2-win-x64.zip) 下载 Windows CLI，核对 [SHA-256 文件](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/cli/v0.1.2/lczyai-cli-0.1.2-win-x64.zip.sha256)。本版 SHA-256 为 `8bdc16f3e295d0b77a0975e9d7ef0cb1f47fdca4a7bac1005bd8d2aa49903b43`，大小 65,829,631 字节；不匹配则停止，不执行包内程序。
2. 解压并运行 `Install.cmd`。安装到 `%LOCALAPPDATA%\LingchuangCLIApp`，不修改旧 Key 环境变量。发行包尚无发布者代码签名，不绕过系统安全提示。
3. 新终端运行 `lczyai login`，在 `https://chat.lczyai.com` 登录会员账号，核对账号、权限和期限后由会员确认授权。这不是 GitHub 登录，也不要求先创建 API Key。授权请求有效 5 分钟；过期时重新执行登录并打开新链接，不能反复使用旧页。
4. 浏览器回调会自动验证并显示最终结果；智能体检查 `logged_in: true`，并核对当前授权。浏览器只收到回调不代表令牌交换或本地保存必然成功。

找不到命令时使用 `& "$env:LOCALAPPDATA\LingchuangCLIApp\lczyai.cmd" login`。登录不会上传素材、创建生成报价或扣积分。需要退出或撤销时使用 `lczyai logout`，或打开 [会员授权管理](https://chat.lczyai.com/?cli_authorizations=1)；不要为测试擅自撤销已有授权。

## 智能体调用

`$skill` 为实际 SKILL.md 所在目录，`$project` 为会员作品目录。优先使用技能自己的 `.venv\Scripts\python.exe`：

```powershell
& "$skill/.venv/Scripts/python.exe" "$skill/scripts/film_entry.py" --project "$project" models --client production
& "$skill/.venv/Scripts/python.exe" "$skill/scripts/film_entry.py" --project "$project" models --client nsdd
```

首次新作品先按操作流程执行 `init`；已有作品直接 `inspect`，不要重新初始化。模型查询也需要已有 `.film/project.json`。

后续 包内 references/workflow.md 和 包内 references/quote-recovery.md 使用同一 `film_entry.py` 入口。它默认通过包内经哈希校验的桥接调用 `film.py`，平台请求交给官方 CLI 0.1.2，保留 `.film`、`.lczyai`、账号与画布绑定、原任务编号、阶段方案/费用确认、下载、NSDD 与实际积分字段。不要为了接入 CLI 重新初始化已有作品。

CLI 和被桥接生产脚本有明确版本/哈希校验；不匹配时停止核对兼容性，不跳过校验、不覆盖新版。CLI 模式不向桥接子进程传递旧 `LCZYAI_API_KEY`，访问/刷新令牌由 CLI 管理。错误原样保留结构化状态供原工作流分类，入口不自动重试生成，也不因登录失效自动改用旧 Key 或其他会员。

## Key 后备方式

用户选择 Key 登录时可在交互终端执行 `lczyai login --key`，隐藏输入的 Key 由 CLI 存入 Windows DPAPI，仍使用默认 CLI 入口。不要把 Key 放在命令参数、聊天、项目 JSON 或源码里。

已有环境变量方式保持兼容，但只有用户明确选择旧接入时才调用：

```powershell
& "$skill/.venv/Scripts/python.exe" "$skill/scripts/film_entry.py" --transport key --project "$project" models --client production
```

此方式运行原客户端，依赖当前进程已有的 `LCZYAI_API_KEY`。不要自动复制 CLI 令牌到环境变量，也不要删除旧环境变量或凭据。同一 Windows 用户下的恶意程序及高权限进程仍可能访问解密后的凭据，DPAPI 不代表绝对隔离。

## 生产边界

浏览器授权只提供接口访问权限；图片、视频、配音、配乐、处理及超分仍分别展示当前方案和有效报价，经真实用户确认才提交。报价过期或内容/价格变化后重新确认。超时、失败、unknown 保留原记录并查询恢复，禁止自动新建替代任务。实际积分以服务端结算为准，未结算保持 `null`；素材完成后仍需验收。

独立 CLI 的 `quote/submit` 不是影视阶段确认流程的替代入口；影视技能使用 `film_entry.py` 保存原确认记录。Codex、千问等宿主必须具备本机文件和命令执行能力；目录适配、登录成功和模型查询均不等于真实媒体生成或剪映验收。

## 安装与登录故障定位（v0.1.10）

默认安装只准备基础生产 Python 环境；Windows 剪映交付前运行 `scripts/install-editing.ps1`，再执行 `doctor.py --mode editing`。`doctor.py --mode production` 只检查本地运行环境，不能证明已登录。

运行 `python "$skill/scripts/connection_check.py"` 可区分 CLI 缺失、无法启动、官方网络检查和会员授权状态。只输出分类摘要，不打印凭据或会员信息；不提交生产。网络检查失败与没有授权是两类结果，不能笼统说“安装失败”。

浏览器显示工作台首页、会员头像或“已同步”，只说明网页会话存在。需要从正在运行的 `lczyai login` 打开的专用授权页核对并确认；保持终端进程运行直到返回成功，不让智能体启动登录后立即杀掉子进程。授权页过期才重新发起，避免同时打开多个旧页面。

Windows 登录和调用必须在同一 Windows 用户下。若普通终端已授权、智能体仍未授权，先核对执行用户和 LOCALAPPDATA 指向，不复制凭据、不抓 Cookie、不重置沙箱或清空环境变量。仍有错误时收集脱敏错误分类，不能依据网页截图猜测根因。

WorkBuddy 的“专家”搜索不等于技能列表。重启软件/新建任务后查看“技能”或对话中的技能入口；本地有 SKILL.md 不等于宿主已索引。未显示时请智能体先读取实际安装路径的 SKILL.md，核对安装用户与宿主路径，不能反复安装到其他平台目录。


## CLI 0.1.2 智能体自动授权

先 `lczyai --version`。已核验 0.1.2 时：

1. 智能体执行 `lczyai login --start`，自动打开官方授权页，保存返回的 session_id。
2. 显示返回的 authorization_url；浏览器没自动打开时由会员打开。会员只需核对账号、权限和期限并点确认，智能体不得代点。
3. 智能体每 2–3 秒执行 `lczyai login --status <session_id>`，保持当前工作并等待。不要重复 start、关闭后台进程或索取回调地址。
4. 仅当 status=connected、logged_in=true、verified_now=true 才继续。该结果已做账号与凭据检查；不需要会员再手动检查命令。
5. 遇到 failed、interrupted 或 verification_failed，展示返回的 code、stage、message、action。先核对状态，明确失败后再重新授权，不无限重试。宿主若不允许后台进程，须保持前台 login 存活。

仍为 0.1.1 时没有 --start/--status；可沿用前台 login，并让宿主保持进程，或安装经校验的新包后使用自动等待。新包从上方版本化 OSS 地址下载并校验。
Windows 必须在 CLI 所在电脑的浏览器确认；Linux CLI 0.2.1 用设备授权链接，会员可在自己的电脑确认，云端自动查询。
CLI 更新不放宽技能哈希校验、报价确认和会员画布绑定。授权不代表同意扣积分。

网站授权确认页的新版错误提示另待线上部署；本 CLI 自带回调结果页与后台等待，兼容现有线上授权接口。


## 独立 Linux CLI 0.2.1（GPT DOT 等云端宿主）

[Linux CLI 安装包](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/cli/v0.2.1-linux/lczyai-cli-0.2.1-linux.tar.gz) · [SHA-256](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/cli/v0.2.1-linux/lczyai-cli-0.2.1-linux.tar.gz.sha256)

需要 Linux 与 Node.js 20+。下载、核对摘要、完整解压后执行包内 `node install-linux.mjs`；入口为 `~/.local/bin/lczyai`。智能体执行 `lczyai login --start`，把返回的官网链接及核对码提供给会员，并持续查询同一 session_id。会员在自己的浏览器确认，云端自动取回授权并检查；不需要访问云端 127.0.0.1。

目录 0700、凭据文件 0600，使用私有持久卷；这是权限保护而非加密，云宿主管理员仍可访问。不同会员应隔离运行目录和系统身份。不要向聊天、源码或作品文件输出凭据。

Linux 影视技能 cloud_entry 的 API Key 入口保持原样；独立 CLI 可以直接使用已授权会员接口，不代表 Python 阶段工作流已接回 CLI。
