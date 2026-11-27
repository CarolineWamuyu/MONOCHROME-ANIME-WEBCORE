/* ==========================================================
   KUROINK — animations.js (GSAP + ScrollTrigger)
   Subtle on purpose: it should feel like an old homepage
   that happens to be alive, not a product launch.
   ========================================================== */
(() => {
  "use strict";
  const gsap = window.gsap;
  if (!gsap) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ST = window.ScrollTrigger;
  if (ST) gsap.registerPlugin(ST);

  /* ---------- ticker marquee (runs even with reduced motion? no) ---------- */
  const track = document.querySelector(".ticker__track");
  if (track && !reduceMotion) {
    // duplicate content for a seamless loop
    track.innerHTML += track.innerHTML;
    const half = () => track.scrollWidth / 2;
    const marquee = gsap.to(track, {
      x: () => -half(), duration: () => half() / 60, ease: "none", repeat: -1,
      modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % half()) }
    });
    const ticker = document.querySelector(".ticker");
    ticker.addEventListener("mouseenter", () => gsap.to(marquee, { timeScale: 0.2, duration: 0.4 }));
    ticker.addEventListener("mouseleave", () => gsap.to(marquee, { timeScale: 1, duration: 0.4 }));
  }

  if (reduceMotion) return;

  /* ---------- 1. masthead entrance ---------- */
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".masthead", { y: -24, opacity: 0, duration: 0.6 })
    .from(".masthead__title .ch", {
      yPercent: -120, rotate: () => gsap.utils.random(-25, 25), opacity: 0,
      duration: 0.7, stagger: 0.06, ease: "back.out(2.2)"
    }, "-=0.25")
    .from(".masthead__jp", { letterSpacing: "1.6em", opacity: 0, duration: 0.6 }, "-=0.5")
    .from(".masthead__tagline", { scale: 0.6, opacity: 0, duration: 0.45, ease: "back.out(3)" }, "-=0.3")
    .from(".masthead .deco", { scale: 0, opacity: 0, duration: 0.45, stagger: 0.05, ease: "back.out(3)" }, "-=0.4")
    .from(".masthead__topbar > *, .masthead__badges > *", { y: -8, opacity: 0, stagger: 0.05, duration: 0.3 }, "-=0.4")
    .from(".ticker", { scaleX: 0.6, opacity: 0, duration: 0.45 }, "-=0.3")
    /* 2. staggered navigation */
    .from(".nav-panel .panel-label, .nav-list li", { x: -26, opacity: 0, stagger: 0.045, duration: 0.4 }, "-=0.3")
    .from(".side-widgets > *", { x: -20, opacity: 0, stagger: 0.08, duration: 0.4 }, "-=0.35")
    /* 5. welcome panel reveal */
    .from(".welcome", { y: 30, opacity: 0, duration: 0.6 }, "-=0.9")
    .from(".welcome__art", { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power2.inOut" }, "-=0.35")
    .from(".welcome__girl", { y: 60, opacity: 0, duration: 0.8 }, "-=0.35")
    .from(".welcome__text > *", { y: 16, opacity: 0, stagger: 0.07, duration: 0.45 }, "-=0.6")
    .from(".speech", { scale: 0, rotate: -30, duration: 0.4, ease: "back.out(3)" }, "-=0.2")
    .from(".status-box", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3");

  /* ambient loops start once the entrance is done, so they
     never capture a half-animated start value */
  const startLoops = () => {
  /* the star in the title spins now and then */
    gsap.to(".masthead__title .ch--star", { rotate: 360, duration: 1.2, ease: "back.inOut(1.6)", repeat: -1, repeatDelay: 3.5, delay: 1 });
    /* title letters bob very gently */
    gsap.to(".masthead__title .ch:not(.ch--star)", {
      y: -4, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1,
      stagger: { each: 0.12, from: "start" }
    });

    /* ---------- 3. floating anime illustration ---------- */
    gsap.to(".welcome__girl", { y: -10, rotate: 0.6, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".welcome__halo", { rotate: 360, duration: 60, ease: "none", repeat: -1 });
    gsap.to(".speech", { y: -4, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });

    /* ---------- 4. decorative objects drifting ---------- */
    gsap.utils.toArray(".deco--sparkle, .float-deco, .deco--pix").forEach((el, i) => {
      gsap.to(el, {
        y: gsap.utils.random(-10, 10), x: gsap.utils.random(-6, 6),
        rotate: gsap.utils.random(-25, 25), scale: gsap.utils.random(0.85, 1.15),
        duration: gsap.utils.random(2, 3.6), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.2
      });
    });
    gsap.to(".deco--bubble", { rotate: -4, scale: 1.06, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".deco--sfx", { scale: 1.12, duration: 0.5, ease: "steps(2)", yoyo: true, repeat: -1, repeatDelay: 1.2 });
    gsap.to(".deco--ring", { rotate: 360, duration: 40, ease: "none", repeat: -1 });
    gsap.to(".sticker--round", { rotate: -4, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });

  };
  intro.eventCallback("onComplete", startLoops);

  /* mouse parallax on masthead decorations (desktop only) */
  const mast = document.querySelector(".masthead__inner");
  if (mast && window.matchMedia("(pointer: fine)").matches) {
    const decos = gsap.utils.toArray(".masthead .deco");
    const setters = decos.map((d) => ({ x: gsap.quickTo(d, "xPercent", { duration: 0.8 }), y: gsap.quickTo(d, "yPercent", { duration: 0.8 }), k: gsap.utils.random(10, 40) }));
    mast.addEventListener("pointermove", (e) => {
      const r = mast.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      setters.forEach((s) => { s.x(nx * s.k); s.y(ny * s.k); });
    });
  }

  if (!ST) return;

  /* ---------- 6. scroll-triggered content entrances ---------- */
  gsap.utils.toArray(".content > .panel:not(.welcome)").forEach((panel) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: panel, start: "top 88%", once: true } });
    tl.from(panel, { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" })
      .from(panel.querySelector(".section-title"), { x: -20, opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.35")
      .from(panel.querySelector(".divider-dots"), { scaleX: 0, transformOrigin: "left", duration: 0.5, ease: "power2.out" }, "-=0.3");
  });

  const batchIn = (selector, vars = {}) => {
    gsap.set(selector, { opacity: 0, y: 24 });
    ST.batch(selector, {
      start: "top 92%", once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out", overwrite: true, clearProps: "transform", ...vars })
    });
  };
  batchIn(".update");
  batchIn(".project");
  batchIn(".service");
  batchIn(".lab-item");
  batchIn(".ex-box");
  batchIn(".post");
  batchIn(".link-box");
  batchIn(".id-card");
  batchIn(".badge88", { stagger: 0.04 });

  /* skill meters fill up */
  gsap.utils.toArray(".meter i").forEach((bar) => {
    gsap.from(bar, { scaleX: 0, duration: 1, ease: "steps(12)", scrollTrigger: { trigger: bar, start: "top 92%", once: true } });
  });

  /* portrait pops in like a sticker */
  gsap.from(".portrait-frame", {
    scale: 0.85, rotate: -6, opacity: 0, duration: 0.7, ease: "back.out(2)",
    scrollTrigger: { trigger: ".portrait-frame", start: "top 85%", once: true }
  });
  gsap.from(".mail-stamp", {
    scale: 1.6, rotate: 20, opacity: 0, duration: 0.5, ease: "power4.in",
    scrollTrigger: { trigger: ".mail-stamp", start: "top 90%", once: true }
  });

  /* ---------- 7. project image hover ---------- */
  document.querySelectorAll(".project").forEach((card) => {
    const img = card.querySelector(".project__img img");
    const link = card.querySelector(".project__link");
    card.addEventListener("mouseenter", () => {
      gsap.to(img, { scale: 1.06, rotate: 0.6, duration: 0.6, ease: "power2.out" });
      gsap.to(link, { x: 4, duration: 0.3, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(img, { scale: 1, rotate: 0, duration: 0.6, ease: "power2.out" });
      gsap.to(link, { x: 0, duration: 0.3, ease: "power2.out" });
    });
  });

  /* ---------- 8. smooth section transitions: halo parallax ---------- */
  gsap.to(".welcome__art", {
    backgroundPositionY: "40px", ease: "none",
    scrollTrigger: { trigger: ".welcome", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".checker", { backgroundPositionX: "+=56px", duration: 4, ease: "none", repeat: -1 });
  gsap.to(".lab-orb__ball", { rotate: 360, duration: 30, ease: "none", repeat: -1 });
  gsap.to(".lab-speed__sfx", { scale: 1.1, duration: 0.25, yoyo: true, repeat: -1, repeatDelay: 1.5, ease: "power2.out" });

  /* ---------- 10. interactive button feedback (squish) ---------- */
  document.querySelectorAll(".btn-retro, .nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      gsap.fromTo(btn, { scaleX: 1.06, scaleY: 0.92 }, { scaleX: 1, scaleY: 1, duration: 0.45, ease: "elastic.out(1.2, 0.4)", clearProps: "transform" });
    });
  });

  /* refresh positions once fonts & images settle */
  window.addEventListener("load", () => ST.refresh());
  document.fonts?.ready.then(() => ST.refresh());
})();
