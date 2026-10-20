# 智能体兼容与验证范围

本版面向 Windows 10/11 64 位。技能名称统一为 `lingchuang-film`，不同软件不一定采用 `$` 调用语法。

| 软件 | npm 的 `--app` | 用户目录下的技能位置 | 启动方法 |
|---|---|---|---|
| Codex | `codex` | `.agents/skills/lingchuang-film` | `$lingchuang-film` |
| WorkBuddy | `workbuddy` | `.workbuddy/skills/lingchuang-film` | 技能列表选择，或自然语言指定 |
| 千问办公（QwenWork） | `qwenwork` | `.qwenworkcn/skills/lingchuang-film` | 输入 `/` 选择技能，或自然语言指定 |
| Qwen Code | `qwen-code` | `.qwen/skills/lingchuang-film` | `/lingchuang-film` |
| Claude Code（本地） | `claude-code` | `.claude/skills/lingchuang-film` | `/lingchuang-film` |
| Cursor（本地） | `cursor` | `.cursor/skills/lingchuang-film` | 输入 `/` 选择技能 |
| Gemini CLI | `gemini-cli` | `.gemini/skills/lingchuang-film` | `/skills reload` 后自然语言指定 |
| 其他具备本地文件和命令执行能力的智能体 | `portable` | `.lingchuang-film/skills/lingchuang-film` | 让智能体读取安装器输出的完整 `SKILL.md` 路径 |

PowerShell `-App` 分别为 `Codex`、`WorkBuddy`、`QwenWork`、`QwenCode`、`ClaudeCode`、`Cursor`、`GeminiCLI`、`Portable`，忽略大小写。

每次只写入选定目录。部分宿主也会扫描 `.agents` 或 `.claude` 等共享目录，因此“只写入一个目录”不等于其他软件不会发现该技能；存在同名多个版本时应核对当前实际加载路径。不要将同一作品交给多个智能体同时写入。

## 支持到哪一步

- 安装器：本机 Windows PowerShell 5.1 隔离目录测试，具体结果见仓库 [验证记录](https://github.com/sulongbin/lingchuang-film/blob/main/VALIDATION-v0.1.6.md)。
- 新增宿主：依据下列官方文档实现目录适配，**尚未逐个打开客户端并完成会员视频生成验收**。软件版本、企业策略、文件和终端权限可能影响加载。
- Windows 完整制作需要本地文件读写、Python 3.11+（64 位）、访问会员 API 的 HTTPS 能力。剪映交付还需要本机剪映专业版，并单独检查草稿打开和编辑。
- 仅网页版聊天、手机端、无本地执行器的云会话不能仅凭此 Windows 安装命令获得全部能力。Claude Code 不等于 Claude 网页版/Cowork；Qwen Code 不等于千问办公。
- TRAE、其他办公助手等未列出的宿主先用 `portable`；这是明确读取技能文件的兼容方式，不声称完成原生注册。不能读取本地文件或运行命令时停止执行并说明缺项。
- 生图、浏览器、定时任务等工具由宿主提供，不能假设每家都有 ChatGPT 的工具。平台模型是否支持所需功能，以会员实时目录为准。

## 通用启动话术

> 请读取安装器输出的 SKILL.md 完整路径，并按其中引用的模块工作。使用同目录 .venv/Scripts/python.exe。作品目录为【填写本机绝对路径】，选择【短剧/商业】路线。先检查本地环境和会员目录连接，不显示 API Key；沿用已有脚本、资产和确认。图片与视频阶段分别确认，付费任务取得当前报价和我的确认后才提交。

通用模式未自动注册任何宿主；新会话需要重新提供入口文件路径。优先使用完整随包目录，不只复制一个 SKILL.md。

## 官方路径依据（2026-10-20 核对）

- [千问办公技能](https://docs.qwenwork.cn/features/skills)：本地技能目录、导入与启动方式。
- [Qwen Code Agent Skills](https://github.com/QwenLM/qwen-code/blob/main/docs/users/features/skills.md)：个人技能目录和显式调用。
- [Claude Code Skills](https://code.claude.com/docs/en/skills)：个人技能目录、本地与云会话区别。
- [Cursor Skills](https://cursor.com/docs/skills)：个人技能目录及跨目录发现。
- [Gemini CLI Skills](https://geminicli.com/docs/cli/skills/)：用户目录、共享别名及刷新。

Codex / WorkBuddy 延续已发布 v0.1.5 的安装适配；本次不修改这些宿主的设置或为其他宿主安装额外插件。
