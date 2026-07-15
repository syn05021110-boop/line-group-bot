/* 副業ドラフト — フロントエンド */

const state = {
  sessionId: null,
  profile: null,
};

/* ---------- DOM ---------- */
const $ = (sel) => document.querySelector(sel);

const els = {
  startBtn: $("#startBtn"),
  intro: $("#intro"),
  chat: $("#chat"),
  messages: $("#messages"),
  answerForm: $("#answerForm"),
  answerInput: $("#answerInput"),
  sendBtn: $("#sendBtn"),
  strengths: $("#strengths"),
  toGenerateBtn: $("#toGenerateBtn"),
  themeInput: $("#themeInput"),
  genProfilesBtn: $("#genProfilesBtn"),
  genCalBtn: $("#genCalBtn"),
  genThreadsBtn: $("#genThreadsBtn"),
  genXBtn: $("#genXBtn"),
  genInstaBtn: $("#genInstaBtn"),
  genTikTokBtn: $("#genTikTokBtn"),
  genNoteBtn: $("#genNoteBtn"),
  genPaidBtn: $("#genPaidBtn"),
  profilesOut: $("#profilesOut"),
  calOut: $("#calOut"),
  threadsOut: $("#threadsOut"),
  xOut: $("#xOut"),
  instaOut: $("#instaOut"),
  tiktokOut: $("#tiktokOut"),
  noteOut: $("#noteOut"),
  paidOut: $("#paidOut"),
  toast: $("#toast"),
};

/* ---------- ユーティリティ ---------- */
async function api(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-unlock-token": unlockToken() },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || "エラーが発生しました");
    err.locked = res.status === 402 || data.locked;
    throw err;
  }
  return data;
}

/* ---------- 有料解放（アクセスコード） ---------- */
const LOCKED_IDS = [
  "genProfilesBtn",
  "genCalBtn",
  "genXBtn",
  "genInstaBtn",
  "genTikTokBtn",
  "genNoteBtn",
  "genPaidBtn",
];
function isUnlocked() {
  return !!localStorage.getItem("unlockToken");
}
function unlockToken() {
  return localStorage.getItem("unlockToken") || "";
}
function applyLockUI() {
  const locked = !isUnlocked();
  LOCKED_IDS.forEach((id) => {
    const b = document.getElementById(id);
    if (!b) return;
    if (b.getAttribute("data-label") === null || b.getAttribute("data-label") === undefined) {
      b.setAttribute("data-label", b.textContent.trim());
    }
    const base = b.getAttribute("data-label");
    b.textContent = locked ? base + " 🔒" : base;
    b.classList.toggle("is-locked", locked);
  });
  const hint = document.querySelector(".plan-hint");
  if (hint) hint.textContent = locked
    ? "🔒付きは有料プラン。まずは Threads で味見できます。"
    : "✓ 有料プラン解放済み。すべての機能が使えます。";
}
function openUpgrade() {
  const m = document.getElementById("upgradeModal");
  if (m) m.classList.remove("hidden");
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function setStep(n) {
  document.querySelectorAll(".step").forEach((el) => {
    const s = Number(el.dataset.step);
    el.classList.toggle("is-active", s === n);
    el.classList.toggle("is-done", s < n);
  });
  $("#panel-hearing").classList.toggle("is-active", n === 1);
  $("#panel-strengths").classList.toggle("is-active", n === 2);
  $("#panel-generate").classList.toggle("is-active", n === 3);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  els.messages.appendChild(div);
  els.messages.scrollTop = els.messages.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "msg ai typing";
  div.textContent = "考え中…";
  els.messages.appendChild(div);
  els.messages.scrollTop = els.messages.scrollHeight;
  return div;
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    toast("コピーしました");
    if (btn) {
      const old = btn.textContent;
      btn.textContent = "コピー済み ✓";
      setTimeout(() => (btn.textContent = old), 1500);
    }
  } catch {
    toast("コピーに失敗しました");
  }
}

/* ---------- STEP1: ヒヤリング ---------- */
els.startBtn.addEventListener("click", async () => {
  els.startBtn.disabled = true;
  els.intro.classList.add("hidden");
  els.chat.classList.remove("hidden");
  const typing = showTyping();
  try {
    const data = await api("/api/hearing/start");
    state.sessionId = data.sessionId;
    typing.remove();
    addMessage(data.reply, "ai");
    els.answerInput.focus();
  } catch (err) {
    typing.remove();
    addMessage("開始に失敗しました: " + err.message, "ai");
    els.startBtn.disabled = false;
  }
});

