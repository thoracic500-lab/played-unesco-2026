/* ============================================================
   PLAYED — main.js v2
   Page chrome: preloader, nav, reveals, counters, magnetic
   buttons, ticker, lab terminal — plus the Hall of Lies grid,
   the "vaccine passed on" banner, and PWA registration.
   ============================================================ */

(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- preloader ---------- */
  window.addEventListener("load", () => {
    setTimeout(() => document.getElementById("preloader")?.classList.add("done"), REDUCED ? 100 : 1250);
  });
  setTimeout(() => document.getElementById("preloader")?.classList.add("done"), 4000);

  /* ---------- "a friend passed you the vaccine" ---------- */
  const banner = document.getElementById("via-banner");
  if (banner) {
    const hideBanner = () => { banner.hidden = true; banner.style.display = "none"; };
    if (new URLSearchParams(location.search).has("via")) {
      banner.hidden = false;
      document.getElementById("via-close")?.addEventListener("click", hideBanner);
      document.getElementById("via-go")?.addEventListener("click", hideBanner);
    } else {
      hideBanner(); // belt and braces: never show without ?via=
    }
  }

  /* ---------- nav ---------- */
  const nav = document.getElementById("nav");
  const links = document.getElementById("nav-links");
  const burger = document.getElementById("nav-burger");
  const progress = document.getElementById("progress-bar");

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = `${pct}%`;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger?.addEventListener("click", () => {
    burger.classList.toggle("open");
    links.classList.toggle("open");
  });
  links?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("open");
    links.classList.remove("open");
  }));

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---------- animated counters ---------- */
  const cio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      cio.unobserve(e.target);
      const target = parseFloat(e.target.dataset.count);
      const suffix = e.target.dataset.suffix || "";
      if (REDUCED) { e.target.textContent = target + suffix; continue; }
      const t0 = performance.now();
      const dur = 1600;
      (function step(t) {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        e.target.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll(".count").forEach(el => cio.observe(el));

  /* ---------- magnetic buttons ---------- */
  if (!REDUCED && matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- occasional auto-glitch on hero & footer ---------- */
  if (!REDUCED) {
    document.querySelectorAll(".glitch").forEach((g, i) => {
      setInterval(() => {
        g.classList.add("glitching");
        setTimeout(() => g.classList.remove("glitching"), 380);
      }, 3800 + i * 900);
    });
  }

  /* ---------- ticker: duplicate for a seamless loop ---------- */
  const track = document.getElementById("ticker-track");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- verify-lab terminal typing loop ---------- */
  const term = document.getElementById("lab-terminal-body");
  if (term) {
    const SCRIPT = [
      { t: `$ <span class="t-cmd">reverse-lens</span> ./viral_flood_shark.jpg`, d: 300 },
      { t: `\n<span class="t-dim">› searching indexed images…</span>`, d: 800 },
      { t: `\n<span class="t-flag">› MATCH FOUND — identical image · first seen SEPT 2011</span>`, d: 700 },
      { t: `\n<span class="t-flag">› recycled in 14 flood events since. Verdict: HOAX</span>`, d: 700 },
      { t: `\n$ <span class="t-cmd">synth-detect</span> ./pentagon_explosion.jpg`, d: 900 },
      { t: `\n<span class="t-dim">› analysing structure…</span>`, d: 800 },
      { t: `\n<span class="t-flag">› fence merges into building · lampposts bend · verdict: AI-GENERATED</span>`, d: 800 },
      { t: `\n<span class="t-ok">✓ two lies contained. Nice work, guardian.</span>`, d: 1600 },
    ];
    let idx = 0;
    let html = "";
    const caret = `<span class="t-caret"></span>`;
    const tio = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      tio.disconnect();
      (function next() {
        if (idx >= SCRIPT.length) {
          setTimeout(() => { idx = 0; html = ""; term.innerHTML = caret; next(); }, 4000);
          return;
        }
        html += SCRIPT[idx].t;
        term.innerHTML = html + caret;
        term.scrollTop = term.scrollHeight; // keep the latest line visible inside the fixed box
        idx++;
        setTimeout(next, REDUCED ? 10 : SCRIPT[idx - 1].d);
      })();
    }, { threshold: 0.4 });
    term.innerHTML = caret;
    tio.observe(term);
  }

  /* ---------- the Hall of Lies: filters + card grid ---------- */

  const grid = document.getElementById("hall-grid");
  const filters = document.getElementById("hall-filters");
  if (grid && filters && window.REAL_CASES) {
    const CASES = window.REAL_CASES;
    const TYPES = window.CASE_TYPES;

    const counts = {};
    CASES.forEach(c => counts[c.type] = (counts[c.type] || 0) + 1);

    filters.innerHTML = [
      `<button class="fbtn active" data-f="all">All <b>${CASES.length}</b></button>`,
      ...Object.entries(TYPES)
        .filter(([k]) => counts[k])
        .map(([k, t]) => `<button class="fbtn" data-f="${k}">${t.ico} ${t.label} <b>${counts[k]}</b></button>`),
    ].join("");

    function cardHTML(c, i) {
      const t = TYPES[c.type] || { label: c.type, ico: "❓" };
      const pi = (window.PLATFORM_ICONS && window.PLATFORM_ICONS[c.platform]) || "";
      const pn = (window.PLATFORM_NAMES && window.PLATFORM_NAMES[c.platform]) || "";
      return `
        <article class="case-card" data-type="${c.type}" style="animation-delay:${Math.min(i * 0.04, 0.5)}s">
          <div class="case-card__top">
            <span class="case-card__type">${t.ico} ${t.label.toUpperCase()}</span>
            <span class="case-card__verdict v-${c.verdict}">${c.verdict}</span>
          </div>
          <h3>${c.title}</h3>
          <p class="case-card__meta">${c.year} · ${c.country}${pi ? ` · ${pi} ${pn}` : ""}</p>
          <p class="case-card__claim">“${c.claim}”</p>
          <div class="case-card__truth">${c.truth}<span class="case-card__src">documented by: ${c.src}</span></div>
          <button class="case-card__more" aria-expanded="false">WHAT VERIFICATION FOUND ↓</button>
        </article>`;
    }

    function render(filter) {
      const list = filter === "all" ? CASES : CASES.filter(c => c.type === filter);
      grid.innerHTML = list.map(cardHTML).join("");
      grid.querySelectorAll(".case-card__more").forEach(btn => {
        btn.onclick = () => {
          const card = btn.closest(".case-card");
          const open = card.classList.toggle("open");
          btn.setAttribute("aria-expanded", String(open));
          btn.textContent = open ? "HIDE ↑" : "WHAT VERIFICATION FOUND ↓";
        };
      });
    }

    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".fbtn");
      if (!b) return;
      filters.querySelectorAll(".fbtn").forEach(x => x.classList.toggle("active", x === b));
      render(b.dataset.f);
    });

    render("all");
  }

  /* ---------- Who We Serve: community cards ---------- */
  const commGrid = document.getElementById("comm-grid");
  if (commGrid && window.COMMUNITIES) {
    commGrid.innerHTML = window.COMMUNITIES.map((c, i) => `
      <article class="comm-card reveal ${i % 3 ? "d" + (i % 3) : ""}">
        <div class="comm-card__ico">${c.ico}</div>
        <h3>${c.name}</h3>
        <p class="comm-card__who">${c.who}</p>
        <p class="comm-card__row"><b>The threat:</b> ${c.threat}</p>
        <p class="comm-card__row comm-card__reach"><b>How we reach them:</b> ${c.reach}</p>
      </article>`).join("");
    commGrid.querySelectorAll(".reveal").forEach(el => io.observe(el));
  }

  /* ---------- PLAYED Guardians: printable prebunk cards ---------- */
  const prebunkGrid = document.getElementById("prebunk-grid");
  if (prebunkGrid && window.PREBUNK_CARDS) {
    prebunkGrid.innerHTML = window.PREBUNK_CARDS.map(c => `
      <article class="pcard">
        <div class="pcard__top"><span class="pcard__ico">${c.ico}</span><span class="pcard__tag">${c.tag}</span></div>
        <div class="pcard__rumor">
          <div class="pcard__rumor-bn">${c.rumor_bn}</div>
          <div class="pcard__rumor-en">${c.rumor_en}</div>
        </div>
        <p class="pcard__fact"><b>✓ The fact:</b> ${c.fact}</p>
        <p class="pcard__trick"><b>⚠ The trick:</b> ${c.trick}</p>
        <p class="pcard__src">${c.source}</p>
        <div class="pcard__brand">PLAYED · playyourpart</div>
      </article>`).join("");
    const printBtn = document.getElementById("print-cards");
    if (printBtn) printBtn.addEventListener("click", () => {
      document.body.classList.add("printing-cards");
      window.print();
      setTimeout(() => document.body.classList.remove("printing-cards"), 500);
    });
    window.addEventListener("afterprint", () => document.body.classList.remove("printing-cards"));
  }

  /* ---------- PWA: register the service worker (production only,
     so local development never fights the cache) ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => { /* offline install unavailable; site still works */ });
    });
  }
})();
