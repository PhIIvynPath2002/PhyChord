PhyChord 2.2.1 — 调性拼写、乐谱撤销与古典 MIDI 写入。

- 修复 Windows NSIS 安装脚本混合路径分隔符导致 File /r “no files found”，Windows 构建失败后整个 Release 被跳过的问题。使用 NSIS 标准反斜线路径；增加含空格路径的编译回归、打包源码校验及发布附件完整性检查。
- 首页和乐谱调性选择统一为 ♮ / # / b → CDEFGAB → 大小调，保留 F♯ / G♭ 等音拼写；自然主音不加多余还原号。
- 乐谱 Command+Z 撤销、Command+X 复原，Windows 支持 Ctrl；恢复音符、调性及光标，新编辑清除复原分支。
- 古典模式 🖊️ 写入开关累计 MIDI 音符，松键保留分析记录，声音按正常松键和 CC64 释放；乐谱与流行模式维持各自输入逻辑。
- 普通与写入古典模式均可长按 Delete/Backspace 400ms 重置和弦。
- 保留 PhC 应用图标、扬声器全局开关、FIX VEL、实时 MIDI 力度、FluidR3 GM 采样、双语、乐谱播放和既有和声分析。
- Windows 下载 x64 / ARM64 Setup.exe；macOS 下载 Intel x64 / Apple Silicon ARM64 DMG，或 ZIP 解压后将 PhyChord.app 拖入 Applications。
- 安装包未签名，未经 Apple 公证。自动测试和构建不代替实际安装及 MIDI 硬件验证；见 MIDI-MACOS-TEST.md。
- 输入、声音和分析在本机运行，不需要互联网；网站部署继续暂停。