els.answerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const answer = els.answerInput.value.trim();
  if (!answer) return;

  addMessage(answer, "user");
  els.answerInput.value = "";
  els.sendBtn.disabled = true;
  const typing = showTyping();

  try {
    const data = await api("/api/hearing/message", {
      sessionId: state.sessionId,
      answer,
    });
    typing.remove();
    addMessage(data.reply, "ai");

    if (data.done && data.profile) {
      state.profile = data.profile;
      renderStrengths(data.profile);
      setTimeout(() => setStep(2), 900);
    }
  } catch (err) {
    typing.remove();
    addMessage("エラー: " + err.message, "ai");
  } finally {
    els.sendBtn.disabled = false;
    els.answerInput.focus();
  }
});

// Enterで送信 / Shift+Enterで改行
els.answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    els.answerForm.requestSubmit();
  }
});

/* ---------- STEP2: 強み棚卸し ---------- */
function renderStrengths(p) {
  const strengths = (p.strengths || [])
    .map(
      (s) => `<div class="card">
        <h4>${esc(s.title)}</h4>
        <p>${esc(s.why)}</p>
        <p class="label">根拠: ${esc(s.evidence)}</p>
      </div>`
    )
    .join("");

  const sellable = (p.sellable || [])
    .map(
      (s) => `<div class="card">
        <h4>${esc(s.product_idea)}</h4>
        <p><span class="label">ターゲット:</span> ${esc(s.target)}</p>
        <p><span class="label">収益化:</span> ${esc(s.monetization)}</p>
        <p><span class="label">向いている媒体:</span> ${esc(s.format || "")}</p>
      </div>`
    )
    .join("");

  const themes = (p.themes || [])
    .map((t) => `<span class="chip">${esc(t)}</span>`)
    .join("");

  const catch_ = p.catchcopy
    ? `<div class="kicker">あなたのキャッチコピー</div><div class="catchcopy">${esc(p.catchcopy)}</div>`
    : "<h2>あなたの強み棚卸し</h2>";

  els.strengths.innerHTML = `
    <div class="summary-card">
      ${catch_}
      <p>${esc(p.summary)}</p>
      <p class="label">主なターゲット: ${esc(p.audience || "")}</p>
    </div>
    <div class="section-title">💪 あなたの強み</div>
    ${strengths}
    <div class="section-title">💰 売れる / 活かせるもの</div>
    ${sellable}
    <div class="section-title">📝 発信テーマ案</div>
    <div class="chips">${themes}</div>
  `;
}

els.toGenerateBtn.addEventListener("click", () => setStep(3));

/* ---------- STEP3: 生成 ---------- */
els.genThreadsBtn.addEventListener("click", async () => {
  const theme = els.themeInput.value.trim();
  els.genThreadsBtn.disabled = true;
  els.threadsOut.innerHTML = loading("Threads 投稿文を生成中…");
  try {
    const data = await api("/api/generate/threads", {
      sessionId: state.sessionId,
      theme,
    });
    renderThreads(data);
  } catch (err) {
    els.threadsOut.innerHTML = `<p class="label">エラー: ${esc(err.message)}</p>`;
  } finally {
    els.genThreadsBtn.disabled = false;
  }
});

els.genXBtn.addEventListener("click", async () => {
  if (!isUnlocked()) {
    openUpgrade();
    return;
  }
  const theme = els.themeInput.value.trim();
  els.genXBtn.disabled = true;
  els.xOut.innerHTML = loading("X 投稿文を生成中…");
  try {
    const data = await api("/api/generate/x", { sessionId: state.sessionId, theme });
    renderX(data);
  } catch (err) {
    els.xOut.innerHTML = `<p class="label">エラー: ${esc(err.message)}</p>`;
  } finally {
    els.genXBtn.disabled = false;
  }
});

els.genNoteBtn.addEventListener("click", async () => {
  if (!isUnlocked()) {
    openUpgrade();
    return;
  }
  const theme = els.themeInput.value.trim();
  els.genNoteBtn.disabled = true;
  els.noteOut.innerHTML = loading("note 下書きを生成中…（少し時間がかかります）");
  try {
    const data = await api("/api/generate/note", {
      sessionId: state.sessionId,
      theme,
    });
    renderNote(data.note);
  } catch (err) {
    els.noteOut.innerHTML = `<p class="label">エラー: ${esc(err.message)}</p>`;
  } finally {
    els.genNoteBtn.disabled = false;
  }
});

