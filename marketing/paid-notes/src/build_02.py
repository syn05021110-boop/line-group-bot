#!/usr/bin/env python3
"""有料note 02（LINE公式の導線を1日で組んだ全手順）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

ARROW_D = "<div style='text-align:center;font-size:34px;color:#FFD23F;font-weight:900;line-height:1'>↓</div>"

def eyecatch():
    bubble = lambda t, me=False: (f"<div style='align-self:{'flex-end' if me else 'flex-start'};max-width:230px;"
                                  f"background:{'#FFD23F' if me else '#24304C'};color:{'#0E1525' if me else '#fff'};"
                                  f"border-radius:16px;padding:10px 14px;font-size:17px;font-weight:700;line-height:1.45'>{t}</div>")
    cells = "".join(f"<div style='background:{'#FFD23F' if i==0 else '#18223A'};border:1px solid #2B3858;border-radius:6px;"
                    f"color:{'#0E1525' if i==0 else '#fff'};font-size:13px;font-weight:800;line-height:1.3;text-align:center;display:flex;align-items:center;justify-content:center'>{t}</div>"
                    for i, t in enumerate(["特典を<br>受け取る", "無料<br>キット", "副業<br>ドラフト", "使い方", "作り<br>直したい", "うまく<br>開けない"]))
    phone = f"""<div style='position:absolute;right:84px;top:60px;width:300px;height:560px;border:6px solid #2B3858;border-radius:40px;
        background:#121B2E;padding:26px 16px 16px;display:flex;flex-direction:column;gap:12px'>
        <div class='m' style='font-size:15px;font-weight:700;text-align:center'>トーク</div>
        {bubble('友だち追加<br>ありがとうございます！')}
        {bubble('特典', True)}
        {bubble('LINE限定の<br>追加特典です')}
        <div style='margin-top:auto;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:62px 62px;gap:6px'>{cells}</div>
      </div>"""
    body = f"""<div class='pad' style='justify-content:center'>
      <div style='display:flex;gap:12px'><div class='tag' style='font-size:24px'>コピペ文面つき</div><div class='tag' style='font-size:24px;background:#fff'>外部ツールなし</div></div>
      <div class='h' style='font-size:60px;margin-top:24px;white-space:nowrap'><span class='y'>LINE公式</span>の導線を<br>外部ツールなし・<br>無料プランで<span class='y'>1日</span>で<br>組んだ全手順</div>
      <div class='m' style='font-size:26px;margin-top:22px;font-weight:700;white-space:nowrap'>あいさつ・特典・ステップ配信・リッチメニュー</div>
    </div>{phone}"""
    b.page("p02_eyecatch", 1280, 670, body)

def flow():
    step = lambda n, t, s, hl=False: (f"<div class='card' style='padding:18px 26px;display:flex;align-items:center;gap:22px;{'border-color:#FFD23F' if hl else ''}'>"
                                      f"<div class='num' style='font-size:36px;width:36px'>{n}</div>"
                                      f"<div><div style='font-size:30px;font-weight:800'>{t}</div><div class='m' style='font-size:22px;margin-top:4px;font-weight:600'>{s}</div></div></div>")
    side = lambda t, s: (f"<div class='card' style='flex:1;padding:24px 26px;display:flex;flex-direction:column;justify-content:center'><div style='font-size:30px;font-weight:800'>{t}</div>"
                         f"<div class='m' style='font-size:22px;margin-top:8px;font-weight:600;line-height:1.5'>{s}</div></div>")
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>LINE公式の導線の<span class='y'>全体図</span></div>
      <div style='display:flex;gap:28px;margin-top:30px'>
        <div style='flex:1.45;display:flex;flex-direction:column;gap:8px'>
          {step(1, 'note・Threads から友だち追加', '記事や投稿からLINEへ')}{ARROW_D}
          {step(2, 'あいさつメッセージ（吹き出し3つ）', '無料プレゼント・特典の受け取り方・困ったとき')}{ARROW_D}
          {step(3, '「特典」と送る → プレゼントが届く', 'キーワード応答で自動返信', True)}{ARROW_D}
          {step(4, 'ステップ配信', '1日後・3日後・5日後に自動で届く')}
        </div>
        <div style='flex:1;display:flex;flex-direction:column;gap:16px'>
          <div class='y' style='font-size:24px;font-weight:800'>並行して、いつでも案内</div>
          {side('リッチメニュー', '画面の下に6つのボタン')}
          {side('サポート用の<br>キーワード応答', '「使い方」「開けない」<br>「やり直し」')}
        </div>
      </div>
      <div class='m' style='font-size:24px;font-weight:700;margin-top:26px'>使うのは、LINE公式アカウントの標準機能だけ</div></div>"""
    b.page("p02_flow", 1280, 860, body)

