# Jellyfish Collective

Static site. Content is Markdown and Nunjucks templates, build is Eleventy. No database, no CMS, no server.

## Editing

Everything you'd normally want to change lives in `src/`:

| To change | Edit |
|---|---|
| Landing page | `src/index.njk` (hero in `src/_includes/hero.njk`) |
| Dues, roles, expectations | `src/how-it-works.md` |
| How We Build page | `src/technical/index.njk` |
| Activations page | `src/activations/index.md` |
| Events list | `src/events/index.md` |
| One event's page | `src/events/<event>.md` |
| Event photos, covers, alt text | `src/_data/photos.json` |
| Event order (newer/older links) | `src/_data/events.json` |
| Day/night slider pairs | `src/_data/daynight.json` |
| Gallery page | `src/gallery.md` |
| Join page | `src/join.md` |
| Colors and type | the top block of `src/css/site.css` |
| Nav and footer links | `src/_includes/navbar.njk`, `src/_includes/footer.njk` |
| 404 page | `src/404.md` |

Push to `main` and Cloudflare rebuilds automatically.

## Running it locally

```
npm install
npm start
```

Then open http://localhost:8080. It reloads as you save.

To build without serving: `npm run build` (output lands in `_site/`).

## Cloudflare settings

Deployed as a Cloudflare Worker serving static assets. `wrangler.jsonc` points
Cloudflare at the built output.

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (the default)
- Assets directory: `_site`, set in `wrangler.jsonc`

If a build fails on an old Node version, add an environment variable
`NODE_VERSION` = `22` in the Worker's build settings.

## House rules

**No member data in this repo.** No rosters, phone numbers, emails, home
addresses, Venmo handles, dues ledgers, budgets, or storage locations. The
repo is public — anything committed here is readable by anyone, including
files that aren't linked from a page. Member logistics belong in the private
tools, not here.

## Photos

Compress before committing. Git keeps every version of every file forever, so
a 6 MB JPEG stays in the repo's history even after you replace it with a
smaller one.

- 1600–2000px on the long edge, WebP at ~75–80% quality
- Landing and gallery images: aim under 200 KB each
- Keep `src/img/` under about 20 MB total
- Always set `alt`, `loading="lazy"`, and `width`/`height` so the page doesn't
  jump while images load

Event photos live in `src/img/events/<event>/` as a pair: a full-size
`name.webp` (about 2000px) for the lightbox and a `name-sm.webp` (about 900px)
for grids. Add an entry to `src/_data/photos.json` and the photo appears on
the event page, the Events teaser, and the Gallery. Set `"cover": true` on the
one that should lead the event page.

Fastest route: put the originals in a folder and ask Claude Code to compress
them into `src/img/`. Or use squoosh.app one at a time.

**Video does not go in this repo.** Embed from Instagram or YouTube instead —
video files bloat the repo permanently and Cloudflare is not a video host.

**Faces:** check with people before publishing recognizable shots where they
aren't obviously performing.
