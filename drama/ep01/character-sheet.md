# 第1話 キャラクター＆美術シート

このファイルのプロンプトで作った画像が、**以降の全カット・全エピソードの基準**になる。
ここで妥協すると後工程が全部ブレるので、**1日かけてでもマスターを納得いくまで作り直す**こと。

---

## 0. 作る順番

`README.md` では「キャラシートを1枚作る」と書いたが、実制作では次の2段階に分けたほうが安定する。
1枚に三面図と表情を同時に描かせると、**顔とタッチが枠ごとにバラつく**ため。

```
STEP 1  マスター1枚（正面・バストアップ・無表情）を全力で作る
          ↓  これが唯一の基準。以降すべてこの画像を参照に渡す
STEP 2  マスターを参照して、角度違い・表情差分を1枚ずつ派生させる
          ↓
STEP 3  背景美術（部屋）を2種つくる
          ↓
STEP 4  ここで初めて本編カットの生成に入る
```

**STEP 1 が終わるまで STEP 2 に進まない。** 途中で顔を変えたくなったら STEP 1 に戻る。

---

## 1. 共通ブロック（全プロンプトの末尾に必ず付ける）

### スタイル固定

```
Japanese late-night anime style, cel shading, clean confident lineart,
muted desaturated palette, deep blue night tones with a single warm light
source, soft film grain, no text, no watermark, no signature
```

### ネガティブプロンプト

```
photorealistic, 3d render, western cartoon, chibi, extra fingers, deformed
hands, multiple people, watermark, text, logo, oversaturated colors,
white clothing, bright daylight, lens flare, heavy makeup, exaggerated
expression, open mouth screaming
```

> `white clothing` をネガティブに入れているのは意図的。**白は人影の専用色**で、キャラに使うと第1話の反転が壊れる。

### アスペクト比の注意

- **キャラシート・美術シート**：`3:2` または `1:1`（横に情報を並べたいので縦にしない）
- **本編カット**：`9:16`

共通ブロックには 9:16 を含めていないので、本編カット生成時のみ末尾に
`vertical 9:16 aspect ratio, cinematic vertical composition` を追加する。

### カラーパレット（編集・テロップもこれに揃える）

| 用途 | Hex | 備考 |
|---|---|---|
| 夜の影 | `#1B2436` | 全カットのベース暗部 |
| 夜の中間色 | `#2E3F5C` | 壁・空気感 |
| 単一光源（暖色） | `#E8B87A` | デスクライト・天井灯 |
| 画面グロー（寒色） | `#7FA8C9` | スマホの光が顔に当たる色 |
| 白（人影専用） | `#EDEDE8` | **キャラの服には使わない** |
| テロップ | `#FFFFFF` ＋ 黒フチ2px | 全話共通 |

---

## 2. アカリ（主人公）

**設定**：22歳。引っ越し初日。段ボールも開けていない。疲れていて、少し気だるい。
恐怖の演技は**動かない方向**に振る（叫ばない、逃げない、固まる）。

### STEP 1 — マスター（これを最初に作る）

```
character reference portrait of a 22-year-old Japanese woman, chin-length
black bob haircut with blunt bangs, slightly downturned tired eyes, dark
brown iris, small mouth, no makeup, wearing an oversized charcoal black
hoodie with the hood down, neutral calm expression, facing directly toward
the viewer, bust-up composition, plain dark grey background, even soft
lighting, front view only, single character

Japanese late-night anime style, cel shading, clean confident lineart,
muted desaturated palette, soft film grain, no text, no watermark
```

> マスターだけは**平坦な均一ライティング**で作る。ここで劇的な陰影をつけると、参照として使ったとき全カットにその影が焼き付いてしまう。

**採用基準**：目の形・前髪の分かれ方・輪郭が「毎回同じ人」と言い切れるか。迷ったら不採用。

### STEP 2 — 角度差分（マスターを参照画像に添付）

```
same character as the reference image, identical face and hairstyle,
three quarter view from the left, bust-up, plain dark grey background,
even soft lighting, single character
```

`three quarter view from the left` を差し替えて、以下を作る：

- `profile view from the left`（横顔／C5・C7で使う）
- `view from behind, back of the head and shoulders`（**後ろ姿。C5で使う最重要カット**）

### STEP 2 — 表情差分（マスターを参照画像に添付）

| ファイル名 | 使うカット | プロンプト差分 |
|---|---|---|
| `akari_neutral` | C2 | `relaxed neutral expression, faint smile` |
| `akari_doubt` | C4前半 | `slightly puzzled expression, one eyebrow lowered, lips parted a little` |
| `akari_freeze` | **C4** | `expression frozen, smile gone, eyes wide but calm, no exaggeration, lips closed tight` |
| `akari_relief` | C8・C10 | `relieved genuine smile, eyes softened, shoulders lowered` |
| `akari_realize` | **C14** | `pupils shrunk, staring at the screen, mouth slightly open, all color drained from the face` |

各差分の完全形（例：C4用）：

```
same character as the reference image, identical face and hairstyle,
expression frozen, smile gone, eyes wide but calm, no exaggeration, lips
closed tight, bust-up, front view, cold blue screen glow lighting her face
from below, dark room behind her, single character

Japanese late-night anime style, cel shading, clean confident lineart,
muted desaturated palette, deep blue night tones, soft film grain, no text
```

---

## 3. ミナ（通話相手）

**設定**：22歳。アカリと同年代の友人。自室から通話している。
**この回で本当に危険なのはミナ側**だが、本人は最後まで気づかない。演技は「善意の心配」に徹する。

### STEP 1 — マスター

