#!/usr/bin/env python3
"""無料note free-07〜10 の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

DOWN = "<div style='font-size:24px;color:#FFD23F;text-align:center;line-height:1;margin:2px 0'>▼</div>"

# ---------- free-07 ----------
def f07_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='card' style='align-self:flex-start;padding:16px 28px;border-color:#FFD23F;font-size:32px;font-weight:800;position:relative'>
        「俺は投稿押すだけ」
        <div style='position:absolute;left:44px;bottom:-14px;width:24px;height:24px;background:#18223A;border-right:1px solid #FFD23F;border-bottom:1px solid #FFD23F;transform:rotate(45deg)'></div>
      </div>
      <div class='h' style='font-size:92px;margin-top:44px;white-space:nowrap'>note <span class='y'>20本</span>、<br><span class='y'>1日で</span>公開</div>
      <div style='font-size:38px;margin-top:30px;font-weight:700' class='m'>AIがやったこと／私が決めたこと</div>
    </div>"""
    b.page("f07_eyecatch", 1280, 670, body)

def f07_roles():
    def side(who, items, hl_last=False):
        rows = "".join(
            f"<div class='card' style='padding:18px 24px;font-size:29px;font-weight:800;line-height:1.4;"
            f"{'border:2px solid #FFD23F;color:#FFD23F;background:#2A2A1E' if hl_last and i == len(items)-1 else ''}'>{t}</div>"
            for i, t in enumerate(items))
        return (f"<div style='flex:1;display:flex;flex-direction:column;gap:14px'>"
                f"<div class='tag' style='font-size:30px;align-self:center;padding:8px 24px'>{who}</div>{rows}</div>")
    ai = side("AI（Claude）", ["タイトル・本文・本文の画像・<br>見出し画像を下書きに入れる", "ハッシュタグを3つずつ付ける", "公開ボタンを押す"])
    me = side("私", ["今日中に全部出すと決める", "価格を承認<br><span style='font-size:25px' class='m'>500円 → 数日後に980円</span>",
                     "計画にOKを出す", "公開後に確認する"], True)
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>AIは<span class='y'>作業</span>、私は<span class='y'>決める・承認・確認</span></div>
      <div style='display:flex;gap:30px;margin-top:38px;align-items:flex-start'>{ai}{me}</div>
    </div>"""
    b.page("f07_roles", 1280, 690, body)

# ---------- free-08 ----------
def f08_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:28px'>有料noteを20本出した日の落とし穴3つ</div>
      <div class='h' style='font-size:92px;margin-top:34px'><span class='y'>有料の線</span>が、<br>1段ずれていた</div>
    </div>
    <div style='position:absolute;right:80px;top:150px;width:300px;display:flex;flex-direction:column;gap:14px'>
      <div style='height:22px;border-radius:6px;background:#2B3858'></div>
      <div style='height:22px;border-radius:6px;background:#2B3858;width:80%'></div>
      <div style='border-top:5px dashed #FFD23F;margin:22px 0 22px 60px'></div>
      <div style='height:22px;border-radius:6px;background:#2B3858;width:90%'></div>
      <div style='height:22px;border-radius:6px;background:#2B3858;width:70%'></div>
      <div style='border-top:5px dashed #6F7C96;margin:22px 60px 22px 0;opacity:.6'></div>
      <div style='height:22px;border-radius:6px;background:#2B3858'></div>
    </div>"""
    b.page("f08_eyecatch", 1280, 670, body)

def f08_paidline():
    def blk(t, kind=""):
        if kind == "line":
            return ("<div style='border:2px dashed #FFD23F;border-radius:10px;padding:12px;text-align:center;"
                    "font-size:28px;font-weight:900;color:#FFD23F'>有料ライン</div>")
        return f"<div class='card' style='padding:14px 22px;font-size:28px;font-weight:800;text-align:center'>{t}</div>"
    mark, head, fig, para = "「ここから有料」の目印", "「1.」の見出し", "図", "段落"
    bad_group = (f"<div style='border:3px solid #FFD23F;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px;position:relative;background:#2A2A1E'>"
                 f"<div class='y' style='font-size:22px;font-weight:800;text-align:center'>無料側に出ていた</div>{blk(head)}{blk(fig)}</div>")
    left = f"<div style='display:flex;flex-direction:column;gap:12px'>{blk(mark)}{bad_group}{blk('', 'line')}{blk(para)}</div>"
    right = f"<div style='display:flex;flex-direction:column;gap:12px'>{blk(mark)}{blk('', 'line')}{blk(head)}{blk(fig)}{blk(para)}</div>"
    col = lambda title, inner, hl: (f"<div style='flex:1;display:flex;flex-direction:column;gap:18px'>"
                                    f"<div class='{'y' if hl else 'm'}' style='font-size:36px;font-weight:900;text-align:center'>{title}</div>{inner}</div>")
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>有料ラインの<span class='y'>位置</span>を比べる</div>
      <div style='display:flex;gap:40px;margin-top:34px;align-items:flex-start'>
        {col('ずれた状態', left, False)}
        <div style='align-self:center;font-size:52px;color:#FFD23F;font-weight:900'>→</div>
        {col('直した状態', right, True)}
      </div>
      <div style='font-size:34px;font-weight:800;margin-top:36px;text-align:center'>線の<span class='y'>直後に何があるか</span>を見る</div>
    </div>"""
    b.page("f08_paidline", 1280, 830, body)

# ---------- free-09 ----------
def f09_eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='h' style='font-size:130px;line-height:1.1'><span class='y'>19本</span>、予約した。</div>
      <div style='font-size:40px;margin-top:28px;font-weight:700' class='m'>Threadsの予約投稿と「今日」の直し方</div>
      <div class='card' style='align-self:flex-start;margin-top:40px;padding:20px 34px;font-size:40px;font-weight:800'>
        今日わかった <span style='color:#FFD23F;margin:0 16px'>→</span><span class='y'>最近わかった</span></div>
    </div>"""
    b.page("f09_eyecatch", 1280, 670, body)

