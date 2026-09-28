#!/usr/bin/env python3
"""AI×発信スターターキット記事の画像。デザインは claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)
page = b.page

def sec(n, title):
    return (f"<div style='display:flex;align-items:center;gap:18px'><div class='tag' style='font-size:26px;padding:6px 16px'>{n}</div>"
            f"<div class='h' style='font-size:46px'>{title}</div></div>")

def eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div style='display:flex;gap:12px'><div class='tag' style='font-size:26px'>無料配布</div><div class='tag' style='font-size:26px;background:#fff'>コピペで使える</div></div>
      <div class='h' style='font-size:64px;margin-top:26px;white-space:nowrap'>「何を発信すればいいか<br>分からない」が<span class='y'>5分で消える</span></div>
      <div style='font-size:32px;margin-top:26px;font-weight:700'>会社員のための <span class='y'>AI×発信スターターキット</span></div>
    </div>
    <div style='position:absolute;right:60px;top:40px;font-size:150px;font-weight:900;color:#FFD23F;opacity:.12;line-height:1'>FREE</div>"""
    page("kit_01_eyecatch", 1280, 670, body)

ITEMS = [("強みを引き出す魔法のプロンプト", "AIに自分を取材させる"), ("バズる投稿の型10選", "書き出しに迷わない"),
         ("AI発信を仕組み化する3ステップ", "1ネタを10投稿に"), ("1週間投稿テンプレ", "曜日ごとに型を決める"),
         ("AIに嫌われないプロンプトの型", "誰に・何を・トーン・長さ")]
def contents():
    rows = "".join(f"<div class='card' style='padding:20px 28px;display:flex;align-items:center;gap:24px'>"
                   f"<div class='num' style='font-size:40px;width:48px'>{'①②③④⑤'[i]}</div>"
                   f"<div style='font-size:31px;font-weight:800;flex:1'>{t}</div><div class='m' style='font-size:23px;font-weight:600'>{d}</div></div>"
                   for i,(t,d) in enumerate(ITEMS))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>このキットに入っている<span class='y'>5つ</span></div>
      <div style='display:flex;flex-direction:column;gap:14px;margin-top:32px'>{rows}</div></div>"""
    page("kit_02_contents", 1280, 720, body)

def prompt():
    outs = "".join(f"<div class='card' style='flex:1;padding:22px;text-align:center'><div class='num' style='font-size:52px'>{n}</div><div style='font-size:26px;font-weight:800;margin-top:4px'>{t}</div></div>"
                   for n,t in [("3", "あなたの強み"), ("3", "発信テーマ"), ("5", "最初の投稿ネタ")])
    body = f"""<div class='pad'>{sec('①', '強みを引き出す魔法のプロンプト')}
      <div class='m' style='font-size:26px;font-weight:700;margin-top:26px'>「自分には何もない」は、9割が言葉にしていないだけ</div>
      <div class='card' style='margin-top:20px;padding:26px 30px;border-color:#FFD23F;display:flex;gap:22px;align-items:center'>
        <div class='tag' style='font-size:22px;align-self:center'>AIに7問<br>質問させる</div>
        <div style='font-size:25px;line-height:1.7;font-weight:600'>あなたは副業プロデューサーです。私に1問ずつ、合計7つ質問してください。…</div></div>
      <div style='font-size:34px;color:#FFD23F;font-weight:900;text-align:center;margin:14px 0'>↓ 答えるだけで</div>
      <div style='display:flex;gap:18px'>{outs}</div></div>"""
    page("kit_03_prompt", 1280, 700, body)

TYPES = ["数字型", "逆張り型", "告白型", "保存型", "二択型", "あるある型", "ビフォーアフター型", "質問型", "ギャップ型", "実例型"]
EX = ["○○の9割が、△△を知らない", "□□はやめた方がいい", "正直、◯◯で失敗しました", "【保存版】◯◯なとき用", "①か②、どっち派？",
      "◯◯な人あるある", "昔→今、変えたのは1つ", "みんな◯◯どうしてる？", "◯◯だと思ってたけど実は", "◯◯を試したら△△に"]
def types():
    cells = "".join(f"<div class='card' style='padding:16px 22px;display:flex;align-items:center;gap:16px'>"
                    f"<div class='num' style='font-size:30px;width:40px'>{i+1}</div><div><div style='font-size:27px;font-weight:800'>{t}</div>"
                    f"<div class='m' style='font-size:20px;margin-top:2px;font-weight:600'>{e}</div></div></div>"
                    for i,(t,e) in enumerate(zip(TYPES, EX)))
    body = f"""<div class='pad'>{sec('②', 'バズる投稿の型10選')}
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px'>{cells}</div></div>"""
    page("kit_04_types", 1280, 780, body)