```
character reference portrait of a 22-year-old Japanese woman, long straight
dark brown hair past the shoulders, center part, gentle round eyes, warm
expression, wearing a loose olive green knit sweater, neutral calm
expression, facing directly toward the viewer, bust-up composition, plain
dark grey background, even soft lighting, front view only, single character

Japanese late-night anime style, cel shading, clean confident lineart,
muted desaturated palette, soft film grain, no text, no watermark
```

> アカリ＝**黒・ショート**、ミナ＝**オリーブ・ロング**。シルエットで判別できるようにわざと振り分けてある。小さいスマホ画面では、髪の長さと服の色でしか見分けられない。

### STEP 2 — 表情差分

| ファイル名 | 使うカット | プロンプト差分 |
|---|---|---|
| `mina_worry` | **C1** | `concerned expression, slight frown, looking straight at the camera` |
| `mina_glance` | **C3** | `uneasy expression, eyes glancing toward the lower corner of the frame, not at the camera` |
| `mina_relief` | C9 | `relieved laugh, eyes closed, head tilted slightly` |
| `mina_frozen` | **C11** | `smile frozen mid-laugh, eyes wide, pupils contracted, unnaturally still` |

`mina_glance` は伏線カット。**視線が「こちら」ではなく画面の隅に向いていることが読み取れるか**を必ず確認する。

---

## 4. 白い服の人影

**顔は絶対に作らない。** 作らなければ破綻しようがない。

```
a white long sleeve and a pale hand emerging from the gap of a dark half-open
door, the figure is completely obscured by shadow, no face visible, no head
visible, only fabric and darkness, extremely low light, deep blue night tones,
ominous stillness, single subject

Japanese late-night anime style, cel shading, muted desaturated palette,
soft film grain, no text, no watermark, vertical 9:16 aspect ratio
```

ネガティブに `face, eyes, head, portrait, character` を追加する。

---

## 5. 背景美術

**背景はキャラと別に、先に「無人の部屋」を作る。** 使い回せるので1話あたり1時間浮く。

### アカリの部屋（引っ越し初日・段ボール）

```
empty small Japanese one-room apartment at night, unpacked cardboard boxes
stacked against the wall, a bare mattress on the floor, no furniture, beige
walls, a single warm ceiling light, deep shadows in the corners, no people,
background art only

Japanese late-night anime style, cel shading, clean lineart, muted
desaturated palette, deep blue night tones, soft film grain, no text
```

派生で以下も作る（同じ部屋・別アングル）：

- `closet interior, empty, only a few hangers, dark`（C6）
- `apartment entrance door seen from inside, security chain fastened, close-up, dim`（C7）

### ミナの部屋（**ドア開き差分が命**）

同じ部屋を**ドアの開き具合だけ変えて2枚**作る。ここが第1話の反転そのもの。

```
a lived-in Japanese bedroom at night seen from the front, a desk lamp as the
only light source, a door in the background LEFT AJAR BY ABOUT FIVE
CENTIMETERS, pure black darkness in the gap, no people, background art only
```

C12用は `LEFT AJAR BY ABOUT FIVE CENTIMETERS` を
`OPEN BY ABOUT TWENTY CENTIMETERS, the dark gap clearly wider` に差し替える。

> **必ず同じ生成セッション・同じ参照画像から2枚出す。** 部屋自体が変わってしまうと、視聴者は「ドアが開いた」ではなく「別の絵になった」と受け取る。2枚を並べて、**ドア以外が同一であること**を目視で確認する。

---

## 6. 保存規約

```
drama/ep01/assets/
├── char/
│   ├── akari_master.png       ← 触らない。全生成の参照元
│   ├── akari_back.png
│   ├── akari_freeze.png
│   ├── mina_master.png
│   ├── mina_glance.png
│   └── mina_frozen.png
├── bg/
│   ├── akari_room.png
│   ├── mina_room_door_5cm.png   ← C1
│   └── mina_room_door_20cm.png  ← C12
└── cuts/
    └── c01.png … c14.png
```

`*_master.png` は**確定後に絶対に上書きしない**。2話以降もこれを参照する。

---

## 7. リテイク判定

生成物は必ずこの順で見る。**上から順に、1つでも×なら他を見ずに再生成。**

1. **同一人物に見えるか**（マスターと並べる。目の間隔・前髪・輪郭）
2. **白い服を着ていないか**
3. **手が破綻していないか** → 直らなければ手をフレームアウトさせる構図に変える
4. **単一光源になっているか**（複数方向から光が当たっていたら不採用）
5. 表情が過剰でないか（**叫んでいたら不採用。このシリーズは静かに怖い**）

### よくある失敗と対処

| 症状 | 対処 |
|---|---|
| カットごとに顔が違う | 参照画像の添付を忘れている。または参照が `master` でなく派生画像になっている |
| 表情が漫画的に誇張される | ネガティブに `exaggerated expression, open mouth` を追加。`subtle, restrained` を本文に足す |
| 部屋が明るくなる | `deep blue night tones` の前に `very low light, underexposed` を足す |
| ドアの隙間が黒く潰れて見えない | 隙間だけ編集ソフトで**わずかに持ち上げる**。生成で粘るより速い |
| 手がどうしても崩れる | その構図を諦める。**逃げ構図は演出**（README 参照） |

---

## 8. 完了チェック

- [ ] `akari_master.png` `mina_master.png` が確定し、以後上書きしない状態になっている
- [ ] 2人が**小さいスマホ画面でシルエットだけで見分けられる**
- [ ] どちらも白い服を着ていない
- [ ] `akari_back.png`（後ろ姿）がある ← C5の保険
- [ ] ミナの部屋のドア差分2枚が、**ドア以外は完全に同一**
- [ ] 人影に顔がない
- [ ] 全素材が `assets/` 配下の規約どおりの名前で保存されている
