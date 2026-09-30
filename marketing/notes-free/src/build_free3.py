#!/usr/bin/env python3
"""無料note free-11〜16 の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

RIGHT = "<div style='font-size:34px;color:#FFD23F;font-weight:900;flex:none'>→</div>"
HL = "border:2px solid #FFD23F;background:#2A2A1E"
RED = "#E5484D"
# 取り消し線（事実ではない数字に使う）
STRIKE = f"text-decoration:line-through;text-decoration-color:{RED};text-decoration-thickness:4px"

def bubble(text, size=32, border="#FFD23F"):
    """左下にしっぽがついた吹き出し"""
    return (f"<div class='card' style='align-self:flex-start;padding:16px 28px;border-color:{border};font-size:{size}px;font-weight:800;position:relative'>"
            f"{text}<div style='position:absolute;left:44px;bottom:-14px;width:24px;height:24px;background:#18223A;"
            f"border-right:1px solid {border};border-bottom:1px solid {border};transform:rotate(45deg)'></div></div>")

def compare(left_title, left_items, right_title, right_items, right_hl=(), gray_left=False):
    """左右比較の2カラム。right_hl は黄色で強調する右側の番号"""
    def col(title, items, hl_idx, is_right):
        rows = "".join(
            f"<div class='card' style='padding:18px 24px;font-size:30px;font-weight:800;line-height:1.4;"
            f"{HL + ';color:#FFD23F' if i in hl_idx else ''}'>{t}</div>" for i, t in enumerate(items))
        tag = (f"<div class='tag' style='font-size:30px;align-self:center;padding:8px 24px'>{title}</div>" if is_right else
               f"<div style='font-size:30px;font-weight:900;align-self:center;padding:8px 24px;border:2px solid #6F7C96;border-radius:6px;color:#9AA7BF'>{title}</div>")
        return f"<div style='flex:1;display:flex;flex-direction:column;gap:14px'>{tag}{rows}</div>"
    return col(left_title, left_items, (), False), col(right_title, right_items, right_hl, True)

# ---------- free-11 ----------
def f11_eyecatch():
    body = f"""<div class='pad' style='justify-content:center'>
      {bubble("「お小遣いが欲しい」")}
      <div class='h' style='font-size:96px;margin-top:44px;white-space:nowrap'>最初の講座は<br><span class='y'>約80万円</span></div>
      <div style='font-size:40px;margin-top:28px;font-weight:700' class='m'>今も取り返せていない</div>
    </div>"""
    b.page("f11_eyecatch", 1280, 670, body)

def f11_chase():
    st = [("お小遣いが<br>欲しい", False), ("約80万円の<br>講座", False), ("成果が<br>出ない", False),
          ("取り返そう<br><span class='m' style='font-size:22px'>FX・物販…</span>", False), ("まだ回収<br>できていない", True)]
    boxes = RIGHT.join(
        f"<div class='card' style='flex:1;padding:28px 4px;text-align:center;align-self:stretch;display:flex;flex-direction:column;justify-content:center;"
        f"{HL if hl else ''}'><div style='font-size:27px;font-weight:800;line-height:1.4;{'color:#FFD23F' if hl else ''}'>{t}</div></div>"
        for t, hl in st)
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>「<span class='y'>取り返そう</span>」の連続</div>
      <div style='display:flex;align-items:center;gap:8px;margin-top:40px'>{boxes}</div>
      <div style='display:flex;justify-content:flex-end;margin-top:14px'>
        <div style='font-size:26px;color:#FFD23F;line-height:1;margin-right:92px'>▲</div></div>
      <div style='display:flex;justify-content:flex-end;margin-top:10px'>
        <div class='card' style='padding:20px 30px;border-color:#FFD23F;font-size:32px;font-weight:800;color:#FFD23F'>継続は力なり。いつか成功すると思っている</div></div>
    </div>"""
    b.page("f11_chase", 1280, 500, body)

