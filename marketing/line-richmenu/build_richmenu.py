#!/usr/bin/env python3
"""LINE リッチメニュー画像（大・6分割 2500x1686）を HTML からヘッドレス Chrome で PNG にする。"""
import glob, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = sorted(glob.glob(os.path.expanduser(
    "~/.cache/puppeteer/chrome-headless-shell/mac_arm-*/chrome-headless-shell-mac-arm64/chrome-headless-shell")))[-1]

# (アイコン名, 見出し, 説明, 強調)
BUTTONS = [
    ("gift", "特典を受け取る", "LINE限定プロンプト5本", True),
    ("book-2", "無料キット", "コピペで使える発信の型", False),
    ("sparkles", "副業ドラフト", "無料で試せるAI下書き", False),
    ("route", "使い方", "基本の流れをチェック", False),
    ("refresh", "作り直したい", "テーマを変えて再生成", False),
    ("lifebuoy", "うまく開けない", "困ったときはこちら", False),
]

W, H = 2500, 1686
CW, CH = W // 3, H // 2  # タップ領域（LINE の6分割テンプレートと一致）
PAD = 22

cells = ""
for i, (icon, title, sub, hl) in enumerate(BUTTONS):
    x, y = (i % 3) * CW, (i // 3) * CH
    cls = "cell hl" if hl else "cell"
    cells += f"""<div class='{cls}' style='left:{x + PAD}px;top:{y + PAD}px;width:{CW - PAD * 2}px;height:{CH - PAD * 2}px'>
      <div class='ic'><i class='ti ti-{icon}'></i></div>
      <div class='t'>{title}</div><div class='s'>{sub}</div>
      <div class='arrow'><i class='ti ti-arrow-right'></i></div></div>"""

html = f"""<!doctype html><html><head><meta charset='utf-8'>
<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css'>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:#0B1120;font-family:"Hiragino Sans",sans-serif;-webkit-font-smoothing:antialiased}}
.bg{{position:absolute;inset:0;background-image:linear-gradient(#ffffff07 2px,transparent 2px),linear-gradient(90deg,#ffffff07 2px,transparent 2px);background-size:90px 90px}}
.cell{{position:absolute;border-radius:48px;background:#151F36;border:3px solid #26324F;padding:84px 80px;display:flex;flex-direction:column;justify-content:center}}
.cell .ic{{width:170px;height:170px;border-radius:44px;background:#1F2B47;display:flex;align-items:center;justify-content:center;font-size:104px;color:#FFD23F}}
.cell .t{{margin-top:56px;font-size:92px;font-weight:800;color:#fff;letter-spacing:-0.02em;white-space:nowrap}}
.cell .s{{margin-top:22px;font-size:50px;font-weight:600;color:#8C9AB6;white-space:nowrap}}
.cell .arrow{{position:absolute;right:70px;top:84px;font-size:72px;color:#3A4868}}
.cell.hl{{background:#FFD23F;border-color:#FFD23F}}
.cell.hl .ic{{background:#0B1120;color:#FFD23F}}
.cell.hl .t{{color:#0B1120}}
.cell.hl .s{{color:#5B4A0E}}
.cell.hl .arrow{{color:#0B1120}}
</style></head><body><div class='bg'></div>{cells}</body></html>"""

src = os.path.join(HERE, "richmenu.html")
open(src, "w", encoding="utf-8").write(html)
png = os.path.join(HERE, "richmenu.png")
subprocess.run([CHROME, "--headless", "--hide-scrollbars", "--force-device-scale-factor=1",
                f"--window-size={W},{H}", "--virtual-time-budget=5000", f"--screenshot={png}", "file://" + src],
               check=True, capture_output=True)
print(png, os.path.getsize(png), "bytes")
