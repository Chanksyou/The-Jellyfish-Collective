// Gallery "drift" view: photos rise slowly through a dark stage like
// jellyfish, bobbing and swaying, with nearer ones larger, sharper and
// faster. Moving the pointer tilts the whole scene a little (parallax).
// Photos that float off the top are recycled with the next ones in line,
// so every photo in the current filter eventually passes through.
//
// The real content is still the grid of links in .photo-grid--wall; this
// view only borrows its thumbnails, and clicking a floater opens the same
// lightbox on the matching grid photo.
(() => {
  const stage = document.querySelector("[data-drift]");
  const grid = document.querySelector(".photo-grid--wall");
  if (!stage || !grid) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layer = stage.querySelector(".drift__layer");
  const pool = () => [...grid.querySelectorAll(".photo-grid__item")].filter((a) => !a.hidden);

  let W = 0, H = 0, floaters = [], cursor = 0, lanes = [], laneIdx = 0;
  let mx = 0, my = 0, tx = 0, ty = 0, running = false, last = 0, visible = false;

  const count = () => (W < 640 ? 9 : W < 1100 ? 13 : 17);

  const measure = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    // Lanes spread floaters across the width so they don't clump.
    const n = Math.max(3, Math.round(W / (W < 640 ? 120 : 170)));
    lanes = Array.from({ length: n }, (_, i) => (i + 0.5) / n);
    lanes.sort(() => Math.random() - 0.5);
  };

  const spawn = (y0) => {
    const list = pool();
    if (!list.length) return null;
    const a = list[cursor++ % list.length];
    const img = a.querySelector("img");
    const r = (+img.getAttribute("width") || 4) / (+img.getAttribute("height") || 3);
    const z = 0.3 + Math.random() * 0.7; // depth: 0.3 far … 1 near
    let w = (W < 640 ? 118 : 200) * (0.5 + z * 0.8);
    if (r < 1) w *= 0.82;
    const h = w / r;

    const el = document.createElement("button");
    el.type = "button";
    el.className = "drift__item";
    el.setAttribute("aria-label", "Open photo: " + img.alt);
    el.style.width = w + "px";
    el.style.zIndex = String(Math.round(z * 100));
    if (z < 0.55) el.style.setProperty("--blur", ((0.55 - z) * 7).toFixed(1) + "px");
    el.style.setProperty("--dim", (0.55 + z * 0.45).toFixed(2));
    const tag = a.querySelector(".photo-grid__tag");
    el.innerHTML = `<img src="${img.getAttribute("src")}" alt="" draggable="false">` +
      (tag ? `<span class="drift__tag">${tag.textContent}</span>` : "");
    layer.appendChild(el);

    const lane = lanes[laneIdx++ % lanes.length];
    const f = {
      el, a, z, w, h,
      x: lane * W - w / 2 + (Math.random() - 0.5) * 60,
      y: y0,
      speed: (reduce ? 0 : 1) * (9 + Math.random() * 8) * (0.4 + z),
      phase: Math.random() * Math.PI * 2,
      sway: reduce ? 0 : 8 + Math.random() * 18,
      tilt: reduce ? 0 : (Math.random() - 0.5) * 7,
      hover: false,
    };
    el.addEventListener("pointerenter", () => (f.hover = true));
    el.addEventListener("pointerleave", () => (f.hover = false));
    el.addEventListener("focus", () => (f.hover = true));
    el.addEventListener("blur", () => (f.hover = false));
    el.addEventListener("click", () => {
      const list = pool();
      if (window.JellyLightbox) window.JellyLightbox.open(list, Math.max(0, list.indexOf(a)));
      else location.href = a.href;
    });
    return f;
  };

  const fill = () => {
    floaters.forEach((f) => f.el.remove());
    floaters = [];
    cursor = 0;
    laneIdx = 0;
    measure();
    const n = Math.min(count(), pool().length); // never show a photo twice at once
    for (let i = 0; i < n; i++) {
      // Start spread through the stage (and a little below) so it's full now.
      const f = spawn((i / n) * (H + 160) - 40 + Math.random() * 60);
      if (f) floaters.push(f);
    }
    place(performance.now());
  };

  const place = (t) => {
    for (const f of floaters) {
      const s = t / 1000;
      const x = f.x + Math.sin(s * 0.45 + f.phase) * f.sway + tx * f.z * 34;
      const y = f.y + Math.sin(s * 0.8 + f.phase) * 6 + ty * f.z * 22;
      const rot = Math.sin(s * 0.35 + f.phase) * f.tilt;
      f.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    }
  };

  const tick = (t) => {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    tx += (mx - tx) * 0.05;
    ty += (my - ty) * 0.05;
    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      if (!f.hover) f.y -= f.speed * dt;
      if (f.y + f.h < -60) {
        f.el.remove();
        const nf = spawn(H + 20 + Math.random() * 80);
        if (nf) floaters[i] = nf;
      }
    }
    place(t);
    requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || reduce || !visible || stage.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  };
  const stop = () => (running = false);

  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5;
    my = (e.clientY - r.top) / r.height - 0.5;
  });
  stage.addEventListener("pointerleave", () => (mx = my = 0));

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? start() : stop();
  }).observe(stage);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => stage.hidden || fill(), 200);
  });

  // Called by the gallery page when the view or filter changes.
  window.JellyDrift = {
    refresh() {
      if (stage.hidden) return stop();
      fill();
      start();
    },
  };
  if (!stage.hidden) fill();
})();