# ---------- free-12 ----------
def f12_eyecatch():
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:28px'>研修で話してきた小ネタ</div>
      <div style='position:relative;align-self:flex-start;margin-top:34px'>
        <div class='h' style='font-size:84px;white-space:nowrap;color:#C9D1E0'>脳は1〜2%しか<br>使っていない</div>
        <svg style='position:absolute;left:-20px;top:-10px;width:calc(100% + 40px);height:calc(100% + 20px)' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <line x1='4' y1='8' x2='96' y2='92' stroke='{RED}' stroke-width='14' stroke-linecap='round' vector-effect='non-scaling-stroke'/>
          <line x1='96' y1='8' x2='4' y2='92' stroke='{RED}' stroke-width='14' stroke-linecap='round' vector-effect='non-scaling-stroke'/>
        </svg>
      </div>
      <div class='h y' style='font-size:56px;margin-top:40px'>確かめたら、映画の話だった</div>
    </div>"""
    b.page("f12_eyecatch", 1280, 670, body)

def f12_numbers():
    old = ["1〜2%しか働いていない", "100%で原子力発電所2つ分"]
    old_rows = "".join(f"<div class='card' style='padding:20px 24px;font-size:30px;font-weight:800;line-height:1.4;color:#9AA7BF'>"
                       f"<span style='{STRIKE}'>{t}</span></div>" for t in old)
    new = [("重さ", "体重の約2%"), ("エネルギー", "全身の約2割"), ("電力にすると", "約20ワット")]
    new_rows = "".join(f"<div class='card' style='padding:16px 24px;{HL}'><div class='m' style='font-size:22px;font-weight:800'>{k}</div>"
                       f"<div class='y' style='font-size:34px;font-weight:900;margin-top:4px'>{v}</div></div>" for k, v in new)
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>脳のエネルギー、<span class='y'>本当の数字</span></div>
      <div style='display:flex;gap:40px;margin-top:34px;align-items:flex-start'>
        <div style='flex:1;display:flex;flex-direction:column;gap:14px'>
          <div style='font-size:30px;font-weight:900;align-self:center;padding:8px 24px;border:2px solid #6F7C96;border-radius:6px;color:#9AA7BF'>話してきたこと</div>
          {old_rows}
          <div style='font-size:26px;font-weight:800;color:{RED};text-align:center;margin-top:6px'>✕ 事実ではない。映画の話だった</div>
        </div>
        <div style='align-self:center;font-size:52px;color:#FFD23F;font-weight:900'>→</div>
        <div style='flex:1;display:flex;flex-direction:column;gap:14px'>
          <div class='tag' style='font-size:30px;align-self:center;padding:8px 24px'>本当の数字</div>
          {new_rows}
        </div>
      </div>
      <div style='font-size:28px;font-weight:800;margin-top:28px;text-align:right'>だから、<span class='y'>省エネしたがる</span></div>
    </div>"""
    b.page("f12_numbers", 1280, 760, body)

# ---------- free-13 ----------
def f13_eyecatch():
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='h' style='font-size:104px;white-space:nowrap'><span class='y'>教えるつもり</span>で<br>聞く</div>
      <div style='font-size:38px;margin-top:36px;font-weight:700' class='m'><span style='{STRIKE}'>5%・95%</span> の数字は使いません</div>
    </div>"""
    b.page("f13_eyecatch", 1280, 670, body)

def f13_listen_vs_teach():
    l, r = compare("ただ聞く", ["受け取るだけ"], "教えるつもりで聞く",
                   ["「一言で言うと？」をメモ", "3行で説明してみる", "投稿の下書きへ"], right_hl=(2,))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>聞き方を<span class='y'>変える</span></div>
      <div style='display:flex;gap:40px;margin-top:34px;align-items:flex-start'>{l}
        <div style='align-self:center;font-size:52px;color:#FFD23F;font-weight:900'>→</div>{r}</div>
      <div class='m' style='font-size:25px;font-weight:700;margin-top:32px;text-align:right'>
        数字（<span style='{STRIKE}'>5%・95%</span>）は根拠不明。考え方には研究あり</div>
    </div>"""
    b.page("f13_listen_vs_teach", 1280, 640, body)

