#!/usr/bin/env python3
"""note.md から、note に書式付きで貼り付けるためのコピー用ページ（note_paste.html）を作る。"""
import html, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
import sys
SRC = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, "..", "note.md")
ROOT = os.path.dirname(SRC)
OUTNAME = sys.argv[2] if len(sys.argv) > 2 else "note_paste.html"
lines = open(SRC, encoding="utf-8").read().splitlines()

def inline(t):
    t = html.escape(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    return re.sub(r"(https?://[^\s<]+)", r'<a href="\1">\1</a>', t)

title, segments, cur, i = "", [], [], 0
while i < len(lines):
    l = lines[i]
    if l.startswith("# "):
        title = l[2:]
    elif m := re.match(r"\[\[img:(.+?)\]\]", l):
        segments.append(("text", cur)); segments.append(("img", m.group(1))); cur = []
    elif l.startswith("## "):
        cur.append(f"<h2>{inline(l[3:])}</h2>")
    elif l.startswith("- "):
        items = []
        while i < len(lines) and lines[i].startswith("- "):
            items.append(f"<li>{inline(lines[i][2:])}</li>"); i += 1
        cur.append("<ul>" + "".join(items) + "</ul>"); continue
    elif l.startswith("> "):
        cur.append(f"<blockquote>{inline(l[2:])}</blockquote>")
    elif l.strip():
        para = [l]
        while i + 1 < len(lines) and lines[i + 1].strip() and not re.match(r"(#|- |> |\[\[)", lines[i + 1]):
            i += 1; para.append(lines[i])
        cur.append("<p>" + "<br>".join(inline(p) for p in para) + "</p>")
    i += 1
segments.append(("text", cur))

out, n = [], 0
for kind, v in segments:
    if kind == "img":
        label = "見出し画像に設定" if "eyecatch" in v else "ここに画像を挿入"
        out.append(f"<div class='img'><div class='badge'>{label}：{v}</div><img src='images/{v}'></div>")
    elif v:
        n += 1
        out.append(f"<div class='seg'><button onclick='cp(\"s{n}\",this)'>本文{n}をコピー</button><div class='body' id='s{n}'>{''.join(v)}</div></div>")

page = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>note貼り付け用</title>
<style>
body{{font-family:"Hiragino Sans",sans-serif;background:#f4f4f2;color:#222;margin:0;padding:24px 16px 80px}}
main{{max-width:760px;margin:0 auto}}
.guide{{background:#fff8d6;border:1px solid #e8d77a;border-radius:10px;padding:14px 18px;line-height:1.8;font-size:15px}}
.seg,.titlebox{{background:#fff;border:1px solid #ddd;border-radius:10px;padding:18px 22px;margin:18px 0}}
button{{background:#222;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-size:14px;cursor:pointer}}
button.done{{background:#2e7d32}}
.body{{line-height:1.9;font-size:16px;margin-top:12px}}
.body h2{{font-size:22px;margin:28px 0 8px}}
.body blockquote{{border-left:4px solid #ccc;margin:12px 0;padding:4px 14px;color:#555}}
.img{{margin:18px 0;text-align:center}}
.img img{{max-width:100%;border-radius:8px;border:1px solid #ddd}}
.badge{{display:inline-block;background:#1565c0;color:#fff;border-radius:6px;padding:4px 10px;font-size:13px;margin-bottom:8px}}
</style></head><body><main>
<div class="guide"><b>使い方</b><br>
1. タイトルをコピーして、note のタイトル欄に貼る<br>
2. 「本文1をコピー」から順にコピーし、note の本文に貼る<br>
3. 青いラベルの位置に、images フォルダの同じ名前の画像を入れる（本文には貼られません）<br>
※ 見出しが普通の文字になった場合は、その行を選んで「大見出し」を設定してください</div>
<div class="titlebox"><button onclick='cp("t",this)'>タイトルをコピー</button><div class="body" id="t">{html.escape(title)}</div></div>
{''.join(out)}
</main>
<script>
function cp(id,b){{const r=document.createRange();r.selectNodeContents(document.getElementById(id));
const s=getSelection();s.removeAllRanges();s.addRange(r);const ok=document.execCommand('copy');s.removeAllRanges();
b.textContent=ok?'コピーしました':'コピーできませんでした（手動で選択してください）';b.classList.add('done');}}
</script></body></html>"""
open(os.path.join(ROOT, OUTNAME), "w", encoding="utf-8").write(page)
print("segments:", n)
