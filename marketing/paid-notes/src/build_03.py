#!/usr/bin/env python3
"""有料note 03（図解・サムネをAIに頼んで量産する仕組み）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

def eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='tag' style='font-size:26px'>非エンジニアの実録</div>
      <div class='h' style='font-size:72px;margin-top:24px;white-space:nowrap'>図解とサムネを<br>AIに頼んで<br><span class='y'>量産する仕組み</span></div>
      <div class='m' style='font-size:30px;margin-top:26px;font-weight:700;white-space:nowrap'>HTMLで組んでPNGにする｜1日で約20枚作った方法</div>
    </div>
    <div style='position:absolute;right:64px;top:56px;font-size:180px;font-weight:900;color:#FFD23F;opacity:.12;line-height:1'>PNG</div>"""
    b.page("p03_eyecatch", 1280, 670, body)

def flow():
    st = [("中身を<br>書く", "見出し・箇条書き"), ("AIが<br>HTMLを書く", "色・大きさ・位置"), ("ヘッドレス<br>Chrome", "画面なしで開く"), ("PNGで<br>保存", "決めたサイズ<br>ぴったり")]
    boxes = "<div style='font-size:36px;color:#FFD23F;font-weight:900'>→</div>".join(
        f"<div class='card' style='flex:1;align-self:stretch;padding:26px 14px;text-align:center;display:flex;flex-direction:column;justify-content:center;{'border-color:#FFD23F' if i==2 else ''}'>"
        f"<div class='num' style='font-size:30px'>{i+1}</div><div style='font-size:30px;font-weight:800;margin-top:6px;line-height:1.3'>{t}</div>"
        f"<div class='m' style='font-size:21px;margin-top:10px;line-height:1.5;font-weight:600'>{d}</div></div>" for i, (t, d) in enumerate(st))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>画像を<span class='y'>“ウェブページ”</span>として作る</div>
      <div style='display:flex;align-items:center;gap:12px;margin-top:40px'>{boxes}</div>
      <div class='card' style='margin-top:34px;padding:24px 30px;font-size:28px;font-weight:800'>
        直したいときは、<span class='y'>AIに言うだけ</span>。HTMLを直して撮り直す</div></div>"""
    b.page("p03_flow", 1280, 600, body)

def sizes():
    def frame(label, w, h, bw, bh, grid=False):
        inner = ""
        if grid:
            inner = ("<div style='position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr'>"
                     + "".join("<div style='border:2px dashed #9AA7BF66'></div>" for _ in range(6)) + "</div>")
        return (f"<div style='flex:1;display:flex;flex-direction:column;align-items:center'>"
                f"<div style='height:270px;display:flex;align-items:center'>"
                f"<div style='position:relative;width:{bw}px;height:{bh}px;border:3px solid #FFD23F;border-radius:8px;background:#18223A'>{inner}</div></div>"
                f"<div style='font-size:28px;font-weight:800;margin-top:22px;text-align:center'>{label}</div>"
                f"<div class='num' style='font-size:40px;margin-top:6px'>{w}×{h}</div></div>")
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>覚えておくサイズは<span class='y'>3つ</span></div>
      <div style='display:flex;gap:24px;margin-top:36px'>
        {frame('note 見出し画像', 1280, 670, 320, 168)}
        {frame('Threads', 1080, 1350, 216, 270)}
        {frame('LINE リッチメニュー', 2500, 1686, 320, 216, True)}
      </div></div>"""
    b.page("p03_sizes", 1280, 600, body)

def checklist():
    items = [("文字がはみ出す", "見出しを短く／文字を小さく"), ("変な位置で改行", "改行する場所を自分で指定"),
             ("余白が空きすぎる", "高さを中身に合わせる"), ("暗い背景でリンクが読めない", "白か黄色にする")]
    cards = "".join(f"<div class='card' style='padding:24px 28px;display:flex;gap:22px;align-items:center'>"
                    f"<div class='num' style='font-size:44px;width:34px'>{i+1}</div>"
                    f"<div><div style='font-size:30px;font-weight:800'>{t}</div>"
                    f"<div style='font-size:24px;margin-top:8px;font-weight:700'><span class='y'>→</span> {f}</div></div></div>"
                    for i, (t, f) in enumerate(items))
    body = f"""<div class='pad'><div class='h' style='font-size:46px'>実際に起きたのは、ここ<span class='y'>4つ</span></div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:32px'>{cards}</div></div>"""
    b.page("p03_checklist", 1280, 480, body)

if __name__ == "__main__":
    for f in [eyecatch, flow, sizes, checklist]:
        f()
