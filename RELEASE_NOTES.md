PhyChord 2.1.1 — 本地 MIDI 古典与流行和声互动学习。

- 新 PhC 应用图标：Windows ICO、macOS ICNS、普通/Retina 多尺寸及圆形、方形展示资源；等比缩放与安全留白。
- 古典/流行模式、全音符乐谱、52 BPM 跟随播放、连接建议和离线单文件继续保留。
- 移除物理建模近似音源，统一使用内嵌 FluidR3 GM Acoustic Grand Piano 88 键采样（CC BY 3.0 US）。MIDI 读取 1–127 力度及 CC64；FIX VEL 开启固定 127，0 仍为释放。
- 鼠标按住琴键发声；古典模式选中/取消，流行模式松开解除。乐谱底部琴键仅试听，不输入音符。
- 中英文、升降号快捷键设置、密集音头/变音排版、中央 C 双谱表手动输入及浅灰琴键上方音名。
- 首页“打开乐谱”左侧新增扬声器图标，统一开关 MIDI、鼠标琴键与乐谱声音，状态本机保存；关闭声音不影响和声分析和播放光标。MIDI 连接与诊断位于设置。
- Electron MIDI 权限修复：普通 MIDI 请求兼容 Chromium 的 midiSysex 回调，同时 preload 限制真正 SysEx 请求；沿用 default Session 和同一 Web MIDI 分析入口。
- Windows 使用对应 x64/arm64 Setup.exe；macOS 使用对应 Intel x64 / Apple Silicon arm64 DMG，或解压 ZIP 将 PhyChord.app 拖入 Applications。
- 未签名、未经 Apple 公证。真实 Electron 权限路径已验证，macOS/Windows 实际键盘、安装及热插拔尚未验证；按 MIDI-MACOS-TEST.md 完成设备验收后才可确认硬件修复。
- MIDI、声音和分析均在本机处理，无需联网。网站部署继续暂停。
