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
  genThreadsBtn: $("#genThreadsBtn"),
  genNoteBtn: $("#genNoteBtn"),
  threadsOut: $("#threadsOut"),
  noteOut: $("#noteOut"),
  toast: $("#toast"),
};

/* ---------- ユーティリティ ---------- */
async function api(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "エラーが発生しました");
  return data;
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

els.genNoteBtn.addEventListener("click", async () => {
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

/* ---------- PWA: Service Worker + インストール導線 ---------- */
if ("serviceWorker" in navigator) {
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