def f09_steps():
    st = ["投稿の作成画面を開く", "作成画面の「…」を押す", "「日時を指定」を選ぶ", "日付と時刻を選んで「完了」を押す", "本文を入力する", "「日時を指定」ボタンを押す"]
    rows = DOWN.join(
        f"<div class='card' style='padding:18px 30px;display:flex;align-items:center;gap:26px;{'border:2px solid #FFD23F' if i == 5 else ''}'>"
        f"<div class='num' style='font-size:40px;width:34px;line-height:1'>{i+1}</div>"
        f"<div style='font-size:34px;font-weight:800'>{t}</div>"
        f"{'<div class=m style=font-size:24px;font-weight:700;margin-left:auto>「投稿」ではなく</div>' if i == 5 else ''}</div>"
        for i, t in enumerate(st))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>Threadsのウェブ版で<span class='y'>予約する6ステップ</span></div>
      <div style='display:flex;flex-direction:column;gap:6px;margin-top:30px'>{rows}</div>
      <div class='card' style='margin-top:26px;padding:22px 30px;border-color:#FFD23F;background:#2A2A1E;font-size:30px;font-weight:800;line-height:1.5'>
        下書き一覧に<span class='y'>「◯月◯日 12:15 JSTに投稿予定」</span>と出ればOK</div>
    </div>"""
    b.page("f09_steps", 1280, 1080, body)

# ---------- free-10 ----------
def fake_post(scale=1.0, labels=False):
    """架空の投稿の枠。文字は入れず、黒塗り・灰色の棒だけで描く"""
    s = lambda v: int(v * scale)
    black = "background:#05080F;border:1px solid #3A4666"
    hl = "outline:3px solid #FFD23F;outline-offset:3px"
    bar = lambda w, style, h=18: f"<div style='height:{s(h)}px;width:{w}%;border-radius:4px;{style}'></div>"
    head = (f"<div style='display:flex;align-items:center;gap:{s(14)}px'>"
            f"<div style='width:{s(56)}px;height:{s(56)}px;border-radius:50%;{black}'></div>"
            f"<div style='height:{s(22)}px;width:40%;border-radius:4px;{black}'></div></div>")
    title = bar(85, f"{black};{hl if labels else ''}", 26)
    bullets = "".join(f"<div style='display:flex;align-items:center;gap:{s(10)}px'><div style='width:{s(8)}px;height:{s(8)}px;border-radius:50%;background:#6F7C96'></div>"
                      f"{bar(w, black + ';' + (hl if labels else ''))}</div>" for w in (60, 72, 55, 66))
    rest = "".join(bar(w, "background:#2B3858") for w in (92, 80, 88))
    return (f"<div class='card' style='padding:{s(26)}px {s(28)}px;display:flex;flex-direction:column;gap:{s(16)}px'>"
            f"{head}{title}<div style='display:flex;flex-direction:column;gap:{s(12)}px'>{bullets}</div>"
            f"<div style='display:flex;flex-direction:column;gap:{s(10)}px;margin-top:{s(6)}px'>{rest}</div></div>")

def f10_eyecatch():
    body = f"""<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:28px'>実績スクショを載せる前のチェック</div>
      <div class='h' style='font-size:72px;margin-top:30px'>名前とアイコンを<br>消しても、<br><span class='y'>まだ分かる</span></div>
    </div>
    <div style='position:absolute;right:70px;top:120px;width:420px'>{fake_post(0.95)}</div>"""
    b.page("f10_eyecatch", 1280, 670, body)

def f10_layers():
    tiers = [("1", "自分で隠した", "アカウント名・アイコン", False),
             ("2", "AIが追加で隠した", "タイトルと箇条書き4行の<br>ジャンルが分かる言葉", True),
             ("3", "まだ残るリスク", "残った文章は検索できる", False)]
    rows = "".join(
        f"<div class='card' style='padding:22px 26px;display:flex;gap:20px;align-items:flex-start;{'border:2px solid #FFD23F;background:#2A2A1E' if hl else ''}'>"
        f"<div class='num' style='font-size:40px;line-height:1;width:28px'>{n}</div>"
        f"<div><div class='{'y' if hl else 'm'}' style='font-size:24px;font-weight:800'>{t}</div>"
        f"<div style='font-size:30px;font-weight:800;margin-top:8px;line-height:1.4;{'color:#FFD23F' if hl else ''}'>{d}</div></div></div>"
        for n, t, d, hl in tiers)
    body = f"""<div class='pad'>
      <div class='h' style='font-size:48px'>隠す場所は<span class='y'>3段</span>ある</div>
      <div style='display:flex;gap:40px;margin-top:34px;align-items:flex-start'>
        <div style='width:430px'>
          <div class='m' style='font-size:22px;font-weight:700;margin-bottom:12px'>架空の投稿のイメージ</div>
          {fake_post(1.0, labels=True)}
          <div class='m' style='font-size:20px;font-weight:700;margin-top:12px;line-height:1.5'>黒＝隠した部分<br>黄色の枠＝AIが追加で隠した部分<br>灰色＝残った文章</div>
        </div>
        <div style='flex:1;display:flex;flex-direction:column;gap:16px'>{rows}</div>
      </div>
    </div>"""
    b.page("f10_layers", 1280, 740, body)

if __name__ == "__main__":
    for f in [f07_eyecatch, f07_roles, f08_eyecatch, f08_paidline, f09_eyecatch, f09_steps, f10_eyecatch, f10_layers]:
        f()
