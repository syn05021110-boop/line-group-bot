#!/usr/bin/env python3
"""有料note 07（Stripe決済リンク × 自動で有料機能を開く）の画像。デザインは articles/claude-code-7tools/src/build.py と共通。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "articles", "claude-code-7tools", "src"))
import build as b
b.HERE = HERE
b.OUT = os.path.join(HERE, "..", "images")
os.makedirs(b.OUT, exist_ok=True)

DOWN = "<div style='font-size:22px;color:#FFD23F;text-align:center;line-height:1;margin:2px 0'>▼</div>"
RIGHT = "<div style='font-size:32px;color:#FFD23F;font-weight:900'>→</div>"

def eyecatch():
    body = """<div class='pad' style='justify-content:center'>
      <div class='h' style='font-size:108px;white-space:nowrap'>払ったら、<br><span class='y'>すぐ使える</span></div>
      <div style='font-size:36px;margin-top:30px;font-weight:700'>Stripe決済リンク × 自動で有料機能を開く仕組み</div>
    </div>
    <div class='tag' style='position:absolute;right:64px;bottom:56px;font-size:28px;padding:10px 22px'>コピペ用プロンプト4本</div>"""
    b.page("p07_eyecatch", 1280, 670, body)

def flow():
    st = [("お客さん", "決済リンクで<br>支払う", False),
          ("成功ページ", "に戻る<br><span style='font-size:18px'>URLに session_id</span>", False),
          ("サーバー", "Stripeに確認<br><span class='y' style='font-weight:900'>payment_status<br>= paid？</span>", True),
          ("解除コード", "を発行", False),
          ("ブラウザ", "に保存して<br>有料機能が開く", False)]
    boxes = RIGHT.join(
        f"<div class='card' style='flex:1;padding:24px 8px;text-align:center;align-self:stretch;{'border:2px solid #FFD23F;background:#2A2A1E' if hl else ''}'>"
        f"<div class='num' style='font-size:26px'>{i+1}</div><div style='font-size:28px;font-weight:800;margin-top:6px'>{t}</div>"
        f"<div class='m' style='font-size:21px;margin-top:8px;line-height:1.5;font-weight:700'>{d}</div></div>" for i, (t, d, hl) in enumerate(st))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:46px'>支払いから<span class='y'>有料機能が開く</span>まで</div>
      <div style='display:flex;align-items:center;gap:8px;margin-top:38px'>{boxes}</div>
      <div class='card' style='margin-top:34px;padding:22px 30px;display:flex;align-items:center;gap:18px'>
        <div class='tag' style='font-size:24px;align-self:center'>月額</div>
        <div style='font-size:27px;font-weight:800'>invoice.paid の知らせ</div>{RIGHT}
        <div style='font-size:27px;font-weight:800'>新しいコードをメールで送る<span class='y'>（31日有効）</span></div>
      </div>
    </div>"""
    b.page("p07_flow", 1280, 600, body)

def stripe_steps():
    st = ["「決済用リンク」を開く", "設定したいリンクを開く", "「…」を押して「編集」を選ぶ", "「支払い完了ページ」のタブを開く",
          "「確認ページを表示しない」を選ぶ", "戻り先のURLを入れる", "「リンクを更新する」を押す"]
    rows = DOWN.join(
        f"<div class='card' style='padding:14px 30px;display:flex;align-items:center;gap:24px;{'border:2px solid #FFD23F' if i == 5 else ''}'>"
        f"<div class='num' style='font-size:36px;width:30px;line-height:1'>{i+1}</div>"
        f"<div style='font-size:31px;font-weight:800'>{t}</div></div>" for i, t in enumerate(st))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:46px'>Stripeダッシュボードで<span class='y'>7ステップ</span></div>
      <div style='display:flex;flex-direction:column;gap:5px;margin-top:28px'>{rows}</div>
      <div class='card' style='margin-top:24px;padding:20px 28px;border-color:#FFD23F;background:#2A2A1E'>
        <div class='m' style='font-size:22px;font-weight:800'>6で入れるURLの形</div>
        <div style='font-size:25px;font-weight:700;margin-top:8px;font-family:Menlo,monospace;letter-spacing:-0.02em;white-space:nowrap'>https://（アプリのドメイン）/success?session_id=<span class='y'>{{CHECKOUT_SESSION_ID}}</span></div>
        <div class='m' style='font-size:21px;font-weight:700;margin-top:8px'>中カッコも含めて、この文字のまま入れる</div>
      </div>
    </div>"""
    b.page("p07_stripe_steps", 1280, 1150, body)

def cleanup():
    st = [("重複を見つける", False), ("残すほうを決める", False), ("使われていないか<br>確かめる", True), ("「無効」にする", False)]
    boxes = RIGHT.join(
        f"<div class='card' style='flex:1;padding:26px 10px;text-align:center;align-self:stretch;display:flex;flex-direction:column;justify-content:center;{'border:2px solid #FFD23F;background:#2A2A1E' if hl else ''}'>"
        f"<div class='num' style='font-size:30px'>{i+1}</div><div style='font-size:28px;font-weight:800;margin-top:8px;line-height:1.4;{'color:#FFD23F' if hl else ''}'>{t}</div></div>"
        for i, (t, hl) in enumerate(st))
    body = f"""<div class='pad'>
      <div class='h' style='font-size:46px'>使っていない決済リンクの<span class='y'>整理</span></div>
      <div style='display:flex;align-items:center;gap:10px;margin-top:38px'>{boxes}</div>
      <div class='m' style='font-size:26px;font-weight:700;margin-top:30px;text-align:right'>※「無効」は削除ではない。いつでも戻せる</div>
    </div>"""
    b.page("p07_cleanup", 1280, 480, body)

if __name__ == "__main__":
    for f in [eyecatch, flow, stripe_steps, cleanup]:
        f()
