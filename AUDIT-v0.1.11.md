# v0.1.11 验证范围

2026-11-08：已读取真实会员模型目录，Muse (`grok------api:muse-video`) 为 adapted=true、mock_tested_not_live_generated。未获取生成报价、上传素材或运行真实付费生成；价格仅为目录快照，输出质量、音频与稳定性尚未验收。

本次变更仅涉及模型筛选、说明和发行版本。增加 Muse 优先、必需图片数量检查；保留 RH H3、WAN、Seedance 等候选，NSDD H3 仍禁止新生成。未修改生产客户端、桥接实现、会员鉴权或计费流程。

模型用例覆盖优先排序、其他模型选择、无图/过多图片/音视频参考/时长/画幅排除、未知声音和未适配模型。Windows/Linux 发行包同步规则；不将 Windows 上的 Python 测试等同于 Linux 宿主授权验收。

验证结果：Windows 包 82 项 Python 测试通过，Linux 包 84 项 Python 测试通过（本次在 Windows 执行，Linux 专属宿主授权不在验收范围）；8 项 npm/Windows 安装器测试通过。8 个 OSS 文件均重新下载并核对 SHA-256。未运行真实付费生成。
