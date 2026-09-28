#!/usr/bin/env python3
"""有料note 04（スマホから家のMacに作業を任せる）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

ARROW = "<div style='font-size:36px;color:#FFD23F;font-weight:900'>→</div>"

def eyecatch():
    phone = """<div style='width:150px;height:270px;border:6px solid #fff;border-radius:28px;background:#18223A;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px'>
        <div style='width:96px;height:26px;border-radius:13px;background:#FFD23F'></div>
        <div style='width:96px;height:26px;border-radius:13px;background:#2B3858'></div>
        <div style='width:70px;height:26px;border-radius:13px;background:#FFD23F;align-self:flex-start;margin-left:21px'></div>
        <div style='font-size:20px;font-weight:800;margin-top:8px'>Discord</div></div>"""
    mac = """<div style='display:flex;flex-direction:column;align-items:center'>
        <div style='width:230px;height:150px;border:6px solid #fff;border-radius:12px;background:#18223A;
          display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#FFD23F'>Claude Code</div>
        <div style='width:40px;height:28px;background:#fff'></div><div style='width:120px;height:8px;border-radius:4px;background:#fff'></div>
        <div style='font-size:20px;font-weight:800;margin-top:10px'>家のMac</div></div>"""
    link = "<div style='width:90px;border-top:5px dashed #FFD23F;margin:0 10px'></div>"
    body = f"""<div class='pad' style='justify-content:center'>
      <div style='display:flex;gap:12px'><div class='tag' style='font-size:24px'>Claude Code × Discord</div><div class='tag' style='font-size:24px;background:#fff'>コピペ用の設定ファイルつき</div></div>
      <div class='h' style='font-size:66px;margin-top:28px'>休憩<span class='y'>5分</span>で、<br>家のMacに<br>副業の作業を任せる</div>
      <div style='font-size:30px;margin-top:26px;font-weight:700'>Claude Code × Discord を<span class='y'>安全に</span>使う設定</div>
    </div>
    <div style='position:absolute;right:64px;top:0;bottom:0;display:flex;align-items:center'>{phone}{link}{mac}</div>"""
    b.page("p04_eyecatch", 1280, 670, body)

def flow():
    btn = lambda t, c: f"<span style='display:inline-block;border:2px solid {c};color:{c};border-radius:8px;padding:2px 6px;font-size:16px;font-weight:800;margin:2px'>{t}</span>"
    st = [("依頼", "休憩中にスマホの<br>Discordで頼む", ""),
          ("受け取る", "家のMacの<br>Claude Codeが動く", ""),
          ("承認", "実行前にスマホへ<br>ボタンが届く", btn("See more", "#9AA7BF") + btn("Allow", "#FFD23F") + btn("Deny", "#fff")),
          ("結果", "結果が<br>Discordに返る", "")]
    boxes = ARROW.join(
        f"<div class='card' style='flex:{1.25 if i==2 else 1};padding:26px 12px;text-align:center;{'border-color:#FFD23F' if i==2 else ''}'>"
        f"<div class='num' style='font-size:28px'>{i+1}</div><div style='font-size:32px;font-weight:800;margin-top:6px'>{t}</div>"
        f"<div class='m' style='font-size:21px;margin-top:10px;line-height:1.5;font-weight:600'>{d}</div>"
        f"{f'<div style=margin-top:12px>{x}</div>' if x else ''}</div>" for i, (t, d, x) in enumerate(st))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>スマホから<span class='y'>家のMac</span>に頼む流れ</div>
      <div style='display:flex;align-items:center;gap:10px;margin-top:40px'>{boxes}</div>
      <div class='card' style='margin-top:32px;padding:20px 28px;font-size:26px;font-weight:700;border-color:#FFD23F'>
        <span class='y'>注意</span>　Macの電源が切れている・スリープ中は動かない</div></div>"""
    b.page("p04_flow", 1280, 600, body)

