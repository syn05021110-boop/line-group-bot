#!/usr/bin/env python3
"""無料note free-01〜06 の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

ARROW = "<div style='font-size:26px;color:#FFD23F;line-height:1'>▼</div>"

def col(title, items, hl=False, sub=""):
    """縦の流れを持つカード列（左右対比の図解用）"""
    steps = ARROW.join(f"<div style='font-size:32px;font-weight:800;line-height:1.35'>{t}</div>" for t in items)
    border = "border:2px solid #FFD23F" if hl else ""
    head_c = "y" if hl else "m"
    return (f"<div class='card' style='flex:1;padding:34px 36px;{border};display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px'>"
            f"<div class='{head_c}' style='font-size:36px;font-weight:900'>{title}</div>"
            f"{'<div class=m style=font-size:24px;font-weight:700>'+sub+'</div>' if sub else ''}"
            f"<div style='height:4px'></div>{steps}</div>")

# ---------- free-01 ----------
def f01_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:28px'>高額講座で押し売りされた会社員の話</div>
      <div class='h' style='font-size:84px;margin-top:30px'>自分は<span class='y'>Zoomで売らない</span>と<br>決めた理由</div>
      <div style='font-size:36px;margin-top:30px;font-weight:700' class='m'>「じゃあ、諦めるんですね」と言われて</div>
    </div>"""
    b.page("f01_eyecatch", 1280, 670, body)

def f01_talk_vs_try():
    vs = "<div style='align-self:center;font-size:40px;font-weight:900;color:#6F7C96'>vs</div>"
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>「話して売る」ではなく<span class='y'>「試して決めてもらう」</span></div>
      <div style='display:flex;gap:24px;margin-top:40px;align-items:stretch'>
        {col('話して売る', ['長時間のZoom', 'その場で決断'])}
        {vs}
        {col('試して決めてもらう', ['投稿・LP・動画<br>無料で試せるもの', '自分のタイミングで決める'], True)}
      </div>
      <div style='font-size:30px;font-weight:700;margin-top:34px;text-align:center'>断りたい人は、<span class='y'>何も言わずに閉じればいい</span></div>
    </div>"""
    b.page("f01_talk_vs_try", 1280, 650, body)

# ---------- free-02 ----------
def f02_eyecatch():
    items = [("SNS運用", False), ("FX", True), ("物販", True), ("アフィリエイト", False)]
    cells = "".join(
        f"<div class='card' style='flex:1;padding:26px 10px;text-align:center;{'border-color:#FFD23F' if ng else ''}'>"
        f"<div style='font-size:34px;font-weight:800;white-space:nowrap'>{n}</div>"
        f"<div style='font-size:24px;font-weight:800;margin-top:12px;{'color:#FFD23F' if ng else 'color:transparent'}'>✕ 合わなかった</div></div>"
        for n, ng in items)
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='h' style='font-size:66px'>副業をいくつも試して分かった<br><span class='y' style='margin-left:-0.5em'>「向き不向き」</span>の見分け方</div>
      <div style='display:flex;gap:18px;margin-top:44px'>{cells}</div>
    </div>"""
    b.page("f02_eyecatch", 1280, 670, body)

def f02_questions():
    qs = ["自分の時間の形に<br>合っているか", "結果までの「待ち」に<br>耐えられるか", "仕組みの壁を<br>先に調べたか",
          "真似できる人が<br>近くにいるか", "生活を崩さずに<br>続けられる金額か", "合わないと分かったら<br>やめられるか"]
    cells = "".join(f"<div class='card' style='padding:26px 30px;display:flex;align-items:center;gap:24px'>"
                    f"<div class='num' style='font-size:52px;width:44px;line-height:1'>{i+1}</div>"
                    f"<div style='font-size:32px;font-weight:800;line-height:1.35'>{q}</div></div>" for i, q in enumerate(qs))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:50px'>始める前に<span class='y'>自分に聞く6つ</span></div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px'>{cells}</div>
      <div class='m' style='font-size:26px;font-weight:700;margin-top:28px;text-align:right'>※ 私の経験からの考えです</div>
    </div>"""
    b.page("f02_questions", 1280, 740, body)

# ---------- free-03 ----------
def f03_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='m' style='font-size:60px;font-weight:800;text-decoration:line-through;text-decoration-color:#FFD23F;text-decoration-thickness:6px'>毎日1〜2時間</div>
      <div style='font-size:48px;color:#FFD23F;margin-top:14px;line-height:1'>▼</div>
      <div class='h y' style='font-size:130px;margin-top:22px;line-height:1.1'>スキマ5分</div>
      <div style='font-size:40px;margin-top:30px;font-weight:800'>にしたら、副業が続くようになった</div>
    </div>"""
    b.page("f03_eyecatch", 1280, 670, body)

def f03_before_after():
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>時間を決めるのを<span class='y'>やめたら続いた</span></div>
      <div style='display:flex;gap:28px;margin-top:40px;align-items:stretch'>
        {col('before', ['帰宅後1〜2時間と決める', '疲れてできない', '落ち込む'])}
        {col('after', ['休憩の5分・10分<br>時間は決めない', '気持ちが楽', '続く'], True)}
      </div>
    </div>"""
    b.page("f03_before_after", 1280, 690, body)

# ---------- free-04 ----------
def f04_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='card' style='align-self:flex-start;padding:16px 26px;border-color:#FF6B6B;font-size:30px;font-weight:800;color:#FF8A8A;position:relative'>
        ⚠ エラーが発生しました
        <div style='position:absolute;left:40px;bottom:-14px;width:24px;height:24px;background:#18223A;border-right:1px solid #FF6B6B;border-bottom:1px solid #FF6B6B;transform:rotate(45deg)'></div>
      </div>
      <div class='h' style='font-size:110px;margin-top:40px'><span class='y'>7週間</span>、止まってた。</div>
      <div style='font-size:38px;margin-top:30px;font-weight:700' class='m'>自分のツールを「お客さん目線」で触ってみた</div>
    </div>"""
    b.page("f04_eyecatch", 1280, 670, body)

