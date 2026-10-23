/* ==========================================================
   Visual effects layer (no content logic here):
   - Hero title: rises in on load, melts away while scrolling
   - Sky story driven by scroll: boarding → takeoff → above the
     clouds (small plane zig-zags L↔R) → lands in Delhi, under the
     partner-flags band
   - Engine sound that follows the plane (pan, pitch, loudness).
     Starts only after a click (browsers block autoplay audio).
   - Team cards: 3D arc on wide screens
   - Round cursor follower (mouse only)
   ========================================================== */
(() => {
  const LOW_POWER = window.matchMedia("(max-width: 900px), (hover: none)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  const hero = document.getElementById("home");
  const title = document.getElementById("hero-title");
  if (hero) requestAnimationFrame(() => setTimeout(() => hero.classList.add("is-ready"), 60));

  function pageProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    return total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
  }

  // ---------- Sky layers ----------
  const boarding = document.querySelector(".sky-boarding");
  const clouds = document.querySelector(".sky-clouds");

  // ---------- Plane path ----------
  // Viewport fractions; the last point is the Delhi tile in the flags band.
  // Path: start on the hero's green pulse (live), then zig-zag, then the flags strip (live)
  const PTS = [
    { x: 0.9, y: 0.36 },   // → left to right
    { x: 0.1, y: 0.2 },    // ← right to left
    { x: 0.9, y: 0.6 },    // → left to right
    { x: 0.12, y: 0.74 },  // ← right to left
  ];
  const START_FALLBACK = { x: 0.03, y: 0.9 };
  const heroSvg = document.querySelector(".hero-network");
  const heroPulse = document.querySelector(".network-pulse-core");
  function startPoint() {
    const W = window.innerWidth, H = window.innerHeight;
    if (heroSvg && heroPulse) {
      try {
        const m = heroPulse.getScreenCTM();
        if (m) {
          const pt = heroSvg.createSVGPoint();
          pt.x = 286; pt.y = 260;                      // centre of the pulse in SVG units
          const q = pt.matrixTransform(m);
          if (q.x || q.y) return { x: q.x, y: q.y - 70 }; // sit just above it
        }
      } catch (e) { /* fall through */ }
    }
    return { x: START_FALLBACK.x * W, y: START_FALLBACK.y * H };
  }
  const DELHI_FALLBACK = { x: 0.95, y: 0.93 };
  let pathPx = [];
  // Delhi = where the India tile settles: the centre of the flags strip, at the tile's height.
  // It does not depend on the moving tile itself, so the plane cannot chase the marquee.
  const tileEl = document.getElementById("flag-india");
  const flagsViewportEl = document.querySelector(".flags-viewport");
  function delhiPoint() {
    const W = window.innerWidth, H = window.innerHeight;
    if (tileEl && flagsViewportEl) {
      const r = tileEl.getBoundingClientRect();
      const v = flagsViewportEl.getBoundingClientRect();
      if (r.height && v.width) return { x: v.left + v.width / 2, y: r.top + r.height * 0.5 };
    }
    return { x: DELHI_FALLBACK.x * W, y: DELHI_FALLBACK.y * H };
  }
  function buildPath() {
    const W = window.innerWidth, H = window.innerHeight;
    pathPx = [startPoint()].concat(PTS.map((p) => ({ x: p.x * W, y: p.y * H })), [delhiPoint()]);
  }
  function pathPoint(u) {
    const pts = pathPx;
    const n = pts.length - 1;
    const f = clamp(u, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(f));
    const t = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    const t2 = t * t, t3 = t2 * t;
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return { x: cr(p0.x, p1.x, p2.x, p3.x), y: cr(p0.y, p1.y, p2.y, p3.y) };
  }
  function headingAt(u) {
    const a = pathPoint(u - 0.002), b = pathPoint(u + 0.002);
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  }

  const plane = document.getElementById("bg-plane");
  const startLabel = document.getElementById("bg-label-start");
  const endLabel = document.getElementById("bg-label-end");
  const PLANE_START = 0;

  // ---------- Engine sound (Web Audio) ----------
  const Engine = (() => {
    let ctx = null, master = null, pan = null, lp = null, osc = null, on = false;
    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const out = pan || master;
      if (pan) { pan.connect(master); }
      master.connect(ctx.destination);
      // brown noise → low-pass: jet rumble
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = clamp(last * 3.5, -1, 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf; noise.loop = true;
      lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 400;
      noise.connect(lp); lp.connect(out);
      noise.start();
      // turbine whine
      osc = ctx.createOscillator();
      osc.type = "sawtooth"; osc.frequency.value = 58;
      const g = ctx.createGain(); g.gain.value = 0.03;
      const tlp = ctx.createBiquadFilter(); tlp.type = "lowpass"; tlp.frequency.value = 260;
      osc.connect(tlp); tlp.connect(g); g.connect(out);
      osc.start();
    }
    return {
      get on() { return on; },
      start() {
        try {
          if (!ctx) build();
          ctx.resume();
          master.gain.setTargetAtTime(0.25, ctx.currentTime, 0.4);
          on = true;
        } catch (e) { on = false; }
        sync();
      },
      stop() {
        if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        on = false;
        sync();
      },
      toggle() { on ? this.stop() : this.start(); },
      // level: how loud/active the plane is, pitch: altitude, panVal: -1 left … 1 right
      set(level, pitch, panVal) {
        if (!ctx || !on) return;
        const t = ctx.currentTime;
        lp.frequency.setTargetAtTime(280 + 900 * level, t, 0.2);
        osc.frequency.setTargetAtTime(50 + 50 * pitch, t, 0.2);
        master.gain.setTargetAtTime(0.06 + 0.24 * level, t, 0.2);
        if (pan) pan.pan.setTargetAtTime(clamp(panVal, -1, 1), t, 0.2);
      }
    };
  })();

  // Engine starts by itself on the visitor's first interaction (browsers block sound before that)
  let autoStarted = false;
  const firstGesture = (e) => {
    if (autoStarted || reduce) return;
    // Tapping the sound button must not auto-start the engine — the button's
    // own click handler toggles it, otherwise it would start and instantly stop.
    if (e && e.target && e.target.closest && e.target.closest("#sound-fab")) return;
    autoStarted = true;
    Engine.start();
  };
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach((ev) =>
    window.addEventListener(ev, firstGesture, { passive: true })
  );

  function sync() {
    const btn = document.getElementById("sound-fab");
    if (!btn) return;
    btn.setAttribute("aria-pressed", String(Engine.on));
    btn.textContent = Engine.on ? "Ovoz: yoqiq" : "Ovoz: o‘chiq";
  }
  if (!reduce) {
    const fab = document.createElement("button");
    fab.id = "sound-fab";
    fab.type = "button";
    fab.className = "btn btn-ghost btn-sm sound-fab";
    fab.setAttribute("aria-pressed", "false");
    fab.textContent = "Ovoz: o‘chiq";
    fab.addEventListener("click", () => Engine.toggle());
    document.body.appendChild(fab);
  }

  // ---------- Partner flags: endless loop ----------
  // The row is repeated until it covers the viewport; the loop unit is one row.
  // Marquee is driven by JS so it can settle with India centred when the plane arrives.
  const flagsMarquee = document.querySelector(".flags-marquee");
  let flagsOriginal = flagsMarquee ? flagsMarquee.querySelector(".flags-row") : null;
  let marqX = 0, marqLast = performance.now(), marqUnit = 0;
  function ensureFlagCopies() {
    if (!flagsMarquee || !flagsOriginal) return;
    marqUnit = flagsOriginal.offsetWidth;
    if (!marqUnit) return;
    const vpW = flagsMarquee.parentNode.clientWidth;
    const rows = flagsMarquee.querySelectorAll(".flags-row").length;
    const need = Math.ceil((vpW + marqUnit) / marqUnit) + 1;
    for (let i = rows; i < need; i++) {
      const copy = flagsOriginal.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      flagsMarquee.appendChild(copy);
    }
  }
  function flagsStep(now) {
    if (!flagsMarquee || !marqUnit || reduce) return;
    const dt = Math.min(0.05, (now - marqLast) / 1000);
    marqLast = now;
    const unit = marqUnit;
    const hovered = flagsMarquee.parentNode.matches(":hover");
    if (!hovered) marqX += 40 * dt;                       // endless loop, moving to the right
    marqX = ((marqX % unit) + unit) % unit - unit;        // keep within (-unit, 0]
    flagsMarquee.style.transform = `translate3d(${marqX.toFixed(2)}px, 0, 0)`;
  }
  ensureFlagCopies();
  window.addEventListener("resize", ensureFlagCopies);

  // ---------- Frame loop ----------
  let target = 0, current = 0, prev = 0;

  function placeSky(p) {
    if (boarding) {
      boarding.style.opacity = String(1 - smooth(0.05, 0.19, p));
      boarding.style.transform = `scale(${(1.04 + p * 0.12).toFixed(3)})`;
    }
    if (clouds) clouds.style.opacity = String(smooth(0.24, 0.36, p));
  }

  let planeVis = 0, planeXY = { x: 0, y: 0 }, planeU = 0;
  function placePlane(p) {
    if (!plane) return;
    const W = window.innerWidth;
    pathPx[0] = startPoint();
    pathPx[pathPx.length - 1] = delhiPoint();
    const u = clamp((p - PLANE_START) / (1 - PLANE_START), 0, 1);
    const vis = 1;                                  // visible from the start
    const pt = pathPoint(u);
    const x = pt.x, y = pt.y;
    planeVis = vis; planeXY = { x, y }; planeU = u;
    const takeoff = 0.55 + 0.45 * smooth(0, 0.1, u);
    plane.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${(headingAt(u) + 90).toFixed(2)}deg) scale(${takeoff.toFixed(3)})`;
    plane.style.opacity = String(vis * (0.9 + 0.1 * smooth(0.8, 0.95, u)));
    if (startLabel) {
      startLabel.style.transform = `translate3d(${clamp(x, 110, W - 110).toFixed(1)}px, ${(y - 84).toFixed(1)}px, 0) translate(-50%, 0)`;
      startLabel.style.opacity = String(vis * (1 - smooth(0.04, 0.16, u)));
    }
    if (endLabel) {
      const e = pathPoint(1);
      endLabel.style.transform = `translate3d(${clamp(e.x, 110, W - 110).toFixed(1)}px, ${(e.y - 110).toFixed(1)}px, 0) translate(-50%, 0)`;
      endLabel.style.opacity = String(smooth(0.82, 0.98, u));
    }
  }

  function placeSound() {
    if (!Engine.on) return;
    const speed = Math.abs(current - prev);
    const W = window.innerWidth, H = window.innerHeight;
    // Engine never goes silent once started: the plane only adds a bit of loudness and movement.
    const level = 0.3 + 0.2 * clamp(speed * 70, 0, 1) + 0.12 * clamp(planeVis, 0, 1);
    const pitch = clamp(1 - planeXY.y / H, 0, 1);
    const panVal = (planeXY.x / W) * 2 - 1;
    Engine.set(level, pitch, panVal);
  }

  function fadeHeroTitle() {
    if (!title || !hero) return;
    const q = clamp(window.scrollY / (hero.offsetHeight * 0.6), 0, 1);
    title.style.opacity = String(clamp(1 - q * 1.15, 0, 1));
    title.style.transform = `translate3d(0, ${(-q * 110).toFixed(1)}px, 0) scale(${(1 - q * 0.06).toFixed(3)})`;
    if (LOW_POWER) return;
    title.style.filter = q > 0 ? `blur(${(q * 12).toFixed(1)}px)` : "none";
  }

  let running = false;
  function frame() {
    if (LOW_POWER && Math.abs(target - current) < 0.0005) { running = false; return; }
    prev = current;
    current += (target - current) * 0.16;
    placeSky(current);
    placePlane(current);
    placeSound();
    flagsStep(performance.now());
    fadeHeroTitle();
    requestAnimationFrame(frame);
  }
  function onScroll() {
    target = pageProgress();
    if (LOW_POWER && !running && !reduce) { running = true; requestAnimationFrame(frame); }
  }
  function onResize() { buildPath(); onScroll(); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  buildPath();
  onScroll();
  current = target; prev = target;

  if (reduce) {
    [plane, startLabel, endLabel, boarding, clouds].forEach((n) => { if (n) n.hidden = true; });
    if (title) title.style.opacity = "1";
  } else {
    running = true;
    requestAnimationFrame(frame);
  }

  // ---------- Team: 3D arc on wide screens ----------
  const teamGrid = document.getElementById("team-grid");
  function layoutTeam() {
    if (!teamGrid) return;
    const kids = Array.from(teamGrid.children);
    const n = kids.length;
    const W = Math.min(window.innerWidth, 1280) - 320;
    const cw = 250;
    const sp = Math.min(cw + 30, W / Math.max(1, n - 1));
    kids.forEach((kid, i) => {
      const k = i - (n - 1) / 2;
      kid.style.setProperty("--x", `${(k * sp).toFixed(1)}px`);
      kid.style.setProperty("--z", `${(-Math.abs(k) * 70).toFixed(1)}px`);
      kid.style.setProperty("--r", `${(k * -12).toFixed(1)}deg`);
      kid.style.setProperty("--i", String(i));
    });
  }
  if (teamGrid) {
    new MutationObserver(layoutTeam).observe(teamGrid, { childList: true });
    window.addEventListener("resize", layoutTeam);
    layoutTeam();
  }

  // ---------- Round cursor (fine pointers only) ----------
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover && !reduce) {
    document.body.classList.add("cursor-fx");
    const ringWrap = document.createElement("div");
    ringWrap.className = "cfx cfx-ring-wrap";
    ringWrap.innerHTML = '<span class="cfx-ring"></span>';
    const dotWrap = document.createElement("div");
    dotWrap.className = "cfx cfx-dot-wrap";
    dotWrap.innerHTML = '<span class="cfx-dot"></span>';
    document.body.append(ringWrap, dotWrap);

    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dotWrap.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      dotWrap.classList.remove("is-hidden");
      ringWrap.classList.remove("is-hidden");
    }, { passive: true });
    document.addEventListener("mouseleave", () => { ringWrap.classList.add("is-hidden"); dotWrap.classList.add("is-hidden"); });
    document.addEventListener("mouseenter", () => { ringWrap.classList.remove("is-hidden"); dotWrap.classList.remove("is-hidden"); });
    window.addEventListener("mousedown", () => ringWrap.classList.add("is-down"));
    window.addEventListener("mouseup", () => ringWrap.classList.remove("is-down"));

    const HOVER = "a, button, label, .course-card, .news-card, .team-card, .info-card, .project-card, .book-page, .winner-book, .stack-slot, .region-svg path, .tour-pin, [data-detail], .flag-tile";
    const TEXT = "input, textarea, select";
    const setText = (on) => { ringWrap.classList.toggle("is-text", on); dotWrap.classList.toggle("is-text", on); };
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(TEXT)) { setText(true); return; }
      setText(false);
      ringWrap.classList.toggle("is-hover", !!e.target.closest(HOVER));
    });
    document.addEventListener("mouseout", (e) => {
      const to = e.relatedTarget;
      if (!to || !to.closest || !to.closest(HOVER)) ringWrap.classList.remove("is-hover");
      if (!to || !to.closest || !to.closest(TEXT)) setText(false);
    });
    const follow = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      ringWrap.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }
})();
