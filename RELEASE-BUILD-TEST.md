# PhyChord 2.2.1 构建修复与验证

## 2.1.1 失败原因

用户提供的 GitHub Actions 日志显示两个 Windows job 在 Build Windows installer 失败，macOS 两 job 已通过，release 被跳过。NSIS 报错为：

```
File: "D:\a\PhyChord\PhyChord/dist/win-unpacked/*" -> no files found.
File: "D:\a\PhyChord\PhyChord/dist/win-arm64-unpacked/*" -> no files found.
```

自定义 installer.nsi 在 Windows 原生根目录后拼接了正斜线及通配符；NSIS 的 Windows File /r 匹配不能按这种混合路径找到文件。2.2.1 改为 `${PROJECT_DIR}\dist\win-unpacked\*` / ARM64 同样路径；POSIX makensis 自行转换反斜线。保留严格 File 错误，不使用 /nonfatal 掩盖缺失文件。

## 自动检查

- `node tests/installer-paths.test.cjs`：含空格路径、嵌套 resources、x64/ARM64 编译真实安装脚本。Windows CI 另编译旧写法，要求复现 no files found。
- `desktop/verify-pack.cjs`：afterPack 核对真实可执行文件、当前单文件 HTML/MIDI 源码、图标、许可证及版本。
- `desktop/verify-release.cjs`：原生 CI 每架构校验必需的 Setup.exe / DMG / ZIP，再允许上传。
- `desktop/build.cjs`：本地构建要求 artifact 事件真实产生两个架构文件，避免清理阶段报错而退出码为零造成误判。
- `npm test`：保留全部功能和新调性选择、MIDI 写入、撤销/复原回归。
- `node tests/artifacts.test.cjs`：本地四种架构的 ASAR 源码、版本、Windows PE 图标、macOS ICNS 与 CPU 架构。

Linux 路径回归与交叉构建不能替代 Windows 原生 job 或真实安装测试。macOS/Windows MIDI 硬件仍须按 MIDI-MACOS-TEST.md 验收。安装包未签名/未公证。

## GitHub 发布

推送 v2.2.1 触发四架构原生构建；全部成功后 release job 上传安装器、图标资源、独立 HTML 和 SHA256 校验和。旧 v2.1.1 失败记录保留，新版不覆盖旧标签。

当前云环境的 GitHub API 域名访问受限，Git push 与 Actions 发布使用不同通道。已在环境配置草稿保留原允许域名并新增 api.github.com；配置应用后还需重试 API，不能把草稿保存当作访问或附件上传成功。
