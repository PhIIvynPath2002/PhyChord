# 转调标注规则与来源

本轮查阅的教材：**Open Music Theory — Modulation**。

- 在线章节：https://openmusictheory.com/Modulation.html
- 已读取的公开教材源码：[Modulation.md](https://github.com/OpenMusicTheory/openmusictheory.github.io/blob/a907aa015f7ec54b925ddb070d2d36aecd0dc705/Modulation.md)
- 源码提交：`a907aa015f7ec54b925ddb070d2d36aecd0dc705`。

Pressbooks 和 Puget Sound 的教材网页访问被网络代理拒绝（403），因此本轮不将其记为已核对来源；使用 GitHub 上的 Open Music Theory 原始章节完成核对。应用运行时不连接这些站点。

## 已落实的规则

共同和弦（pivot chord）须属于前后两调，具有一致的根音、和弦结构和音名拼写。最常见的平滑解释涉及前属功能；也允许教材认可的其他共同功能。新调属和弦如果仅在旧调中作副属，不是调内共同和弦，不加中介括号。

调性引擎需持续支持新调；标注引擎还检查新调 V/V7 到 I/i 的到达证据。由于乐谱没有节奏和乐句边界，不能确认乐句终止，因此框和双属都属于上下文支持的候选分析，方框悬停提供说明。单次副属到目标和弦不生成已确立转调标记。

确认后，标记回溯到共同和弦；新调框位于前一和弦与该共同和弦之间，共同和弦第一行按旧功能／新功能上下叠写，以右方括号相连；罗马数字同行列出旧／新解释。其后按新调标注功能。

显示政策将双属括号限定为相邻调号、关系大小调与同主音大小调。其他关系仅标新调框。这是教学显示范围限制，**不表示远关系转调一定不属于古典主义**。等音减七、变化增六等另有上下文解释，但不作为普通调内共同和弦的替代证明。

## 独立正反例

| 进行 | 旧调／新调中的共同解释 |
| --- | --- |
| C 大调：C—Am—D7—G | Am：vi / ii，即 TSVI / SII，C → G |
| C 大调：C—F—C7—F | F：IV / I，即 S / T，C → F |
| C 大调：C—F—E7—Am | F：IV / VI，即 S / TSVI，C → a |
| D 小调：Dm—C—F | C：VII / V；教材原文的自然 VII → V 示例 |
| 小调：i—i—V7/属小调—属小调 i | 原主和弦：旧 T / 新 S，覆盖 12 个主音 |

反例包含旧调副属仅作新调属、单次临时主音化、较远关系，以及等音拼写不一致；它们不能因音高类重合而得到调内中介括号。

## 流行／副属分析预览来源（2026-10-16 实际读取）

- Robert Hutchinson, *Music Theory for the 21st-Century Classroom*, [Jazz Chord Basics §31.1](https://musictheory.pugetsound.edu/mt21c/JazzChordBasics.html)：9 隐含七音，add9 无七音；add2 是常用替代标记；6/9 和小大七；真实十三和弦常省十一。
- 同书 [Chord Symbol Specifics §31.2](https://musictheory.pugetsound.edu/mt21c/ChordSymbolSpecifics.html)：有无七音区别 6/13；有无三音区别 sus/11；保留自然五音时变化四音写作 #11。
- 同书 [Altered Dominant Seventh Chords §31.3](https://musictheory.pugetsound.edu/mt21c/AlteredDominantSeventhChords.html)：根、三、七不变，变化五／九；b13 与 #5 的区别取决于自然五音是否保留，不能无条件互换。
- 同书 [Tonicization §17.2](https://musictheory.pugetsound.edu/mt21c/Tonicization.html)：大三／属七副属，V/V；不以减三和弦为普通临时主目标。
- 同书 [Tonicization versus Modulation §22.2](https://musictheory.pugetsound.edu/mt21c/TonicizationVersusModulation.html)：新调需终止确认；V–I 到达仍可能是短暂主音化，节奏／乐句不足时保留候选。
- [Open Music Theory — Applied Chords](https://github.com/OpenMusicTheory/openmusictheory.github.io/blob/master/appliedChords.md) 与前述 Modulation 原始章节已读取；采用副属／副导和转调区分，不把其功能低音标法当成斯波索宾标法。
- [Tonal chord-type data](https://github.com/tonaljs/tonal/blob/main/packages/chord-type/data.ts) 与 [chord-detect](https://github.com/tonaljs/tonal/blob/main/packages/chord-detect/index.ts) 已读取，核对 add2/add9 别名及音高类检测边界。未引入在线库或复制其实现代码。
- [ChordieApp 官方功能／FAQ](https://www.chordieapp.com/) 已读取：公开说明其拼写表、和弦解释及定义更新机制；未取得内部算法，未作实机对比，不能据此宣称超越其识别准确度。PhyChord 保持本地离线规则与内嵌音源。

### 明确的实现约定和未完成核对

按用户希望，add2/add9、add4/add11 主标记参考最低实际根音和加音位置；教材承认别名而未规定唯一音区，这属于本项目显示约定。常规七和弦扩展不因低音区改叫 2/4/6。混合音区、转位、缺根音不能凭当前音响确定唯一和弦。主标记排序是启发式，不是风格统计概率。

两份用户上传《爵士和声》PDF 各自超过 download_file 的 32 MiB 上限，工具拒绝传输，故未读正文，未引用书内页码；须拆分／压缩相关章节后才能完成书本校订。俄文斯波索宾网络检索返回不相关结果，未把它算作原教材核对成功；DD / D/D 保留项目的斯波索宾功能约定，与公开教材 V/V 对照，不能声称已核对斯波索宾原书。此处新增教材链接在本轮均返回 HTTP 200；上方历史记录中的网络 403 是此前轮次状态。
