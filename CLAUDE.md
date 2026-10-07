# Jellyfish Collective

Static Eleventy site. Content is Markdown and Nunjucks in `src/`; see `README.md` for which file controls what. No database, no server. Pushing to `main` deploys via Cloudflare.

Feedback loop: `npm run build` must succeed before any commit. Use `npm start` and look at the page when a change is visual.

## How to work

This repo uses Matt Pocock's skills (vendored in `.claude/skills/`, MIT, from github.com/mattpocock/skills). Run `/ask-matt` when unsure which flow fits.

- Before any non-trivial change, run the `/grill-with-docs` interview. Don't start building until the open questions are settled.
- Use the vocabulary in `GLOSSARY.md` once it exists. Record hard-to-reverse decisions as ADRs in `docs/adr/`.
- Take small, verifiable steps. For logic in `src/js/` or `eleventy.config.js`, work test-first with `/tdd`.
- For a bug that resists a first look, use `/diagnosing-bugs`. Get a reproducible failure before you theorise.
- When opening a PR, shape its body with `/pr`.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues for Chanksyou/The-Jellyfish-Collective. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical names, unchanged (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, both created lazily. See `docs/agents/domain.md`.