// 生成ボタンの共通配線
function wireGen(btn, outEl, path, label, renderFn) {
  btn.addEventListener("click", async () => {
    if (!isUnlocked()) {
      openUpgrade();
      return;
    }
    const theme = els.themeInput.value.trim();
    btn.disabled = true;
    outEl.innerHTML = loading(label + "を生成中…");
    try {
      const data = await api(path, { sessionId: state.sessionId, theme });
      renderFn(data);
    } catch (err) {
      outEl.innerHTML = `<p class="label">エラー: ${esc(err.message)}</p>`;
    } finally {
      btn.disabled = false;
    }
  });
}
wireGen(els.genProfilesBtn, els.profilesOut, "/api/generate/profiles", "プロフィール一括", renderProfiles);
wireGen(els.genCalBtn, els.calOut, "/api/generate/calendar", "1週間カレンダー", renderCalendar);
wireGen(els.genInstaBtn, els.instaOut, "/api/generate/instagram", "Instagram投稿", renderInstagram);
wireGen(els.genTikTokBtn, els.tiktokOut, "/api/generate/tiktok", "TikTok台本", renderTikTok);
wireGen(els.genPaidBtn, els.paidOut, "/api/generate/paidnote", "有料note構成案", renderPaidNote);

function renderProfiles(p) {
  if (!p || (!p.headline && !p.threads)) {
    els.profilesOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }
  const rows = [
    ["共通キャッチ", p.headline],
    ["Threads", p.threads],
    ["X（旧Twitter）", p.x],
    ["Instagram", p.instagram],
    ["note", p.note],
  ]
    .filter((r) => r[1])
    .map(
      (r, i) => `<div class="post-card">
        <div class="theme">${esc(r[0])}</div>
        <div class="post-body">${esc(r[1])}</div>
        <div class="card-actions"><button class="btn btn-ghost" data-prof="${i}">コピー</button></div>
        <textarea class="hidden" id="prof-${i}">${esc(r[1])}</textarea>
      </div>`
    )
    .join("");
  els.profilesOut.innerHTML = `<div class="section-title">👤 プロフィール一括（全SNS）</div>${rows}`;
  els.profilesOut.querySelectorAll("[data-prof]").forEach((btn) => {
    btn.addEventListener("click", () => copyText($(`#prof-${btn.dataset.prof}`).value, btn));
  });
}

function renderTikTok(data) {
  const scripts = (data && data.scripts) || [];
  if (!scripts.length) {
    els.tiktokOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }
  const cards = scripts
    .map((s, i) => {
      const scenes = (s.scenes || [])
        .map(
          (sc, j) => `<div class="post-body" style="margin-bottom:8px">
            <span class="label">シーン${j + 1}</span><br />
            <b>テロップ:</b> ${esc(sc.telop || "")}<br />
            <b>セリフ:</b> ${esc(sc.serif || "")}
          </div>`
        )
        .join("");
      const tags = (s.hashtags || []).join(" ");
      const full = buildTikTokCopy(s);
      return `<div class="post-card">
        <div class="theme">${esc(s.theme || "台本 " + (i + 1))}｜${esc(s.duration || "")}</div>
        <p><span class="label">フック:</span> ${esc(s.hook || "")}</p>
        ${scenes}
        <p><span class="label">CTA:</span> ${esc(s.cta || "")}</p>
        <p><span class="label">キャプション:</span> ${esc(s.caption || "")} ${esc(tags)}</p>
        <div class="card-actions"><button class="btn btn-ghost" data-tt="${i}">台本をコピー</button></div>
        <textarea class="hidden" id="tt-${i}">${esc(full)}</textarea>
      </div>`;
    })
    .join("");
  els.tiktokOut.innerHTML = `<div class="section-title">🎬 TikTok / ショート動画 台本（${scripts.length}件）</div>${cards}`;
  els.tiktokOut.querySelectorAll("[data-tt]").forEach((btn) => {
    btn.addEventListener("click", () => copyText($(`#tt-${btn.dataset.tt}`).value, btn));
  });
}

function buildTikTokCopy(s) {
  const lines = [`【${s.theme || "台本"}】(${s.duration || ""})`, `フック: ${s.hook || ""}`, ""];
  (s.scenes || []).forEach((sc, j) => {
    lines.push(`シーン${j + 1}`);
    lines.push(`  テロップ: ${sc.telop || ""}`);
    lines.push(`  セリフ: ${sc.serif || ""}`);
  });
  lines.push("", `CTA: ${s.cta || ""}`);
  lines.push("", `キャプション: ${s.caption || ""} ${(s.hashtags || []).join(" ")}`);
  return lines.join("\n");
}

