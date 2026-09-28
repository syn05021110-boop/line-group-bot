#!/usr/bin/env python3
"""有料note 01（スマホのAIを下書き係に）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

def eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div style='display:flex;gap:12px'><div class='tag' style='font-size:26px'>会社にAIがない人へ</div><div class='tag' style='font-size:26px;background:#fff'>コピペ用の頼み方つき</div></div>
      <div class='h' style='font-size:68px;margin-top:26px;white-space:nowrap'>スマホのAIを<br><span class='y'>「下書き係」</span>にする</div>
      <div style='font-size:32px;margin-top:24px;font-weight:700'>資料・議事録・メールを軽くする、情報を守る使い方</div>
    </div>"""
    b.page("p01_eyecatch", 1280, 670, body)

def rules():
    items = [("人の名前", "Aさん"), ("会社名・取引先", "ある取引先"), ("場所", "ある事業所"), ("日付と時刻", "ある日の午後"), ("金額・数量", "伏せる"), ("社外秘の文章", "貼らない")]
    rows = "".join(f"<div class='card' style='padding:18px 26px;display:flex;align-items:center;gap:20px'>"
                   f"<div style='font-size:28px;font-weight:800;flex:1'>{a}</div><div style='font-size:34px;color:#FFD23F;font-weight:900'>→</div>"
                   f"<div style='font-size:28px;font-weight:800;flex:1;color:#FFD23F'>{c}</div></div>" for a, c in items)
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>AIに<span class='y'>入れない</span>情報の置き換え</div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:30px'>{rows}</div>
      <div class='m' style='font-size:26px;font-weight:700;margin-top:28px'>迷ったら置き換える。正式な資料になるものは必ず。</div></div>"""
    b.page("p01_rules", 1280, 640, body)

def flow():
    st = [("メモ", "休憩中にスマホで<br>箇条書き"), ("伏せる", "名前・社名を<br>置き換える"), ("頼む", "頼み方に<br>貼る"), ("選ぶ", "いい案だけ<br>残す"), ("仕上げる", "会社のPCで<br>自分の言葉に")]
    boxes = "<div style='font-size:36px;color:#FFD23F;font-weight:900'>→</div>".join(
        f"<div class='card' style='flex:1;padding:26px 10px;text-align:center;{'border-color:#FFD23F' if i==4 else ''}'>"
        f"<div class='num' style='font-size:28px'>{i+1}</div><div style='font-size:32px;font-weight:800;margin-top:6px'>{t}</div>"
        f"<div class='m' style='font-size:20px;margin-top:10px;line-height:1.5;font-weight:600'>{d}</div></div>" for i, (t, d) in enumerate(st))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>休憩中の<span class='y'>5分</span>で下書きを作る流れ</div>
      <div style='display:flex;align-items:center;gap:10px;margin-top:40px'>{boxes}</div>
      <div style='font-size:28px;font-weight:800;margin-top:34px;text-align:center'>AIの文章は<span class='y'>そのまま持ち込まない</span>。案を見て、自分で打ち直す</div></div>"""
    b.page("p01_flow", 1280, 520, body)

if __name__ == "__main__":
    for f in [eyecatch, rules, flow]:
        f()