def keyword():
    row = lambda msg, ok: (f"<div class='card' style='padding:18px 26px;display:flex;align-items:center;gap:20px;{'border-color:#FFD23F' if ok else ''}'>"
                           f"<div style='font-size:30px;font-weight:800;flex:1.3'>「{msg}」</div>"
                           f"<div style='font-size:32px;color:#FFD23F;font-weight:900'>→</div>"
                           f"<div style='font-size:28px;font-weight:800;flex:1;{'color:#FFD23F' if ok else ''}'>{'反応する' if ok else '反応しない'}"
                           f"{'' if ok else '<div class=m style=font-size:20px;margin-top:4px;font-weight:600>一律応答が返る</div>'}</div></div>")
    fix = lambda n, t, s: (f"<div class='card' style='flex:1;padding:22px 22px'><div class='num' style='font-size:34px'>{n}</div>"
                           f"<div style='font-size:26px;font-weight:800;margin-top:6px;line-height:1.4'>{t}</div>"
                           f"<div class='m' style='font-size:20px;margin-top:8px;font-weight:600;line-height:1.5'>{s}</div></div>")
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>キーワードは<span class='y'>完全一致</span>でしか反応しない</div>
      <div class='m' style='font-size:24px;font-weight:700;margin-top:14px'>登録したキーワード：「開けない」</div>
      <div style='display:flex;flex-direction:column;gap:12px;margin-top:18px'>
        {row('開けない', True)}{row('ツールが開けないです', False)}{row('開けません', False)}
      </div>
      <div class='h' style='font-size:34px;margin-top:36px'>ぴったりの言葉を送ってもらう<span class='y'>3つの工夫</span></div>
      <div style='display:flex;gap:16px;margin-top:18px'>
        {fix(1, 'あいさつで<br>送ることばを指定', '「そのまま送ると」と<br>カギかっこで見せる')}
        {fix(2, 'リッチメニューで<br>正確な言葉を送る', 'ボタンを押すと<br>キーワードが送られる')}
        {fix(3, 'ゆれそうな言い方を<br>キーワードに足す', '「とくてん」<br>「プレゼント」など')}
      </div></div>"""
    b.page("p02_keyword", 1280, 900, body)

def richmenu():
    btns = [("特典を受け取る", "テキスト", "「特典」を送る", True), ("無料キット", "リンク", "無料プレゼントのnote", False),
            ("副業ドラフト", "リンク", "ツールのページ", False), ("使い方", "テキスト", "「使い方」を送る", False),
            ("作り直したい", "テキスト", "「やり直し」を送る", False), ("うまく開けない", "テキスト", "「開けない」を送る", False)]
    cells = "".join(f"<div style='display:flex;flex-direction:column;gap:12px'>"
                    f"<div style='height:130px;border-radius:14px;display:flex;align-items:center;padding:0 26px;font-size:34px;font-weight:900;"
                    f"{'background:#FFD23F;color:#0E1525' if hl else 'background:#18223A;border:1px solid #2B3858'}'>{t}</div>"
                    f"<div style='font-size:22px;font-weight:700;padding-left:6px'><span class='tag' style='font-size:18px;padding:3px 10px;"
                    f"{'' if kind=='テキスト' else 'background:#9AA7BF'}'>{kind}</span>　{a}</div></div>"
                    for t, kind, a, hl in btns)
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>リッチメニュー<span class='y'>6つのボタン</span>の配置</div>
      <div class='m' style='font-size:24px;font-weight:700;margin-top:12px'>上の段：もらう・読む・試す　／　下の段：困ったとき</div>
      <div style='display:grid;grid-template-columns:repeat(3,1fr);gap:30px 20px;margin-top:30px'>{cells}</div>
      <div class='card' style='margin-top:34px;padding:22px 28px;font-size:28px;font-weight:800;border-color:#FFD23F'>
        送るテキストは、キーワードと<span class='y'>ぴったり同じ</span>にする</div></div>"""
    b.page("p02_richmenu", 1280, 740, body)

if __name__ == "__main__":
    for f in [eyecatch, flow, keyword, richmenu]:
        f()
