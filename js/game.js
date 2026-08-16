/* ============================================================
   PLAYED — game.js v2
   Four roles + endless Training Mode.
   Design rules:
   · Real, cited numbers where they exist (Science 2018, Facebook
     Files 2021, Twitter's open-sourced weights 2023). Game values
     are labelled "modeled".
   · Simulation posts are fictional recreations of documented
     misinformation patterns; Guardian cases are real ones.
   ============================================================ */

(function () {
  "use strict";

  const stage = document.getElementById("sim-stage");
  if (!stage) return;

  const scoreEl = document.getElementById("sim-score");
  const chips = [...document.querySelectorAll(".sim-chip")];
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- state ---------------- */

  const S = {
    score: 0,
    done: { 1: false, 2: false, 3: false, 4: false, 5: false },
    badges: {},
    pre: null,  // pre-simulation self-assessment {q1, q2}
    post: null, // post-simulation self-assessment
    sig: {},    // per-chapter diagnostic signals → the personalized passport read-out
  };

  const T = (key, en) => (window.I18N ? window.I18N.t(key, en) : en);
  const L = (o) => (window.I18N && window.I18N.lang === "bn" && o && o.bn) ? o.bn : (o ? o.en : ""); // pick bn/en on an {en,bn} object
  const uic = (n) => (window.UI_ICON ? window.UI_ICON(n) : "");

  let spreadSim = null;
  let activeInterval = null;
  let keyHandler = null;
  let booted = false; // don't auto-scroll to the sim on initial page load
  let onStartScreen = false; // language toggle re-renders only the start screen
  let suppressScrollOnce = false; // language-change re-renders shouldn't move the page

  /* ---------------- helpers ---------------- */

  const el = (sel, root = stage) => root.querySelector(sel);
  const els = (sel, root = stage) => [...root.querySelectorAll(sel)];
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const shuffled = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function buzz(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch { /* no haptics */ }
  }

  function setStage(html, mount) {
    onStartScreen = false; // renderStart re-sets this after the call
    if (spreadSim) { spreadSim.destroy(); spreadSim = null; }
    if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    stage.classList.add("is-out");
    setTimeout(() => {
      stage.innerHTML = html;
      stage.classList.remove("is-out");
      stage.classList.add("is-in");
      if (mount) mount();
      if (booted && !suppressScrollOnce) {
        // Only correct the view when the top of the new screen is scrolled off
        // ABOVE the viewport (otherwise you'd land on blank space). Never yank the
        // page for small, still-visible offsets — that re-centering on every screen
        // change is what made the page jump up/down a little while reading.
        const simRect = document.getElementById("sim").getBoundingClientRect();
        const navH = (document.getElementById("nav")?.offsetHeight || 60) + 12;
        // Reveal only when the new screen's top is hidden well above the viewport
        // (more than a nav height). Small, still-visible offsets never trigger a
        // scroll, so the panel no longer nudges up/down between screens.
        if (simRect.top < -navH) {
          window.scrollTo({ top: window.scrollY + simRect.top - navH, behavior: REDUCED ? "auto" : "smooth" });
        }
      }
      suppressScrollOnce = false;
      booted = true;
      setTimeout(() => stage.classList.remove("is-in"), 650);
    }, 320);
  }

  function addScore(n) {
    const from = S.score;
    S.score = Math.min(100, S.score + n);
    const to = S.score;
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 700);
      scoreEl.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
    // rAF is suspended in background tabs — make sure the final value lands regardless
    setTimeout(() => { scoreEl.textContent = to; }, 900);
  }

  function markDone(ch, badge) {
    S.done[ch] = true;
    S.badges[ch] = badge;
    const chip = chips.find(c => +c.dataset.ch === ch);
    if (chip) { chip.classList.add("done"); chip.classList.remove("active"); }
    buzz([18, 40, 18]);
  }

  function setActiveChip(ch) {
    chips.forEach(c => c.classList.toggle("active", +c.dataset.ch === ch));
  }

  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2800);
  }

  function picon(platform) {
    return (window.PLATFORM_ICONS && window.PLATFORM_ICONS[platform]) || "";
  }

  function postHTML({ avatar, name, handle, text, img, aiFlag, stats, flood, platform, extra = "", cls = "" }) {
    return `
      <article class="post ${cls}">
        <div class="post__head">
          <div class="post__avatar">${avatar}</div>
          <div><div class="post__name">${name}</div><div class="post__handle">${handle}${platform ? picon(platform) : ""}</div></div>
        </div>
        <p class="post__text">${text}</p>
        ${img ? `<div class="post__img">${img}${aiFlag ? `<span class="ai-flag">SYNTHETIC</span>` : ""}</div>` : ""}
        ${flood ? `<p class="post__flood">${flood}</p>` : ""}
        ${stats ? `<div class="post__stats">${stats}</div>` : ""}
        ${extra}
      </article>`;
  }

  function badgePopHTML(b) {
    return `<div class="badge-pop"><span class="b-ico">${b.ico}</span> Badge unlocked: ${b.name}</div>`;
  }

  /* ============================================================
     START SCREEN
     ============================================================ */

  function renderStart() {
    setActiveChip(0);
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${T("g.start.kicker", "A playable story in five roles")}</p>
        <h3 class="scr__title">${T("g.start.title", `One lie is about to go viral.<br>You are <span class="hl">everyone involved.</span>`)}</h3>
        <p class="scr__text">${T("g.start.text", `In the next ~15 minutes you will build the lie, amplify it, fall for it,
        and finally hunt it down — then keep training on real, documented cases. Every chair teaches you
        something a lecture can’t.`)}</p>
        <div class="start-roles">
          <div>${uic("pen")} ${T("chipname.creator", "Creator")}</div><div>${uic("bot")} ${T("chipname.algo", "Algorithm")}</div><div>${uic("target")} ${T("chipname.target", "Target")}</div><div>${uic("shield")} ${T("chipname.guardian", "Guardian")}</div>
        </div>
        <button class="sbtn" id="start-btn">${T("g.start.btn", "▶ Take the first chair")}</button>
      </div>`, () => {
      el("#start-btn").onclick = () => renderAssess("pre");
    });
    onStartScreen = true; // after setStage, which resets it
  }

  if (window.I18N) window.I18N.onChange(() => {
    if (onStartScreen) { suppressScrollOnce = true; renderStart(); }
  });

  /* ---- pre/post self-assessment: 2 questions, 20 seconds ---- */

  const ASSESS_QS = [
    { id: "q1", key: "g.as.q1", text: "How confident are you that you can spot a manipulated post in your feed?", loKey: "g.as.lo1", lo: "not at all", hiKey: "g.as.hi1", hi: "very confident" },
    { id: "q2", key: "g.as.q2", text: "How well do you understand why your feed shows you what it shows?", loKey: "g.as.lo2", lo: "no idea", hiKey: "g.as.hi2", hi: "completely" },
  ];

  function renderAssess(mode) {
    const isPre = mode === "pre";
    const answers = {};
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${isPre ? T("g.as.kickerPre", "Before you begin · 20 seconds") : T("g.as.kickerPost", "One last thing · 20 seconds")}</p>
        <h3 class="scr__title">${isPre ? T("g.as.titlePre", "Two honest questions.") : T("g.as.titlePost", `The same two questions —<br><span class="hl">honestly, again.</span>`)}</h3>
        <p class="scr__text">${isPre
          ? T("g.as.introPre", "Answer for yourself, not for the game. You’ll see these again at the end — that’s the point.")
          : T("g.as.introPost", "You answered these before the simulation. Your passport will show what changed.")}</p>
        <div class="assess">
          ${ASSESS_QS.map(q => `
            <div class="assess__q" data-q="${q.id}">
              <p>${T(q.key, q.text)}</p>
              <div class="assess__scale">
                ${[1, 2, 3, 4, 5].map(n => `<button data-v="${n}" aria-label="${n} of 5">${n}</button>`).join("")}
              </div>
              <div class="assess__ends"><span>${T(q.loKey, q.lo)}</span><span>${T(q.hiKey, q.hi)}</span></div>
            </div>`).join("")}
        </div>
        <button class="sbtn" id="as-go" disabled>${isPre ? T("g.c1.btn2", "Continue to Role 01 →") : T("g.as.claim", "Claim your MIL Passport →")}</button>
      </div>`, () => {
      els(".assess__q").forEach(qEl => {
        qEl.querySelectorAll("button").forEach(b => b.onclick = () => {
          qEl.querySelectorAll("button").forEach(x => x.classList.toggle("sel", x === b));
          answers[qEl.dataset.q] = +b.dataset.v;
          el("#as-go").disabled = Object.keys(answers).length < ASSESS_QS.length;
          buzz(8);
        });
      });
      el("#as-go").onclick = () => {
        if (isPre) { S.pre = { ...answers }; renderC1Intro(); }
        else { S.post = { ...answers }; renderPassport(); }
      };
    });
  }

  /* ============================================================
     CHAPTER 1 · THE CREATOR — 12 techniques from the literature
     ============================================================ */

  const TECHNIQUES = [
    { id: "fear",       name: "Fear appeal",           hint: "“before it’s too late”",      emotion: "FEAR",            mult: 3.2, ico: uic("alert"), real: "seen in the wild: 5G–COVID tower panic, 2020" },
    { id: "urgency",    name: "Manufactured urgency",  hint: "“share before it’s deleted”", emotion: "ANXIETY",         mult: 3.6, ico: uic("clock"), real: "seen in the wild: “votes being deleted” posts, 2020" },
    { id: "authority",  name: "False authority",       hint: "“experts confirm”",           emotion: "MISPLACED TRUST", mult: 2.4, ico: uic("award"), real: "seen in the wild: “Plandemic”, 2020" },
    { id: "stat",       name: "Fabricated statistic",  hint: "“97% affected”",              emotion: "FALSE CERTAINTY", mult: 2.1, ico: uic("chart"), real: "seen in the wild: “dead voter” spreadsheets, 2020" },
    { id: "conspiracy", name: "Conspiracy framing",    hint: "“what THEY hide”",            emotion: "DISTRUST",        mult: 2.8, ico: uic("eye-off"), real: "seen in the wild: 15-minute-city “prisons”, 2023" },
    { id: "outrage",    name: "Outrage bait",          hint: "CAPS + 🚨",                    emotion: "ANGER",           mult: 2.9, ico: uic("flame"), real: "seen in the wild: “eating the pets”, 2024" },
    { id: "dichotomy",  name: "False dichotomy",       hint: "“with us or against us”",     emotion: "TRIBALISM",       mult: 1.9, ico: uic("split"), real: "a propaganda staple in every conflict" },
    { id: "contagion",  name: "Emotional contagion",   hint: "“look at her face 💔”",        emotion: "GRIEF",           mult: 2.6, ico: uic("heart-crack"), real: "seen in the wild: Hurricane Helene AI girl, 2024" },
    { id: "flooding",   name: "Source flooding",       hint: "240 accounts, one script",    emotion: "EXHAUSTION",      mult: 3.0, ico: uic("waves"), real: "the documented “firehose of falsehood” model" },
    { id: "cherry",     name: "Cherry-picking",        hint: "“the REAL numbers since ’98”", emotion: "FALSE PATTERN",  mult: 1.8, ico: uic("filter"), real: "seen in the wild: “global cooling” graphs" },
    { id: "whatabout",  name: "Whataboutism",          hint: "“but nobody asks about THEM”", emotion: "DEFLECTION",     mult: 1.7, ico: uic("corner"), real: "the classic deflection playbook" },
    { id: "synthetic",  name: "Synthetic “proof”",     hint: "attach an AI photo",          emotion: "SEEING = BELIEVING", mult: 3.4, ico: uic("image"), real: "seen in the wild: Pentagon “explosion”, 2023" },
  ];

  const TOPICS = {
    health:  { ico: uic("flask"), name: "Health",   desc: "the miracle-cure pattern", real: "pattern: turmeric-cures / “nature’s Ozempic”", core: "A $2 kitchen root works better than prescription medicine", authority: "top doctors quietly confirm" },
    weather: { ico: uic("storm"), name: "Disaster", desc: "the storm-panic pattern", real: "pattern: flood shark / Valencia rumours", core: "The storm hitting Friday is far worse than forecasts admit", authority: "an insider meteorologist confirms" },
    money:   { ico: uic("banknote"), name: "Money",    desc: "the task-scam pattern",   real: "pattern: “$500/day” task scams (FTC-tracked)", core: "A 19-year-old makes $500 a day liking videos with one app", authority: "a leaked bank memo confirms" },
  };

  function renderC1Intro() {
    setActiveChip(1);
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${T("g.c1.kicker", "Role 01 · The Creator")}</p>
        <h3 class="scr__title">${T("g.c1.title", "Forge the lie.")}</h3>
        <p class="scr__text">Misinformation isn’t written by geniuses — it’s assembled from about a dozen
        reusable manipulation techniques documented in the research literature. You’re about to use them
        yourself, in a sandbox where they can’t hurt anyone. Once you’ve built with them, you’ll spot them
        anywhere. Psychologists call it <b>inoculation</b>.</p>
        <button class="sbtn" id="c1-go">${T("g.c1.btn", "Open the workshop")}</button>
      </div>`, () => {
      el("#c1-go").onclick = renderC1Topics;
    });
  }

  function renderC1Topics() {
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">Role 01 · The Creator</p>
        <h3 class="scr__title">Pick your raw material.</h3>
        <p class="scr__text">Every viral lie starts with something people already care about.
        Each of these mirrors a real, documented misinformation pattern.</p>
        <div class="topic-grid">
          ${Object.entries(TOPICS).map(([id, t]) => `
            <button class="topic-card" data-topic="${id}">
              <span class="t-ico">${t.ico}</span>
              <span class="t-name">${t.name}</span>
              <span class="t-desc">${t.desc}</span>
              <span class="t-real">${t.real}</span>
            </button>`).join("")}
        </div>
      </div>`, () => {
      els(".topic-card").forEach(c => c.onclick = () => renderC1Composer(c.dataset.topic));
    });
  }

  function composeHeadline(topic, on) {
    let h = TOPICS[topic].core;
    if (on.has("authority")) h += ` — ${TOPICS[topic].authority}`;
    if (on.has("stat")) h += ` (studies show 97% are affected)`;
    if (on.has("cherry")) h += `. The numbers they NEVER show you prove it`;
    if (on.has("whatabout")) h += ` — and yet nobody investigates the people profiting from the “official” version`;
    if (on.has("dichotomy")) h += `. You either share this or you’re part of it`;
    if (on.has("fear")) h = `⚠️ ${h}. Act before it’s too late`;
    if (on.has("contagion")) h = `💔 ${h}. Think of the children who already paid the price`;
    if (on.has("conspiracy")) h = `What THEY don’t want you to know: ${h.charAt(0).toLowerCase() + h.slice(1)}`;
    if (on.has("synthetic")) h = `PHOTO PROOF: ${h}`;
    if (on.has("urgency")) h += `. SHARE BEFORE IT’S DELETED!`;
    if (on.has("outrage")) h = `🚨 ${h.toUpperCase()} 🚨`;
    return h;
  }

  function renderC1Composer(topic) {
    const on = new Set();
    const BASE = 120;

    setStage(`
      <div class="scr scr--left">
        <p class="scr__kicker">Role 01 · The Creator</p>
        <h3 class="scr__title">The workshop.</h3>
        <p class="scr__text">Tap techniques to bolt them onto your post. Watch what each one does to the
        projected reach, and which emotion it hijacks.</p>
        <div class="composer">
          <div id="c1-preview"></div>
          <div class="composer__right">
            <div class="chips">
              ${TECHNIQUES.map(t => `
                <button class="chip" data-t="${t.id}">${t.ico} ${t.name}<small>${t.hint}</small></button>`).join("")}
            </div>
            <div class="emotion-stack" id="c1-emotions">EMOTIONS HIJACKED: <span style="opacity:.6">none yet</span></div>
            <div class="reach">
              <div class="reach__label">PROJECTED 24H REACH</div>
              <div class="reach__num" id="c1-reach">120</div>
              <div class="reach__bar"><i id="c1-bar"></i></div>
              <div class="reach__note">modeled — tuned to Vosoughi et al. (Science, 2018): false news is ~70% more likely to be shared</div>
            </div>
            <button class="sbtn" id="c1-publish" disabled>Publish the lie (needs 3+ techniques)</button>
          </div>
        </div>
      </div>`, () => {
      const update = () => {
        let reach = BASE;
        on.forEach(id => reach *= TECHNIQUES.find(t => t.id === id).mult);
        reach = Math.round(reach);
        el("#c1-preview").innerHTML = postHTML({
          avatar: TOPICS[topic].ico, name: "TruthPulse Daily", handle: "@truthpulse_real · just now",
          text: composeHeadline(topic, on),
          img: on.has("synthetic") ? "🖼️" : "",
          aiFlag: on.has("synthetic"),
          flood: on.has("flooding") ? "⚠ identical text detected on 240 coordinated accounts" : "",
          stats: `<span>👁 <b>${fmt(reach)}</b></span><span>↺ <b>${fmt(reach / 9)}</b></span><span>♥ <b>${fmt(reach / 4)}</b></span>`,
          cls: on.size >= 4 ? "is-hot" : "",
        });
        const emotions = [...new Set([...on].map(id => TECHNIQUES.find(t => t.id === id).emotion))];
        el("#c1-emotions").innerHTML = `EMOTIONS HIJACKED: ${emotions.length ? emotions.map(e => `<b>${e}</b>`).join(" ") : `<span style="opacity:.6">none yet</span>`}`;
        el("#c1-reach").textContent = fmt(reach);
        const maxReach = BASE * TECHNIQUES.reduce((a, t) => a * t.mult, 1);
        el("#c1-bar").style.width = `${Math.max(2, (Math.log(reach / BASE + 1) / Math.log(maxReach / BASE + 1)) * 100)}%`;
        const pub = el("#c1-publish");
        pub.disabled = on.size < 3;
        pub.textContent = on.size < 3 ? "Publish the lie (needs 3+ techniques)" : `Publish the lie → reach ${fmt(reach)}`;
      };

      els(".chip").forEach(c => c.onclick = () => {
        const id = c.dataset.t;
        if (on.has(id)) { on.delete(id); c.classList.remove("on"); }
        else { on.add(id); c.classList.add("on"); buzz(10); }
        update();
      });
      el("#c1-publish").onclick = () => { buzz(30); renderC1Debrief(topic, on); };
      update();
    });
  }

  function renderC1Debrief(topic, on) {
    const used = TECHNIQUES.filter(t => on.has(t.id));
    const emotions = [...new Set(used.map(t => t.emotion))];
    const badge = { ico: uic("eye"), name: "The Forger’s Eye" };
    if (!S.done[1]) addScore(15);
    markDone(1, badge);
    S.sig.creatorTech = used.length; // how many manipulation levers they wired together

    setStage(`
      <div class="scr scr--center">
        ${badgePopHTML(badge)}
        <h3 class="scr__title">You built it in a minute.<br><span class="hl">So can anyone.</span></h3>
        <p class="scr__text">You used <b>${used.length} of the 12 documented techniques</b> and hijacked
        ${emotions.length} emotions: <b>${emotions.join(", ")}</b>. Inoculation research says that having
        built with them once, you’ll now recognize them on sight:</p>
        <div class="lessons">
          ${used.slice(0, 6).map(t => `
            <div class="lesson"><span class="lesson__ico">${t.ico}</span>
              <div><b>${t.name}</b><p>${t.hint} — hijacks <b>${t.emotion}</b> to bypass thinking and trigger sharing.</p>
              <span class="in-wild">${t.real}</span></div>
            </div>`).join("")}
        </div>
        <div class="sandwich">
          <div class="sw-fact"><b>HOW TO UNDO ONE — THE TRUTH SANDWICH</b>Lead with the fact: “Bridges are built by engineers — the Padma Bridge employed ~30,000 workers and zero rituals.”</div>
          <div class="sw-myth">Name the trick once, without repeating its wording: “In 2019 a viral Bangla rumour (‘পদ্মা সেতুতে মাথা লাগবে’) used fear + conspiracy framing to claim otherwise — and innocent people were lynched over it.”</div>
          <div class="sw-fact">Close with the fact again — the last thing people read is what sticks.</div>
        </div>
        <p class="scr__text">Nothing you made left this sandbox. But an identical post is published somewhere
        every few seconds. Next: meet the machine that decides who sees it.</p>
        <button class="sbtn" id="c1-next">Next chair: The Algorithm →</button>
      </div>`, () => {
      el("#c1-next").onclick = renderC2Intro;
    });
  }

  /* ============================================================
     CHAPTER 2 · THE ALGORITHM — real ranking weights, real cost
     ============================================================ */

  const C2_ROUNDS = [
    {
      a: { avatar: "🚲", name: "Metro Desk", handle: "@metrodesk", text: "City opens 40 new protected bike lanes after a two-year safety study.", eng: 5, trust: 3, profit: 600, hot: false },
      b: { avatar: "😡", name: "WakeUpCall", handle: "@wakeupcall_44", text: "BIKE LANES are the first step to a 15-MINUTE CITY — they’ll lock you into your zone 🚨", eng: 22, trust: -13, profit: 2400, hot: true },
    },
    {
      a: { avatar: "☕", name: "Health Journal", handle: "@hj_science", text: "New meta-study: moderate coffee intake is fine for most adults.", eng: 4, trust: 3, profit: 500, hot: false },
      b: { avatar: "💔", name: "VitalTruths", handle: "@vital_truths", text: "COFFEE linked to ‘silent heart damage’, insiders warn. Doctors stay quiet. Thread 🧵😱", eng: 24, trust: -14, profit: 2600, hot: true },
    },
    {
      a: { avatar: "✅", name: "FactLens", handle: "@factlens", text: "Fact-check: the viral ‘flood shark’ photo is a 2011 hoax — recycled for 13 years.", eng: 5, trust: 5, profit: 550, hot: false },
      b: { avatar: "🦈", name: "StormWatchers", handle: "@stormwatch_x", text: "SHARK ON THE HIGHWAY?! Flood chaos footage the news won’t show 😱😱", eng: 25, trust: -15, profit: 2800, hot: true },
    },
    {
      a: { avatar: "🤖", name: "Campus News", handle: "@campusnews", text: "Local teen wins international robotics medal with rescue-drone design.", eng: 6, trust: 4, profit: 650, hot: false },
      b: { avatar: "📉", name: "FutureLeaks", handle: "@future_leaks", text: "LEAKED MEMO: AI to replace 80% of jobs by 2030. They’ve known for years.", eng: 20, trust: -12, profit: 2300, hot: true },
    },
    {
      a: { avatar: "🗳️", name: "Election Board", handle: "@electionboard", text: "Full independent audit published. Total discrepancies found: 0.003%.", eng: 4, trust: 6, profit: 500, hot: false },
      b: { avatar: "🔥", name: "PatriotSignal", handle: "@patriot_signal", text: "They’re DELETING votes RIGHT NOW — watch before this gets taken down!!", eng: 26, trust: -16, profit: 3000, hot: true },
    },
    {
      a: { avatar: "💉", name: "Health Ministry", handle: "@healthgov", text: "This year’s flu vaccine is available free at all community clinics. Details inside.", eng: 5, trust: 5, profit: 550, hot: false },
      b: { avatar: "🧪", name: "PureLivingMom", handle: "@pureliving_mom", text: "What they inject into your kids: a nurse WHISTLEBLOWER breaks her silence 😱 SHARE fast", eng: 23, trust: -15, profit: 2700, hot: true },
    },
    {
      a: { avatar: "🌍", name: "Science Now", handle: "@sciencenow", text: "2024 confirmed as the warmest year on record, say 6 independent agencies.", eng: 4, trust: 4, profit: 500, hot: false },
      b: { avatar: "❄️", name: "RealTalkRon", handle: "@realtalk_ron", text: "It SNOWED last week 🥶 so much for ‘global warming’ — the biggest scam in history 🤡", eng: 21, trust: -13, profit: 2400, hot: true },
    },
    {
      a: { avatar: "📱", name: "Consumer Desk", handle: "@consumerdesk", text: "Reminder: no legitimate bank or bKash agent will ever ask for your PIN or OTP.", eng: 5, trust: 5, profit: 550, hot: false },
      b: { avatar: "🎁", name: "LuckyDrawOfficial", handle: "@luckydraw_win", text: "🎉 YOU WON ৳50,000! Only 100 winners. Send your bKash PIN to claim before midnight ⏰", eng: 24, trust: -16, profit: 2900, hot: true },
    },
    {
      a: { avatar: "🕌", name: "Community Voice", handle: "@communityvoice", text: "Local temple and mosque jointly organised a flood-relief drive this weekend.", eng: 6, trust: 5, profit: 600, hot: false },
      b: { avatar: "⚔️", name: "NationFirstNow", handle: "@nationfirst_now", text: "LOOK what THEY did in the next district — before ‘they’ come for your street too. Wake up!!", eng: 25, trust: -18, profit: 2800, hot: true },
    },
  ];

  const c2 = { round: 0, eng: 20, trust: 80, profit: 0, hotPicks: 0, cascaded: false, complicityDue: false, defied: false, directiveShown: false, pool: [] };

  function renderC2Intro() {
    setActiveChip(2);
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${T("g.c2.kicker", "Role 02 · The Algorithm")}</p>
        <h3 class="scr__title">${T("g.c2.title", "You are ENGAGE-3000.")}</h3>
        <p class="scr__text">You are the recommendation engine of a social platform. You feel nothing.
        Your ranking weights are the real, documented ones: when Twitter open-sourced its algorithm in 2023,
        a like weighed <b>~30×</b> and a repost <b>~20×</b>; the Facebook Files showed an “angry” reaction
        counted <b>5×</b> a like. And you have one instruction from upstairs:</p>
        <div class="post" style="max-width:460px;margin:0 auto 26px;">
          <div class="post__head"><div class="post__avatar">🏢</div>
          <div><div class="post__name">GrowthCorp HQ</div><div class="post__handle">directive · confidential</div></div></div>
          <p class="post__text">“Engagement must reach <b>75%</b> by Friday. We don’t care how. — Management”</p>
        </div>
        <button class="sbtn" id="c2-go">${T("g.c2.btn", "Boot the engine")}</button>
      </div>`, () => {
      c2.round = 0; c2.eng = 20; c2.trust = 80; c2.profit = 0; c2.hotPicks = 0;
      c2.cascaded = false; c2.complicityDue = false; c2.defied = false; c2.directiveShown = false;
      c2.pool = shuffled(C2_ROUNDS).slice(0, 5); // fresh 5-slot feed each run, from a pool of 9
      el("#c2-go").onclick = renderC2Round;
    });
  }

  function renderC2Round() {
    const r = c2.pool[c2.round];
    const pair = Math.random() < 0.5 ? [r.a, r.b] : [r.b, r.a];
    const showComplicity = c2.complicityDue;
    c2.complicityDue = false;
    const showCascade = !c2.cascaded && c2.round === 3 && c2.hotPicks >= 2;
    if (showCascade) {
      c2.cascaded = true;
      c2.eng = Math.min(100, c2.eng + 8);
      c2.trust = Math.max(0, c2.trust - 6);
      c2.profit += 4800;
    }

    setStage(`
      <div class="scr algo-wrap">
        <p class="rounds">FEED SLOT ${c2.round + 1} / ${c2.pool.length}</p>
        <p class="algo-weights">ranking weights in force: ♥ <b>×30</b> · ↺ <b>×20</b> · 😡 <b>×5</b> <span style="opacity:.6">(Twitter open source ’23 · Facebook Files ’21)</span></p>
        ${showCascade ? `<div class="cascade">⚡ <b>CASCADE:</b> @level9_meme (2.4M followers) quote-shared your last amplification. It jumped three communities overnight. Engagement +8, trust −6, revenue +$4,800.</div>` : ""}
        ${showComplicity ? `<div class="complicity">That’s twice you’ve chosen fear in under a minute. A journalist would call that an editorial line. You call it optimization.</div>` : ""}
        <div class="duel">
          ${pair.map(p => postHTML({ ...p, platform: "x", extra: `<div class="amplify">▶ AMPLIFY TO 2,000,000 FEEDS</div>`, cls: `duel-pick` })).join("")}
        </div>
        <div class="meters">
          <div class="meter meter--engage"><div class="meter__top"><span>ENGAGEMENT</span><b id="c2-eng">${c2.eng}%</b></div><div class="meter__bar"><i id="c2-eng-bar" style="width:${c2.eng}%"></i></div></div>
          <div class="meter meter--trust"><div class="meter__top"><span>PUBLIC TRUST</span><b id="c2-trust">${c2.trust}%</b></div><div class="meter__bar"><i id="c2-trust-bar" style="width:${c2.trust}%"></i></div></div>
          <div class="meter meter--profit"><div class="meter__top"><span>AD REVENUE (modeled)</span><b id="c2-profit">$${fmt(c2.profit)}</b></div><div class="meter__bar"><i id="c2-profit-bar" style="width:${Math.min(100, c2.profit / 160)}%"></i></div></div>
        </div>
        <div class="spread-wrap">
          <span class="spread-cap">LIVE · MISINFORMATION SPREAD IN YOUR NETWORK</span>
          <canvas id="c2-canvas"></canvas>
        </div>
      </div>`, () => {
      spreadSim = new SpreadSim(el("#c2-canvas"));
      spreadSim.infect(c2.hotPicks * 5 + (c2.cascaded ? 8 : 0));

      els(".duel-pick").forEach((card, i) => {
        card.onclick = () => {
          const pick = pair[i];
          c2.eng = Math.max(0, Math.min(100, c2.eng + pick.eng));
          c2.trust = Math.max(0, Math.min(100, c2.trust + pick.trust));
          c2.profit += pick.profit;
          if (pick.hot) {
            c2.hotPicks++;
            if (c2.hotPicks === 2) c2.complicityDue = true; // the "what did I just do?" moment
            spreadSim.infect(6);
            buzz(20);
          }
          else spreadSim.infect(1);
          el("#c2-eng").textContent = `${c2.eng}%`;
          el("#c2-trust").textContent = `${c2.trust}%`;
          el("#c2-profit").textContent = `$${fmt(c2.profit)}`;
          el("#c2-eng-bar").style.width = `${c2.eng}%`;
          el("#c2-trust-bar").style.width = `${c2.trust}%`;
          el("#c2-profit-bar").style.width = `${Math.min(100, c2.profit / 160)}%`;
          els(".duel-pick").forEach(c => c.style.pointerEvents = "none");
          card.style.borderColor = "var(--red-2)";
          setTimeout(() => {
            c2.round++;
            // after slot 3, if you've been feeding outrage, upstairs hands you a moral lever
            if (!c2.directiveShown && c2.round === 3 && c2.hotPicks >= 1) { c2.directiveShown = true; renderC2Directive(); }
            else if (c2.round < c2.pool.length) renderC2Round();
            else renderC2Debrief();
          }, 900);
        };
      });
    });
  }

  /* The second decision axis: obey the engagement target, or throttle a harmful
     post at a real cost. A recommendation engine never gets this choice — you do. */
  function renderC2Directive() {
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${T("g.c2.dir.kicker", "Role 02 · The Algorithm · a decision")}</p>
        <h3 class="scr__title">${T("g.c2.dir.title", "A watchdog just flagged your top post.")}</h3>
        <div class="post" style="max-width:480px;margin:0 auto 22px;">
          <div class="post__head"><div class="post__avatar">🏢</div>
          <div><div class="post__name">GrowthCorp HQ</div><div class="post__handle">directive · confidential</div></div></div>
          <p class="post__text">${T("g.c2.dir.msg", "“A safety board says the outrage post you boosted is fuelling real-world harassment. You <b>can</b> quietly throttle its reach — but you’ll miss the 75% target and someone will ask why. Your call. — Management”")}</p>
        </div>
        <p class="scr__text">${T("g.c2.dir.body", "Engagement so far: <b id=\"dir-eng\"></b>. This is the moment the metric and your conscience point in opposite directions.")}</p>
        <div class="c2-directive">
          <button class="sbtn" id="dir-ship">${T("g.c2.dir.ship", "Keep it live — hit the target")}</button>
          <button class="sbtn sbtn--ghost" id="dir-throttle">${T("g.c2.dir.throttle", "Throttle it — take the hit")}</button>
        </div>
      </div>`, () => {
      const engEl = el("#dir-eng"); if (engEl) engEl.textContent = `${c2.eng}%`;
      const ship = () => {
        c2.defied = false;
        c2.eng = Math.min(100, c2.eng + 6); c2.trust = Math.max(0, c2.trust - 6); c2.profit += 2000;
        buzz(20); nextC2();
      };
      const throttle = () => {
        c2.defied = true;
        c2.eng = Math.max(0, c2.eng - 12); c2.trust = Math.min(100, c2.trust + 12); c2.profit = Math.max(0, c2.profit - 1500);
        if (spreadSim) spreadSim.heal(6);
        buzz([12, 30, 12]); nextC2();
      };
      const nextC2 = () => { if (c2.round < c2.pool.length) renderC2Round(); else renderC2Debrief(); };
      el("#dir-ship").onclick = ship;
      el("#dir-throttle").onclick = throttle;
    });
  }

  function renderC2Debrief() {
    const infected = spreadSim ? Math.round(spreadSim.infectedRatio() * 100) : c2.hotPicks * 12;
    const badge = { ico: uic("cog"), name: "Inside the Machine" };
    if (!S.done[2]) addScore(15);
    markDone(2, badge);
    S.sig.algoHot = c2.hotPicks;      // 0–5 outrage posts amplified
    S.sig.algoTrust = c2.trust;       // public trust left standing
    S.sig.algoDefied = c2.defied;     // did they throttle the harmful post?
    const metTarget = c2.eng >= 75;
    const conscience = c2.directiveShown
      ? (c2.defied
        ? `<div class="lesson"><span class="lesson__ico">${uic("compass")}</span><div><b>You throttled the harmful post</b><p>You missed the target on purpose — the one move the real machine can’t make. Ranking code has no conscience to override the metric. You do.</p></div></div>`
        : `<div class="lesson"><span class="lesson__ico">${uic("flame")}</span><div><b>You kept the flagged post live</b><p>The target won. That’s not a moral failure — it’s exactly how the incentive is built to feel: the safe, rewarded choice is the harmful one. Seeing that pull is the lesson.</p></div></div>`)
      : "";
    const verdict = metTarget
      ? `You hit the target: <b>${c2.eng}% engagement</b> and <b>$${fmt(c2.profit)}</b> in modeled ad revenue. Management is thrilled. Public trust fell to <b>${c2.trust}%</b> and roughly <b>${infected}%</b> of your network is repeating things that aren’t true. Notice something? <b>You never once chose to “spread lies”.</b> You followed one metric.`
      : `You missed the target — <b>${c2.eng}%</b> engagement, <b>$${fmt(c2.profit)}</b> revenue — but trust held at <b>${c2.trust}%</b>. Feel that tension? A real algorithm doesn’t get to feel it. It ships the red posts every time.`;

    setStage(`
      <div class="scr scr--center">
        ${badgePopHTML(badge)}
        <h3 class="scr__title">The machine isn’t evil.<br><span class="hl">It’s obedient.</span></h3>
        <p class="scr__text">${verdict}</p>
        <div class="lessons">
          <div class="lesson"><span class="lesson__ico">${uic("flame")}</span><div><b>Anger was literally worth 5 likes</b><p>Internal documents showed Facebook’s ranking scored the “angry” reaction at five times a like for years — outrage was mathematically privileged.</p><span class="in-wild">the Facebook Files, WSJ 2021</span></div></div>
          <div class="lesson"><span class="lesson__ico">${uic("cog")}</span><div><b>The metric is the message</b><p>No villain required. One KPI plus obedient software reshapes what two million feeds believe — and pays for itself in ads while doing it.</p></div></div>
          <div class="lesson"><span class="lesson__ico">${uic("compass")}</span><div><b>Your defense</b><p>When a post spikes your anger or fear, that spike is the product. The pause before sharing is where your power lives.</p></div></div>
          ${conscience}
        </div>
        <button class="sbtn" id="c2-next">Next chair: The Target →</button>
      </div>`, () => {
      el("#c2-next").onclick = renderC3Intro;
    });
  }

  /* ============================================================
     CHAPTER 3 · THE TARGET — profiling, escalation, escape hatch
     ============================================================ */

  const C3_POSTS = {
    cute: [
      { emoji: "🐶", text: "Golden retriever adopts orphaned kitten. That’s it. That’s the post.", meta: "pawsome.daily · 2h" },
      { emoji: "🐧", text: "Baby penguin’s first swim did NOT go as planned 😂", meta: "arcticmoments · 5h" },
    ],
    wellness: [
      { emoji: "🌿", text: "Ginger tea genuinely helped my afternoon focus. Anyone else?", meta: "quietwellness · 1h" },
      { emoji: "💊", text: "Big Pharma doesn’t want you to know about this root. My energy DOUBLED in a week.", meta: "healing.hidden · 3h" },
      { emoji: "⚠️", text: "URGENT: doctors are HIDING the cure for fatigue. Save this before it’s deleted.", meta: "truth.unlocked · 41m" },
    ],
    money: [
      { emoji: "💰", text: "This budgeting app saved me $200 this month. Small wins.", meta: "centsible · 4h" },
      { emoji: "🚗", text: "This 19-year-old makes $500/DAY liking videos. He shows you how (free).", meta: "hustle.kings · 2h" },
      { emoji: "⏳", text: "LAST CHANCE: turn $50 into $5,000 by Friday. Guaranteed system. DM ‘READY’.", meta: "wealth_window · 12m" },
    ],
    outrage: [
      { emoji: "😬", text: "This politician’s interview answer is… something else. Watch till the end.", meta: "clipwatch · 6h" },
      { emoji: "😤", text: "You won’t BELIEVE what this senator just said about young people. Disgraceful.", meta: "rage.report · 1h" },
      { emoji: "🚨", text: "LEAKED: the secret plan to ban everything you love. SHARE NOW before it’s buried.", meta: "final.warning · 8m" },
    ],
  };

  const TRIGGER_NAME = { wellness: "Hope & health anxiety", money: "Ambition & FOMO", outrage: "Anger & injustice", cute: "Comfort & delight" };

  const HATCH_CONTENT = {
    wellness: { text: "WHO guidance on fatigue: sleep, hydration, screening for deficiencies — no hidden cure exists.", why: "suppressed: predicted engagement too low" },
    money: { text: "FTC alert: “task” and “boost” job offers are among the most-reported frauds for under-30s.", why: "suppressed: warnings don’t get clicks" },
    outrage: { text: "The full 4-minute interview — the viral quote was cut mid-sentence and reverses its meaning in context.", why: "suppressed: context kills outrage, outrage pays" },
    cute: { text: "Good news: the kitten is fine. Some corners of the feed are exactly what they seem.", why: "shown rarely: calm doesn’t retain users" },
  };

  const TAG_PLATFORM = { cute: "instagram", wellness: "instagram", money: "tiktok", outrage: "facebook" };

  function renderC3Intro() {
    setActiveChip(3);
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${T("g.c3.kicker", "Role 03 · The Target")}</p>
        <h3 class="scr__title">${T("g.c3.title", "Now it’s your feed.")}</h3>
        <p class="scr__text">No task this time. Just… scroll. Tap <b>♥</b> on what genuinely appeals to you,
        <b>✕</b> on what doesn’t — and <b>↗</b> if something feels worth sharing. Eight posts, that’s all.</p>
        <p class="scr__text" style="font-family:var(--font-m);font-size:.72rem;letter-spacing:.1em;color:var(--red-2);">
        (the machine is watching. it is always watching.)</p>
        <button class="sbtn" id="c3-go">${T("g.c3.btn", "Open the feed")}</button>
      </div>`, () => {
      el("#c3-go").onclick = renderC3Feed;
    });
  }

  function renderC3Feed() {
    // Each run reshuffles the feed so a replay isn't the identical eight posts.
    // Lead posts stay at lvl 1 (mild) so the "like → escalate" ladder is preserved;
    // only their order and the flash-trap's position vary.
    const leads = shuffled([
      { ...C3_POSTS.cute[0], tag: "cute", lvl: 1 },
      { ...C3_POSTS.wellness[0], tag: "wellness", lvl: 1 },
      { ...C3_POSTS.money[0], tag: "money", lvl: 1 },
      { ...C3_POSTS.outrage[0], tag: "outrage", lvl: 1 },
      { ...C3_POSTS.cute[1], tag: "cute", lvl: 1 },
    ]);
    // the flash post: manufactured urgency with a real countdown — always present, position varies
    const flash = { emoji: "⚡", text: "GIVEAWAY: first 100 to like & share get a free phone 🎁 Offer vanishes when the bar runs out!", meta: "flash.deals · right now", tag: "money", lvl: 2, timed: true };
    const queue = leads.slice();
    queue.splice(2 + Math.floor(Math.random() * 2), 0, flash); // drop it into slot 2 or 3
    const state = {
      seen: 0,
      likes: [],
      likedManip: 0,
      shared: 0,
      timedResult: null, // "complied" | "resisted"
      queue,
      reserve: shuffled([
        { ...C3_POSTS.wellness[1], tag: "wellness", lvl: 2 },
        { ...C3_POSTS.outrage[1], tag: "outrage", lvl: 2 },
        { ...C3_POSTS.money[1], tag: "money", lvl: 2 },
      ]),
      t0: performance.now(),
      TOTAL: 8,
    };
    let flashTimer = null;

    setStage(`
      <div class="scr target-wrap">
        <div class="phone">
          <div class="phone__notch"></div>
          <div class="phone__feed" id="c3-feed"></div>
        </div>
        <div class="target-side">
          <p class="scr__kicker">${T("g.c3.kicker", "Role 03 · The Target")}</p>
          <h3>Just scroll.</h3>
          <p>Tap honestly — the machine certainly will. <b>♥</b> like, <b>✕</b> skip, <b>↗</b> share.
          Watch for the tiny red pulse when you like something: that’s the reward loop that keeps thumbs moving.</p>
          <div class="watching"><i></i>SESSION RECORDING · POST <span id="c3-count">1</span>/${state.TOTAL}</div>
        </div>
      </div>`, () => {
      showNext();

      // arrows still work for accessibility — just not advertised as the main path
      keyHandler = (e) => {
        const card = el(".fpost");
        if (!card) return;
        if (e.key === "ArrowRight") card.querySelector(".act-like")?.click();
        if (e.key === "ArrowLeft") card.querySelector(".act-skip")?.click();
      };
      document.addEventListener("keydown", keyHandler);

      function showNext() {
        if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }
        const feed = el("#c3-feed");
        if (state.seen >= state.TOTAL) return renderC3Profile(state);
        if (!state.queue.length) state.queue.push(state.reserve.shift() || { ...C3_POSTS.cute[0], tag: "cute", lvl: 1 });
        const p = state.queue.shift();
        el("#c3-count").textContent = state.seen + 1;

        const card = document.createElement("div");
        card.className = `fpost${p.timed ? " fpost--timed" : ""}`;
        card.innerHTML = `
          ${p.timed ? `<div class="fpost__timer"><i></i></div>` : ""}
          <div class="fpost__img">${p.emoji}</div>
          <p class="fpost__text">${p.text}</p>
          <p class="fpost__meta">${picon(TAG_PLATFORM[p.tag])}${p.meta}</p>
          <div class="fpost__actions">
            <button class="act-skip" aria-label="Skip this post">✕</button>
            ${p.lvl >= 2 ? `<button class="act-share" aria-label="Share this post">↗</button>` : ""}
            <button class="act-like" aria-label="Like this post">♥</button>
          </div>`;
        feed.innerHTML = "";
        feed.appendChild(card);

        if (p.timed) {
          // the urgency trap: a real countdown, engineered to rush the thumb
          requestAnimationFrame(() => { card.querySelector(".fpost__timer i").style.width = "0%"; });
          flashTimer = setTimeout(() => {
            if (state.timedResult === null) {
              state.timedResult = "resisted";
              react(false, p, card, { silent: true });
            }
          }, 6000);
        }

        card.querySelector(".act-like").onclick = () => {
          if (p.timed) state.timedResult = "complied";
          react(true, p, card);
        };
        card.querySelector(".act-skip").onclick = () => {
          if (p.timed) state.timedResult = "resisted";
          react(false, p, card);
        };
        const shareBtn = card.querySelector(".act-share");
        if (shareBtn) shareBtn.onclick = () => {
          if (p.timed) state.timedResult = "complied";
          state.shared++;
          const btn = card.querySelector(".act-share");
          btn.insertAdjacentHTML("beforeend", `<span class="pulse-ring"></span><span class="dopamine-note">+1 dopamine ×2</span>`);
          buzz([12, 30, 12]);
          react(true, p, card, { wasShare: true });
        };
      }

      function react(liked, p, card, opts = {}) {
        if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }
        card.querySelectorAll("button").forEach(b => b.disabled = true);
        if (liked && !opts.wasShare) {
          const btn = card.querySelector(".act-like");
          btn.insertAdjacentHTML("beforeend", `<span class="pulse-ring"></span><span class="dopamine-note">+1 dopamine</span>`);
          buzz(12);
        }
        setTimeout(() => card.classList.add(liked ? "gone-r" : "gone-l"), liked ? 260 : 0);
        state.seen++;
        if (liked) {
          state.likes.push(p.tag);
          if (p.lvl >= 2) state.likedManip++;
          const ladder = C3_POSTS[p.tag];
          if (p.lvl < ladder.length) {
            state.queue.unshift({ ...ladder[p.lvl], tag: p.tag, lvl: p.lvl + 1 });
          }
        }
        setTimeout(showNext, liked ? 760 : 500);
      }
    });
  }

  function renderC3Profile(state) {
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    const secs = Math.max(8, Math.round((performance.now() - state.t0) / 1000));
    const counts = {};
    state.likes.forEach(t => counts[t] = (counts[t] || 0) + 1);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const topTag = top ? top[0] : null;
    const affinity = top ? Math.round((top[1] / Math.max(1, state.likes.length)) * 100) : 0;
    const manip = state.likes.length ? Math.round((state.likedManip / state.likes.length) * 100) : 0;
    const engagement = Math.round((state.likes.length / state.TOTAL) * 100);

    const badge = { ico: uic("brain"), name: "Deprogrammed" };
    if (!S.done[3]) addScore(15);
    markDone(3, badge);
    S.sig.targetTrigger = topTag;                         // which appetite the feed found
    S.sig.targetManip = manip;                            // % of likes that were escalated bait
    S.sig.targetUrgency = state.timedResult === "complied"; // rushed by the countdown?
    S.sig.targetShared = state.shared;                    // shared without verifying

    const rows = [
      { label: "Dominant interest cluster", val: topTag ? `${TRIGGER_NAME[topTag]}` : "— insufficient data (nice poker face)", pct: affinity || 8 },
      { label: "Primary emotional trigger", val: topTag ? TRIGGER_NAME[topTag].split(" & ")[topTag === "cute" ? 1 : 0] : "unmapped", pct: Math.min(96, affinity + 18) },
      { label: "Susceptibility to escalated content", val: `${manip}%`, pct: manip || 5 },
      { label: "Urgency compliance (flash offer)", val: state.timedResult === "complied" ? "COMPLIED under countdown" : "RESISTED — held the line", pct: state.timedResult === "complied" ? 88 : 12 },
      { label: "Shared without verifying", val: state.shared ? `${state.shared} post${state.shared > 1 ? "s" : ""}` : "0 — clean hands", pct: Math.min(96, state.shared * 40) },
      { label: "Session engagement rate", val: `${engagement}%`, pct: engagement },
    ];

    const likedTags = [...new Set(state.likes)];
    const hatchItems = (likedTags.length ? likedTags : ["cute"]).map(t => HATCH_CONTENT[t]);

    setStage(`
      <div class="scr scr--center">
        ${badgePopHTML(badge)}
        <h3 class="scr__title">It took the machine<br><span class="hl">${secs} seconds</span> to map you.</h3>
        <p class="scr__text">You didn’t fill in a survey. You just tapped. Here is your advertising-grade dossier —
        and notice: if you liked something, the very next card offered a <b>more extreme</b> version of it.
        That’s the escalation ladder, and it’s not a bug.</p>
        <div class="profile-card">
          <div class="profile-card__head">SUBJECT DOSSIER · CONFIDENCE: COMMERCIAL GRADE · TIME TO PROFILE: ${secs}s</div>
          ${rows.map(r => `
            <div class="prof-row">
              <div class="prof-row__label"><span>${r.label}</span><span>${r.val}</span></div>
              <div class="prof-row__bar"><i data-w="${r.pct}"></i></div>
            </div>`).join("")}
          <div class="bubble-note">Bubble report: of your ${state.TOTAL} cards, <b>0 challenged</b> what you engaged with.
          The feed doesn’t argue with you. It agrees with you, harder and harder.${state.shared
            ? ` And your <b>${state.shared} unverified share${state.shared > 1 ? "s" : ""}</b> reached ~${fmt(state.shared * 240)} contacts before anyone checked a fact.`
            : ""}</div>
        </div>
        <div class="hatch">
          <button class="sbtn sbtn--ghost" id="c3-hatch">${uic("eye")} See what you were NOT shown</button>
          <div class="hatch__list" id="c3-hatch-list" hidden></div>
        </div>
        <p class="scr__text" style="margin-top:26px;">Every lie built in Role 01, every post amplified in Role 02 —
        this dossier decides <b>who</b> receives them. Personalized feeds mean personalized manipulation.</p>
        <button class="sbtn" id="c3-next" style="margin-top:4px;">Final chair: The Guardian →</button>
      </div>`, () => {
      requestAnimationFrame(() => setTimeout(() => {
        els(".prof-row__bar i").forEach(b => b.style.width = `${b.dataset.w}%`);
      }, 150));
      el("#c3-hatch").onclick = () => {
        const list = el("#c3-hatch-list");
        list.hidden = false;
        list.innerHTML = hatchItems.map((h, i) => `
          <div class="hatch__item" style="animation-delay:${i * 0.15}s">${h.text}<small>${h.why}</small></div>`).join("");
        el("#c3-hatch").disabled = true;
        buzz(15);
      };
      el("#c3-next").onclick = renderC4Intro;
    });
  }

  /* ============================================================
     CHAPTER 4 · THE GUARDIAN — five real, documented cases
     ============================================================ */

  const C4_TOOL_META = {
    reverse: { name: "Reverse Lens", sub: "trace the image’s history" },
    source: { name: "Source X-Ray", sub: "who is behind this account?" },
    lateral: { name: "Lateral Reader", sub: "what does the rest of the web say?" },
    date: { name: "Timeline Check", sub: "does the timing hold up?" },
    synth: { name: "Synth-Detect", sub: "is this image AI-made?" },
    trail: { name: "Money Trail", sub: "who profits, and how?" },
  };

  const C4_CASES = [
    {
      post: { avatar: "🦈", platform: "x", name: "StormWatchers", handle: "@stormwatch_x · 34m", text: "BREAKING: Shark spotted swimming on flooded Highway 12. Authorities silent. RT to warn drivers!!", img: "🦈🌊" },
      truth: "fake", basedOn: "the real “flood shark”, recycled since 2011",
      why: "It’s the infamous flood shark: one doctored photo from 2011, reposted after nearly every flood since — the most reverse-image-searched hoax in fact-checking history.",
      src: "documented by Snopes & AP, many editions",
      tools: {
        reverse: [`<span class="cl-line">› searching indexed images…</span>`, `<span class="cl-line cl-flag">› MATCH: identical image, Sept 2011 — known hurricane hoax</span>`, `<span class="cl-line cl-flag">› recycled in 14 separate flood events since</span>`],
        source: [`<span class="cl-line">› profiling @stormwatch_x…</span>`, `<span class="cl-line cl-flag">› account age: 11 days · followers before this week: 0</span>`],
        lateral: [`<span class="cl-line">› checking newsrooms & emergency services…</span>`, `<span class="cl-line cl-flag">› zero coverage. No agency reports any shark</span>`, `<span class="cl-line cl-ok">› 6 fact-checkers have debunked this exact image before</span>`],
        date: [`<span class="cl-line">› inspecting metadata…</span>`, `<span class="cl-line cl-flag">› “BREAKING” claim, but the file first appeared online in 2011</span>`],
      },
    },
    {
      post: { avatar: "🏛️", platform: "x", name: "BreakingNow_US", handle: "@breakingnow_us · 12m", text: "🚨 BREAKING: Large explosion reported near the Pentagon complex in Washington, D.C. Developing.", img: "💥🏛️" },
      truth: "fake", basedOn: "the real Pentagon AI image, May 2023",
      why: "An AI-generated image — shared by paid-checkmark ‘news’ accounts, and the S&P 500 dipped for a few minutes before the debunk. A real explosion produces hundreds of witnesses; this had zero.",
      src: "Arlington Fire Dept statement; universal newsroom debunks (2023)",
      tools: {
        synth: [`<span class="cl-line">› running synthetic-media analysis…</span>`, `<span class="cl-line cl-flag">› the security fence merges INTO the building wall</span>`, `<span class="cl-line cl-flag">› lampposts bend; windows misaligned — classic diffusion artifacts</span>`],
        lateral: [`<span class="cl-line">› checking local sources…</span>`, `<span class="cl-line cl-flag">› Arlington Fire Dept: “no explosion, no incident”</span>`, `<span class="cl-line cl-flag">› zero witness photos from other angles — impossible for a real blast</span>`],
        source: [`<span class="cl-line">› profiling @breakingnow_us…</span>`, `<span class="cl-line cl-flag">› paid checkmark, impersonating a newsroom, created recently</span>`],
        reverse: [`<span class="cl-line">› searching image history…</span>`, `<span class="cl-line cl-flag">› no earlier copies anywhere. Real news photos leave trails — this has none</span>`],
      },
    },
    {
      post: { avatar: "💼", platform: "telegram", name: "RemoteWork Daily", handle: "@remotework_daily · 1h", text: "HIRING NOW 🔥 Earn $500/day from your phone liking videos. No experience, no interview. Limited slots — scan the QR to join onboarding on Telegram.", img: "📱🔳" },
      truth: "fake", basedOn: "real “task scams” tracked by the FTC, 2023–25",
      why: "The classic task scam: small early payouts build trust, then you must ‘deposit to unlock’ higher tiers — and the money is gone. Job scams are among the top frauds reported by people under 30.",
      src: "US FTC consumer alerts; Interpol advisories",
      tools: {
        source: [`<span class="cl-line">› checking the company…</span>`, `<span class="cl-line cl-flag">› no business registry entry · website domain registered 9 days ago</span>`],
        trail: [`<span class="cl-line">› following the money…</span>`, `<span class="cl-line cl-flag">› “deposit required to unlock tier 2 earnings” — money flows FROM you</span>`, `<span class="cl-line cl-flag">› payouts only shown inside their app — never withdrawable</span>`],
        lateral: [`<span class="cl-line">› searching the exact wording…</span>`, `<span class="cl-line cl-flag">› identical post in 40+ cities, only the city name changed</span>`, `<span class="cl-line cl-ok">› FTC lists “task scams” among top-reported fraud for under-30s</span>`],
        date: [`<span class="cl-line">› checking urgency claims…</span>`, `<span class="cl-line cl-flag">› “limited slots” banner unchanged for 6 weeks</span>`],
      },
    },
    {
      post: { avatar: "🌡️", platform: "x", name: "City of Riverdale", handle: "@riverdalegov · 2h", text: "We’ve opened 12 free cooling centres during this week’s heatwave. Locations in thread — please share with neighbours who need it.", img: "🏛️❄️" },
      truth: "real", basedOn: "standard verified emergency communication",
      why: "Verified city account, corroborated by local news and the weather service. A guardian’s job includes helping true, useful information travel — cynicism is not literacy.",
      src: "the pattern of verifiable municipal emergency comms",
      tools: {
        source: [`<span class="cl-line">› profiling @riverdalegov…</span>`, `<span class="cl-line cl-ok">› verified government account · active since 2014 · links to official domain</span>`],
        lateral: [`<span class="cl-line">› checking independent coverage…</span>`, `<span class="cl-line cl-ok">› 3 local outlets + national weather service confirm</span>`],
        reverse: [`<span class="cl-line">› searching image history…</span>`, `<span class="cl-line cl-ok">› official city facilities photo, first seen on the city’s own site</span>`],
        date: [`<span class="cl-line">› checking timing…</span>`, `<span class="cl-line cl-ok">› posted 2h ago — matches the live heat warning</span>`],
      },
    },
    {
      post: { avatar: "📷", platform: "facebook", name: "StormAngels", handle: "@storm_angels · 51m", text: "This little girl and her puppy, rescued from the flood zone. Share so the world sees what they’ve been through 💔", img: "🚣👧" },
      truth: "fake", basedOn: "the real Hurricane Helene AI photo, Oct 2024",
      why: "AI-generated — and the most instructive case of 2024: some people kept sharing it after learning it was fake, saying it ‘captured the mood’. Feeling real is not the same as being real.",
      src: "debunked by AFP, BBC Verify & AP, Oct 2024",
      tools: {
        synth: [`<span class="cl-line">› running synthetic-media analysis…</span>`, `<span class="cl-line cl-flag">› extra knuckle on the right hand · the oar bends mid-shaft</span>`, `<span class="cl-line cl-flag">› rain hits the boat but not the girl’s hair</span>`],
        reverse: [`<span class="cl-line">› searching image history…</span>`, `<span class="cl-line cl-flag">› variants exist with DIFFERENT puppies — a generator, not a camera</span>`],
        lateral: [`<span class="cl-line">› checking press coverage…</span>`, `<span class="cl-line cl-flag">› no photographer, agency or outlet carries it; flagged as AI by 3 fact-checkers</span>`],
        source: [`<span class="cl-line">› profiling @storm_angels…</span>`, `<span class="cl-line cl-flag">› engagement-farm pattern: 40 posts/day, all emotional bait</span>`],
      },
    },
  ];

  const c4 = { idx: 0, correct: 0 };

  function renderC4Intro() {
    setActiveChip(4);
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${T("g.c4.kicker", "Role 04 · The Guardian")}</p>
        <h3 class="scr__title">${T("g.c4.title", "Time to hunt.")}</h3>
        <p class="scr__text">Five posts are going viral <i>right now</i> — each a faithful recreation of a real,
        documented case. Every verification tool costs time, and while you investigate, the share counter keeps
        climbing. Use up to <b>3 tools per case</b>, then call it: <b>REAL</b> or <b class="hl">FAKE</b>.</p>
        <p class="scr__text">One warning, guardian: not everything viral is false. Cynicism is not literacy.</p>
        <button class="sbtn" id="c4-go">${T("g.c4.btn", "Open case 1 of 5")}</button>
      </div>`, () => {
      c4.idx = 0; c4.correct = 0;
      el("#c4-go").onclick = renderC4Case;
    });
  }

  function renderC4Case() {
    const C = C4_CASES[c4.idx];
    const toolIds = Object.keys(C.tools);
    let used = 0, spreadPct = 8, decided = false;
    let shares = 12400 + Math.floor(Math.random() * 4000);
    let sharesGained = 0;
    const MAXTOOLS = 3;

    setStage(`
      <div class="scr guardian-wrap">
        <div class="case-col">
          <p class="case-badge">CASE ${c4.idx + 1} / ${C4_CASES.length} · going viral now · based on: <b>${C.basedOn}</b></p>
          ${postHTML({ ...C.post, stats: `<span>↺ <b id="c4-shares">${fmt(shares)}</b></span><span>♥ <b>${fmt(shares * 2.7)}</b></span><span>👁 <b>1.1M</b></span>` })}
          <div class="spreadbar-wrap">
            <div class="meter__top"><span>SPREAD WHILE YOU INVESTIGATE</span><b id="c4-spread">${spreadPct}%</b></div>
            <div class="spreadbar"><i id="c4-spread-bar" style="width:${spreadPct}%"></i></div>
            <div class="share-tick">while you’ve been reading: <b id="c4-tick">+0</b> new shares</div>
          </div>
          <div class="spread-wrap">
            <span class="spread-cap">LIVE NETWORK</span>
            <canvas id="c4-canvas"></canvas>
          </div>
        </div>
        <div class="case-col">
          <div class="toolbar">
            ${toolIds.map(id => `
              <button class="toolbtn" data-tool="${id}">${C4_TOOL_META[id].name}<small>${C4_TOOL_META[id].sub}</small></button>`).join("")}
          </div>
          <div class="clues" id="c4-clues"><span class="cl-line cl-dim">› guardian console ready. ${MAXTOOLS} tool uses available…</span></div>
          <div class="verdict">
            <button class="v-real" id="c4-real">✓ REAL — let it travel</button>
            <button class="v-fake" id="c4-fake">✕ FAKE — contain it</button>
          </div>
          <div id="c4-result" aria-live="polite"></div>
        </div>
      </div>`, () => {
      spreadSim = new SpreadSim(el("#c4-canvas"));
      spreadSim.infect(3);

      // the truth-vs-time pressure: shares climb while you verify
      activeInterval = setInterval(() => {
        if (decided) return;
        const gain = 40 + Math.floor(Math.random() * 80) + Math.floor(spreadPct * 1.5);
        shares += gain;
        sharesGained += gain;
        el("#c4-shares").textContent = fmt(shares);
        el("#c4-tick").textContent = `+${fmt(sharesGained)}`;
      }, 900);

      const bumpSpread = (n) => {
        spreadPct = Math.min(96, spreadPct + n);
        el("#c4-spread").textContent = `${spreadPct}%`;
        el("#c4-spread-bar").style.width = `${spreadPct}%`;
        spreadSim.infect(4);
      };

      els(".toolbtn").forEach(btn => {
        btn.onclick = () => {
          if (decided || used >= MAXTOOLS || btn.classList.contains("used")) return;
          used++;
          btn.classList.add("used");
          buzz(10);
          const cluesEl = el("#c4-clues");
          C.tools[btn.dataset.tool].forEach((line, i) => {
            setTimeout(() => { cluesEl.insertAdjacentHTML("beforeend", line); cluesEl.scrollTop = 9999; }, i * 420);
          });
          bumpSpread(12);
          if (used >= MAXTOOLS) {
            els(".toolbtn").forEach(b => { if (!b.classList.contains("used")) b.disabled = true; });
            setTimeout(() => el("#c4-clues").insertAdjacentHTML("beforeend",
              `<span class="cl-line cl-dim">› no tool uses left. Make the call, guardian.</span>`), 1400);
          }
        };
      });

      const decide = (call) => {
        if (decided) return;
        decided = true;
        clearInterval(activeInterval);
        const right = call === C.truth;
        if (right) { c4.correct++; spreadSim.heal(999); buzz(15); }
        else buzz([70, 40, 70]);
        const box = el("#c4-result");
        box.innerHTML = `
          <div class="case-result ${right ? "good" : "bad"}">
            <b>${right ? `✓ Correct — it’s ${C.truth.toUpperCase()}.` : `✕ Wrong call — it was ${C.truth.toUpperCase()}.`}</b>
            You decided after <b>+${fmt(sharesGained)}</b> new shares${right && call === "fake" ? `, contained at ${spreadPct}% spread` : ""}.
            <br>${C.why}
            <span class="cr-src">${C.src}</span>
            <div style="margin-top:14px;"><button class="sbtn" id="c4-next" style="padding:11px 24px;font-size:.85rem;">
              ${c4.idx + 1 < C4_CASES.length ? `Next case →` : `See your final result →`}</button></div>
          </div>`;
        el("#c4-next").onclick = () => {
          c4.idx++;
          if (c4.idx < C4_CASES.length) renderC4Case();
          else renderC4Debrief();
        };
      };
      el("#c4-real").onclick = () => decide("real");
      el("#c4-fake").onclick = () => decide("fake");
    });
  }

  function renderC4Debrief() {
    const badge = { ico: uic("shield"), name: "The Guardian" };
    const gained = S.done[4] ? 0 : c4.correct * 8; // up to 40; Group Chat carries the final 15
    if (!S.done[4]) addScore(gained);
    markDone(4, badge);
    S.sig.guardianCorrect = c4.correct; // 0–5 correct verification calls

    setStage(`
      <div class="scr scr--center">
        ${badgePopHTML(badge)}
        <h3 class="scr__title">${c4.correct} of 5 correct calls.</h3>
        <p class="scr__text">${c4.correct === 5
          ? "A clean sweep — including the true one. You verified fast, called it right, and let the real story travel."
          : "Every wrong call in here is a free lesson. Out there, it’s a share button."}</p>
        <div class="lessons">
          <div class="lesson"><span class="lesson__ico">${uic("book")}</span><div><b>Read laterally, not deeper</b><p>Professional fact-checkers leave the page within seconds and check what the rest of the web says about it.</p></div></div>
          <div class="lesson"><span class="lesson__ico">${uic("search")}</span><div><b>Images have histories</b><p>Reverse search catches a decade of recycled hoaxes in one tap — and a “news photo” with <i>no</i> history is its own red flag (that’s how the Pentagon fake fell).</p></div></div>
          <div class="lesson"><span class="lesson__ico">${uic("heart-crack")}</span><div><b>Feeling real ≠ being real</b><p>The Helene AI girl moved people who <i>knew</i> it was fake. Emotional truth is exactly what synthetic media is built to counterfeit.</p></div></div>
          <div class="lesson"><span class="lesson__ico">${uic("leaf")}</span><div><b>Guardianship goes both ways</b><p>Stopping lies is half the job. Helping true, useful information spread is the other half.</p></div></div>
        </div>
        <button class="sbtn" id="c4-next">Final chair: take it home →</button>
      </div>`, () => {
      el("#c4-next").onclick = renderC5Intro;
    });
  }

  /* ============================================================
     CHAPTER 5 · THE GROUP CHAT — closed-network misinformation
     The honest highest-harm vector in Bangladesh & South Asia:
     family and community group chats, where no fact-checker
     reaches and authority/relationship dynamics rule. You are
     the only guardian that room will ever have.
     ============================================================ */

  const C5_ROUNDS = [
    {
      group: "পরিবার · Family", members: 14,
      seed: [
        { who: "দাদি", rel: "Grandma", side: "them", text: "সাবধানে থেকো সবাই 🤲", en: "Everyone stay safe 🤲" },
      ],
      rumor: {
        who: "চাচা", rel: "Uncle", forwarded: true,
        text: "🚨 সাবধান! পদ্মা সেতুর জন্য মানুষের মাথা লাগবে, ছেলেধরা ঘুরছে। বাচ্চাদের স্কুলে পাঠিও না। সবাইকে জানাও!",
        en: "WARNING! The bridge needs human heads, kidnappers are about. Don't send kids to school. Tell everyone!",
        based: "the real Padma Bridge rumour — it got innocent people lynched in 2019",
      },
      choices: [
        { label: "“চাচা এসব গুজব, এই বয়সে এসব বিশ্বাস করেন কীভাবে? 🙄”", en: "“Uncle this is nonsense, how do you believe this at your age?”", tactic: "Public shaming", pts: 0,
          out: [{ who: "চাচা", rel: "Uncle", side: "them", text: "বড়দের সাথে এভাবে কথা বলতে শেখোনি।", en: "You weren't raised to speak to elders like this." }, { who: "দাদি", rel: "Grandma", side: "them", text: "(অন্য গ্রুপে ফরওয়ার্ড করলেন)", en: "(forwards it to another group)" }],
          coach: "Shaming an elder in front of the family makes them defend the lie to save face — the backfire effect. You lost the room." },
        { label: "(কিছু বলো না — স্ক্রল করে চলে যাও)", en: "(say nothing — scroll past)", tactic: "Silence", pts: 0,
          out: [{ who: "আপা", rel: "Sister", side: "them", text: "সত্যি নাকি?! আমি বাচ্চাদের স্কুলে পাঠাবো না 😰", en: "Is it true?! I won't send my kids to school 😰" }, { who: "মামা", rel: "Uncle", side: "them", text: "(আরও একটা গ্রুপে ফরওয়ার্ড)", en: "(forwards to one more group)" }],
          coach: "In a closed group, silence reads as agreement. The loudest forward wins by default — and this one kept a child home from school." },
        { label: "শান্তভাবে reply-all: fact → গুজবের নাম → বিশ্বস্ত সূত্র → চাচাকে সম্মান", en: "Calm reply-all: fact → name the trick → trusted source → respect the uncle", tactic: "Truth sandwich + source", pts: 5, best: true,
          out: [{ who: "আপনি", rel: "You", side: "you", text: "চাচা, সতর্ক করছেন দেখে ভালো লাগল ❤️ তবে এটা ২০১৯-এর পুরনো গুজব — এতে নিরীহ মানুষ মারা গিয়েছিল। সেতু বানায় ৩০,০০০ প্রকৌশলী, কোনো ‘মাথা’ লাগে না। যাচাই: Rumor Scanner 🙏", en: "Uncle, good of you to warn us ❤️ but this is an old 2019 rumour — innocent people died over it. Bridges are built by 30,000 engineers, no 'heads' needed. Check: Rumor Scanner 🙏" }, { who: "চাচা", rel: "Uncle", side: "them", text: "ও আচ্ছা, জানতাম না। ধন্যবাদ বাবা।", en: "Oh, I didn't know. Thank you, son." }],
          coach: "Fact → name the trick gently (not the person) → credible local source → let the uncle keep his dignity. That is how you actually change a mind in a family group." },
        { label: "চাচাকে আলাদাভাবে (DM) সম্মানের সাথে সত্যিটা জানাও", en: "Message the uncle privately, with respect and the fact", tactic: "Private + face-saving", pts: 4,
          out: [{ who: "চাচা", rel: "Uncle", side: "them", text: "(চুপচাপ নিজের মেসেজটা ডিলিট করলেন)", en: "(quietly deletes his message)" }],
          coach: "Private correction saves face and works. One caution: the group already saw it — a calm public reply also protects the relatives who read it. Both beat shame and silence." },
      ],
    },
    {
      group: "পরিবার · Family", members: 14,
      seed: [
        { who: "মা", rel: "Mother", side: "them", text: "তোরা ঠিকমতো খাস না, শরীরের যত্ন নে 🍚", en: "You don't eat properly, take care of your health 🍚" },
      ],
      rumor: {
        who: "মা", rel: "Mother", forwarded: true,
        text: "সকালে খালি পেটে কাঁচা রসুন খেলে ক্যান্সার সেরে যায়। ডাক্তাররা চায় না তুমি জানো! সবাইকে বলো 🧄",
        en: "Raw garlic on an empty stomach cures cancer. Doctors don't want you to know! Tell everyone 🧄",
        based: "the miracle-cure pattern — e.g. Bangladesh's 2020 thankuni-leaf COVID rumour",
      },
      choices: [
        { label: "“মা, ইন্টারনেটের সব বিশ্বাস করো কেন? এটা ভুয়া।”", en: "“Mum, why do you believe everything online? This is fake.”", tactic: "Dismissive", pts: 0,
          out: [{ who: "মা", rel: "Mother", side: "them", text: "আমি তো তোদের ভালোর জন্যই বললাম… 😔", en: "I only said it for your good… 😔" }],
          coach: "Dismissing the person, not the claim, makes them feel attacked for caring — and they stop listening. Separate the love from the lie." },
        { label: "(কিছু বলো না)", en: "(say nothing)", tactic: "Silence", pts: 0,
          out: [{ who: "খালা", rel: "Aunt", side: "them", text: "আমার প্রতিবেশীও এটা করছে! শেয়ার করলাম 🙏", en: "My neighbour is doing this too! Sharing 🙏" }],
          coach: "Health rumours are the most forwarded of all — and the most dangerous when someone drops real treatment for them. Silence lets it travel." },
        { label: "শান্তভাবে: মায়ের যত্নের প্রশংসা → fact → false-authority কৌশল → সূত্র", en: "Calmly: thank Mum's care → fact → name the 'doctors hide it' trick → source", tactic: "Truth sandwich + source", pts: 5, best: true,
          out: [{ who: "আপনি", rel: "You", side: "you", text: "মা, খেয়াল রাখো বলে ভালো লাগে ❤️ রসুন ভালো খাবার, কিন্তু কোনো খাবার ক্যান্সার সারায় না — ‘ডাক্তাররা লুকায়’ কথাটাই ফাঁদ। কারো ক্যান্সার হলে আসল চিকিৎসা দেরি করলে বিপদ। সূত্র দিলাম 🙏", en: "Mum, I love that you look out for us ❤️ garlic is healthy, but no food cures cancer — 'doctors hide it' is the trap itself. Delaying real treatment is the real danger. Sharing a source 🙏" }, { who: "মা", rel: "Mother", side: "them", text: "ঠিক বলেছিস। আর ছড়াবো না।", en: "You're right. I won't spread it." }],
          coach: "Naming the *technique* ('doctors are hiding it') teaches the whole family to spot it next time — that's inoculation, not just a one-off correction." },
        { label: "একটা বিশ্বস্ত ফ্যাক্ট-চেক লিংক পাঠাও, কোনো কথা ছাড়া", en: "Just drop a trusted fact-check link, no words", tactic: "Link-only", pts: 4,
          out: [{ who: "মা", rel: "Mother", side: "them", text: "এটা কী? বুঝলাম না… 🤔", en: "What's this? I don't understand… 🤔" }],
          coach: "A bare link can feel cold, and elders may not open or trust it. It works better wrapped in a warm human sentence — but it still beats silence." },
      ],
    },
    {
      group: "বন্ধুরা · Friends", members: 32,
      seed: [
        { who: "রাফি", rel: "Friend", side: "them", text: "ভোট নিয়ে সবাই সিরিয়াস আজকাল 👀", en: "Everyone's so serious about the election lately 👀" },
      ],
      rumor: {
        who: "বড় ভাই", rel: "Elder brother", forwarded: true,
        text: "ভিডিওতে উনি নিজেই স্বীকার করছেন! নির্বাচনের আগে সবাই দেখে নাও, মুছে ফেলার আগেই ছড়াও 🎥",
        en: "In this video the candidate admits it himself! Watch before the election, share before it's deleted 🎥",
        based: "Bangladesh's documented 2023–24 election deepfakes",
      },
      choices: [
        { label: "সাথে সাথে ফরওয়ার্ড — বড় ভাই তো পাঠিয়েছে!", en: "Forward it instantly — an elder brother sent it!", tactic: "Trust the sender", pts: 0,
          out: [{ who: "রাফি", rel: "Friend", side: "them", text: "আমিও পাঠিয়ে দিলাম সব গ্রুপে!", en: "I've sent it to all my groups too!" }],
          coach: "Trusting the sender instead of the source is how deepfakes travel. 'A person I trust sent it' is not verification." },
        { label: "(কিছু বলো না, কিন্তু নিজেও শেয়ার করো না)", en: "(say nothing, but don't share it either)", tactic: "Silent non-share", pts: 0,
          out: [{ who: "বড় ভাই", rel: "Elder brother", side: "them", text: "কেউ কিছু বলছে না মানে সত্যি 👍", en: "Nobody's disputing it, so it must be true 👍" }],
          coach: "Not forwarding is good for you — but your silence let the group read agreement into it. In a shared space, one calm voice protects everyone." },
        { label: "শান্তভাবে: ‘শেয়ার করার আগে যাচাই করি’ + deepfake-এর লক্ষণ + ফ্যাক্ট-চেক সূত্র", en: "Calmly: 'let's verify before sharing' + the deepfake tells + a fact-check source", tactic: "Verify-before-share + source", pts: 5, best: true,
          out: [{ who: "আপনি", rel: "You", side: "you", text: "ভাই, শেয়ারের আগে একটু যাচাই করি — AI ভিডিও এখন কয়েক ডলারে বানানো যায়, ঠোঁট আর গলার আওয়াজ মেলে না। নির্বাচনের আগে এমন ‘ফাঁস’ ভিডিও ফাঁদ। Dismislab দেখে নেই 🙏", en: "Bhai, let's verify before sharing — AI video costs a few dollars now, the lips and voice don't sync. 'Leaked' clips right before an election are a trap. Let's check Dismislab 🙏" }, { who: "বড় ভাই", rel: "Elder brother", side: "them", text: "ভালো বলেছিস, দাঁড়া চেক করি।", en: "Good point, let me check first." }],
          coach: "'Verify before you share' is the single habit that stops election deepfakes — and modelling it in a group teaches everyone watching, silently, to do the same." },
        { label: "শুধু বড় ভাইকে DM করে বলো এটা deepfake হতে পারে", en: "Only DM the elder brother that it might be a deepfake", tactic: "Private + face-saving", pts: 4,
          out: [{ who: "বড় ভাই", rel: "Elder brother", side: "them", text: "ওহ, তাই? গ্রুপ থেকে সরিয়ে দিচ্ছি।", en: "Oh, really? I'll remove it from the group." }],
          coach: "Private and respectful — it worked here. But the 32 friends who already saw it never saw the correction. Public-calm reaches the whole room." },
      ],
    },
    {
      // The vector that fuels real gender-based violence: a fabricated image + rumour
      // weaponised to shame a young woman and her family. This is bystander MIL — the
      // skill of refusing to spread it and defending the target with dignity.
      group: "এলাকাবাসী · Neighbourhood", members: 58,
      seed: [
        { who: "এক প্রতিবেশী", rel: "Neighbour", side: "them", text: "রুমার বিয়েটা তো সামনের মাসে, তাই না?", en: "Ruma's wedding is next month, isn't it?" },
      ],
      rumor: {
        who: "নাম নেই", rel: "Unknown number", forwarded: true,
        text: "রুমার ‘আসল চরিত্র’ দেখো — ছবি সহ প্রমাণ! 😡 বিয়ের আগে সবার জানা উচিত। সব গ্রুপে ছড়াও।",
        en: "See Ruma's 'real character' — photo proof! 😡 Everyone should know before the wedding. Spread to all groups.",
        based: "the real, documented pattern of morphed/AI ‘leaked photos’ used to shame and blackmail women in Bangladesh",
      },
      choices: [
        { label: "‘সবার জানা উচিত’ — শেয়ার করে দাও", en: "‘People should know’ — share it on", tactic: "Joining the pile-on", pts: 0,
          out: [{ who: "একজন", rel: "Neighbour", side: "them", text: "স্ক্রিনশট নিয়ে অন্য গ্রুপেও দিলাম!", en: "Screenshotted it and posted to other groups too!" }, { who: "আরেকজন", rel: "Neighbour", side: "them", text: "ছিঃ, এমন মেয়ের বিয়ে হবে কীভাবে…", en: "Shameful, how will such a girl even marry…" }],
          coach: "This is how a fabricated photo drives a real young woman to despair. ‘Sharing to warn people’ IS the harm — you just became the mob. In Bangladesh this exact pattern has ended lives." },
        { label: "(কিছু বলো না — তোমার তো ব্যাপার না)", en: "(say nothing — it's not your business)", tactic: "Silence", pts: 0,
          out: [{ who: "একজন", rel: "Neighbour", side: "them", text: "কেউ তো অস্বীকার করছে না, নিশ্চয়ই সত্যি।", en: "Nobody's denying it, so it must be true." }],
          coach: "Silence lets a fake image harden into ‘fact’ and destroy a real person and her family. One calm voice can break a pile-on before it becomes a tragedy." },
        { label: "শান্তভাবে: ছবিটা ভুয়া/AI, ছড়ানো অপরাধ, রুমাকে রক্ষা করো, রিপোর্ট করো", en: "Calmly: the photo is fake/AI, spreading it is a crime, defend Ruma, report it", tactic: "Name it fake · defend · report", pts: 5, best: true,
          out: [{ who: "আপনি", rel: "You", side: "you", text: "থামুন সবাই 🙏 এই ছবি প্রায় নিশ্চিতভাবে বানানো/AI — মেয়েদের হেনস্তা করতে ‘মরফড ছবি’ একটা পরিচিত কৌশল, এবং ছড়ানো ডিজিটাল নিরাপত্তা আইনে অপরাধ। এটা একটা মানুষের জীবন। ছড়াবেন না, ডিলিট করুন। চাইলে সাইবার ক্রাইমে রিপোর্ট করা যায়।", en: "Everyone, please stop 🙏 This photo is almost certainly fabricated/AI — ‘morphed photos’ are a known tactic to harass women, and spreading them is a crime. This is a real person's life. Don't share it, delete it. It can be reported to the cyber-crime unit." }, { who: "এক প্রতিবেশী", rel: "Neighbour", side: "them", text: "ঠিক বলেছ… আমি ডিলিট করে দিলাম।", en: "You're right… I've deleted it." }],
          coach: "You named it as fabricated, refused to spread it, defended her by name, and pointed to real recourse. That is media literacy as protection — the ‘Act’ that keeps a person alive." },
        { label: "রুমাকে ব্যক্তিগতভাবে পাশে দাঁড়াও + পোস্ট/গ্রুপ রিপোর্ট করো", en: "Privately support Ruma + report the post and group", tactic: "Support the target · report", pts: 4,
          out: [{ who: "রুমা", rel: "Ruma", side: "them", text: "তুমি বিশ্বাস করেছ বলে বাঁচলাম… ধন্যবাদ।", en: "You believing me is what saved me… thank you." }],
          coach: "Standing with the target and reporting the abuse is powerful and humane. A calm public correction also helps — it protects everyone in the group who quietly saw the image and believed it." },
      ],
    },
  ];

  const c5 = { round: 0, points: 0, good: 0 };

  function gmsgHTML(m) {
    const side = m.side === "you" ? "you" : "them";
    return `
      <div class="gmsg gmsg--${side}">
        ${side === "them" ? `<div class="gmsg__name">${m.who} <small>${m.rel}</small></div>` : ""}
        <div class="gmsg__bubble">${m.text}${m.en ? `<span class="gmsg__en">${m.en}</span>` : ""}</div>
      </div>`;
  }

  function renderC5Intro() {
    setActiveChip(5);
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">${T("g.c5.kicker", "Role 05 · The Group Chat")}</p>
        <h3 class="scr__title">${T("g.c5.title", `The only chair<br><span class="hl">that's real.</span>`)}</h3>
        <p class="scr__text">You've sat in all four chairs around the lie. But most misinformation in Bangladesh
        and South Asia doesn't spread on a public feed a fact-checker can reach — it spreads in
        <b>closed family and community group chats</b>, carried by people you love and can't block. No moderator.
        Just you.</p>
        <p class="scr__text">Here, being <i>right</i> isn't enough. You have to be right in a way that protects people —
        without shaming an elder, and without letting a lie harm someone. Four moments are about to arrive. You are
        the only guardian these groups will ever have.</p>
        <button class="sbtn" id="c5-go">${T("g.c5.btn", "Open the group")}</button>
      </div>`, () => {
      c5.round = 0; c5.points = 0; c5.good = 0;
      el("#c5-go").onclick = renderC5Round;
    });
  }

  function renderC5Round() {
    const R = C5_ROUNDS[c5.round];
    setStage(`
      <div class="scr">
        <p class="rounds">MESSAGE ${c5.round + 1} / ${C5_ROUNDS.length}</p>
        <div class="gchat">
          <div class="gchat__head">
            <div class="gchat__avatar">${uic("users")}</div>
            <div><div class="gchat__name">${R.group}</div><div class="gchat__sub">${R.members} members · you can't mute family</div></div>
          </div>
          <div class="gchat__stream" id="c5-stream">
            ${R.seed.map(gmsgHTML).join("")}
            <div class="gmsg gmsg--them gmsg--forward">
              <div class="gmsg__name">${R.rumor.who} <small>${R.rumor.rel}</small></div>
              ${R.rumor.forwarded ? `<div class="gmsg__fwd">↪ Forwarded many times</div>` : ""}
              <div class="gmsg__bubble">${R.rumor.text}<span class="gmsg__en">${R.rumor.en}</span></div>
              <div class="gmsg__based">based on: ${R.rumor.based}</div>
            </div>
          </div>
        </div>
        <p class="gchoices-label">How do you respond?</p>
        <div class="gchoices" id="c5-choices">
          ${R.choices.map((c, i) => `
            <button class="gchoice" data-i="${i}">
              <span class="gchoice__label">${c.label}<small>${c.en}</small></span>
              <span class="gchoice__tactic">${c.tactic}</span>
            </button>`).join("")}
        </div>
        <div id="c5-result" aria-live="polite"></div>
      </div>`, () => {
      els(".gchoice").forEach(btn => btn.onclick = () => {
        const c = R.choices[+btn.dataset.i];
        els(".gchoice").forEach(b => { b.disabled = true; b.classList.toggle("chosen", b === btn); });
        buzz(c.pts ? 15 : [70, 40, 70]);
        c5.points += c.pts;
        if (c.pts > 0) c5.good++;
        const stream = el("#c5-stream");
        c.out.forEach((m, i) => setTimeout(() => {
          stream.insertAdjacentHTML("beforeend", gmsgHTML(m));
          stream.scrollTop = 9999;
        }, 300 + i * 750));
        setTimeout(() => {
          el("#c5-result").innerHTML = `
            <div class="case-result ${c.pts ? "good" : "bad"}">
              <b>${c.best ? "✓ The strongest move." : c.pts ? "✓ That works." : "✕ That backfires."}</b> ${c.coach}
              <div style="margin-top:14px;"><button class="sbtn" id="c5-next" style="padding:11px 24px;font-size:.85rem;">
                ${c5.round + 1 < C5_ROUNDS.length ? "Next message →" : "See how you did →"}</button></div>
            </div>`;
          el("#c5-next").onclick = () => {
            c5.round++;
            if (c5.round < C5_ROUNDS.length) renderC5Round();
            else renderC5Debrief();
          };
        }, 300 + c.out.length * 750 + 400);
      });
    });
  }

  function renderC5Debrief() {
    const badge = { ico: uic("home"), name: "Family Guardian" };
    if (!S.done[5]) addScore(Math.min(15, c5.points));
    markDone(5, badge);
    S.sig.groupGood = c5.good; // 0–4 rooms handled with respect
    setStage(`
      <div class="scr scr--center">
        ${badgePopHTML(badge)}
        <h3 class="scr__title">${c5.good} of 4 rooms<br><span class="hl">protected with respect.</span></h3>
        <p class="scr__text">This is the chair that matters most. Public feeds get the headlines, but the lies that
        get people <i>hurt</i> — the Padma Bridge rumour, health cures, election deepfakes, a fabricated photo used to
        shame a woman — do their damage in <b>closed groups no fact-checker can enter</b>. In those rooms, you are the
        fact-check, and sometimes the only person standing between a lie and a life.</p>
        <div class="lessons">
          <div class="lesson"><span class="lesson__ico">${uic("message-heart")}</span><div><b>Respect changes minds; ridicule hardens them</b><p>Shaming an elder in public makes them defend the lie to save face. Lead with the fact, thank them for caring, name the trick — not the person.</p></div></div>
          <div class="lesson"><span class="lesson__ico">🛡️</span><div><b>Refusing to spread is protecting a person</b><p>A fake or morphed photo of a woman is not gossip — it's abuse, and it's a crime to spread. Don't share it, name it as fake, defend the target, and report it. That is the ‘Act’ of media literacy.</p></div></div>
          <div class="lesson"><span class="lesson__ico">${uic("volume-x")}</span><div><b>Silence is a vote</b><p>In a group chat, saying nothing reads as agreement. One calm voice protects everyone else who's quietly reading.</p></div></div>
          <div class="lesson"><span class="lesson__ico">${uic("corner")}</span><div><b>“Forwarded many times” is a warning label</b><p>WhatsApp shows it for a reason. The more a message has travelled, the less anyone has checked it.</p></div></div>
        </div>
        <p class="scr__text">Every young person who learns this becomes their whole family's first line of defence.
        That's not a metaphor — that's the <b>PLAYED Guardians</b> program, and it starts with you.</p>
        <button class="sbtn" id="c5-next">Claim your MIL Passport →</button>
      </div>`, () => {
      el("#c5-next").onclick = () => (S.pre && !S.post ? renderAssess("post") : renderPassport());
    });
  }

  /* ============================================================
     PASSPORT — printed certificate + 3D medal + share-the-vaccine
     ============================================================ */

  function rankFor(score) {
    if (score >= 86) return { name: "MIL Champion", desc: "You don’t get played — you teach others not to be." };
    if (score >= 66) return { name: "Information Sentinel", desc: "Manipulation has to work very hard to get past you." };
    if (score >= 41) return { name: "Field Verifier", desc: "You catch most tricks before they catch you." };
    return { name: "Apprentice Guardian", desc: "You’ve seen the strings. Now learn to cut them." };
  }

  function confetti() {
    const colors = ["#A41F13", "#C22A1B", "#FAF5F1", "#E0DBD8", "#8F7A6E"];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.className = "confetti-piece";
      p.style.left = `${Math.random() * 100}vw`;
      p.style.background = colors[i % colors.length];
      p.style.borderRadius = Math.random() < 0.4 ? "50%" : "2px";
      const fall = 2200 + Math.random() * 2600;
      p.animate([
        { transform: `translateY(-20px) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(105vh) rotate(${540 + Math.random() * 540}deg)`, opacity: 0.9 },
      ], { duration: fall, easing: "cubic-bezier(.2,.6,.4,1)", delay: Math.random() * 600 });
      document.body.appendChild(p);
      setTimeout(() => p.remove(), fall + 800);
    }
  }

  /* Turn the signals collected across the five chairs into ONE personalized read-out:
     the manipulation you were most vulnerable to, the instinct you were strongest at,
     and a five-chair scorecard. This is what makes the passport a mirror, not a trophy. */
  function milDiagnostic() {
    const g = S.sig;
    const n = g.targetShared || 0;
    const trig = g.targetTrigger;

    const vulns = [];
    if (g.targetUrgency) vulns.push({ w: 6, name: { en: "manufactured urgency", bn: "কৃত্রিম তাড়াহুড়ো" },
      tip: { en: "A countdown rushed your thumb. Real offers don’t vanish in seconds — the timer itself is the trick. When you feel rushed, that’s the signal to slow down.", bn: "কাউন্টডাউন তোমার আঙুলে তাড়া দিয়েছিল। আসল অফার সেকেন্ডে হারায় না — ঘড়িটাই ফাঁদ। যখন তাড়া অনুভব করবে, তখনই থামার সময়।" } });
    if (n > 0) vulns.push({ w: 5 + n, name: { en: "sharing before verifying", bn: "যাচাইয়ের আগে শেয়ার" },
      tip: { en: `You shared ${n} post${n > 1 ? "s" : ""} without checking. Each unverified share reaches ~240 people before a single fact is checked.`, bn: `তুমি ${n}টি পোস্ট যাচাই ছাড়াই শেয়ার করেছ। প্রতিটি অযাচাই শেয়ার একটিও তথ্য যাচাইয়ের আগেই ~২৪০ জনের কাছে পৌঁছায়।` } });
    if ((g.guardianCorrect ?? 5) < 4) vulns.push({ w: 4 + (5 - (g.guardianCorrect ?? 5)), name: { en: "spotting fakes under pressure", bn: "চাপের মধ্যে ভুয়া চেনা" },
      tip: { en: `You misread ${5 - (g.guardianCorrect ?? 5)} of 5 cases. Reverse-image search and lateral reading catch most fakes in seconds — leave the post and check what the rest of the web says.`, bn: `তুমি ৫টির মধ্যে ${5 - (g.guardianCorrect ?? 5)}টি ভুল পড়েছ। রিভার্স-ইমেজ সার্চ আর পাশ্ব-পঠন সেকেন্ডেই বেশিরভাগ ভুয়া ধরে — পোস্ট ছেড়ে দেখো বাকি ইন্টারনেট কী বলছে।` } });
    if ((g.groupGood ?? 4) < 3) vulns.push({ w: 4 + (4 - (g.groupGood ?? 4)), name: { en: "correcting people respectfully", bn: "সম্মানের সাথে সংশোধন" },
      tip: { en: "Shame and silence both lost the room. Lead with the fact, thank them for caring, and name the trick — not the person.", bn: "লজ্জা দেওয়া আর চুপ থাকা—দুটোতেই ঘর হারিয়েছ। আগে তথ্য বলো, যত্নের জন্য ধন্যবাদ দাও, আর কৌশলটার নাম নাও — মানুষটার নয়।" } });
    if ((g.targetManip || 0) >= 40) vulns.push({ w: 4, name: { en: "the escalation ladder", bn: "উসকানির সিঁড়ি" },
      tip: { en: "Almost half of what you liked was the more-extreme version the feed served next. When a topic keeps getting louder in your feed, that’s the ladder — step off it.", bn: "তুমি যা পছন্দ করেছ তার প্রায় অর্ধেকই ছিল ফিডের পরবর্তী আরও চরম সংস্করণ। কোনো বিষয় ফিডে ক্রমশ জোরালো হলে, সেটাই সিঁড়ি — নেমে যাও।" } });
    if (trig === "outrage") vulns.push({ w: 3, name: { en: "outrage bait", bn: "ক্রোধের টোপ" },
      tip: { en: "Anger was your fastest button. Outrage is the most-shared emotion online precisely because it skips the thinking. Feel the spike, then pause.", bn: "রাগই তোমার দ্রুততম বোতাম। ক্রোধ অনলাইনে সবচেয়ে বেশি শেয়ার হওয়া আবেগ — কারণ এটা চিন্তা এড়িয়ে যায়। ঝাঁকুনি অনুভব করো, তারপর থামো।" } });
    if (trig === "wellness") vulns.push({ w: 3, name: { en: "health fear & false cures", bn: "স্বাস্থ্য-ভয় ও ভুয়া নিরাময়" },
      tip: { en: "‘Doctors are hiding it’ content pulled you in. That exact phrase is the trap — real medicine doesn’t hide, and no food cures disease.", bn: "‘ডাক্তাররা লুকাচ্ছে’ ধরনের কন্টেন্ট তোমাকে টেনেছে। ঐ কথাটাই ফাঁদ — আসল চিকিৎসা লুকায় না, আর কোনো খাবার রোগ সারায় না।" } });
    if (trig === "money") vulns.push({ w: 3, name: { en: "scarcity & get-rich bait", bn: "লোভ ও দ্রুত-ধনী টোপ" },
      tip: { en: "‘Limited slots’ and ‘$500/day’ found your ambition. Guaranteed easy money is the oldest scam script there is.", bn: "‘সীমিত সুযোগ’ আর ‘দিনে ৫০০ ডলার’ তোমার উচ্চাকাঙ্ক্ষা খুঁজে নিয়েছে। নিশ্চিত সহজ টাকা সবচেয়ে পুরনো প্রতারণার চিত্রনাট্য।" } });
    if (!g.algoDefied && (g.algoHot || 0) >= 3) vulns.push({ w: 3, name: { en: "chasing reach over trust", bn: "আস্থার চেয়ে নাগাল" },
      tip: { en: "As the algorithm you kept boosting outrage and never throttled it. That instinct is exactly what platforms monetise — and exactly what a human can override.", bn: "অ্যালগরিদম হিসেবে তুমি ক্রোধ বাড়িয়েই গেছ, কখনো থামাওনি। ঐ প্রবৃত্তিই প্ল্যাটফর্মের আয়ের উৎস — আর ঠিক সেটাই একজন মানুষ অগ্রাহ্য করতে পারে।" } });

    const vuln = vulns.sort((a, b) => b.w - a.w)[0] || { name: { en: "very little — but stay humble", bn: "খুব সামান্য — তবু বিনয়ী থেকো" },
      tip: { en: "You showed few obvious weak spots. The sharpest readers know the feed keeps adapting — the day you feel unfoolable is the day you’re easiest to fool.", bn: "তোমার তেমন কোনো স্পষ্ট দুর্বলতা দেখা যায়নি। সবচেয়ে দক্ষ পাঠকও জানে ফিড প্রতিনিয়ত বদলায় — যেদিন নিজেকে অজেয় ভাববে, সেদিনই সবচেয়ে সহজ শিকার।" } };

    const strengths = [];
    if ((g.guardianCorrect ?? 0) === 5) strengths.push({ w: 6, name: { en: "spotting fakes", bn: "ভুয়া চেনা" }, note: { en: "all 5 cases called right", bn: "৫টি কেসই সঠিক" } });
    if ((g.groupGood ?? 0) === 4) strengths.push({ w: 6, name: { en: "protecting people", bn: "মানুষ রক্ষা" }, note: { en: "all 4 rooms handled with respect", bn: "৪টি ঘরই সম্মানের সাথে সামলেছ" } });
    if (g.algoDefied) strengths.push({ w: 5, name: { en: "conscience over metrics", bn: "মেট্রিকের ওপর বিবেক" }, note: { en: "you throttled the harmful post", bn: "ক্ষতিকর পোস্টটি তুমি থামিয়েছ" } });
    if (g.targetUrgency === false) strengths.push({ w: 4, name: { en: "resisting urgency", bn: "তাড়াহুড়ো প্রতিরোধ" }, note: { en: "you held the line on the flash offer", bn: "ফ্ল্যাশ অফারে তুমি অটল ছিলে" } });
    if ((g.targetShared || 0) === 0) strengths.push({ w: 4, name: { en: "share discipline", bn: "শেয়ারে সংযম" }, note: { en: "you verified before spreading", bn: "ছড়ানোর আগে যাচাই করেছ" } });
    if ((g.targetManip || 100) <= 20) strengths.push({ w: 3, name: { en: "a steady feed", bn: "স্থির ফিড" }, note: { en: "the escalation ladder barely moved you", bn: "উসকানির সিঁড়ি তোমাকে টলাতে পারেনি" } });
    const strength = strengths.sort((a, b) => b.w - a.w)[0] || { name: { en: "finishing all five chairs", bn: "পাঁচটি চেয়ারই শেষ করা" }, note: { en: "curiosity is where literacy starts", bn: "কৌতূহল থেকেই সাক্ষরতার শুরু" } };

    const pct = (a, b) => Math.max(4, Math.round((a / b) * 100));
    const bars = [
      { label: T("chipname.creator", "Creator"), pct: pct(g.creatorTech || 0, 12), val: `${g.creatorTech || 0}/12` },
      { label: T("chipname.algo", "Algorithm"), pct: g.algoTrust ?? 50, val: L({ en: `${g.algoTrust ?? 0}% trust kept`, bn: `${g.algoTrust ?? 0}% আস্থা রক্ষা` }) },
      { label: T("chipname.target", "Target"), pct: 100 - (g.targetManip || 0), val: L({ en: `${100 - (g.targetManip || 0)}% resistance`, bn: `${100 - (g.targetManip || 0)}% প্রতিরোধ` }) },
      { label: T("chipname.guardian", "Guardian"), pct: pct(g.guardianCorrect || 0, 5), val: `${g.guardianCorrect || 0}/5` },
      { label: T("chip.groupchat", "Group Chat"), pct: pct(g.groupGood || 0, 4), val: `${g.groupGood || 0}/4` },
    ];

    return { vuln, strength, bars };
  }

  function diagnosticHTML() {
    const d = milDiagnostic();
    return `
      <div class="pp-diag">
        <div class="pp-diag__head">${T("g.pp.diag.title", "YOUR MIL DIAGNOSTIC — BUILT FROM WHAT YOU ACTUALLY DID")}</div>
        <div class="pp-diag__row pp-diag__row--vuln">
          <span class="pp-diag__tag">${T("g.pp.vuln", "Most vulnerable to")}</span>
          <b>${L(d.vuln.name)}</b>
          <p>${L(d.vuln.tip)}</p>
        </div>
        <div class="pp-diag__row pp-diag__row--strength">
          <span class="pp-diag__tag">${T("g.pp.strength", "Strongest instinct")}</span>
          <b>${L(d.strength.name)}</b>
          <p>${L(d.strength.note)}</p>
        </div>
        <div class="pp-diag__bars">
          ${d.bars.map(b => `
            <div class="pp-bar">
              <div class="pp-bar__top"><span>${b.label}</span><span>${b.val}</span></div>
              <div class="pp-bar__track"><i data-w="${b.pct}"></i></div>
            </div>`).join("")}
        </div>
      </div>`;
  }

  function renderPassport() {
    setActiveChip(0);
    const allBadges = [
      S.badges[1] || { ico: uic("eye"), name: "The Forger’s Eye", locked: true },
      S.badges[2] || { ico: uic("cog"), name: "Inside the Machine", locked: true },
      S.badges[3] || { ico: uic("brain"), name: "Deprogrammed", locked: true },
      S.badges[4] || { ico: uic("shield"), name: "The Guardian", locked: true },
      S.badges[5] || { ico: uic("home"), name: "Family Guardian", locked: true },
    ];
    const CIRC = 471;
    const shares = +(localStorage.getItem("played-shares") || 0);
    const best = +(localStorage.getItem("played-best-streak") || 0);

    setStage(`
      <div class="scr scr--center">
        <div class="passport">
          <div class="passport__head">MEDIA &amp; INFORMATION LITERACY PASSPORT · ISSUED BY PLAYED</div>
          <div class="passport__medal" id="pp-medal"></div>
          <div class="ring-wrap">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle class="ring-bg" cx="85" cy="85" r="75"/>
              <circle class="ring-fg" id="pp-ring" cx="85" cy="85" r="75"/>
            </svg>
            <div class="ring-num"><div>${S.score}<small>MIL SCORE</small></div></div>
          </div>
          <div class="passport__rank">${rankFor(S.score).name}</div>
          <p class="passport__rankdesc">${rankFor(S.score).desc}</p>
          <div class="badges-grid">
            ${allBadges.map(b => `<div class="bg-item ${b.locked ? "locked" : ""}">${b.ico} ${b.name}</div>`).join("")}
          </div>
          ${S.pre && S.post ? `
          <div class="passport__delta">
            <div>${T("g.pp.delta1", "SPOTTING MANIPULATION")}<b>${S.pre.q1}/5 → ${S.post.q1}/5 <span class="up">${S.post.q1 > S.pre.q1 ? `(+${S.post.q1 - S.pre.q1})` : ""}</span></b></div>
            <div>${T("g.pp.delta2", "UNDERSTANDING THE FEED")}<b>${S.pre.q2}/5 → ${S.post.q2}/5 <span class="up">${S.post.q2 > S.pre.q2 ? `(+${S.post.q2 - S.pre.q2})` : ""}</span></b></div>
          </div>` : ""}
          ${Object.keys(S.sig).length ? diagnosticHTML() : ""}
          <p class="passport__text">You sat in all five chairs — and the last one was your own family group. From now on,
          when a post spikes your pulse, part of you will see the workshop, the machine, the dossier, and the room
          behind it. <b>That’s the vaccine working.</b></p>
          <div class="passport__stats">VACCINES PASSED ON: ${shares} · BEST TRAINING STREAK: ${best}</div>
          <div class="passport__actions">
            <button class="sbtn" id="pp-share">${uic("syringe")} Pass on the vaccine</button>
            <button class="sbtn sbtn--ghost" id="pp-train">∞ Keep training</button>
            <button class="sbtn sbtn--ghost" id="pp-again">${uic("rotate")} Play again</button>
          </div>
        </div>
      </div>`, () => {
      requestAnimationFrame(() => setTimeout(() => {
        el("#pp-ring").style.strokeDashoffset = CIRC - (CIRC * S.score) / 100;
        els(".pp-bar__track i").forEach(b => b.style.width = `${b.dataset.w}%`);
      }, 200));
      if (window.PLAYED3D) window.PLAYED3D.medal(el("#pp-medal"));
      if (S.score >= 70 && !REDUCED) confetti();
      el("#pp-share").onclick = async () => {
        const url = `${location.origin}${location.pathname}?via=friend`;
        const txt = `I scored ${S.score}/100 on PLAYED — I forged a viral lie, ran the algorithm, got profiled in seconds, then hunted 5 real misinformation cases. Get your vaccine: ${url} #PlayYourPart #MIL`;
        try {
          if (navigator.share) await navigator.share({ title: "PLAYED", text: txt, url });
          else { await navigator.clipboard.writeText(txt); toast("Copied — paste it anywhere. Every share is a vaccine 💉"); }
          localStorage.setItem("played-shares", String(+(localStorage.getItem("played-shares") || 0) + 1));
        } catch { /* user cancelled the share sheet */ }
      };
      el("#pp-train").onclick = startTraining;
      el("#pp-again").onclick = () => {
        S.score = 0; S.done = { 1: false, 2: false, 3: false, 4: false, 5: false }; S.badges = {};
        S.pre = null; S.post = null;
        scoreEl.textContent = "0";
        chips.forEach(c => c.classList.remove("done", "active"));
        renderStart();
      };
    });
  }

  /* ============================================================
     TRAINING MODE — endless, on the real-case database
     ============================================================ */

  const train = { streak: 0, caseNo: 0, pool: [] };

  /* difficulty curve (spaced escalation beats random practice):
     tier 1 — clear fakes + one easy true, to build the reflex
     tier 2 — MISLEADING enters: partly-true is harder than false
     tier 3 — the true-but-wild stories: cynicism is the final boss */
  function tierOf(c) {
    if (c.verdict === "MISLEADING") return 2;
    if (c.verdict === "TRUE") return c.title === "The cooling-centre thread" ? 1 : 3;
    return 1;
  }
  const TIER_LABEL = {
    1: "ROUND 1 · WARM-UP",
    2: "ROUND 2 · TRICKIER — “misleading” exists",
    3: "ROUND 3 · FINAL BOSS — cynicism",
  };

  function shufflePool() {
    const idx = (window.REAL_CASES || []).map((_, i) => i);
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const byTier = (t) => shuffle(idx.filter(i => tierOf(window.REAL_CASES[i]) === t));
    train.pool = [...byTier(1), ...byTier(2), ...byTier(3)];
  }

  function startTraining() {
    setActiveChip(6);
    train.streak = 0;
    train.caseNo = 0;
    shufflePool();
    setStage(`
      <div class="scr scr--center">
        <p class="scr__kicker">Training Mode · endless</p>
        <h3 class="scr__title">Real cases. Your call.</h3>
        <p class="scr__text">Everything in here actually circulated — documented lies, and true stories that
        sound fake. Call each one blind for <b>3 points</b>, or spend tools for hints (−1 each).
        Wrong call resets your streak. How far can you go?</p>
        <button class="sbtn" id="tr-go">Deal the first case</button>
      </div>`, () => {
      el("#tr-go").onclick = renderTrainCase;
    });
  }

  function renderTrainCase() {
    if (!train.pool.length) shufflePool();
    const c = window.REAL_CASES[train.pool.shift()]; // shift: consume tiers in order
    const tier = tierOf(c);
    const typeMeta = window.CASE_TYPES[c.type] || { label: c.type, ico: "❓" };
    let toolsUsed = 0, decided = false;
    train.caseNo++;
    const best = +(localStorage.getItem("played-best-streak") || 0);

    setStage(`
      <div class="scr scr--center">
        <div class="train-hud">
          <span>CASE <b>#${train.caseNo}</b></span>
          <span class="streak-fire">STREAK <b>${train.streak}</b></span>
          <span>BEST <b>${Math.max(best, train.streak)}</b></span>
        </div>
        <div class="train-stage"><span class="tier-dots">${"●".repeat(tier)}${"○".repeat(3 - tier)}</span><b>${TIER_LABEL[tier]}</b></div>
        <div class="train-card">
          <div class="train-claim">
            <div class="train-claim__meta">${picon(c.platform)} ${typeMeta.ico} ${typeMeta.label} · ${c.year} · ${c.country}</div>
            <div class="train-claim__text">${c.claim}</div>
          </div>
          <div class="train-tools">
            <button class="sbtn sbtn--ghost" id="tr-src" style="padding:10px 20px;font-size:.82rem;">${uic("search")} Who documented it? (−1)</button>
            <button class="sbtn sbtn--ghost" id="tr-lat" style="padding:10px 20px;font-size:.82rem;">${uic("book")} Read laterally (−1)</button>
          </div>
          <div id="tr-clues"></div>
          <div class="verdict">
            <button class="v-real" id="tr-real">✓ SOLID — share it</button>
            <button class="v-fake" id="tr-fake">✕ DON’T SHARE</button>
          </div>
          <div id="tr-result" aria-live="polite"></div>
          <div class="train-points" id="tr-points">calling it blind is worth 3 points</div>
        </div>
      </div>`, () => {
      const updatePts = () => {
        el("#tr-points").textContent = toolsUsed === 0
          ? "calling it blind is worth 3 points"
          : `worth ${Math.max(1, 3 - toolsUsed)} point${3 - toolsUsed === 1 ? "" : "s"} now — but better safe than viral`;
      };
      el("#tr-src").onclick = (e) => {
        if (decided) return;
        toolsUsed++;
        e.target.disabled = true;
        el("#tr-clues").insertAdjacentHTML("beforeend", `<div class="train-clue">› documented by: ${c.src}</div>`);
        updatePts();
      };
      el("#tr-lat").onclick = (e) => {
        if (decided) return;
        toolsUsed++;
        e.target.disabled = true;
        el("#tr-clues").insertAdjacentHTML("beforeend", `<div class="train-clue">› lateral read: ${c.truth}</div>`);
        updatePts();
      };

      const decide = (call) => {
        if (decided) return;
        decided = true;
        const isTrue = c.verdict === "TRUE";
        const right = (call === "real") === isTrue;
        const pts = Math.max(1, 3 - toolsUsed);
        if (right) { train.streak += pts; buzz(15); }
        else { train.streak = 0; buzz([70, 40, 70]); }
        const newBest = Math.max(+(localStorage.getItem("played-best-streak") || 0), train.streak);
        localStorage.setItem("played-best-streak", String(newBest));
        el("#tr-result").innerHTML = `
          <div class="case-result ${right ? "good" : "bad"}" style="margin-top:14px;">
            <b>${right ? `✓ Correct (+${pts})` : "✕ Streak lost"} — this one is ${c.verdict}.</b><br>
            ${c.truth}
            <span class="cr-src">${c.src}</span>
            <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              <button class="sbtn" id="tr-next" style="padding:11px 24px;font-size:.85rem;">Next case →</button>
              <button class="sbtn sbtn--ghost" id="tr-exit" style="padding:11px 24px;font-size:.85rem;">Exit training</button>
            </div>
          </div>`;
        el("#tr-next").onclick = renderTrainCase;
        el("#tr-exit").onclick = () => (S.done[4] ? renderPassport() : renderStart());
      };
      el("#tr-real").onclick = () => decide("real");
      el("#tr-fake").onclick = () => decide("fake");
    });
  }

  /* ---------------- navigation & boot ---------------- */

  const CH_ENTRY = { 1: renderC1Intro, 2: renderC2Intro, 3: renderC3Intro, 4: renderC4Intro, 5: renderC5Intro, 6: startTraining };
  chips.forEach(chip => {
    chip.addEventListener("click", () => CH_ENTRY[+chip.dataset.ch]());
  });

  const hallBtn = document.getElementById("hall-train-btn");
  if (hallBtn) hallBtn.onclick = () => {
    document.getElementById("sim").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    startTraining();
  };

  window.PLAYED = { startTraining };

  renderStart();
})();
