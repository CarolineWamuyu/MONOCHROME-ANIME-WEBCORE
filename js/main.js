/* ==========================================================
   KUROINK — main.js
   Smooth scroll, navigation, forms, guestbook & experiments
   ========================================================== */
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- safe storage (private mode / blocked storage) ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
    }
  };

  /* ---------- icons ---------- */
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 2.2 } });

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
    window.__lenis = lenis;
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  const scrollToTarget = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const offset = isMobile ? -64 : -22;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.2 });
    else {
      const y = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  /* ---------- in-page links ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
    history.replaceState(null, "", id === "#top" ? location.pathname : id);
    if (a.classList.contains("nav-btn")) closeMenu();
    // move focus for keyboard / screen-reader users
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* ---------- mobile menu ---------- */
  const toggle = $(".menu-toggle");
  const navPanel = $("#site-nav");
  function closeMenu() {
    if (!toggle || toggle.getAttribute("aria-expanded") !== "true") return;
    toggle.setAttribute("aria-expanded", "false");
    navPanel.classList.remove("is-open");
    toggle.querySelector("span").textContent = "MENU";
  }
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    navPanel.classList.toggle("is-open", !open);
    toggle.querySelector("span").textContent = open ? "MENU" : "CLOSE";
    if (!open && window.gsap && !reduceMotion) {
      window.gsap.from(".nav-panel .nav-btn", { x: -16, opacity: 0, stagger: 0.03, duration: 0.3, ease: "power2.out" });
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- active nav state ---------- */
  const navLinks = $$(".nav-btn");
  const sectionIds = navLinks.map((a) => a.getAttribute("href"));
  const sections = sectionIds.map((id) => $(id)).filter(Boolean);
  const setActive = (id) => {
    navLinks.forEach((a) => {
      const on = a.getAttribute("href") === id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  };
  // the last section whose top has passed 40% of the viewport wins
  let ticking = false;
  const updateActive = () => {
    ticking = false;
    const line = window.innerHeight * 0.4;
    let current = sectionIds[0];
    sections.forEach((sec) => { if (sec.getBoundingClientRect().top - line <= 0) current = "#" + sec.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sectionIds[sectionIds.length - 1];
    setActive(current);
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateActive); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateActive();

  /* ---------- tactile press feedback on all retro buttons ---------- */
  $$(".nav-btn, .btn-retro, .mini-btn, .filter").forEach((btn) => {
    btn.addEventListener("pointerdown", () => btn.classList.add("is-pressed"));
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, () => btn.classList.remove("is-pressed")));
  });

  /* ---------- clock, counter, dates ---------- */
  const clock = $("#clock");
  const tick = () => {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  tick(); setInterval(tick, 15000);

  const counter = $("#hit-counter");
  if (counter) {
    // A friendly fake hit counter: base number + this browser's visits.
    const visits = store.get("kuroink:visits", 0) + 1;
    store.set("kuroink:visits", visits);
    counter.textContent = String(12846 + visits).padStart(7, "0");
  }
  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  const lastUpdated = $("#last-updated");
  if (lastUpdated) {
    const d = new Date(document.lastModified);
    if (!isNaN(d)) {
      lastUpdated.dateTime = d.toISOString().slice(0, 10);
      lastUpdated.textContent = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
        " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  /* ---------- portfolio filter ---------- */
  const filters = $$(".filter");
  const projects = $$(".project");
  const emptyNote = $(".empty-note");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => { const on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    let shown = 0;
    projects.forEach((p) => {
      const match = f === "all" || p.dataset.cat === f;
      p.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (emptyNote) emptyNote.hidden = shown > 0;
    if (window.gsap && !reduceMotion) {
      window.gsap.fromTo(projects.filter((p) => !p.classList.contains("is-hidden")),
        { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", clearProps: "transform,opacity" });
    }
    window.ScrollTrigger?.refresh();
  }));

  /* ---------- guestbook (stored in this browser) ----------
     To make entries public, POST them to a backend (e.g. a
     Formspree form, Supabase, or a Netlify function) inside
     the submit handler below. */
  const GB_KEY = "kuroink:guestbook";
  const seedEntries = [
    { name: "pixelmoth", site: "https://neocities.org", msg: "your masthead is SO good. the little ドキドキ bubble got me. webring buddies?", stamp: "✿", date: "2026-11-22" },
    { name: "tomo_draws", site: "", msg: "came for the screentone post, stayed for the sticker board. 47 stickers placed, no regrets", stamp: "★", date: "2026-11-15" },
    { name: "riso_rin", site: "", msg: "the Static Bloom posters!!! please sell prints", stamp: "♡", date: "2026-11-03" },
    { name: "oldweb_kai", site: "https://neocities.org", msg: "a hit counter in 2026. respect. ( •̀ ω •́ )✧", stamp: "☾", date: "2026-10-28" }
  ];
  const gbList = $("#gb-entries");
  const gbCount = $("#gb-count");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };
  const fmtDate = (iso) => new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  function renderGuestbook(highlightFirst = false) {
    if (!gbList) return;
    const entries = [...store.get(GB_KEY, []), ...seedEntries];
    gbList.innerHTML = entries.map((e) => {
      const url = safeUrl(e.site);
      return `<li class="gb-entry">
        <span class="gb-entry__stamp" aria-hidden="true">${esc(e.stamp || "★")}</span>
        <div>
          <p class="gb-entry__head"><span class="gb-entry__name">${esc(e.name)}</span>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener nofollow ugc">${esc(new URL(url).hostname)}</a>` : ""}<time class="gb-entry__date" datetime="${esc(e.date)}">${esc(fmtDate(e.date))}</time></p>
          <p class="gb-entry__msg">${esc(e.msg)}</p>
        </div>
      </li>`;
    }).join("");
    if (gbCount) gbCount.textContent = entries.length;
    if (highlightFirst && window.gsap && !reduceMotion) {
      window.gsap.from(gbList.firstElementChild, { scale: 0.9, opacity: 0, duration: 0.5, ease: "back.out(2)" });
    }
  }
  renderGuestbook();

  const gbForm = $("#gb-form");
  const gbMsg = $("#gb-msg");
  const gbChars = $("#gb-chars");
  gbMsg?.addEventListener("input", () => { gbChars.textContent = `${gbMsg.value.length} / 280`; });

  const validate = (form) => {
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const valid = f.value.trim() !== "" && f.checkValidity();
      f.setAttribute("aria-invalid", String(!valid));
      if (!valid && ok) { f.focus(); ok = false; }
    });
    $$('input[type="url"]', form).forEach((f) => {
      if (f.value && !safeUrl(f.value)) { f.setAttribute("aria-invalid", "true"); if (ok) f.focus(); ok = false; }
      else if (!f.required) f.setAttribute("aria-invalid", "false");
    });
    return ok;
  };

  gbForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $("#gb-status");
    if (!validate(gbForm)) { status.textContent = "✗ please fill in your name and a message"; return; }
    const data = new FormData(gbForm);
    const entry = {
      name: data.get("name").trim().slice(0, 32),
      site: (data.get("site") || "").trim(),
      msg: data.get("message").trim().slice(0, 280),
      stamp: data.get("stamp") || "★",
      date: new Date().toISOString().slice(0, 10)
    };
    const saved = store.get(GB_KEY, []);
    saved.unshift(entry);
    store.set(GB_KEY, saved.slice(0, 50));
    renderGuestbook(true);
    gbForm.reset();
    gbChars.textContent = "0 / 280";
    status.textContent = "★ thank you for signing! (saved in this browser)";
  });

  /* ---------- contact form (Formspree-ready) ---------- */
  const ctForm = $("#contact-form");
  ctForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#ct-status");
    if (!validate(ctForm)) { status.textContent = "✗ a few fields still need filling in"; return; }
    if (ctForm.action.includes("YOUR_FORM_ID")) {
      status.textContent = "⚠ form not connected yet: add your Formspree form ID in index.html";
      return;
    }
    const btn = ctForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = "sending… ✉";
    try {
      const res = await fetch(ctForm.action, { method: "POST", body: new FormData(ctForm), headers: { Accept: "application/json" } });
      if (res.ok) { ctForm.reset(); status.textContent = "★ message sent! I'll reply within two days."; }
      else {
        const json = await res.json().catch(() => ({}));
        status.textContent = "✗ " + (json.errors?.map((x) => x.message).join(", ") || "something went wrong, please try again");
      }
    } catch {
      status.textContent = "✗ network error, please email me directly";
    } finally { btn.disabled = false; }
  });

  /* ---------- EXPERIMENT 1: halftone playground ---------- */
  const canvas = $("#halftone-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const size = $("#ht-size"), wave = $("#ht-wave"), invert = $("#ht-invert");
    let mouse = { x: 0.5, y: 0.5 }, t = 0, running = false, visible = false;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const step = +size.value, amp = +wave.value / 100, inv = invert.checked;
      ctx.fillStyle = inv ? "#eaeaea" : "#080808"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = inv ? "#080808" : "#eaeaea";
      const mx = mouse.x * w, my = mouse.y * h;
      for (let y = step / 2, row = 0; y < h; y += step, row++) {
        for (let x = step / 2 + (row % 2 ? step / 2 : 0); x < w; x += step) {
          const d = Math.hypot(x - mx, y - my) / Math.max(w, h);
          const v = 0.5 + 0.5 * Math.sin(d * 18 - t * 2) * amp + (1 - d * 1.6) * 0.35;
          const r = Math.max(0, Math.min(1, v)) * step * 0.52;
          if (r > 0.3) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
        }
      }
    };
    const loop = () => {
      if (!visible) { running = false; return; }
      t += 0.016; draw(); requestAnimationFrame(loop);
    };
    const start = () => { if (!running && visible && !reduceMotion) { running = true; requestAnimationFrame(loop); } };
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      if (reduceMotion) draw();
    });
    [size, wave, invert].forEach((c) => c.addEventListener("input", draw));
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(canvas);
    window.addEventListener("resize", () => { resize(); draw(); });
    resize(); draw();
  }

  /* ---------- EXPERIMENT 2: sticker board ---------- */
  const board = $("#sticker-board");
  if (board) {
    const countEl = $("#sticker-count");
    const hint = board.querySelector(".sticker-board__hint");
    const kinds = [
      () => `<span class="stamp stamp--circle">★</span>`,
      () => `<span class="stamp stamp--text">${["ドン", "!!", "ワオ", "★", "♡"][Math.floor(Math.random() * 5)]}</span>`,
      () => `<span class="stamp stamp--img"><img src="assets/icons/${["pixel-star", "pixel-heart", "pixel-sparkle"][Math.floor(Math.random() * 3)]}.svg" alt=""></span>`,
      () => `<span class="stamp stamp--circle">✿</span>`
    ];
    let count = 0;
    const place = (x, y) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = kinds[Math.floor(Math.random() * kinds.length)]();
      const el = wrap.firstElementChild;
      el.style.left = x + "px"; el.style.top = y + "px";
      board.appendChild(el);
      const rot = Math.random() * 50 - 25;
      if (window.gsap && !reduceMotion) window.gsap.fromTo(el, { scale: 0, rotate: rot - 40 }, { scale: 1, rotate: rot, duration: 0.45, ease: "back.out(3)" });
      else el.style.transform = `rotate(${rot}deg)`;
      count++; countEl.textContent = count; hint.hidden = true;
      // keep it tidy
      const stamps = board.querySelectorAll(".stamp");
      if (stamps.length > 60) stamps[0].remove();
    };
    board.addEventListener("click", (e) => {
      const r = board.getBoundingClientRect();
      place(e.clientX - r.left, e.clientY - r.top);
    });
    board.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        place(Math.random() * board.clientWidth * 0.8 + board.clientWidth * 0.1, Math.random() * board.clientHeight * 0.8 + board.clientHeight * 0.1);
      }
    });
    $("#sticker-clear")?.addEventListener("click", () => {
      board.querySelectorAll(".stamp").forEach((s) => s.remove());
      count = 0; countEl.textContent = 0; hint.hidden = false;
    });
  }

  /* ---------- EXPERIMENT 3: glitch type ---------- */
  const gIn = $("#glitch-input"), gOut = $("#glitch-out");
  if (gIn && gOut) {
    const glyphs = "#@%&*+=/<>?!░▒▓█";
    let timer;
    gIn.addEventListener("input", () => {
      const target = (gIn.value || " ").toUpperCase();
      gOut.dataset.text = target;
      clearInterval(timer);
      if (reduceMotion) { gOut.textContent = target; return; }
      let frame = 0;
      timer = setInterval(() => {
        gOut.textContent = [...target].map((c, i) => (i < frame / 2 ? c : glyphs[Math.floor(Math.random() * glyphs.length)])).join("");
        if (++frame > target.length * 2) { clearInterval(timer); gOut.textContent = target; }
      }, 30);
    });
  }
})();