def steps():
    st = [("棚卸し", "①のプロンプトで<br>強み・テーマを確定"), ("量産", "「10の切り口に分解して」<br>→ 1ネタが10投稿に"), ("予約", "週末30分でまとめて予約<br>平日は出すだけ")]
    boxes = "<div style='font-size:44px;color:#FFD23F;font-weight:900'>→</div>".join(
        f"<div class='card' style='flex:1;padding:30px 20px;text-align:center;{'border-color:#FFD23F' if i==1 else ''}'>"
        f"<div class='num' style='font-size:30px'>STEP {i+1}</div><div style='font-size:40px;font-weight:800;margin-top:6px'>{t}</div>"
        f"<div class='m' style='font-size:22px;margin-top:12px;line-height:1.6;font-weight:600'>{d}</div></div>" for i,(t,d) in enumerate(st))
    body = f"""<div class='pad'>{sec('③', 'AI発信を仕組み化する3ステップ')}
      <div style='display:flex;align-items:center;gap:14px;margin-top:40px'>{boxes}</div>
      <div style='font-size:30px;font-weight:800;margin-top:34px;text-align:center'>1つのネタが、<span class='y'>10本の投稿</span>になる</div></div>"""
    page("kit_05_steps", 1280, 600, body)

def week():
    days = [("月", "告白", "ストーリー"), ("火", "保存型", "ノウハウ"), ("水", "逆張り", "意見"), ("木", "二択", "質問"),
            ("金", "ミニ実例", ""), ("土", "あるある", "共感"), ("日", "まとめ", "次週予告")]
    cols = "".join(f"<div class='card' style='flex:1;padding:22px 8px;text-align:center;{'border-color:#FFD23F' if d in '土日' else ''}'>"
                   f"<div class='num' style='font-size:40px'>{d}</div><div style='font-size:26px;font-weight:800;margin-top:14px'>{a}</div>"
                   f"<div class='m' style='font-size:20px;margin-top:6px;font-weight:600;min-height:24px'>{s}</div></div>" for d,a,s in days)
    body = f"""<div class='pad'>{sec('④', '1週間投稿テンプレ')}
      <div style='display:flex;gap:12px;margin-top:40px'>{cols}</div>
      <div class='m' style='font-size:26px;font-weight:700;margin-top:30px'>曜日ごとに型を決めておけば、「今日なに書こう」がなくなる</div></div>"""
    page("kit_06_week", 1280, 520, body)

def formula():
    parts = [("誰に", "○○な人向けに"), ("何を", "△△について"), ("トーン", "□□な感じで"), ("長さ", "120字で")]
    cells = "<div style='font-size:40px;color:#FFD23F;font-weight:900'>＋</div>".join(
        f"<div class='card' style='flex:1;padding:26px 14px;text-align:center'><div class='tag' style='font-size:26px;align-self:center;display:inline-block'>{a}</div>"
        f"<div style='font-size:26px;font-weight:800;margin-top:14px'>{b_}</div></div>" for a,b_ in parts)
    body = f"""<div class='pad'>{sec('⑤', 'AIに嫌われないプロンプトの型')}
      <div style='display:flex;align-items:center;gap:12px;margin-top:40px'>{cells}</div>
      <div style='font-size:30px;font-weight:800;margin-top:34px;text-align:center'>4つを埋めて「<span class='y'>書いて</span>」と頼むだけ</div></div>"""
    page("kit_07_formula", 1280, 520, body)

def ending():
    body = """<div class='pad' style='justify-content:center;align-items:center;text-align:center'>
      <div class='m' style='font-size:30px;font-weight:700'>この5つで、「何を・どう発信するか」で止まらない</div>
      <div class='h' style='font-size:70px;margin-top:20px'>まずは<span class='y'>①</span>を、今日1回</div>
      <div style='font-size:28px;margin-top:26px;font-weight:600'>AIに7つ質問してもらうだけ。5分で終わります</div>
    </div>"""
    page("kit_08_end", 1280, 500, body)

if __name__ == "__main__":
    for f in [eyecatch, contents, prompt, types, steps, week, formula, ending]:
        f()
