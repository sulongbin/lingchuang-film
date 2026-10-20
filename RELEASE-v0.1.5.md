# 灵创智影影视全流程 v0.1.5｜Windows 通用版

交付包日期：2026-10-06。统一入口：`lingchuang-film`。

## 下载
- [完整安装包](distributions/v0.1.5/灵创智影影视全流程-v0.1.5-Windows通用版.zip?raw=true)
- [学员使用与交付说明 PDF](distributions/v0.1.5/灵创智影影视全流程学员使用与交付说明-v0.1.5.pdf)
- [原始 SHA256 校验文件](distributions/v0.1.5/SHA256.txt)
- [随包验证记录](distributions/v0.1.5/验证结果-v0.1.5.txt)

下载 ZIP 后完整解压，先阅读《安装与启动说明.md》。GitHub 如显示二进制文件预览页，使用 Download raw file 下载。原 v0.1.2 Release 保留，本版安装包直接存于仓库的 distributions/v0.1.5 目录。

## 安装与变化
需要 Windows、Python 3.11+、允许本地执行与网络访问的 Codex 或 WorkBuddy，以及自己的灵创智影会员 API Key；剪映交付需要 Windows 剪映专业版。

在解压后的 lingchuang-film 目录，只运行当前平台对应的一条：
- Codex：`./install-codex.ps1`
- WorkBuddy：`./install-workbuddy.ps1`

不默认同时安装两个平台。独立终端无法确定宿主时，运行 `./install.ps1` 选择一个平台。安装会联网安装依赖，完成后重开所选软件。Codex 使用 `$lingchuang-film`；WorkBuddy 在技能列表选择或自然语言指定。

本版增加专属入口并校验 CallerApp 与 App 一致；保留单个 SKILL.md、内部 GUIDE.md、旧版外部备份及失败恢复。仅处理所选平台，不清空作品 .film / .lczyai 记录。模型策略、生产脚本、计费接口未改变，未加入 Shotcraft。

## 验证范围
随包记录：13 项安装隔离测试、47 项生产离线测试通过。安装测试环境为 PowerShell 7.6.5，依赖安装跳过或模拟失败。

本次 GitHub 同步重新运行包内 47 项生产离线测试，全部通过；确认已有解压文件与 ZIP 各条目一致、ZIP CRC 正常、SHA-256 匹配。未重新执行安装隔离测试、联网依赖安装、付费生成或 GUI 实机验收。历史剪映验收不扩展为所有版本兼容。

## 完整性
ZIP 大小：742,179 字节。保留原中文文件名与原始字节。

SHA-256：
```text
13e69fa232a691e550060dccd3645ad681881eb5578c27238aa08448051cf2f4
```

组件来源与许可声明随包保留。本仓库保持私有，不改变分发授权范围。
