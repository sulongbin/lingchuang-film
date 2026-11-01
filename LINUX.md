# Linux 云端专用版 v0.1.9-linux

Windows v0.1.8 继续提供剪映草稿和成片剪辑；本版不替换 Windows 安装器或技能。

Linux 版以会员画布中的逐镜视频为交付。只需要 Linux + Python 3.10+，无需 Node、Windows CLI、剪映或第三方 Python 依赖。使用会员自己的 API Key，由云平台 Secret 配置注入 LCZYAI_API_KEY，不要发到聊天或写入项目文件。安装完成不等于授权付费生成。

## 安装

先下载并检查脚本，再执行；以下为 Codex 云端，其他宿主可选 workbuddy、qwen-code、claude-code、portable。宿主目录适配不等于其技能列表已经实机验证。

```sh
curl -fL --proto '=https' --tlsv1.2 https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/lingchuang-film/v0.1.9-linux/install-linux.sh -o install-linux.sh
bash install-linux.sh --app codex
```

解压完整 ZIP 后也可执行 `python3 install-linux.py --app codex`，不用联网安装依赖。安装器将可识别的旧版备份，遇到作品数据、未知目录或符号链接会停止。

Codex 技能入口通常为 `~/.agents/skills/lingchuang-film/SKILL.md`。在智能体中发送：

> 使用 lingchuang-film 的 Linux 云端 API Key 模式。先运行 cloud_doctor.py，确认 Secret 已注入后只读查询会员模型；不要显示 Key。作品放在持久卷，保留账号和画布绑定。先确认脚本、图片与视频方案，再分别展示有效报价，经我确认后生成。每段视频回传到本人画布，返回真实画布信息、逐镜状态和已结算积分。不要运行 Windows CLI 或剪映。

原生产流程继续由 scripts/cloud_entry.py 调用；完整说明见安装后 references/linux-cloud.md。需要实际 Key 才能进行会员只读连接验收；安装器不会收集或保存 Key。

## 下载

- [Linux 完整 ZIP](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/lingchuang-film/v0.1.9-linux/lingchuang-film-v0.1.9-linux.zip)
- [SHA-256](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/lingchuang-film/v0.1.9-linux/SHA256.txt)
- [Linux 安装脚本](https://lczyai.oss-cn-shanghai.aliyuncs.com/lczyai/downloads/lingchuang-film/v0.1.9-linux/install-linux.sh)
- [Windows 安装与剪映成片流程](INSTALL.md)

## 验证与边界

Linux x86_64、Python 3.10.12：64 项技能测试 + 2 项安装恢复测试通过，包括真实 Python 子进程调用模拟 HTTP 接口、阶段确认阻断、账号隔离、同画布复用、逐镜结果、结算、重复提交保护。安装、升级、回滚、未知目录与符号链接保护已测试。

测试不连接真实生成供应商，没有产生积分消费。尚未完成 Linux 真实会员付费视频与画布播放验收；使用前先用会员自己的 Secret 做只读连接检查。云端必须能持久保存 .film 和 .lczyai，临时任务重启后先恢复原项目，不自动重做。

本版不提供 Linux 浏览器授权，也不将 Windows CLI 标为跨平台；Windows 版保留原有剪映成片剪辑能力。
