# 私有仓库安装与定向分享

当前仓库为个人账号 sulongbin 下的私有仓库。访问使用 GitHub 账号授权，不能给仓库设置一个共享下载密码。

## 谁能安装
仓库所有者及已接受邀请的协作者可使用下面的命令。GitHub 连接器授权属于当前账号，不会自动传给学员。

个人私有仓库协作者同时具备读、写权限。少量可信协作者可通过仓库 Settings → Collaborators → Add people 邀请；面向只需下载的会员，建议后续使用组织私有交付仓库的 Read 权限，或会员登录后的安装包下载。不要把所有者的 GitHub 密码、PAT 或会员 API Key 作为安装密码分享。撤销仓库权限不会删除对方已下载的包。

本次没有新增协作者、修改仓库可见性或建立下载授权服务。

## Windows Codex 安装
准备 Git、GitHub CLI（gh）、Python 3.11+、Codex，并确保自己的 GitHub 账号有仓库权限。联网依赖安装可能需要等待。

先登录自己的账号：
```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git --hostname github.com
```

再在 PowerShell 执行。它在临时目录取得一份新副本并核对 v0.1.5 安装包，只安装到 Codex：
```powershell
$ErrorActionPreference = 'Stop'
$lcSource = Join-Path $env:TEMP ('lingchuang-film-' + [guid]::NewGuid().ToString('N'))
gh repo clone sulongbin/lingchuang-film $lcSource -- --depth 1
if ($LASTEXITCODE -ne 0) { throw '仓库下载失败，请核对登录账号和仓库权限。' }
$lcZip = Join-Path $lcSource 'distributions/v0.1.5/灵创智影影视全流程-v0.1.5-Windows通用版.zip'
if ((Get-FileHash -LiteralPath $lcZip -Algorithm SHA256).Hash -ne '13e69fa232a691e550060dccd3645ad681881eb5578c27238aa08448051cf2f4') { throw '安装包校验失败，停止安装。' }
$lcUnpacked = Join-Path $lcSource 'unpacked-v0.1.5'
Expand-Archive -LiteralPath $lcZip -DestinationPath $lcUnpacked
& (Join-Path $lcUnpacked 'lingchuang-film/install-codex.ps1')
```

WorkBuddy 用户只将最后一行的 `install-codex.ps1` 改为 `install-workbuddy.ps1`，不要两个都执行。脚本如受本机策略阻止，按本机策略处理，不自动绕过。

完成后重开所选软件。Codex 中使用 `$lingchuang-film`，WorkBuddy 中选择 lingchuang-film。会员 API Key 另按包内说明配置，GitHub 登录不能替代灵创智影会员鉴权。

本说明的下载语法依据官方 CLI 文档；本次未以另一个会员账号实际登录安装。

## 官方依据
- [GitHub CLI 登录](https://cli.github.com/manual/gh_auth_login)
- [GitHub CLI 克隆仓库](https://cli.github.com/manual/gh_repo_clone)
- [个人仓库权限](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)
- [组织仓库 Read 角色](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
