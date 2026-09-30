#!/usr/bin/env python3
"""有料note 08（AIと一緒にやる目標分解）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

HL = "border:2px solid #FFD23F;background:#2A2A1E"

def eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:28px'>AIと一緒に</div>
      <div class='h' style='font-size:84px;margin-top:30px;white-space:nowrap'>大きい目標を<br><span class='y' style='margin-left:-0.45em'>「今日の5分」</span>まで分ける</div>
      <div style='font-size:34px;margin-top:34px;font-weight:700' class='m'>コピペ用の頼み方5本・ワークシートつき</div>
    </div>"""
    b.page("p08_eyecatch", 1280, 670, body)

def ladder():
    steps = [("大きい目標", "夢でいい", 260, False),
             ("小さい目標", "確かめられる形", 130, False),
             ("行動", "休憩の5分でできる", 0, True)]
    rows = "".join(
        f"<div class='card' style='margin-left:{ml}px;width:480px;padding:22px 28px;{HL if hl else ''}'>"
        f"<div style='font-size:36px;font-weight:900;{'color:#FFD23F' if hl else ''}'>{t}</div>"
        f"<div class='m' style='font-size:26px;font-weight:800;margin-top:6px'>（{d}）</div></div>"
        for t, d, ml, hl in steps)
    arrow = """<div style='width:60px;flex:none;display:flex;flex-direction:column;align-items:center;align-self:stretch;margin-left:30px'>
        <div style='width:0;height:0;border-left:22px solid transparent;border-right:22px solid transparent;border-bottom:30px solid #FFD23F'></div>
        <div style='flex:1;width:10px;background:#FFD23F'></div>
      </div>
      <div class='y' style='font-size:30px;font-weight:900;writing-mode:vertical-rl;letter-spacing:0.06em;align-self:center;flex:none'>これをやったから達成できた</div>"""
    body = f"""<div class='pad'>
      <div class='h' style='font-size:46px'>大きい目標 → 小さい目標 → <span class='y'>行動</span></div>
      <div style='display:flex;gap:24px;margin-top:36px'>
        <div style='width:180px;flex:none;display:flex;flex-direction:column;justify-content:flex-end;gap:14px'>
          <div class='m' style='font-size:24px;font-weight:800;line-height:1.6'>決めるのは<br><span style='color:#fff'>自分</span></div>
          <div class='m' style='font-size:24px;font-weight:800;line-height:1.6'>案を出すのは<br><span style='color:#fff'>AI</span></div>
        </div>
        <div style='display:flex;flex-direction:column;gap:18px'>{rows}</div>
        {arrow}
      </div>
    </div>"""
    b.page("p08_ladder", 1280, 710, body)

def flow():
    st = [("大きい目標を<br>言葉にする", False), ("小さい目標に<br>分ける", False), ("5分の行動に<br>下ろす", True), ("週1回の<br>振り返り", False)]
    RIGHT = "<div style='font-size:34px;color:#FFD23F;font-weight:900;text-align:center'>→</div>"
    cells = RIGHT.join(
        f"<div class='card' style='padding:24px 10px;text-align:center;{HL if hl else ''}'>"
        f"<div class='num' style='font-size:30px'>{i+1}</div>"
        f"<div style='font-size:27px;font-weight:800;margin-top:6px;line-height:1.4;{'color:#FFD23F' if hl else ''}'>{t}</div></div>"
        for i, (t, hl) in enumerate(st))
    # 箱の中心（x）：box幅 = (1152 - 3*50) / 4 = 250.5
    bw, aw = (1152 - 150) / 4, 50
    cx = [bw / 2 + i * (bw + aw) for i in range(4)]
    dash = "2px dashed #FFD23F"
    up = lambda x: (f"<div style='position:absolute;left:{x - 14}px;top:0;width:0;height:0;border-left:14px solid transparent;"
                    f"border-right:14px solid transparent;border-bottom:20px solid #FFD23F'></div>")
    vline = lambda x, top: f"<div style='position:absolute;left:{x - 1}px;top:{top}px;height:{70 - top}px;border-left:{dash}'></div>"
    back = (f"<div style='position:relative;height:70px'>"
            f"{up(cx[1])}{up(cx[2])}{vline(cx[1], 20)}{vline(cx[2], 20)}{vline(cx[3], 0)}"
            f"<div style='position:absolute;left:{cx[1]}px;width:{cx[3] - cx[1]}px;top:69px;border-top:{dash}'></div></div>")
    label = (f"<div style='margin-left:{cx[1]}px;width:{cx[3] - cx[1]}px;display:flex;justify-content:center;margin-top:-22px'>"
             f"<div class='card' style='padding:12px 26px;display:flex;align-items:center;gap:14px;border-color:#FFD23F;background:#0E1525'>"
             f"<div class='num' style='font-size:30px'>5</div><div style='font-size:27px;font-weight:800'>詰まったら分け直す</div></div></div>")
    body = f"""<div class='pad'>
      <div class='h' style='font-size:46px'>頼み方<span class='y'>5本</span>の使い方</div>
      <div style='display:grid;grid-template-columns:1fr {aw}px 1fr {aw}px 1fr {aw}px 1fr;align-items:center;margin-top:38px'>{cells}</div>
      {back}{label}
      <div class='m' style='font-size:23px;font-weight:700;margin-top:24px;text-align:right'>上から順番に使う。4で詰まったら、5で2・3に戻る</div>
    </div>"""
    b.page("p08_flow", 1280, 600, body)

def worksheet():
    items = [("①", "大きい目標", ""), ("②", "小さい目標", "まず1〜3個"), ("③", "行動", "5分〜10分でできるもの"),
             ("④", "振り返り", "週1回"), ("⑤", "詰まったとき", "")]
    def row(n, t, sub):
        extra = ""
        if n == "③":
            extra = (f"<div style='margin-top:12px;padding:12px 18px;border-radius:10px;{HL};font-size:26px;font-weight:900;color:#FFD23F'>"
                     f"疲れている日でもできるか：はい／いいえ</div>"
                     f"<div class='m' style='font-size:21px;font-weight:700;margin-top:8px'>いいえなら、もっと小さくする</div>")
        return (f"<div style='padding:22px 30px;border-bottom:1px solid #2B3858'>"
                f"<div style='display:flex;align-items:baseline;gap:16px'><div class='num' style='font-size:36px'>{n}</div>"
                f"<div style='font-size:34px;font-weight:900'>{t}</div>"
                f"{f'<div class=m style=font-size:23px;font-weight:700>{sub}</div>' if sub else ''}</div>{extra}</div>")
    rows = "".join(row(*it) for it in items)
    body = f"""<div class='pad'>
      <div class='h' style='font-size:46px'>目標分解<span class='y'>ワークシート</span></div>
      <div class='card' style='margin-top:30px;overflow:hidden'>{rows}</div>
      <div class='m' style='font-size:23px;font-weight:700;margin-top:20px;text-align:right'>紙やメモアプリに写して使う</div>
    </div>"""
    b.page("p08_worksheet", 1280, 890, body)

if __name__ == "__main__":
    for f in [eyecatch, ladder, flow, worksheet]:
        f()