def safety():
    ng = ["消す", "外に送る", "Macの設定を変える", "鍵を読む"]
    chips = "".join(f"<div style='display:flex;align-items:center;gap:10px;background:#0E1525;border:1px solid #2B3858;border-radius:10px;padding:10px 14px'>"
                    f"<div style='width:30px;height:30px;border-radius:50%;background:#FFD23F;color:#0E1525;font-weight:900;font-size:20px;"
                    f"display:flex;align-items:center;justify-content:center;flex-shrink:0'>✕</div>"
                    f"<div style='font-size:22px;font-weight:800'>{t}</div></div>" for t in ng)
    def notes(ts):
        return "<div style='display:flex;flex-direction:column;gap:8px;margin-top:18px'>" + "".join(
            f"<div style='background:#0E1525;border:1px solid #2B3858;border-radius:10px;padding:12px 16px;font-size:21px;font-weight:700;line-height:1.45'>{t}</div>" for t in ts) + "</div>"
    cols = [("入口", "自分の投稿だけ<br>受け付ける", "allowlist",
             notes(["許可していない場所の<br>投稿は無視される", "許可リストは<br>Macのターミナルから変える"])),
            ("承認", "実行する前に<br>DMにボタンが届く", "",
             notes(["<span class='m'>See more</span>　中身を見る", "<span class='y'>Allow</span>　許可", "Deny　拒否", "分からないときは Deny"])),
            ("禁止", "承認しても<br>動かない操作", "", f"<div style='display:flex;flex-direction:column;gap:8px;margin-top:18px'>{chips}</div>")]
    boxes = "".join(
        f"<div class='card' style='flex:1;align-self:stretch;padding:28px 24px;{'border-color:#FFD23F' if i==2 else ''}'>"
        f"<div style='display:flex;align-items:baseline;gap:14px'><div class='num' style='font-size:44px;line-height:1'>{i+1}</div>"
        f"<div style='font-size:36px;font-weight:800'>{t}</div></div>"
        f"<div style='font-size:24px;margin-top:14px;line-height:1.5;font-weight:700'>{d}</div>"
        f"{f'<div class=m style=font-size:20px;margin-top:10px;font-weight:700>{s}</div>' if s else ''}{x}</div>"
        for i, (t, d, s, x) in enumerate(cols))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>安全装置は<span class='y'>3段</span>に分ける</div>
      <div style='display:flex;align-items:flex-start;gap:18px;margin-top:34px'>{boxes}</div></div>"""
    b.page("p04_safety", 1280, 660, body)

def pitfalls():
    items = [("Public Botオフで赤いエラー", "先にインストールリンクを「なし」に"),
             ("トークンを2回貼って動かない", "見えない入力欄に貼るのは1回だけ"),
             ("書き込んでも無視される", "許可していない場所は無視。DMで送る"),
             ("「API Usage Billing」と出る", "subscriptionでログインし直す"),
             ("承認ボタンがチャンネルに来ない", "承認ボタンはDMに届く"),
             ("返事のたびに承認を求められる", "設定ファイルの allow で省く")]
    rows = "".join(f"<div class='card' style='padding:22px 26px;display:flex;gap:20px;align-items:flex-start'>"
                   f"<div style='width:34px;height:34px;border:3px solid #FFD23F;border-radius:6px;flex-shrink:0;margin-top:2px;"
                   f"display:flex;align-items:center;justify-content:center;color:#FFD23F;font-weight:900;font-size:20px'>{i+1}</div>"
                   f"<div><div style='font-size:26px;font-weight:800'>{t}</div><div class='m' style='font-size:21px;margin-top:8px;font-weight:600'>→ {f}</div></div></div>"
                   for i, (t, f) in enumerate(items))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>よくあるつまずき<span class='y'>6つ</span></div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:32px'>{rows}</div></div>"""
    b.page("p04_pitfalls", 1280, 610, body)

if __name__ == "__main__":
    for f in [eyecatch, flow, safety, pitfalls]:
        f()
