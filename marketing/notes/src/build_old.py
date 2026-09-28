#!/usr/bin/env python3
"""既存の無料note（05,14〜20）のアイキャッチ。デザインは paid-notes と共通（紺×黄）。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

# (番号, タグ, 1行目, 2行目（黄）, 補足)
ITEMS = [
    ("05", "発信の型", "Xで伸びる人がやっている", "「フックの型」4選", "最初の1行で、止まってもらうために"),
    ("14", "何者でもない人へ", "SNSで信頼される", "最短ルート", "実績より先に、順番がある"),
    ("15", "副業の第一歩", "商品作りじゃなく", "「言語化」だった", "何を売るかより、何を言えるか"),
    ("16", "フォロワーが少なくても", "仕事につながる", "発信の共通点", "数より、届く相手"),
    ("17", "ネタ切れしない", "コンテンツが尽きる人と", "尽きない人の違い", "違いは「ネタ源」"),
    ("18", "AIと発信", "AIに丸投げしても伸びない", "人の心が動く投稿の条件", "最後の一言は、自分で足す"),
    ("19", "消耗しない副業", "発信の", "「設計図」の作り方", "続けられる形を、先に決める"),
    ("20", "会社員のうちに", "\"自分メディア\"を", "持つべき理由", "辞める前から、始めておく"),
]

def eyecatch(n, tag, l1, l2, sub):
    body = f"""<div class='pad' style='justify-content:center'>
      <div style='display:flex;gap:12px'><div class='tag' style='font-size:26px'>{tag}</div></div>
      <div class='h' style='font-size:64px;margin-top:26px;white-space:nowrap'>{l1}<br><span class='y'>{l2}</span></div>
      <div style='font-size:32px;margin-top:24px;font-weight:700'>{sub}</div>
    </div>"""
    b.page(f"n{n}_eyecatch", 1280, 670, body)

if __name__ == "__main__":
    for it in ITEMS:
        eyecatch(*it)
