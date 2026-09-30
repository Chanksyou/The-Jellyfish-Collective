// Small progressive enhancements. Every feature checks for its own markup
// and leaves the page usable as plain HTML if this file never runs.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Event hero: crossfade through the extra cover shots ────────────────
  // Extra slides carry data-src so they only download once the first
  // photo is up, then swap every few seconds with a slow push-in.
  document.querySelectorAll("[data-hero-slides]").forEach((stage) => {
    const slides = [...stage.querySelectorAll("img")];
    if (slides.length < 2 || reduce) return;
    const load = () =>
      slides.forEach((s) => {
        if (s.dataset.src) {
          s.src = s.dataset.src;
          delete s.dataset.src;
        }
      });
    if (document.readyState === "complete") load();
    else addEventListener("load", load, { once: true });

    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const next = slides[(i + 1) % slides.length];
      if (!next.complete || !next.naturalWidth) return; // not loaded yet
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      next.classList.add("is-active");
    }, 6500);
  });

  // ── Day / night wipe ───────────────────────────────────────────────────
  document.querySelectorAll("[data-daynight]").forEach((fig) => {
    const range = fig.querySelector(".daynight__range");
    const set = (v) => {
      v = Math.max(0, Math.min(100, v));
      fig.style.setProperty("--pos", v + "%");
      range.value = Math.round(v);
    };
    const fromPointer = (e) => {
      const r = fig.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };

    range.addEventListener("input", () => set(+range.value));
    fig.addEventListener("pointerdown", (e) => {
      fig.setPointerCapture(e.pointerId);
      fig.classList.add("is-dragging");
      fromPointer(e);
    });
    fig.addEventListener("pointermove", (e) => {
      if (fig.classList.contains("is-dragging") || e.pointerType === "mouse") fromPointer(e);
    });
    const end = () => fig.classList.remove("is-dragging");
    fig.addEventListener("pointerup", end);
    fig.addEventListener("pointercancel", end);

    // One gentle sweep the first time it scrolls into view, so it reads as
    // something you can grab.
    if (reduce || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const keys = [50, 80, 20, 50];
        let t0 = 0;
        const dur = 2200;
        const step = (t) => {
          if (fig.matches(":hover") || fig.classList.contains("is-dragging")) return;
          const p = Math.min(1, (t - t0) / dur) * (keys.length - 1);
          const k = Math.min(keys.length - 2, Math.floor(p));
          const f = p - k;
          const ease = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2;
          set(keys[k] + (keys[k + 1] - keys[k]) * ease);
          if (p < keys.length - 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame((t) => { t0 = t; step(t); }), 400);
      },
      { threshold: 0.6 },
    );
    io.observe(fig);
  });
})();
