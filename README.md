# PhyChord 2.2.1

离线 MIDI 古典和声学习与流行和弦分析软件。`index.html` 内嵌 CSS、JavaScript、Bravura 乐谱字形和 FluidR3 GM 钢琴采样，无运行时 CDN、字体或分析网络请求。

## 下载和运行

GitHub [Releases](https://github.com/PhIIvynPath2002/PhyChord/releases/tag/v2.2.1) 的 Assets 提供 Windows x64/arm64 安装器与 macOS Intel/Apple Silicon DMG/ZIP。Windows 运行 Setup.exe；macOS 拖入 Applications。安装包未签名/未公证，实机安装及 MIDI 验收尚未完成。

Chrome/Edge 也可打开独立 HTML；在“设置”连接本机 MIDI。浏览器要求安全上下文，file:// 不可用时可本地启动 `python3 -m http.server 8000`。不需要互联网。网站部署暂时跳过。

## 界面与输入

- 古典模式：双谱表、斯波索宾功能、罗马数字、流行符号及候选分析。鼠标第一次点击选中并按住发声，再次点击静音取消选中。
- 流行模式：只显示当前输入的流行和弦及候选，不推断古典功能/调性。鼠标按住发声与高亮，松开解除。
- 两模式 MIDI 实时读取力度 1–127，note-on 0 表示释放，CC64 延音不影响实时按下音符分析。界面 FIX VEL 开启时固定 127；鼠标始终 127。
- 页面底部 88 键无需横向滚动；高亮键上方显示小号浅灰音名。左上谱面为 5:4。密集音头与变音符独立分列。
- 首页右上角“扬声器图标 / 打开乐谱 / FIX VEL / 设置”；扬声器统一开关 MIDI、鼠标及乐谱声音，状态本机保存，关闭不影响输入分析和播放光标。MIDI 设备选择、诊断、系统/亮/暗主题、中文/English 与快捷键在设置中。

声音采用内嵌 FluidR3 GM Acoustic Grand Piano 88 键采样，未使用物理建模；来源与 CC BY 3.0 US 许可见 [LICENSE-PianoSamples.md](LICENSE-PianoSamples.md)。Bravura 字形采用 SIL OFL 1.1，见 LICENSE-Bravura.txt。

## 全音符乐谱

两个模式均可打开乐谱，仅全音符、无拍号/小节线、无四部配音控件。

- 鼠标左键增加音符、右键删除；Shift+S/Shift+Q 临时填写升/降号，可在设置改为非 CDEFGAB 的不同字母。
- Enter 插入下一和声位，左右键移动光标，Delete/Backspace 删除当前和声并回到前一和声，可连续删除。删除后新输入在前一和声之后插入，不覆盖原内容。
- MIDI 多音同时或先后按下，全部释放后提交一组和声。中央 C 的 MIDI 输入默认高音谱表；鼠标可在两个谱表填写并独立删除。
- 乐谱下方钢琴只试听，按住发声、松开释放，不改变乐谱和光标。
- 超出范围横向滚动，可缩放、保存、比较候选连接、试听并插入；没有独立双击竖屏窗口。
- 选中光标位于和弦右侧，钢琴高亮选中和弦；谱下三行依次为斯波索宾、罗马数字、流行标记。起始与转调有方框调名，符合证据规则的共同和弦标双重功能。
- 播放从头按 52 BPM，每个非空和声一拍，光标跟随，支持暂停/继续。试听时值不是和声节奏证据。

## 理论边界与 MIDI 修复

区分音响、拼写、调性功能和上下文；sus、6/9、加音、变化、十一/十三及省略音配法保留多解。属十一常省三音，完整属九加十一记为 `9(add11)`。没有真实声部或乐句节奏时，不宣称已验证严格四部连接或唯一终止/转调；参阅 PRODUCT_SPEC.md 和 THEORY_SOURCES.md。

Electron 44.7.0 的普通 Web MIDI 请求触发 `midiSysex` 权限回调，旧权限规则拒绝导致 NotAllowedError。2.2.1 修复此路径，并添加非 SysEx preload 限制及 MIDI 诊断，保留原 default Session 和网页版 MIDI 实现。真实 Electron 权限回调已验证；云环境没有 macOS MIDI 键盘，不能宣称硬件修复完全验证。根因和设备测试步骤见 [MIDI-MACOS-TEST.md](MIDI-MACOS-TEST.md)。

## 开发与构建

```sh
npm ci
npm test
npm run build:windows
npm run build:macos
```

浏览器测试需 Chromium，默认 `/usr/bin/chromium`，可用 `PHYCHORD_CHROMIUM` 指定。真实 Electron 测试另运行 `npm run test:desktop-runtime`，可用 `PHYCHORD_ELECTRON` 指定二进制；Linux 需要显示服务，缺少 MIDI 后端不算设备通过。

本地交叉构建输出 Windows Setup.exe 和 macOS ZIP；标签 `v2.2.1` 触发 GitHub 原生 Windows/macOS 构建，macOS 同时生成 DMG，然后发布版本、图标资源、单文件 HTML 和 SHA256 校验和。所有构建架构必须成功才发布。

图标在 `build/icons`，ICO/ICNS 在 `build`；比例不变，圆形与 maskable 版本保留安全留白。资源已提交，构建无需生成图片。仅重新导出时需要 ImageMagick 7 和 `npm run icons`。

## 最新编辑功能

调性选择现为 `♮ / # / b → C D E F G A B → 大调/小调`，首页和乐谱一致。所选拼写保留，例如 F♯ 与 G♭ 显示各自调号；♮ 选项不让自然主音额外出现还原符。

古典模式的 🖊️ 开关开启后，依次弹奏的 MIDI 音符会累计为一个和弦，松键仍正常释放声音。长按 Delete/Backspace 400ms 重置当前和弦（正常古典模式同样适用），写入开关保持开启；流行模式不累计。打开乐谱时暂停主界面累计，乐谱录入逻辑保持。

乐谱 Command+Z 撤销，Command+X 复原；Windows 可用 Ctrl。覆盖音符、MIDI 和声、删除、插入和调性修改，并恢复光标，最多保留本次运行的 128 步。新增编辑后原复原分支清除；文本输入栏保留原生文字快捷键。

Windows 发布修复：2.1.1 的 NSIS 脚本把 Windows 根路径与 `/dist/.../*` 拼接，导致 File 通配匹配失败；两 Windows 构建失败使整个 Release 跳过。2.2.1 改用 NSIS 标准反斜线；路径回归可运行 `node tests/installer-paths.test.cjs`（使用 electron-builder 的校验下载工具）。原生 Windows CI 另验证旧写法确实失败，所有构建增加源码和必需附件检查。