# ---------- free-14 ----------
def f14_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:30px'>失敗って何？</div>
      <div class='h' style='font-size:100px;margin-top:36px;white-space:nowrap'><span class='y'>死ぬこと以外</span>は、<br>やり直せる</div>
    </div>"""
    b.page("f14_eyecatch", 1280, 670, body)

def f14_shelf():
    def shelf(title, items, style, title_color, note=""):
        rows = "".join(f"<div style='font-size:30px;font-weight:800;padding:14px 0;border-bottom:1px solid #2B3858;{style[1]}'>{t}</div>" for t in items)
        return (f"<div class='card' style='flex:1;padding:24px 26px;align-self:stretch;display:flex;flex-direction:column;{style[0]}'>"
                f"<div style='font-size:32px;font-weight:900;color:{title_color};padding-bottom:12px;border-bottom:3px solid {title_color}'>{title}</div>{rows}{note}</div>")
    a = shelf("やり直せる失敗", ["仕事のミス", "お金がなくなる", "使いすぎる"], ("", ""), "#FFFFFF",
              "<div class='y' style='font-size:23px;font-weight:800;margin-top:auto;padding-top:18px'>▲ 私の副業の失敗もここ</div>")
    c = shelf("別に考える", ["人に迷惑をかける", "犯罪"], ("background:#141A28;border-color:#2B3858", "color:#6F7C96"), "#6F7C96")
    d = shelf("一番の失敗", ["死ぬこと"], (HL, "color:#FFD23F;font-size:40px"), "#FFD23F",
              "<div class='m' style='font-size:24px;font-weight:800;padding-top:16px;line-height:1.5'>これだけは<br>やり直せない</div>")
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>失敗を<span class='y'>3つの棚</span>に分ける</div>
      <div style='display:flex;gap:24px;margin-top:36px'>{a}{c}{d}</div>
    </div>"""
    b.page("f14_shelf", 1280, 560, body)

# ---------- free-15 ----------
def f15_eyecatch():
    body = f"""<div class='pad' style='justify-content:center'>
      {bubble("「なんとかなるだろう」", size=76, border="#6F7C96")}
      <div class='h y' style='font-size:64px;margin-top:64px'>勢いだけでは無理だった</div>
    </div>"""
    b.page("f15_eyecatch", 1280, 670, body)

def f15_before_after():
    l, r = compare("若いころ", ["寝ずに仕事へ", "「なんとかなるだろう」", "ミスはないが、<br>ヒヤリハットが多い"],
                   "今", ["勢いだけでは無理", "副業は<br>休憩の5分・10分"], right_hl=(1,))
    mid = ("<div style='align-self:center;width:190px;display:flex;flex-direction:column;align-items:center;gap:8px'>"
           "<div style='font-size:22px;font-weight:800;text-align:center;line-height:1.5' class='m'>年を取る<br>責任のある仕事</div>"
           "<div style='font-size:56px;color:#FFD23F;font-weight:900;line-height:1'>→</div></div>")
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>「なんとかなる」から<span class='y'>「続く形」</span>へ</div>
      <div style='display:flex;gap:20px;margin-top:34px;align-items:flex-start'>{l}{mid}{r}</div>
    </div>"""
    b.page("f15_before_after", 1280, 620, body)

# ---------- free-16 ----------
def f16_eyecatch():
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='h m' style='font-size:56px;white-space:nowrap'><span style='text-decoration:line-through;text-decoration-thickness:3px'>なんとなく達成</span></div>
      <div style='font-size:48px;color:#FFD23F;font-weight:900;margin:14px 0 6px 20px;line-height:1'>▼</div>
      <div class='h' style='font-size:92px;white-space:nowrap'><span class='y'>これをやったから</span>達成</div>
      <div style='font-size:38px;margin-top:34px;font-weight:700' class='m'>大きい目標を小さく分ける</div>
    </div>"""
    b.page("f16_eyecatch", 1280, 670, body)

def f16_ladder():
    steps = [("大きい目標", "脱サラ（夢）", False, 400),
             ("小さい目標", "例：最初の1円／発信を続ける／<br>強みを説明できる形に", False, 200),
             ("行動", "例：休憩の5分で下書き1本", True, 0)]
    rows = "".join(
        f"<div class='card' style='margin-left:{ml}px;width:752px;padding:22px 28px;display:flex;align-items:center;gap:24px;{HL if hl else ''}'>"
        f"<div class='tag' style='font-size:26px;align-self:center;flex:none;width:190px;text-align:center;white-space:nowrap'>{t}</div>"
        f"<div style='font-size:30px;font-weight:800;line-height:1.45;{'color:#FFD23F' if hl else ''}'>{d}</div></div>"
        for t, d, hl, ml in steps)
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>大きい目標を<span class='y'>3段</span>に分ける</div>
      <div style='display:flex;flex-direction:column;gap:18px;margin-top:36px'>{rows}</div>
      <div class='m' style='font-size:23px;font-weight:700;margin-top:auto;text-align:right'>※小さい目標・行動は例</div>
    </div>"""
    b.page("f16_ladder", 1280, 620, body)

if __name__ == "__main__":
    for f in [f11_eyecatch, f11_chase, f12_eyecatch, f12_numbers, f13_eyecatch, f13_listen_vs_teach,
              f14_eyecatch, f14_shelf, f15_eyecatch, f15_before_after, f16_eyecatch, f16_ladder]:
        f()
