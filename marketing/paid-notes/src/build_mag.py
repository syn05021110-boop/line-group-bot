#!/usr/bin/env python3
"""有料マガジン「会社員がAIで副業を回す 実践6本セット」の見出し画像。デザインは build_01.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

def mag():
    items = ["スマホAIを下書き係に", "LINE公式の導線", "図解・サムネ量産", "休憩5分で家のMac", "Threads自動投稿", "伸びた投稿の構成"]
    chips = "".join(f"<div class='card' style='padding:10px 16px;font-size:22px;font-weight:800'>{t}</div>" for t in items)
    body = f"""<div class='pad' style='justify-content:center'>
      <div style='display:flex;gap:12px'><div class='tag' style='font-size:26px'>有料マガジン</div><div class='tag' style='font-size:26px;background:#fff'>実践6本セット</div></div>
      <div class='h' style='font-size:66px;margin-top:22px;white-space:nowrap'>会社員が<span class='y'>AI</span>で<br>副業を回す</div>
      <div style='display:flex;flex-wrap:wrap;gap:10px;margin-top:26px;max-width:1100px'>{chips}</div>
    </div>"""
    b.page("mag01_eyecatch", 1280, 670, body)

if __name__ == "__main__":
    mag()
