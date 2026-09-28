#!/usr/bin/env python3
"""note / Threads 用の画像を HTML で組み、ヘッドレス Chrome で PNG に書き出す。"""
import glob, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "images")
CHROME = sorted(glob.glob(os.path.expanduser(
    "~/.cache/puppeteer/chrome-headless-shell/mac_arm-*/chrome-headless-shell-mac-arm64/chrome-headless-shell")))[-1]

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden}
body{font-family:"Hiragino Sans","Hiragino Kaku Gothic ProN",sans-serif;background:#0E1525;color:#fff;
  -webkit-font-smoothing:antialiased;position:relative}
.y{color:#FFD23F}.m{color:#9AA7BF}
.pad{position:absolute;inset:0;padding:%(pad)dpx;display:flex;flex-direction:column}
.tag{display:inline-block;background:#FFD23F;color:#0E1525;font-weight:800;border-radius:6px;padding:6px 14px;align-self:flex-start}
.h{font-weight:800;line-height:1.28;letter-spacing:-0.01em}
.card{background:#18223A;border:1px solid #2B3858;border-radius:14px}
.num{font-weight:900;color:#FFD23F}
.foot{position:absolute;left:%(pad)dpx;right:%(pad)dpx;bottom:%(fb)dpx;display:flex;justify-content:space-between;color:#6F7C96;font-weight:600}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px);background-size:48px 48px}
"""

def page(name, w, h, body, pad=64, fb=40, extra=""):
    html = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS % dict(w=w,h=h,pad=pad,fb=fb)}{extra}</style></head><body><div class='grid-bg'></div>{body}</body></html>"
    src = os.path.join(HERE, name + ".html")
    open(src, "w").write(html)
    png = os.path.abspath(os.path.join(OUT, name + ".png"))
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={w},{h}", f"--screenshot={png}", "file://" + src],
                   check=True, capture_output=True)
    print("wrote", png)

TOOLS = [
    ("Canva", "サムネ・バナーを作る"),
    ("HyperFrames", "指示から動画を組み立てる"),
    ("Superpowers", "計画 → 実行 → レビュー"),
    ("browser-use", "ブラウザ操作と情報収集"),
    ("frontend-design", "サイトの見た目を磨く"),
    ("Discord連携", "スマホから指示を送る"),
    ("skill-creator", "繰り返す作業をスキル化"),
]
PITFALLS = [
    ("公開Botをオフにしたらエラー", "インストールリンクを「なし」にする"),
    ("トークンを2回貼ってしまった", "2つつながって保存され、Botが動かない"),
    ("DMのつもりがチャンネルに投稿", "許可していない場所の投稿は無視される"),
    ("更新でログインが外れていた", "従量課金でなくサブスクで入り直す"),
]

def note_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:26px'>非エンジニアの実録</div>
      <div class='h' style='font-size:64px;margin-top:22px;white-space:nowrap'>動画で見た<span class='y'>AIツール7つ</span>を<br>全部入れたら、スマホから<br><span class='y'>家のMac</span>が動き出した</div>
      <div style='font-size:28px;margin-top:22px;font-weight:600' class='m'>Claude Code × 非エンジニア｜つまずいた4か所も全部書いた</div>
    </div>
    <div style='position:absolute;right:64px;top:56px;font-size:150px;font-weight:900;color:#FFD23F;opacity:.12;line-height:1'>7/7</div>"""
    page("note_01_eyecatch", 1280, 670, body)

def note_tools():
    rows = "".join(f"<div class='card' style='padding:22px 26px;display:flex;align-items:center;gap:20px'>"
                   f"<div class='num' style='font-size:34px;width:40px'>{i+1}</div>"
                   f"<div><div style='font-size:30px;font-weight:800'>{n}</div><div class='m' style='font-size:22px;margin-top:4px;font-weight:600'>{d}</div></div></div>"
                   for i,(n,d) in enumerate(TOOLS))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:44px'>入れた7つと、それぞれの役割</div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:30px'>{rows}
        <div class='card' style='padding:22px 26px;display:flex;align-items:center;border-color:#FFD23F'>
          <div style='font-size:24px;font-weight:700;line-height:1.5'>7つとも<span class='y'>公式に実在</span>。<br>1つは最初から入っていた</div></div>
      </div></div>"""
    page("note_02_tools", 1280, 780, body)

def note_flow():
    box = lambda t, s, hl=False: (f"<div class='card' style='flex:1;padding:26px 16px;text-align:center;{'border-color:#FFD23F' if hl else ''}'>"
                                  f"<div style='font-size:30px;font-weight:800'>{t}</div><div class='m' style='font-size:21px;margin-top:8px;font-weight:600'>{s}</div></div>")
    arrow = "<div style='font-size:40px;color:#FFD23F;font-weight:900;padding:0 10px'>→</div>"
    body = f"""<div class='pad'>
      <div class='h' style='font-size:44px'>スマホから自宅のMacに仕事を頼む仕組み</div>
      <div style='display:flex;align-items:center;margin-top:60px'>
        {box('スマホ','Discordに書き込む')}{arrow}{box('Bot','自分専用サーバー')}{arrow}{box('許可チェック','本人の投稿だけ通す',True)}{arrow}{box('Mac','Claude Codeが実行')}
      </div>
      <div class='card' style='margin-top:40px;padding:26px 30px;font-size:26px;line-height:1.7;font-weight:600'>
        コマンドを動かす前に、<span class='y'>承認ボタンがスマホに届く</span>。<br>危ない操作や秘密ファイルの読み取りは、最初から禁止にしてある。
      </div></div>"""
    page("note_03_flow", 1280, 560, body)

def note_pitfalls():
    rows = "".join(f"<div class='card' style='padding:24px 28px;display:flex;gap:22px;align-items:flex-start'>"
                   f"<div class='num' style='font-size:40px;line-height:1'>{i+1}</div>"
                   f"<div><div style='font-size:29px;font-weight:800'>{t}</div><div class='m' style='font-size:22px;margin-top:8px;font-weight:600'>→ {f}</div></div></div>"
                   for i,(t,f) in enumerate(PITFALLS))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:44px'>つまずいたのは、ここ<span class='y'>4か所</span></div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:34px'>{rows}</div></div>"""
    page("note_04_pitfalls", 1280, 500, body)

TH = dict(w=1080, h=1350, pad=80, fb=56)
def th_foot(n):
    return f"<div class='foot' style='font-size:24px'><span>Claude Code 実録</span><span>{n}/6</span></div>"

def th_cover():
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:30px'>やってみた</div>
      <div class='h' style='font-size:96px;margin-top:40px'>動画で見た<br><span class='y'>AIツール7つ</span><br>全部入れた</div>
      <div style='font-size:38px;margin-top:44px;font-weight:700;line-height:1.6'>スマホから、自宅のMacに<br>仕事を頼めるようになった話</div>
      <div class='m' style='font-size:30px;margin-top:60px;font-weight:600'>プログラミング経験なし →</div>
    </div>{th_foot(1)}"""
    page("threads_01_cover", TH['w'], TH['h'], body, TH['pad'], TH['fb'])

def th_tools():
    rows = "".join(f"<div class='card' style='padding:15px 28px;display:flex;align-items:center;gap:24px'>"
                   f"<div class='num' style='font-size:40px;width:44px'>{i+1}</div>"
                   f"<div><div style='font-size:36px;font-weight:800'>{n}</div><div class='m' style='font-size:26px;margin-top:4px;font-weight:600'>{d}</div></div></div>"
                   for i,(n,d) in enumerate(TOOLS))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:58px'>入れたのはこの7つ</div>
      <div style='display:flex;flex-direction:column;gap:12px;margin-top:32px'>{rows}</div>
    </div>{th_foot(2)}"""
    page("threads_02_tools", TH['w'], TH['h'], body, TH['pad'], TH['fb'])

def th_phone():
    step = lambda t, s, hl=False: (f"<div class='card' style='padding:34px 36px;{'border-color:#FFD23F' if hl else ''}'>"
                                   f"<div style='font-size:40px;font-weight:800'>{t}</div><div class='m' style='font-size:28px;margin-top:6px;font-weight:600'>{s}</div></div>")
    down = "<div style='text-align:center;font-size:44px;color:#FFD23F;font-weight:900;line-height:1.1'>↓</div>"
    body = f"""<div class='pad'>
      <div class='h' style='font-size:58px'>外出先から<br><span class='y'>家のMacが動く</span></div>
      <div style='display:flex;flex-direction:column;gap:10px;margin-top:44px'>
        {step('スマホでDiscordに書き込む','「案件探して」とか')}{down}
        {step('本人の投稿だけ通す','他の人の書き込みは無視',True)}{down}
        {step('MacのClaude Codeが実行','危ない操作は承認制')}{down}
        {step('結果がスマホに返ってくる','')}
      </div>
    </div>{th_foot(3)}"""
    page("threads_03_phone", TH['w'], TH['h'], body, TH['pad'], TH['fb'])

def th_pitfalls():
    rows = "".join(f"<div class='card' style='padding:36px 34px'>"
                   f"<div style='font-size:40px;font-weight:800'><span class='num'>{i+1}</span>　{t}</div>"
                   f"<div class='m' style='font-size:30px;margin-top:14px;font-weight:600'>→ {f}</div></div>"
                   for i,(t,f) in enumerate(PITFALLS))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:64px'>ハマったのは<br><span class='y'>ここ4つ</span></div>
      <div style='display:flex;flex-direction:column;gap:22px;margin-top:50px'>{rows}</div>
      <div style='font-size:30px;font-weight:700;margin-top:40px' class='y'>直し方は全部noteに書いた</div>
    </div>{th_foot(4)}"""
    page("threads_04_pitfalls", TH['w'], TH['h'], body, TH['pad'], TH['fb'])

def th_end():
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='h' style='font-size:72px'>全手順と<br>直し方は<br><span class='y'>noteにまとめた</span></div>
      <div style='font-size:36px;margin-top:48px;font-weight:700;line-height:1.7'>リンクは返信欄に置いておく</div>
    </div>{th_foot(5)}"""
    page("threads_05_end", TH['w'], TH['h'], body, TH['pad'], TH['fb'])

DRAFT_STEPS = [("ヒヤリング", "AIの質問に3〜5分答える"), ("強み棚卸し", "副業に使える強みを整理"), ("下書き生成", "Threads と note の下書き")]

def th_draft():
    steps = "".join(f"<div class='card' style='padding:30px 34px;display:flex;gap:26px;align-items:center'>"
                    f"<div class='num' style='font-size:52px;width:50px'>{i+1}</div>"
                    f"<div><div style='font-size:40px;font-weight:800'>{t}</div><div class='m' style='font-size:28px;margin-top:6px;font-weight:600'>{d}</div></div></div>"
                    for i,(t,d) in enumerate(DRAFT_STEPS))
    body = f"""<div class='pad'>
      <div class='m' style='font-size:32px;font-weight:700'>発信が止まる理由は、ネタと下書き</div>
      <div class='h' style='font-size:84px;margin-top:22px'><span class='y'>副業ドラフト</span></div>
      <div style='font-size:36px;font-weight:700;margin-top:14px;line-height:1.5'>話すだけで、強みから<br>下書きまで出てくる</div>
      <div style='display:flex;flex-direction:column;gap:16px;margin-top:44px'>{steps}</div>
      <div class='tag' style='font-size:32px;margin-top:40px;padding:14px 26px'>Threads 3本まで無料で試せる</div>
    </div>{th_foot(6)}"""
    page("threads_06_draft", TH['w'], TH['h'], body, TH['pad'], TH['fb'])

def note_draft():
    steps = "".join(f"<div class='card' style='flex:1;padding:24px 22px;text-align:center'>"
                    f"<div class='num' style='font-size:40px'>{i+1}</div><div style='font-size:30px;font-weight:800;margin-top:6px'>{t}</div>"
                    f"<div class='m' style='font-size:20px;margin-top:8px;font-weight:600'>{d}</div></div>"
                    for i,(t,d) in enumerate(DRAFT_STEPS))
    body = f"""<div class='pad'>
      <div class='m' style='font-size:26px;font-weight:700'>発信が止まる理由は、ネタと下書き</div>
      <div class='h' style='font-size:60px;margin-top:10px'><span class='y'>副業ドラフト</span>　話すだけで下書きまで</div>
      <div style='display:flex;gap:18px;margin-top:40px'>{steps}</div>
      <div class='tag' style='font-size:26px;margin-top:34px'>Threads 3本まで無料で試せる</div>
    </div>"""
    page("note_05_draft", 1280, 670, body)

if __name__ == "__main__":
    for f in [note_eyecatch, note_tools, note_flow, note_pitfalls, th_cover, th_tools, th_phone, th_pitfalls, th_end, th_draft, note_draft]:
        f()
