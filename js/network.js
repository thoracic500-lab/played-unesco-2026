/* ============================================================
   PLAYED — network.js (palette v2: paper/ink/red/taupe)
   1) Ambient background particle network (taupe ink on paper)
   2) SpreadSim — infection-graph visualization for the Algorithm
      and Guardian chapters: red = infected, cream = healed.
   ============================================================ */

(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- ambient background ---------------- */

  const canvas = document.getElementById("net-canvas");
  if (canvas && !REDUCED) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, nodes = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = Math.min(100, Math.floor((W * H) / 18000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.5,
        hot: Math.random() < 0.1 // a few red "infected" nodes drifting in the crowd
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      const LINK = 130;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;

        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 240 * 240 && d2 > 1) {
          const d = Math.sqrt(d2);
          n.x += (dx / d) * 0.22;
          n.y += (dy / d) * 0.22;
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.16;
            ctx.strokeStyle = (a.hot && b.hot)
              ? `rgba(164, 31, 19, ${alpha * 1.8})`
              : `rgba(143, 122, 110, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hot ? "rgba(164, 31, 19, 0.65)" : "rgba(143, 122, 110, 0.5)";
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    resize();
    tick();
  }

  /* ---------------- SpreadSim ---------------- */

  /**
   * A small planar social graph rendered on the dark console band.
   * Nodes get "infected" (red) as the lie spreads and can be
   * "healed" (cream) when the guardian contains it.
   */
  class SpreadSim {
    constructor(canvasEl, opts = {}) {
      this.canvas = canvasEl;
      this.ctx = canvasEl.getContext("2d");
      this.nodeCount = opts.nodes || 46;
      this.pulses = [];
      this.dead = false;
      this._resize();
      this._build();
      const seed = this.nodes[Math.floor(this.nodeCount / 2)];
      seed.state = "hot";
      this._loop = this._loop.bind(this);
      if (!REDUCED) requestAnimationFrame(this._loop);
      else this._draw();
    }

    _resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = (rect.height || 190) * dpr;
      this.ctx.scale(dpr, dpr);
      this.W = rect.width;
      this.H = rect.height || 190;
    }

    _build() {
      this.nodes = [];
      const cols = Math.ceil(Math.sqrt(this.nodeCount * (this.W / this.H)));
      const rows = Math.ceil(this.nodeCount / cols);
      let i = 0;
      for (let r = 0; r < rows && i < this.nodeCount; r++) {
        for (let c = 0; c < cols && i < this.nodeCount; c++, i++) {
          this.nodes.push({
            x: ((c + 0.5) / cols) * this.W + (Math.random() - 0.5) * (this.W / cols) * 0.8,
            y: ((r + 0.5) / rows) * this.H + (Math.random() - 0.5) * (this.H / rows) * 0.8,
            state: "calm",
            phase: Math.random() * Math.PI * 2
          });
        }
      }
      this.edges = [];
      for (let a = 0; a < this.nodes.length; a++) {
        const dists = this.nodes
          .map((n, idx) => ({ idx, d: idx === a ? Infinity : (n.x - this.nodes[a].x) ** 2 + (n.y - this.nodes[a].y) ** 2 }))
          .sort((p, q) => p.d - q.d)
          .slice(0, 2 + (a % 2));
        for (const { idx } of dists) {
          if (!this.edges.some(([p, q]) => (p === a && q === idx) || (p === idx && q === a))) {
            this.edges.push([a, idx]);
          }
        }
      }
    }

    infect(n) {
      let left = n;
      let guard = 200;
      while (left > 0 && guard-- > 0) {
        const hotIdx = this.nodes.map((nd, i) => (nd.state === "hot" ? i : -1)).filter(i => i >= 0);
        if (!hotIdx.length) break;
        const from = hotIdx[Math.floor(Math.random() * hotIdx.length)];
        const nbrs = this.edges
          .filter(([a, b]) => a === from || b === from)
          .map(([a, b]) => (a === from ? b : a))
          .filter(i => this.nodes[i].state === "calm");
        if (!nbrs.length) {
          const calm = this.nodes.map((nd, i) => (nd.state === "calm" ? i : -1)).filter(i => i >= 0);
          if (!calm.length) break;
          this._ignite(calm[Math.floor(Math.random() * calm.length)]);
          left--;
          continue;
        }
        this._ignite(nbrs[Math.floor(Math.random() * nbrs.length)]);
        left--;
      }
      if (REDUCED) this._draw();
    }

    _ignite(i) {
      this.nodes[i].state = "hot";
      this.pulses.push({ x: this.nodes[i].x, y: this.nodes[i].y, r: 2, a: 0.8, color: "196, 42, 27" });
    }

    heal(n) {
      const hot = this.nodes.map((nd, i) => (nd.state === "hot" ? i : -1)).filter(i => i >= 0);
      for (let k = 0; k < Math.min(n, hot.length); k++) {
        const i = hot[k];
        this.nodes[i].state = "healed";
        this.pulses.push({ x: this.nodes[i].x, y: this.nodes[i].y, r: 2, a: 0.8, color: "250, 245, 241" });
      }
      if (REDUCED) this._draw();
    }

    infectedRatio() {
      return this.nodes.filter(n => n.state === "hot").length / this.nodes.length;
    }

    _draw(t = 0) {
      const { ctx } = this;
      ctx.clearRect(0, 0, this.W, this.H);

      ctx.lineWidth = 1;
      for (const [a, b] of this.edges) {
        const na = this.nodes[a], nb = this.nodes[b];
        const bothHot = na.state === "hot" && nb.state === "hot";
        const bothHealed = na.state === "healed" && nb.state === "healed";
        ctx.strokeStyle = bothHot
          ? "rgba(196, 42, 27, 0.55)"
          : bothHealed
            ? "rgba(250, 245, 241, 0.35)"
            : "rgba(143, 122, 110, 0.22)";
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }

      for (const n of this.nodes) {
        const pulse = 1 + Math.sin(t / 500 + n.phase) * 0.25;
        let r = 2.4, fill = "rgba(143, 122, 110, 0.6)";
        if (n.state === "hot") { r = 3.4 * pulse; fill = "rgba(196, 42, 27, 0.95)"; }
        if (n.state === "healed") { r = 3.1 * pulse; fill = "rgba(250, 245, 241, 0.9)"; }
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }

      this.pulses = this.pulses.filter(p => p.a > 0.02);
      for (const p of this.pulses) {
        p.r += 1.2;
        p.a *= 0.94;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${p.color}, ${p.a})`;
        ctx.stroke();
      }
    }

    _loop(t) {
      if (this.dead) return;
      if (!this.canvas.isConnected) { this.dead = true; return; }
      this._draw(t);
      requestAnimationFrame(this._loop);
    }

    destroy() { this.dead = true; }
  }

  window.SpreadSim = SpreadSim;
})();
