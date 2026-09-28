#!/usr/bin/env python3
"""有料note 05（Threads自動投稿を自分で持つ）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

ARROW = "<div style='font-size:34px;color:#FFD23F;font-weight:900'>→</div>"

def eyecatch():
    phone = """<div style='width:140px;height:250px;border:6px solid #fff;border-radius:26px;background:#18223A;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px'>
        <div style='width:90px;height:22px;border-radius:6px;background:#FFD23F'></div>
        <div style='width:90px;height:22px;border-radius:6px;background:#2B3858'></div>
        <div style='width:90px;height:22px;border-radius:6px;background:#2B3858'></div>
        <div style='font-size:20px;font-weight:800;margin-top:6px'>Threads</div></div>"""
    unit = "<div style='width:190px;height:54px;border:5px solid #fff;border-radius:10px;background:#18223A;display:flex;align-items:center;padding:0 16px;gap:10px'><div style='width:12px;height:12px;border-radius:50%;background:#FFD23F'></div><div style='flex:1;height:6px;background:#2B3858;border-radius:3px'></div></div>"
    server = f"""<div style='display:flex;flex-direction:column;align-items:center;gap:8px'>{unit*3}
        <div style='font-size:20px;font-weight:800;margin-top:6px'>無料サーバー</div></div>"""
    link = "<div style='font-size:44px;color:#FFD23F;font-weight:900;margin:0 18px'>←</div>"
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:24px'>AIへの頼み方つき</div>
      <div class='h' style='font-size:70px;margin-top:28px'>Threads自動投稿を<br><span class='y'>"自分で持つ"</span></div>
      <div style='font-size:30px;margin-top:30px;font-weight:700;line-height:1.6'>公式API × 無料サーバー<br>× 人間らしい間隔</div>
    </div>
    <div style='position:absolute;right:64px;top:0;bottom:0;display:flex;align-items:center'>{phone}{link}{server}</div>"""
    b.page("p05_eyecatch", 1280, 670, body)

def step_row(steps, start, hl=()):
    return ARROW.join(
        f"<div class='card' style='flex:1;align-self:stretch;padding:22px 14px;text-align:center;{'border-color:#FFD23F' if start+i in hl else ''}'>"
        f"<div class='num' style='font-size:26px'>{start+i+1}</div><div style='font-size:27px;font-weight:800;margin-top:4px;line-height:1.35'>{t}</div>"
        f"<div class='m' style='font-size:20px;margin-top:8px;line-height:1.5;font-weight:600'>{d}</div></div>" for i, (t, d) in enumerate(steps))

def flow():
    st = [("投稿文ファイル", "投稿したい文章を<br>並べておく"),
          ("10分ごとに確認", "深夜1〜6時は<br>保留"),
          ("1本選ぶ", "直近に出したものは<br>避ける"),
          ("公式APIで投稿", "Threadsに出す"),
          ("次回を決める", "10〜16時間後に<br>ランダム"),
          ("眠らせない", "自分のURLに<br>アクセスする")]
    side = """<div class='card' style='width:250px;padding:24px 22px;border-color:#FFD23F;align-self:stretch;display:flex;flex-direction:column;justify-content:center'>
      <div style='font-size:22px;font-weight:800' class='y'>管理用の入口</div>
      <div style='font-size:26px;font-weight:800;margin-top:10px;line-height:1.45'>合言葉を<br>知っている人<br>しか使えない</div>
      <div class='m' style='font-size:19px;margin-top:12px;font-weight:600;line-height:1.5'>合言葉がないと<br>何もしない</div></div>"""
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>自動投稿の<span class='y'>全体の流れ</span></div>
      <div style='display:flex;gap:22px;margin-top:34px'>
        <div style='flex:1;display:flex;flex-direction:column;gap:20px'>
          <div style='display:flex;align-items:center;gap:8px'>{step_row(st[:3], 0)}</div>
          <div style='display:flex;align-items:center;gap:8px'>{step_row(st[3:], 3)}</div>
        </div>{side}</div></div>"""
    b.page("p05_flow", 1280, 620, body)

def timeline():
    st = [("最初", "固定", "4時間", "決まった間隔で<br>機械的に"),
          ("次", "ランダム", "5〜9時間", "時間を<br>ばらつかせる"),
          ("次", "ランダム", "4〜7時間", "1日3〜4本"),
          ("今", "ランダム", "10〜16時間", "自動1〜2本＋手動<br>＝1日2〜3本")]
    boxes = ARROW.join(
        f"<div class='card' style='flex:{1.3 if i==3 else 1};padding:24px 12px;text-align:center;align-self:stretch;{'border-color:#FFD23F;border-width:3px' if i==3 else ''}'>"
        f"<div class='tag' style='font-size:20px;align-self:center;{'' if i==3 else 'background:#2B3858;color:#fff'}'>{s}</div>"
        f"<div class='m' style='font-size:22px;margin-top:14px;font-weight:700'>{k}</div>"
        f"<div style='font-size:34px;font-weight:900;margin-top:2px;white-space:nowrap;{'color:#FFD23F' if i==3 else ''}'>{t}</div>"
        f"{f'<div style=font-size:20px;margin-top:10px;font-weight:700;line-height:1.5>{n}</div>' if n else ''}</div>"
        for i, (s, k, t, n) in enumerate(st))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>投稿の間隔は<span class='y'>こう変えてきた</span></div>
      <div style='display:flex;align-items:center;gap:10px;margin-top:38px'>{boxes}</div>
      <div style='font-size:28px;font-weight:800;margin-top:34px;text-align:center'>自動の本数は、<span class='y'>手動で出す本数と合わせて</span>決める</div></div>"""
    b.page("p05_timeline", 1280, 560, body)

def checklist():
    items = [("トークンの期限", "切れると投稿が止まる"),
             ("最後の投稿時刻", "止まっていないか見に行く"),
             ("投稿文の入れ替え", "古い投稿は差し替える"),
             ("無料枠の条件", "変わっていないか確認"),
             ("秘密はファイルに書かない", "環境変数に入れる"),
             ("他人への自動返信はしない", "自動化は自分の投稿だけ")]
    rows = "".join(f"<div class='card' style='padding:22px 26px;display:flex;gap:20px;align-items:center'>"
                   f"<div style='width:38px;height:38px;border:3px solid #FFD23F;border-radius:6px;flex-shrink:0;"
                   f"display:flex;align-items:center;justify-content:center;color:#FFD23F;font-weight:900;font-size:30px'>✓</div>"
                   f"<div><div style='font-size:28px;font-weight:800'>{t}</div><div class='m' style='font-size:21px;margin-top:6px;font-weight:600'>{d}</div></div></div>"
                   for t, d in items)
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>動かし始めてからの<span class='y'>チェックリスト</span></div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:32px'>{rows}</div></div>"""
    b.page("p05_checklist", 1280, 600, body)

if __name__ == "__main__":
    for f in [eyecatch, flow, timeline, checklist]:
        f()
