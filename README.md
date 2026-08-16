# PLAYED — Don't get played. Play your part.

**Entry for the UNESCO Youth Hackathon 2026 — "Play Your Part: Youth Designing the Future of Media and Information Literacy"**

**PLAYED Guardians** is a youth-led media-literacy program whose core is a playable vaccine against misinformation, built from Bangladesh for youth everywhere. One fictional viral lie moves through the information ecosystem — and you play **every role in its life cycle**, ending in your own family group chat (~15 minutes), then keep training on **51 real, documented cases**. The interface is bilingual (**English / বাংলা**), a built-in pre/post self-assessment shows each player their own learning delta, and every player becomes a trained peer educator who carries it into the communities the internet forgets.

| Role | What you do | What it teaches |
|---|---|---|
| ✍️ **The Creator** | Forge a viral lie using the 12 manipulation techniques documented in misinformation research; watch which emotion each one hijacks | Inoculation / prebunking |
| 🤖 **The Algorithm** | Run the feed with the *real* leaked ranking weights (♥ ≈30×, ↺ ≈20×, 😡 = 5× a like); count the ad money; survive an influencer cascade | AI & systems literacy |
| 🎯 **The Target** | Just scroll — but the feed escalates whatever you like, a timed "flash offer" rushes your thumb, unverified shares get counted, and then the machine shows your dossier (timed in real seconds) plus everything it chose to *hide* from you | Personalization literacy |
| 🛡️ **The Guardian** | Five recreations of real cases (flood shark, Pentagon AI image, task scam, Hurricane Helene AI photo — and one true post) while the share counter climbs | Practical verification |
| 💬 **The Group Chat** | The fifth, realest chair: three rumours (Padma Bridge, health cure, election deepfake) arrive in your own Bangla family group — shame an elder and it backfires, stay silent and it spreads, use a respectful truth-sandwich and you win the room | Correcting the people you love |

Then: the **Hall of Lies** (a 3D globe plotting 51 sourced real-world cases — from the Pentagon AI image to the Padma Bridge rumour, each tagged with the real platform where it spread, including 7 true-but-wild stories because cynicism is not literacy), endless **Training Mode** with a three-tier difficulty curve (clear fakes → misleading → true-but-wild as the final boss), and a shareable **MIL Passport** with a 3D medal, four named ranks, and your pre/post learning delta ("pass on the vaccine" → friends arrive to a welcome banner via `?via=`).

## Run it

No build, no install, no server required.

- **Option A (double-click):** open `index.html` in any modern browser.
- **Option B (local server):** `python -m http.server 4173` in this folder → http://localhost:4173.
- **Production:** any static host (GitHub Pages, Netlify, …). On HTTPS it registers a service worker and becomes an **installable, fully offline PWA**.

Three.js is vendored locally (`js/vendor/`), so 3D works offline too; without WebGL everything degrades gracefully to the 2D canvas experience.

## Evidence, not vibes

Every number is either cited or labelled as modeled — fabricated statistics in an MIL project would be self-defeating:

- **6× faster / 70% more likely to be shared** — Vosoughi, Roy & Aral, *Science* 359 (2018)
- **"Angry" = 5× a like** — the Facebook Files, WSJ (2021)
- **♥ ≈30×, ↺ ≈20× ranking weight** — Twitter's open-sourced recommendation code (2023)
- **85% worry about disinformation** — UNESCO–Ipsos, 16 countries (2023)
- **96% missed a site's backer** — Stanford History Education Group
- All 51 Hall of Lies entries are real, publicly documented cases, each with its documenting source; in-game reach/revenue numbers are labelled *modeled*.

## Design decisions that map to the judging criteria

- **Theme consistency** — *"Play Your Part"* is the literal mechanic: you play the parts.
- **Innovation** — perspective reversal across the whole pipeline (creator → algorithm → target → guardian → **the group chat**), the algorithm as a playable character, a true post among the fakes, and a chapter set inside a closed family group — the vector public fact-checking can't reach.
- **Feasibility & sustainability** — zero-dependency static folder; free hosting forever; open source; a self-propagating youth-Guardian delivery loop; target partners (Rumor Scanner, Dismislab, BRAC, university MIL chairs).
- **Impact & inclusion** — built for **named communities** (families & elders, garment workers, first-time voters, migrant families, madrasa students, low-bandwidth users); bilingual English/বাংলা; offline-first; keyboard playable; reduced-motion mode; printable Bangla prebunk cards.
- **Clarity** — the prototype *is* the pitch; judges can play all five chairs in the browser.

## Project structure

```
index.html            landing + simulation shell + Hall of Lies + Who We Serve + Guardians (+ PWA/SEO meta)
css/style.css         editorial design system (#A41F13 · #FAF5F1 · #E0DBD8 · #292F36 · #8F7A6E)
js/main.js            page chrome, Hall grid, community cards, printable prebunk cards, via-banner, SW
js/game.js            the five-role simulation + Training Mode + assessment + passport
js/i18n.js            English ⇄ বাংলা toggle (data-i18n snapshot + game-string dictionary)
js/network.js         ambient particle network + SpreadSim infection graph
js/three-scenes.js    3D: hero shield, Hall of Lies globe, passport medal (lazy, fallback-safe)
js/real-cases.js      content: 51 documented cases + communities + prebunk cards + platform icons
js/vendor/three.min.js  Three.js r128, vendored for offline use
sw.js / manifest.webmanifest / icon.svg   installable offline PWA
docs/PROPOSAL.md      draft proposal document (convert to PDF/Word for submission)
```

## Submission checklist (window: July 6 – August 16, 2026)

- [ ] Proposal document (PDF/Word, ≤10 MB) — draft in `docs/PROPOSAL.md`; fill in team details
- [ ] Pitch video (max 3 minutes) — script outline in `docs/PROPOSAL.md`
- [ ] Team of 2–6 members, all aged 18–30
- [ ] Host the demo (GitHub Pages) and add the URL to the proposal

Simulation posts are fictional recreations of documented misinformation patterns; the Hall of Lies contains only real, publicly documented cases. This prototype is an independent entry and is not endorsed by UNESCO.
