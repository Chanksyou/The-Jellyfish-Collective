// Gallery "drift" view: the photos laid out in tidy columns that scroll
// slowly and endlessly, neighbouring columns moving in opposite directions
// like currents. Nothing overlaps, nothing is blurred, every photo keeps its
// own shape. Hovering a column pauses it; clicking a photo opens it in the
// lightbox.
//
// The real content is still the grid of links in .photo-grid--wall; this
// view only borrows its thumbnails, and clicking a photo here opens the same
// lightbox on the matching grid photo.
(() => {
  const stage = document.querySelector("[data-drift]");
  const grid = document.querySelector(".photo-grid--wall");
  if (!stage || !grid) return;

  const layer = stage.querySelector(".drift__layer");
  const pool = () => [...grid.querySelectorAll(".photo-grid__item")].filter((a) => !a.hidden);
  const GAP = 12;

  const columnsFor = (w) => (w < 560 ? 2 : w < 900 ? 3 : w < 1300 ? 4 : 5);

  const tile = (a) => {
    const img = a.querySelector("img");
    const el = document.createElement("button");
    el.type = "button";
    el.className = "drift__item";
    el.setAttribute("aria-label", "Open photo: " + img.alt);
    const tag = a.querySelector(".photo-grid__tag");
    el.innerHTML =
      `<img src="${img.getAttribute("src")}" alt="" draggable="false" ` +
      `width="${img.getAttribute("width")}" height="${img.getAttribute("height")}">` +
      (tag ? `<span class="drift__tag">${tag.textContent}</span>` : "");
    el.addEventListener("click", () => {
      const list = pool();
      if (window.JellyLightbox) window.JellyLightbox.open(list, Math.max(0, list.indexOf(a)));
      else location.href = a.href;
    });
    return el;
  };

  const build = () => {
    layer.textContent = "";
    const list = pool();
    if (!list.length) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const n = Math.min(columnsFor(W), list.length);
    const colW = (W - GAP * (n + 1)) / n;
    layer.style.setProperty("--cols", n);
    layer.style.setProperty("--gap", GAP + "px");

    // Deal photos round-robin, so each column mixes events and years.
    const decks = Array.from({ length: n }, () => []);
    list.forEach((a, i) => decks[i % n].push(a));

    decks.forEach((deck, c) => {
      const col = document.createElement("div");
      col.className = "drift__col";
      const track = document.createElement("div");
      track.className = "drift__track";

      // Height of one pass through this column's photos, from their ratios.
      const passH = deck.reduce((h, a) => {
        const img = a.querySelector("img");
        return h + (colW * img.getAttribute("height")) / img.getAttribute("width") + GAP;
      }, 0);
      // Repeat the deck until one copy is taller than the stage, then lay it
      // down twice so the loop can wrap without a visible seam.
      const reps = Math.max(1, Math.ceil((H + 40) / passH));
      for (let copy = 0; copy < 2; copy++)
        for (let r = 0; r < reps; r++) deck.forEach((a) => track.appendChild(tile(a)));
      // The second copy is a visual repeat; keep it out of the tab order and
      // away from screen readers.
      [...track.children].slice(deck.length * reps).forEach((el) => {
        el.tabIndex = -1;
        el.setAttribute("aria-hidden", "true");
      });

      // Same slow speed everywhere (px/s), alternating direction, with a
      // touch of variation so the columns don't move in lockstep.
      const speed = 16 + ((c * 7) % 5) * 2;
      track.style.animationDuration = ((passH * reps) / speed).toFixed(1) + "s";
      if (c % 2) track.classList.add("drift__track--down");
      // Start each column at a different point in its loop.
      track.style.animationDelay = (-((c * 0.37) % 1) * (passH * reps) / speed).toFixed(1) + "s";

      col.appendChild(track);
      layer.appendChild(col);
    });
  };

  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => stage.hidden || build(), 200);
  });

  // Called by the gallery page when the view or filter changes.
  window.JellyDrift = {
    refresh() {
      if (!stage.hidden) build();
    },
  };
  if (!stage.hidden) build();
})();
