# Jellyfish Collective

Static site. Content is Markdown, layout is one Nunjucks template, build is
Eleventy. No database, no CMS, no server.

## Editing

Everything you'd normally want to change lives in `src/`:

| To change | Edit |
|---|---|
| Landing page | `src/index.md` |
| Dues, roles, expectations | `src/how-it-works.md` |
| Past activations | `src/activations/past.md` |
| Next activation | `src/activations/upcoming.md` |
| Build and safety docs | `src/technical/index.md` |
| Join page | `src/join.md` |
| Colors and type | the top block of `src/css/site.css` |
| Nav links | `src/_includes/layout.njk` |
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

- 1600px on the long edge, WebP at ~80% quality
- Landing and gallery images: aim under 200 KB each
- Keep `src/img/` under about 20 MB total
- Always set `alt`, `loading="lazy"`, and `width`/`height` so the page doesn't
  jump while images load

Fastest route: put the originals in a folder and ask Claude Code to compress
them into `src/img/`. Or use squoosh.app one at a time.

**Video does not go in this repo.** Embed from Instagram or YouTube instead —
video files bloat the repo permanently and Cloudflare is not a video host.

**Faces:** check with people before publishing recognizable shots where they
aren't obviously performing.