function renderCalendar(data) {
  const days = (data && data.days) || [];
  if (!days.length) {
    els.calOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }
  const rows = days
    .map(
      (d) => `<div class="card">
        <h4>${esc(d.day)}｜${esc(d.platform)}</h4>
        <p><span class="label">テーマ:</span> ${esc(d.theme)}</p>
        <p>${esc(d.idea)}</p>
      </div>`
    )
    .join("");
  const tip = data.tip
    ? `<p class="hint" style="padding:10px 2px 0">💡 ${esc(data.tip)}</p>`
    : "";
  els.calOut.innerHTML = `<div class="section-title">📅 1週間 投稿カレンダー</div>${rows}${tip}`;
}

function renderInstagram(data) {
  const posts = (data && data.posts) || [];
  const carousel = data && data.carousel;
  if (!posts.length && !carousel) {
    els.instaOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }
  const cards = posts
    .map((p, i) => {
      const tags = (p.hashtags || []).join(" ");
      const full = [p.caption, tags].filter(Boolean).join("\n\n");
      return `<div class="post-card">
        <div class="theme">${esc(p.theme || "投稿案 " + (i + 1))}</div>
        <div class="post-body">${esc(full)}</div>
        <div class="card-actions">
          <button class="btn btn-ghost" data-igcopy="${i}">キャプションをコピー</button>
        </div>
        <textarea class="hidden" id="igpost-${i}">${esc(full)}</textarea>
      </div>`;
    })
    .join("");
  let carouselCard = "";
  if (carousel && (carousel.slides || []).length) {
    const slides = carousel.slides
      .map(
        (s, i) =>
          `<div class="post-body" style="margin-bottom:8px"><span class="label">スライド${i + 1}</span><br />${esc(s)}</div>`
      )
      .join("");
    carouselCard = `<div class="section-title">🖼 カルーセル構成案</div>
      <div class="post-card"><div class="theme">${esc(carousel.topic || "カルーセル")}</div>${slides}</div>`;
  }
  els.instaOut.innerHTML =
    `<div class="section-title">📸 Instagram 投稿案（${posts.length}件）</div>` + cards + carouselCard;
  els.instaOut.querySelectorAll("[data-igcopy]").forEach((btn) => {
    btn.addEventListener("click", () => copyText($(`#igpost-${btn.dataset.igcopy}`).value, btn));
  });
}

function renderPaidNote(n) {
  if (!n || !n.outline) {
    els.paidOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }
  const titles = (n.titles || []).map((t) => `<li>${esc(t)}</li>`).join("");
  const outline = (n.outline || [])
    .map(
      (o, i) => `<div class="card"><h4>${i + 1}. ${esc(o.heading)}</h4><p>${esc(o.detail)}</p></div>`
    )
    .join("");
  const full = buildPaidCopy(n);
  els.paidOut.innerHTML = `
    <div class="section-title">💎 有料note 構成案</div>
    <div class="note-card">
      <div class="theme">タイトル案</div>
      <ul class="title-list">${titles}</ul>
      <p><span class="label">価格の目安:</span> ${esc(n.price_hint || "")}</p>
      <p><span class="label">無料パート:</span> ${esc(n.free_part || "")}</p>
      <div class="theme" style="margin-top:14px">章立て</div>
      ${outline}
      <p style="margin-top:14px"><span class="label">有料ライン:</span> ${esc(n.paywall || "")}</p>
      <p><span class="label">販売CTA:</span> ${esc(n.cta || "")}</p>
      <div class="card-actions">
        <button class="btn btn-ghost" id="copyPaidBtn">構成をコピー</button>
      </div>
      <textarea class="hidden" id="paidFull">${esc(full)}</textarea>
    </div>`;
  $("#copyPaidBtn").addEventListener("click", (e) => copyText($("#paidFull").value, e.target));
}

function buildPaidCopy(n) {
  const lines = ["【タイトル案】"];
  (n.titles || []).forEach((t) => lines.push("・" + t));
  lines.push("", "【価格の目安】" + (n.price_hint || ""));
  lines.push("", "【無料パート】" + (n.free_part || ""));
  lines.push("", "【章立て】");
  (n.outline || []).forEach((o, i) => lines.push(`${i + 1}. ${o.heading}\n   ${o.detail}`));
  lines.push("", "【有料ライン】" + (n.paywall || ""));
  lines.push("", "【販売CTA】" + (n.cta || ""));
  return lines.join("\n");
}