def f04_fixes():
    fx = ["期限なしのキーに入れ替え", "エラーの見せ方を変えた", "待ち時間を表示", "何問目かを表示",
          "言っていないことを足さない", "特商法・解約ページを作った", "LINEの連絡先を統一"]
    cells = "".join(f"<div class='card' style='padding:24px 28px;display:flex;align-items:center;gap:22px'>"
                    f"<div class='num' style='font-size:44px;width:36px;line-height:1'>{i+1}</div>"
                    f"<div style='font-size:31px;font-weight:800;white-space:nowrap'>{t}</div></div>" for i, t in enumerate(fx))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:50px'>お客さん目線で<span class='y'>直した7つ</span></div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:34px'>{cells}
        <div class='card' style='padding:24px 28px;display:flex;align-items:center;border-color:#FFD23F'>
          <div style='font-size:28px;font-weight:800;line-height:1.45'>最初から触っていれば<br><span class='y'>すぐ気づけたこと</span>ばかり</div></div>
      </div>
    </div>"""
    b.page("f04_fixes", 1280, 700, body)

# ---------- free-05 ----------
def f05_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:28px'>フォロワー数百人のアカウント</div>
      <div class='h' style='font-size:60px;margin-top:26px'>表示<span class='num' style='font-size:150px;margin-left:12px'>6.4万</span>回</div>
      <div style='font-size:40px;font-weight:800;margin-top:14px'>いいね <span class='y'>2,065</span>　／　コメント <span class='y'>1,306</span></div>
      <div style='font-size:36px;font-weight:700;margin-top:30px' class='m'>やったのは「構成の真似」だけ</div>
    </div>"""
    b.page("f05_eyecatch", 1280, 670, body)

def f05_structure():
    st = ["呼びかけ", "宣言", "「〜でいい」でハードルを下げる", "気持ちを言い当てる", "自分も同じ側に立つ", "コメントする言葉を指定する", "自虐で締める"]
    rows = "".join(
        f"<div class='card' style='padding:18px 30px;display:flex;align-items:center;gap:26px;{'border:2px solid #FFD23F;background:#2A2A1E' if i==5 else ''}'>"
        f"<div class='num' style='font-size:40px;width:34px;line-height:1'>{i+1}</div>"
        f"<div style='font-size:34px;font-weight:800;{'color:#FFD23F' if i==5 else ''}'>{t}</div>"
        f"{'<div class=tag style=font-size:24px;margin-left:auto;align-self:center>いちばん効いた</div>' if i==5 else ''}</div>"
        + ("<div style='font-size:22px;color:#FFD23F;text-align:center;line-height:1;margin:2px 0'>▼</div>" if i < 6 else "")
        for i, t in enumerate(st))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>真似したのは<span class='y'>7つのステップ</span>の並び順</div>
      <div style='display:flex;flex-direction:column;gap:6px;margin-top:30px'>{rows}</div>
    </div>"""
    b.page("f05_structure", 1280, 1070, body)

# ---------- free-06 ----------
def f06_eyecatch():
    dots = "".join(f"<div style='width:{s}px;height:{s}px;border-radius:50%;background:{c}'></div>"
                   for s, c in [(70, "#2B3858"), (70, "#2B3858"), (100, "#FFD23F"), (70, "#2B3858"), (70, "#2B3858")])
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='h' style='font-size:108px'><span class='y'>一人じゃ</span><br>何もできない</div>
      <div style='font-size:40px;margin-top:30px;font-weight:700' class='m'>PTA会長をやって気づいた、発信の考え方</div>
    </div>
    <div style='position:absolute;right:80px;top:90px;display:flex;align-items:center;gap:16px'>{dots}</div>"""
    b.page("f06_eyecatch", 1280, 670, body)

def f06_roles():
    side = lambda who, what, hl=False: (
        f"<div class='card' style='flex:1;padding:36px 30px;text-align:center;{'border:2px solid #FFD23F' if hl else ''}'>"
        f"<div class='{'y' if hl else 'm'}' style='font-size:32px;font-weight:900'>{who}</div>"
        f"<div style='font-size:42px;font-weight:800;margin-top:18px;line-height:1.4'>{what}</div></div>")
    center = ("<div style='display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 6px'>"
              "<div class='tag' style='font-size:30px;align-self:center;padding:10px 22px'>感謝</div>"
              "<div style='font-size:52px;color:#FFD23F;font-weight:900;line-height:1'>⇄</div>"
              "<div class='tag' style='font-size:30px;align-self:center;padding:10px 22px'>巻き込む</div></div>")
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>PTAの役割分担</div>
      <div style='display:flex;gap:24px;margin-top:44px;align-items:center'>
        {side('役員のみなさん', '案を出す<br>作業を進める')}{center}{side('自分（会長）', '人前で話す<br>決める', True)}
      </div>
      <div style='font-size:30px;font-weight:700;margin-top:40px;text-align:center'>嫌がられる役を、<span class='y'>自分が先に引き受ける</span></div>
    </div>"""
    b.page("f06_roles", 1280, 590, body)

if __name__ == "__main__":
    for f in [f01_eyecatch, f01_talk_vs_try, f02_eyecatch, f02_questions, f03_eyecatch, f03_before_after,
              f04_eyecatch, f04_fixes, f05_eyecatch, f05_structure, f06_eyecatch, f06_roles]:
        f()
