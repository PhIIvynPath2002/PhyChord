# PhyChord 2.2.1 macOS MIDI 修复与实机验收

## 已定位的问题

桌面框架为 Electron 44.7.0（实际同版本 Linux 运行时报告 Chromium 152.0.7977.130）。不是 WKWebView / Tauri。

旧代码 desktop/security.cjs 只放行 midi 权限，拒绝 midiSysex。Chromium 的 BlockMidiByDefault 默认开启，即使调用 requestMIDIAccess({sysex:false}) 也使用 SysEx 权限描述符请求授权。同版本 Electron 实测回调是 midiSysex，旧处理返回 NotAllowedError。Chrome 的内置授权流程不受这段 Electron 自定义回调影响。

参考源码：
- https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/modules/webmidi/midi_access_initializer.cc
- https://github.com/chromium/chromium/blob/main/third_party/blink/common/features.cc

这是已复现的权限根因；未确认是否也是用户 macOS 环境的唯一故障。

## 最小修复

- 在受信任的 app://phychord 主页面兼容 midi / midiSysex 权限名称；保留用户同意、来源及主框架检查。
- preload 在主世界中强制非 SysEx API，明确拒绝 sysex:true，并阻止创建 iframe 绕过该入口；不禁用 App 的 contextIsolation / renderer sandbox。
- BrowserWindow、协议处理和权限回调绑定同一个 default Session，保留已有 localStorage 乐谱与设置。
- 保留网页 Web MIDI 和统一 MIDIInput.event / MIDI 消息处理，和声算法未重写；macOS CoreMIDI 由 Chromium 原生后端使用，无第二套分析逻辑。
- 设置内 MIDI 诊断显示 API、secureContext、设备、端口状态、最近消息、错误及 Electron 权限回调/版本。诊断 JSON 保留原始错误，不经界面翻译修改。

## 当前验证边界

已通过浏览器回归、模拟设备枚举/热插拔/Note On/Off/Velocity/CC64，以及真实 Electron 的 API 和权限路径测试。

Linux 真实 Electron 放行权限后返回 InvalidStateError: Platform dependent initialization failed；本环境没有 /dev/snd/seq MIDI sequencer。此项不能算 native MIDI 枚举通过。

macOS App 为交叉构建，未在 macOS 或真实 MIDI 键盘上运行，未签名/未公证。不得将其描述为实机完全修复。

## 用户实机验收步骤

1. 退出旧 PhyChord；按处理器选择 arm64（Apple Silicon）或 x64（Intel），解压 ZIP，将新 PhyChord.app 放到单独目录，确认版本 2.2.1。首次启动如被 Gatekeeper 拦截，在系统设置中检查来源后按 macOS 正常授权流程允许打开。
2. 连接已在 Chrome 验证可用的 MIDI 键盘；完全退出 Chrome，避免第三方驱动的独占情况干扰对比。打开新的 App。
3. 设置 → MIDI 连接/刷新 → 允许本机 MIDI 权限；选择实际设备。展开 MIDI 诊断 → 刷新。
4. 检查 framework=Electron、版本 2.2.1、secureContext=true、webMIDIPresent=true。设备应有正确 name、state=connected；权限记录应出现 midiSysex request / granted=true，随后 midi check / granted=true。
5. 古典和流行模式分别弹单音/和弦：消息应有 note-on、note-off；力度覆盖轻/重弹，data 第三个字节为输入的 1–127。FIX VEL 关闭应随力度变化，开启应以 127 音量映射输出（原始诊断仍保留原始力度）。note-on velocity=0 作为 note-off。
6. 按/松延音踏板：应出现 sustain-CC64，值 >=64 为踩下、<64 为抬起；音响延续与释放正确，实时识别仍按实际按键集合变化。
7. 在按住音符时拔下设备：声音应清理，端口 state 变 disconnected；重新插入后无需重启即可再次枚举、选择并接收消息。
8. 打开设置、切换语言、打开乐谱时继续弹奏；MIDI 发声不中断，乐谱仍按原规则录入和弦，原有分析与鼠标试听功能可用。
9. 若失败，把诊断文本复制给开发者：API absent 指向运行时/preload；NotAllowedError 指向权限；InvalidStateError 指向 CoreMIDI/驱动初始化；设备列表空但无错时检查端口枚举与设备选择。不要只发送“连接失败”。

开发者真实 Electron 回归（需可运行的桌面显示环境；Linux 可用 Xvfb）：
`PHYCHORD_ELECTRON=/path/to/electron npm run test:desktop-runtime`

硬件验收记录需附 macOS 版本、Mac 架构、键盘型号、接入方式、以上逐项结果和诊断；目前这些结果尚未获得。