function renderThreads(data) {
  const posts = (data && data.posts) || [];
  const bio = (data && data.bio) || "";
  if (!posts.length && !bio) {
    els.threadsOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }

  const bioCard = bio
    ? `<div class="section-title">📌 プロフィール文（bio）案</div>
       <div class="bio-card">
         <div class="theme">Threadsプロフィール</div>
         <div class="post-body">${esc(bio)}</div>
         <div class="card-actions">
           <button class="btn btn-ghost" id="copyBioBtn">コピー</button>
         </div>
         <textarea class="hidden" id="bioText">${esc(bio)}</textarea>
       </div>`
    : "";

  els.threadsOut.innerHTML =
    bioCard +
    `<div class="section-title">✏️ Threads 投稿案（${posts.length}件）</div>` +
    posts
      .map((post, i) => {
        const tags = (post.hashtags || []).join(" ");
        const full = [post.body, tags].filter(Boolean).join("\n\n");
        const intent = `https://www.threads.net/intent/post?text=${encodeURIComponent(full)}`;
        return `<div class="post-card">
          <div class="theme">${esc(post.theme || "投稿案 " + (i + 1))}</div>
          <div class="post-body">${esc(full)}</div>
          <div class="card-actions">
            <button class="btn btn-ghost" data-copy="${i}">本文をコピー</button>
            <a class="btn btn-ghost" href="${intent}" target="_blank" rel="noopener">Threadsで開く</a>
          </div>
          <textarea class="hidden" id="tpost-${i}">${esc(full)}</textarea>
        </div>`;
      })
      .join("");

  els.threadsOut.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = btn.dataset.copy;
      copyText($(`#tpost-${i}`).value, btn);
    });
  });
  const bioBtn = $("#copyBioBtn");
  if (bioBtn) bioBtn.addEventListener("click", () => copyText($("#bioText").value, bioBtn));
}

function renderX(data) {
  const posts = (data && data.posts) || [];
  const thread = data && data.thread;
  if (!posts.length && !thread) {
    els.xOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }

  const xIntent = (t) => `https://x.com/intent/post?text=${encodeURIComponent(t)}`;

  const single = posts
    .map((post, i) => {
      const tags = (post.hashtags || []).join(" ");
      const full = [post.body, tags].filter(Boolean).join(" ");
      return `<div class="post-card">
        <div class="theme">${esc(post.theme || "投稿案 " + (i + 1))}</div>
        <div class="post-body">${esc(full)}</div>
        <div class="card-actions">
          <button class="btn btn-ghost" data-xcopy="${i}">コピー</button>
          <a class="btn btn-ghost" href="${xIntent(full)}" target="_blank" rel="noopener">Xで開く</a>
        </div>
        <textarea class="hidden" id="xpost-${i}">${esc(full)}</textarea>
      </div>`;
    })
    .join("");

  let threadCard = "";
  if (thread && (thread.tweets || []).length) {
    const tweets = thread.tweets
      .map(
        (tw, i) => `<div class="post-body" style="margin-bottom:8px">
          <span class="label">${i + 1}/${thread.tweets.length}</span><br />${esc(tw)}
          <div class="card-actions" style="margin-top:8px">
            <button class="btn btn-ghost" data-xtw="${i}">この1本をコピー</button>
            <a class="btn btn-ghost" href="${xIntent(tw)}" target="_blank" rel="noopener">Xで開く</a>
          </div>
          <textarea class="hidden" id="xtw-${i}">${esc(tw)}</textarea>
        </div>`
      )
      .join("");
    threadCard = `<div class="section-title">🧵 連投スレッド案</div>
      <div class="post-card">
        <div class="theme">${esc(thread.topic || "スレッド")}</div>
        ${tweets}
      </div>`;
  }

  els.xOut.innerHTML =
    `<div class="section-title">𝕏 X（旧Twitter）単発投稿案（${posts.length}件）</div>` +
    single +
    threadCard;

  els.xOut.querySelectorAll("[data-xcopy]").forEach((btn) => {
    btn.addEventListener("click", () => copyText($(`#xpost-${btn.dataset.xcopy}`).value, btn));
  });
  els.xOut.querySelectorAll("[data-xtw]").forEach((btn) => {
    btn.addEventListener("click", () => copyText($(`#xtw-${btn.dataset.xtw}`).value, btn));
  });
}

