/* ============================================================
   PLAYED — three-scenes.js
   Progressive 3D moments (Three.js r128, vendored locally so the
   site still works fully offline):
     1. Hero — drifting lie-particle field + rotating ink shield
     2. Hall of Lies — draggable globe plotting the real cases
     3. Passport — spinning 3D medal
   Everything degrades gracefully: no WebGL → the 2D canvas and
   CSS animations carry the experience alone.
   ============================================================ */

(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const C = {
    red: 0xA41F13,
    red2: 0xC22A1B,
    paper: 0xFAF5F1,
    stone: 0xE0DBD8,
    ink: 0x292F36,
    taupe: 0x8F7A6E,
  };

  function webglOK() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch { return false; }
  }

  let threeLoading = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (threeLoading) return threeLoading;
    threeLoading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "js/vendor/three.min.js";
      s.onload = () => res();
      s.onerror = () => rej(new Error("three.js failed to load"));
      document.head.appendChild(s);
    });
    return threeLoading;
  }

  function makeRenderer(w, h) {
    const r = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setSize(w, h);
    return r;
  }

  /* ---------------- 1 · hero particle field ---------------- */

  function initHero(container) {
    const W = container.clientWidth, H = container.clientHeight;
    const renderer = makeRenderer(W, H);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 16;

    // particle cloud: red "lies" drifting among taupe noise
    const N = window.innerWidth < 760 ? 220 : 420;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const red = new THREE.Color(C.red), taupe = new THREE.Color(C.taupe), stone = new THREE.Color(0xB9A99E);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 44;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
      const c = Math.random() < 0.22 ? red : (Math.random() < 0.5 ? taupe : stone);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const cloud = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.16, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false,
    }));
    scene.add(cloud);

    // the guardian shield: an ink wireframe icosahedron, right of the headline
    const shield = new THREE.Group();
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(4.4, 1),
      new THREE.MeshBasicMaterial({ color: C.ink, wireframe: true, transparent: true, opacity: 0.34 })
    );
    const icoInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 0),
      new THREE.MeshBasicMaterial({ color: C.red, wireframe: true, transparent: true, opacity: 0.4 })
    );
    shield.add(ico, icoInner);
    shield.position.set(W > 900 ? 8.5 : 0, W > 900 ? 0.5 : 6.5, -2);
    scene.add(shield);

    const mouse = { x: 0, y: 0 };
    window.addEventListener("pointermove", (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    let visible = true;
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(container);

    window.addEventListener("resize", () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    (function loop(t) {
      requestAnimationFrame(loop);
      if (!visible) return;
      cloud.rotation.y = t * 0.000045;
      cloud.rotation.x = Math.sin(t * 0.00003) * 0.08;
      shield.rotation.y = t * 0.00028;
      shield.rotation.x = t * 0.00013;
      icoInner.rotation.y = -t * 0.0005;
      camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.9 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })(0);
  }

  /* ---------------- 2 · the Hall of Lies globe ---------------- */

  function latLonToVec(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return [
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    ];
  }

  function initGlobe(container, canvasEl) {
    const W = container.clientWidth, H = container.clientHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.z = 15;

    const globe = new THREE.Group();
    scene.add(globe);
    const R = 5;

    // dot-matrix sphere (fibonacci distribution) — the quiet crowd
    const DOTS = 900;
    const dpos = new Float32Array(DOTS * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOTS; i++) {
      const y = 1 - (i / (DOTS - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      dpos[i * 3] = Math.cos(th) * rad * R;
      dpos[i * 3 + 1] = y * R;
      dpos[i * 3 + 2] = Math.sin(th) * rad * R;
    }
    const dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    globe.add(new THREE.Points(dgeo, new THREE.PointsMaterial({
      color: C.taupe, size: 0.055, transparent: true, opacity: 0.55, depthWrite: false,
    })));

    // faint wireframe skeleton
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.995, 28, 18),
      new THREE.MeshBasicMaterial({ color: C.taupe, wireframe: true, transparent: true, opacity: 0.07 })
    ));

    // case markers: red = documented lies, cream = actually true
    const cases = window.REAL_CASES || [];
    const lies = cases.filter(c => c.verdict !== "TRUE");
    const truths = cases.filter(c => c.verdict === "TRUE");
    function markerCloud(list, color, size) {
      const p = new Float32Array(list.length * 3);
      list.forEach((c, i) => {
        const jitter = (i % 5) * 0.045; // spread stacked same-city markers slightly
        const [x, y, z] = latLonToVec(c.lat + jitter, c.lon + jitter, R * 1.03);
        p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(p, 3));
      const m = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.95, depthWrite: false });
      const pts = new THREE.Points(g, m);
      globe.add(pts);
      return m;
    }
    const lieMat = markerCloud(lies, C.red2, 0.24);
    const trueMat = markerCloud(truths, C.paper, 0.2);

    // drag to spin
    let dragging = false, px = 0, py = 0, velY = 0.0016, rotX = 0.28;
    const down = (e) => { dragging = true; px = e.clientX; py = e.clientY; };
    const move = (e) => {
      if (!dragging) return;
      velY = (e.clientX - px) * 0.00028;
      globe.rotation.y += (e.clientX - px) * 0.006;
      rotX = Math.max(-0.9, Math.min(0.9, rotX + (e.clientY - py) * 0.004));
      px = e.clientX; py = e.clientY;
    };
    const up = () => { dragging = false; if (Math.abs(velY) < 0.0006) velY = 0.0016 * Math.sign(velY || 1); };
    container.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);

    let visible = true;
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(container);

    window.addEventListener("resize", () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    (function loop(t) {
      requestAnimationFrame(loop);
      if (!visible) return;
      if (!dragging) globe.rotation.y += velY;
      globe.rotation.x += (rotX - globe.rotation.x) * 0.06;
      const pulse = 1 + Math.sin(t * 0.004) * 0.25;
      lieMat.size = 0.24 * pulse;
      trueMat.size = 0.2 * (2 - pulse) * 0.6 + 0.08;
      renderer.render(scene, camera);
    })(0);
  }

  /* ---------------- 3 · passport medal ---------------- */

  function medalFaceTexture() {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const x = cv.getContext("2d");
    x.fillStyle = "#A41F13";
    x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "#FAF5F1"; x.lineWidth = 7;
    x.beginPath(); x.arc(128, 128, 108, 0, Math.PI * 2); x.stroke();
    x.fillStyle = "#FAF5F1";
    x.beginPath(); x.moveTo(105, 82); x.lineTo(105, 174); x.lineTo(178, 128); x.closePath(); x.fill();
    x.font = "700 26px Georgia, serif";
    x.textAlign = "center";
    x.fillText("PLAYED", 128, 224);
    return new THREE.CanvasTexture(cv);
  }

  function initMedal(container) {
    const size = 300;
    const renderer = makeRenderer(size, size);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.z = 7.2;

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 6, 8);
    scene.add(key);

    const face = medalFaceTexture();
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 2.15, 0.26, 64),
      [
        new THREE.MeshStandardMaterial({ color: C.taupe, metalness: 0.5, roughness: 0.35 }),
        new THREE.MeshStandardMaterial({ map: face, metalness: 0.25, roughness: 0.45 }),
        new THREE.MeshStandardMaterial({ map: face, metalness: 0.25, roughness: 0.45 }),
      ]
    );
    coin.rotation.x = Math.PI / 2;
    const group = new THREE.Group();
    group.add(coin);
    scene.add(group);

    let alive = true;
    (function loop(t) {
      if (!alive) return;
      if (!container.isConnected) { alive = false; return; }
      requestAnimationFrame(loop);
      group.rotation.y = t * 0.0012;
      group.position.y = Math.sin(t * 0.002) * 0.14;
      renderer.render(scene, camera);
    })(0);
  }

  /* ---------------- lazy boot ---------------- */

  const OK = webglOK() && !REDUCED;

  function when(el, cb) {
    if (!el) return;
    new IntersectionObserver((en, io) => {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      loadThree().then(cb).catch(() => {});
    }, { rootMargin: "200px" }).observe(el);
  }

  if (OK) {
    const hero = document.getElementById("hero-3d");
    when(hero, () => initHero(hero));
    const globeWrap = document.getElementById("globe-wrap");
    when(globeWrap, () => initGlobe(globeWrap, document.getElementById("globe-canvas")));
  } else {
    // no WebGL / reduced motion: hide the globe stage gracefully
    const gw = document.getElementById("globe-wrap");
    if (gw && !OK && !webglOK()) gw.style.display = "none";
  }

  window.PLAYED3D = {
    ok: OK,
    medal(container) {
      if (!OK || !container) return;
      loadThree().then(() => initMedal(container)).catch(() => {});
    },
  };
})();
