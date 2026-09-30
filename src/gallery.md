---
layout: layout.njk
title: Gallery
tagline: Years of jellyfish, in no particular order.
wide: true
---

<!-- HOW TO ADD PHOTOS
     1. Compress to .webp (a full-size ~2000px copy and a ~900px "-sm" copy)
        and drop both into src/img/events/<event-slug>/
     2. Add an entry for it under that event in src/_data/photos.json
     It shows up here, on the event's own page, and in the Events teasers.
-->

<div class="gallery-filter" role="group" aria-label="Filter photos by activation">
<button type="button" class="gallery-filter__chip" data-filter="all" aria-pressed="true">All</button>
{%- for e in events -%}
<button type="button" class="gallery-filter__chip" data-filter="{{ e.slug }}" aria-pressed="false">{{ e.name }} {{ e.year }}</button>
{%- endfor -%}
</div>

<div class="photo-grid photo-grid--wall" data-lightbox-group>
{%- for p in photos | wall(events) -%}
<a class="photo-grid__item" style="--r: {{ (p.w / p.h) | round(3) }}" href="{{ p.src }}" data-event="{{ p.event.slug }}" data-lightbox data-caption="{{ p.alt }} · {{ p.event.name }} {{ p.event.year }}"><img src="{{ p.sm }}" alt="{{ p.alt }}" width="{{ p.w }}" height="{{ p.h }}" loading="lazy" decoding="async"><span class="photo-grid__tag">{{ p.event.name }} {{ p.event.year }}</span></a>
{%- endfor -%}
</div>

<script>
(() => {
  const chips = document.querySelectorAll('.gallery-filter__chip');
  const items = document.querySelectorAll('.photo-grid--wall .photo-grid__item');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
    items.forEach(it => { it.hidden = f !== 'all' && it.dataset.event !== f; });
  }));
})();
</script>

More on [Instagram](https://www.instagram.com/the_jellyfish_collective).
