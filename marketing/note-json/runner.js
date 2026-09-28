// note エディタ（editor.note.com）で、note-json/*.json の原稿を下書きとして入力する。
// 使い方（ブラウザのコンソール等）：window.__start('02-line-funnel.json','paid-notes/images') → window.__res に結果
(() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const RAW = 'https://raw.githubusercontent.com/syn05021110-boop/line-group-bot/claude/threads-note-income-app-fr3bhv/marketing/';
  const btn = t => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t);
  const getFile = async p => { const r = await fetch(RAW + p); if (!r.ok) return null; return new File([await r.blob()], p.split('/').pop(), { type: 'image/png' }); };
  const hdrImg = () => [...document.querySelectorAll('img')].some(i => i.src.includes('st-note') && !i.closest('.ProseMirror'));

  async function setEyecatch(path) {
    const f = await getFile(path); if (!f) return 'missing';
    window.scrollTo(0, 0);
    [...document.querySelectorAll('button')].find(b => b.outerHTML.includes('画像を追加')).click(); await sleep(1000);
    const up = [...document.querySelectorAll('button')].find(b => b.textContent.includes('画像をアップロード'));
    const orig = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () { if (this.type === 'file') { const d = new DataTransfer(); d.items.add(f); this.files = d.files; this.dispatchEvent(new Event('change', { bubbles: true })); } else orig.call(this); };
    up.click(); await sleep(800); HTMLInputElement.prototype.click = orig;
    for (let i = 0; i < 40 && !btn('保存'); i++) await sleep(250);
    for (let tries = 0; tries < 6 && !hdrImg(); tries++) {
      await sleep(4000);
      const sv = btn('保存'); if (sv) sv.click();
      for (let i = 0; i < 20 && !hdrImg(); i++) await sleep(500);
    }
    return hdrImg() ? 'ok' : 'NG';
  }

  async function run(jsonPath, imgDir) {
    for (let i = 0; i < 80 && !(document.querySelector('.ProseMirror') && document.querySelector('textarea')); i++) await sleep(250);
    const log = [];
    const J = await (await fetch(RAW + 'note-json/' + jsonPath)).json();
    const ta = document.querySelector('textarea');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, J.title);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const segs = [...J.segs]; let eye = null;
    if (segs[0].t === 'img' && segs[0].v.includes('eyecatch')) eye = segs.shift().v;
    const html = segs.map(s => s.t === 'html' ? s.v : `<p>@@IMG:${s.v}@@</p>`).join('');
    const el = document.querySelector('.ProseMirror'); el.focus();
    const paste = dt => el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    const bs = () => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace', keyCode: 8, bubbles: true, cancelable: true }));
    const selP = (p, collapse) => { el.focus(); const r = document.createRange(); if (collapse) { r.setStart(p, 0); r.collapse(true); } else r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    const findPh = v => [...el.querySelectorAll('p')].find(p => p.textContent.trim() === `@@IMG:${v}@@`);
    let dt = new DataTransfer(); dt.setData('text/html', html); dt.setData('text/plain', 'x'); paste(dt); await sleep(1500);
    for (const s of segs.filter(s => s.t === 'img')) {
      let p = findPh(s.v); if (!p) { log.push('noph ' + s.v); continue; }
      selP(p); await sleep(150);
      const f = await getFile(imgDir + '/' + s.v);
      if (!f) { log.push('missing ' + s.v); dt = new DataTransfer(); dt.setData('text/plain', `【ここに画像：${s.v}】`); paste(dt); await sleep(300); continue; }
      const n0 = el.querySelectorAll('figure').length;
      dt = new DataTransfer(); dt.items.add(f); paste(dt);
      for (let i = 0; i < 80 && el.querySelectorAll('figure').length <= n0; i++) await sleep(250);
      await sleep(800);
      p = findPh(s.v);
      if (p) { selP(p); await sleep(150); bs(); await sleep(200); selP(p, true); await sleep(150); bs(); await sleep(200); }
      log.push((el.querySelectorAll('figure').length > n0 ? 'ok ' : 'NG ') + s.v);
    }
    if (eye) log.push('eye ' + await setEyecatch(imgDir + '/' + eye));
    const left = [...el.querySelectorAll('p')].filter(p => p.textContent.includes('@@IMG')).length; if (left) log.push('placeholders left ' + left);
    const key = location.pathname.split('/')[2];
    let d = {};
    for (let t = 0; t < 3; t++) {
      btn('下書き保存').click(); await sleep(4000);
      d = (await (await fetch(`https://note.com/api/v3/notes/${key}?draft=true&draft_reedit=false`, { credentials: 'include' })).json()).data || {};
      if (!eye || d.eyecatch) break;
    }
    return { key, name: (d.name || '').slice(0, 25), status: d.status, len: (d.body || '').length, figs: ((d.body || '').match(/<figure/g) || []).length, eyecatch: !!d.eyecatch, ph: (d.body || '').includes('@@'), log };
  }

  window.__start = (j, dir) => { window.__res = null; run(j, dir).then(r => window.__res = r).catch(e => window.__res = { err: String(e) }); return 'started'; };
  // 保存後に閉じる（「下書きを保存しました」の閉じるまで押す）
  window.__close = () => { btn('閉じる').click(); setTimeout(() => [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === '閉じる').pop()?.click(), 2000); return 'closing'; };
})();
