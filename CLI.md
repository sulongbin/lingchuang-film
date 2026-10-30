# Windows 会员浏览器授权与 CLI 接入

技能 v0.1.8 对接官方 CLI 0.1.1。CLI 与影视技能是两个安装项：CLI 自带 Node.js 和凭据运行时；影视技能仍需要 Python 3.11+ 及包内依赖。其他系统未验证。

## 安装与登录

1. 从 [官方 OSS 直连地址](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/public/distribution/cli/0.1.1/27582851d8f5c1be3e43651c55ac56b667701d0642693d80651971e1628cd7d5/lczyai-cli-0.1.1-win-x64.zip) 下载 Windows CLI，核对 [SHA-256 文件](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/public/distribution/cli/0.1.1/27582851d8f5c1be3e43651c55ac56b667701d0642693d80651971e1628cd7d5/lczyai-cli-0.1.1-win-x64.zip.sha256)。本版 SHA-256 为 `27582851d8f5c1be3e43651c55ac56b667701d0642693d80651971e1628cd7d5`，大小 65,822,815 字节；不匹配则停止，不执行包内程序。
2. 解压并运行 `Install.cmd`。安装到 `%LOCALAPPDATA%\LingchuangCLIApp`，不修改旧 Key 环境变量。发行包尚无发布者代码签名，不绕过系统安全提示。
3. 新终端运行 `lczyai login`，在 `https://chat.lczyai.com` 登录会员账号，核对账号、权限和期限后由会员确认授权。这不是 GitHub 登录，也不要求先创建 API Key。授权请求有效 5 分钟；过期时重新执行登录并打开新链接，不能反复使用旧页。
4. 浏览器出现 `Authorization received` 后仍要检查 CLI 返回 `logged_in: true`，再运行 `lczyai auth status` 和 `lczyai doctor`。浏览器只收到回调不代表令牌交换或本地保存必然成功。

找不到命令时使用 `& "$env:LOCALAPPDATA\LingchuangCLIApp\lczyai.cmd" login`。登录不会上传素材、创建生成报价或扣积分。需要退出或撤销时使用 `lczyai logout`，或打开 [会员授权管理](https://chat.lczyai.com/?cli_authorizations=1)；不要为测试擅自撤销已有授权。

## 智能体调用

`$skill` 为实际 SKILL.md 所在目录，`$project` 为会员作品目录。优先使用技能自己的 `.venv\Scripts\python.exe`：

```powershell
& "$skill/.venv/Scripts/python.exe" "$skill/scripts/film_entry.py" --project "$project" models --client production
& "$skill/.venv/Scripts/python.exe" "$skill/scripts/film_entry.py" --project "$project" models --client nsdd
```

首次新作品先按操作流程执行 `init`；已有作品直接 `inspect`，不要重新初始化。模型查询也需要已有 `.film/project.json`。

后续 包内 references/workflow.md 和 包内 references/quote-recovery.md 使用同一 `film_entry.py` 入口。它默认通过官方 CLI 的外置桥接调用原 `film.py`，保留 `.film`、`.lczyai`、账号与画布绑定、原任务编号、阶段方案/费用确认、下载、NSDD 与实际积分字段。不要为了接入 CLI 重新初始化已有作品。

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
