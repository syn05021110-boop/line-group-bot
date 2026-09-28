#!/usr/bin/env python3
"""有料note 06（伸びた投稿の構成を分解）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。
p06_proof_screenshot.png は本人が用意する実際のスクリーンショットなので、ここでは作らない。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

ARROW = "<div style='font-size:34px;color:#FFD23F;font-weight:900'>→</div>"

def eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:24px'>AIでリサーチして真似る手順つき</div>
      <div class='h' style='font-size:68px;margin-top:28px'>フォロワー数百人で<br><span class='y' style='font-size:96px'>6.4万回</span>表示</div>
      <div style='font-size:36px;margin-top:28px;font-weight:800'>伸びた投稿の<span class='y'>"構成"</span>を分解する</div>
    </div>
    <div style='position:absolute;right:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:10px'>
      """ + "".join(f"<div style='display:flex;align-items:center;gap:12px'><div class='num' style='font-size:26px;width:26px;text-align:right'>{i}</div>"
                   f"<div style='width:{w}px;height:34px;border-radius:8px;background:{'#FFD23F' if i==6 else '#18223A'};border:1px solid {'#FFD23F' if i==6 else '#2B3858'}'></div></div>"
                   for i, w in zip(range(1, 8), [150, 200, 250, 230, 190, 260, 170])) + """
      <div class='m' style='font-size:20px;font-weight:700;margin-top:6px;text-align:right'>7ステップの型</div></div>"""
    b.page("p06_eyecatch", 1280, 670, body)

def seven_steps():
    st = ["呼びかけで止める", "一言で宣言する", "「〜でいい」でハードルを下げる", "読む人の気持ちを言い当てる",
          "自分も同じ側に立つ", "コメントする言葉を指定する", "自虐で締める"]
    down = "<div style='text-align:center;font-size:30px;color:#FFD23F;font-weight:900;line-height:1'>↓</div>"
    boxes = down.join(
        f"<div class='card' style='padding:18px 30px;display:flex;align-items:center;gap:24px;"
        f"{'background:#FFD23F;border-color:#FFD23F;color:#0E1525' if i==5 else ''}'>"
        f"<div style='font-size:34px;font-weight:900;width:40px;{'color:#0E1525' if i==5 else 'color:#FFD23F'}'>{i+1}</div>"
        f"<div style='font-size:32px;font-weight:800;flex:1'>{t}</div>"
        f"{'<div style=font-size:24px;font-weight:800;line-height:1.4>コメント数につながった<br>一番の理由と見ている</div>' if i==5 else ''}</div>"
        for i, t in enumerate(st))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>伸びた投稿の構成は<span class='y'>7ステップ</span></div>
      <div style='display:flex;flex-direction:column;gap:6px;margin-top:32px'>{boxes}</div></div>"""
    b.page("p06_seven_steps", 1280, 1110, body)

def step_row(steps, start, hl=()):
    return ARROW.join(
        f"<div class='card' style='flex:1;padding:24px 14px;text-align:center;align-self:stretch;{'border-color:#FFD23F' if start+i in hl else ''}'>"
        f"<div class='num' style='font-size:26px'>{start+i+1}</div><div style='font-size:28px;font-weight:800;margin-top:4px;line-height:1.35'>{t}</div>"
        f"<div class='m' style='font-size:20px;margin-top:8px;line-height:1.5;font-weight:600'>{d}</div></div>" for i, (t, d) in enumerate(steps))

def research_flow():
    st = [("キーワードで検索", "自分のジャンルに<br>近い言葉で"),
          ("反応が多い投稿を開く", "いいね・コメントが<br>多いもの"),
          ("フォロワー数を確認", "数百人なのに<br>伸びている？"),
          ("メモに残す", "3〜5本たまったら<br>次へ"),
          ("AIで構成を分解", "中身ではなく<br>型を取り出す"),
          ("自分の体験で書き換え", "＋自分の一言")]
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>真似する投稿の<span class='y'>リサーチの流れ</span></div>
      <div style='display:flex;flex-direction:column;gap:20px;margin-top:34px'>
        <div style='display:flex;align-items:center;gap:8px'>{step_row(st[:3], 0, hl=(2,))}</div>
        <div style='display:flex;align-items:center;gap:8px'>{step_row(st[3:], 3, hl=(5,))}</div>
      </div>
      <div style='font-size:28px;font-weight:800;margin-top:30px;text-align:center'>見るのは、<span class='y'>フォロワーが少ないのに反応が多い投稿</span></div></div>"""
    b.page("p06_research_flow", 1280, 690, body)

if __name__ == "__main__":
    for f in [eyecatch, seven_steps, research_flow]:
        f()