function renderNote(note) {
  if (!note || !note.draft) {
    els.noteOut.innerHTML = `<p class="label">生成できませんでした。もう一度お試しください。</p>`;
    return;
  }
  const titles = (note.titles || []).map((t) => `<li>${esc(t)}</li>`).join("");
  const fullForCopy = buildNoteCopy(note);

  els.noteOut.innerHTML = `
    <div class="section-title">note 下書き</div>
    <div class="note-card">
      <div class="theme">タイトル案</div>
      <ul class="title-list">${titles}</ul>
      <div class="theme">本文（下書き）</div>
      <div class="note-draft">${esc(note.draft)}</div>
      <div class="card-actions">
        <button class="btn btn-ghost" id="copyNoteBtn">本文をコピー</button>
        <a class="btn btn-ghost" href="https://note.com/notes/new" target="_blank" rel="noopener">noteの新規作成を開く</a>
      </div>
      <textarea class="hidden" id="noteFull">${esc(fullForCopy)}</textarea>
    </div>
    <p class="hint" style="padding:8px 2px 0">
      ※ noteは自動投稿に対応していないため、「コピー → note新規作成に貼り付け」で公開してください。
    </p>
  `;
  $("#copyNoteBtn").addEventListener("click", (e) =>
    copyText($("#noteFull").value, e.target)
  );
}

function buildNoteCopy(note) {
  const parts = [];
  if (note.draft) parts.push(note.draft);
  if (note.cta) parts.push("\n" + note.cta);
  return parts.join("\n");
}

/* ---------- helpers ---------- */
function loading(msg) {
  return `<div class="loading">${esc(msg)}</div>`;
}

/* ---------- 投稿ガイド モーダル ---------- */
(function guideModal() {
  const modal = document.getElementById("guideModal");
  if (!modal) return;
  const open = () => modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");
  ["guideBtn", "guideBtn2"].forEach((id) => {
    const b = document.getElementById(id);
    if (b) b.addEventListener("click", open);
  });
  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* ---------- 有料プラン（解放）モーダル ---------- */
(function upgradeModal() {
  const modal = document.getElementById("upgradeModal");
  if (!modal) return;
  modal.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", () => modal.classList.add("hidden"))
  );
  const form = document.getElementById("unlockForm");
  const msg = document.getElementById("unlockMsg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("unlockCode").value.trim();
    if (!code) return;
    msg.textContent = "確認中…";
    try {
      const data = await api("/api/unlock", { code });
      localStorage.setItem("unlockToken", data.token);
      applyLockUI();
      modal.classList.add("hidden");
      msg.textContent = "";
      toast("解放しました🔓 全機能が使えます");
    } catch (err) {
      msg.textContent = "❌ " + err.message;
    }
  });
})();
applyLockUI();

/* ---------- オープニング（スプラッシュ）を閉じる ---------- */
(function splashFlow() {
  const el = document.getElementById("splash");
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let closed = false;
  const hide = () => {
    if (closed) return;
    closed = true;
    el.classList.add("hide");
    setTimeout(() => el.remove(), 650);
  };
  // 演出が終わったら自動で本編へ（タップでスキップ可）
  setTimeout(hide, reduce ? 300 : 3000);
  el.addEventListener("click", hide);
})();

/* ---------- PWA: Service Worker + インストール導線 ---------- */
if ("serviceWorker" in navigator) {
  // 新しいServiceWorkerが有効化されたら、一度だけ自動リロードして最新表示に切り替える
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW 登録失敗:", err);
    });
  });
}

(function installFlow() {
  const banner = $("#installBanner");
  const btn = $("#installBtn");
  const closeBtn = $("#installClose");
  const text = $("#installText");
  if (!banner) return;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (isStandalone || localStorage.getItem("installDismissed")) return;

  const dismiss = () => {
    banner.classList.add("hidden");
    localStorage.setItem("installDismissed", "1");
  };
  closeBtn.addEventListener("click", dismiss);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isIOS) {
    // iOS は beforeinstallprompt が無いので手順を案内
    text.textContent = "共有ボタン →「ホーム画面に追加」でアプリのように使えます";
    btn.classList.add("hidden");
    banner.classList.remove("hidden");
    return;
  }

  // Android/Chrome など: ネイティブのインストールプロンプトを利用
  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    banner.classList.remove("hidden");
  });
  btn.addEventListener("click", async () => {
    if (!deferred) return dismiss();
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    dismiss();
  });
  window.addEventListener("appinstalled", dismiss);
})();
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
