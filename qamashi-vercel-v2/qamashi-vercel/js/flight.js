/* ==========================================================
   Scene 2 — Real map flight Tashkent → Delhi
   - Leaflet + OpenStreetMap tiles (needs internet in the browser)
   - Great-circle route, plane moves with scroll, heading follows path
   - Engine sound via Web Audio — starts ONLY after the user clicks
     the sound button (browsers block autoplay audio anyway)
   ========================================================== */
(() => {
  const mapEl = document.getElementById("flight-map");
  const journey = document.getElementById("journey");
  if (!mapEl || !journey) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const QAM = [38.81565, 66.46656]; // Qamashi (markaz joylashgan tuman)
  const DEL = [28.5562, 77.1000];   // Delhi (IGI)
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---------- Great-circle points (curved like a real flight) ----------
  function greatCircle(a, b, n) {
    const r = (d) => (d * Math.PI) / 180;
    const d2 = (x) => (x * 180) / Math.PI;
    const [p1, l1] = [r(a[0]), r(a[1])];
    const [p2, l2] = [r(b[0]), r(b[1])];
    const delta = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const A = Math.sin((1 - f) * delta) / Math.sin(delta);
      const B = Math.sin(f * delta) / Math.sin(delta);
      const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
      const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
      const z = A * Math.sin(p1) + B * Math.sin(p2);
      pts.push([d2(Math.atan2(z, Math.sqrt(x * x + y * y))), d2(Math.atan2(y, x))]);
    }
    return pts;
  }

  // Top-down airliner, nose up. Shaded with gradients so it reads as a 3D object.
  const PLANE_HTML = `
    <div class="aircraft-marker">
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pl-body" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#6d84a6"/>
            <stop offset=".3" stop-color="#eef4fc"/>
            <stop offset=".5" stop-color="#ffffff"/>
            <stop offset=".72" stop-color="#d3e1f3"/>
            <stop offset="1" stop-color="#6d84a6"/>
          </linearGradient>
          <linearGradient id="pl-wing" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".45" stop-color="#d6e4f6"/>
            <stop offset="1" stop-color="#7f98b9"/>
          </linearGradient>
          <linearGradient id="pl-engine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#5b7394"/>
            <stop offset=".45" stop-color="#e9f1fb"/>
            <stop offset="1" stop-color="#5b7394"/>
          </linearGradient>
          <linearGradient id="pl-livery" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#38b6ff"/>
            <stop offset="1" stop-color="#2f6bff"/>
          </linearGradient>
          <filter id="pl-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.6"/>
          </filter>
        </defs>

        <!-- ground shadow -->
        <g fill="#000a1f" opacity=".42" filter="url(#pl-blur)" transform="translate(7 9)">
          <path d="M54 44C46 46 30 56 14 68Q10 71 12 76Q14 78 18 76L54 66Z M66 44C74 46 90 56 106 68Q110 71 108 76Q106 78 102 76L66 66Z"/>
          <path d="M60 3C65 3 68 9 68.5 18L69 92Q69 103 65 110Q62 114 60 114Q58 114 55 110Q51 103 51 92L51.5 18C52 9 55 3 60 3Z"/>
        </g>

        <!-- wings -->
        <path d="M54 44C46 46 30 56 14 68Q10 71 12 76Q14 78 18 76L54 66Z M66 44C74 46 90 56 106 68Q110 71 108 76Q106 78 102 76L66 66Z"
          fill="url(#pl-wing)" stroke="#5f7898" stroke-width=".9" stroke-linejoin="round"/>
        <path d="M51 49 22 65M69 49 98 65" stroke="#ffffff" stroke-width="1" opacity=".7" stroke-linecap="round"/>
        <circle cx="12.5" cy="72.5" r="2.2" fill="#ff3b5c"/>
        <circle cx="107.5" cy="72.5" r="2.2" fill="#38b6ff"/>

        <!-- engines -->
        <g>
          <rect x="29" y="55" width="11" height="19" rx="5.5" fill="url(#pl-engine)" stroke="#5b7394" stroke-width=".6"/>
          <ellipse cx="34.5" cy="56" rx="3.9" ry="1.6" fill="#0b1d3d"/>
          <rect x="80" y="55" width="11" height="19" rx="5.5" fill="url(#pl-engine)" stroke="#5b7394" stroke-width=".6"/>
          <ellipse cx="85.5" cy="56" rx="3.9" ry="1.6" fill="#0b1d3d"/>
        </g>

        <!-- tail stabilisers -->
        <path d="M54 92C48 94 40 99 36 104Q34 107 37 107L54 102Z M66 92C72 94 80 99 84 104Q86 107 83 107L66 102Z"
          fill="url(#pl-wing)" stroke="#5f7898" stroke-width=".8" stroke-linejoin="round"/>

        <!-- fuselage -->
        <path d="M60 3C65 3 68 9 68.5 18L69 92Q69 103 65 110Q62 114 60 114Q58 114 55 110Q51 103 51 92L51.5 18C52 9 55 3 60 3Z"
          fill="url(#pl-body)" stroke="#5f7898" stroke-width=".9"/>

        <!-- brand cheat-lines along the fuselage -->
        <rect x="52.4" y="24" width="2" height="66" rx="1" fill="url(#pl-livery)"/>
        <rect x="65.6" y="24" width="2" height="66" rx="1" fill="url(#pl-livery)"/>

        <!-- cockpit -->
        <path d="M54.8 15.5Q60 8.5 65.2 15.5L64.6 21Q60 18.6 55.4 21Z" fill="#12305e" opacity=".92"/>
        <path d="M57 15.5Q60 12 62.4 15" stroke="#ffffff" stroke-width=".8" fill="none" opacity=".8" stroke-linecap="round"/>

        <!-- passenger windows -->
        <g fill="#2a4a78" opacity=".55">
          <circle cx="56.4" cy="32" r=".9"/><circle cx="56.4" cy="37" r=".9"/><circle cx="56.4" cy="42" r=".9"/><circle cx="56.4" cy="47" r=".9"/>
          <circle cx="56.4" cy="52" r=".9"/><circle cx="56.4" cy="57" r=".9"/><circle cx="56.4" cy="62" r=".9"/><circle cx="56.4" cy="67" r=".9"/>
          <circle cx="63.6" cy="32" r=".9"/><circle cx="63.6" cy="37" r=".9"/><circle cx="63.6" cy="42" r=".9"/><circle cx="63.6" cy="47" r=".9"/>
          <circle cx="63.6" cy="52" r=".9"/><circle cx="63.6" cy="57" r=".9"/><circle cx="63.6" cy="62" r=".9"/><circle cx="63.6" cy="67" r=".9"/>
        </g>

        <!-- specular highlight on the top of the fuselage -->
        <path d="M58.6 20Q59.4 14 60 14" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>
      </svg>
    </div>`;

  // ---------- Leaflet map ----------
  if (!window.L) {
    mapEl.classList.add("is-fallback");
    mapEl.textContent = "";
    const msg = document.createElement("p");
    msg.className = "map-fallback-msg";
    msg.textContent = "Xarita yuklanmadi (internet ulanishi kerak).";
    mapEl.appendChild(msg);
    return;
  }

  const map = L.map(mapEl, { zoomControl: false, scrollWheelZoom: false, attributionControl: true, worldCopyJump: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 7,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const route = greatCircle(QAM, DEL, 120);
  L.polyline(route, { color: "#38b6ff", weight: 3, dashArray: "2 8", opacity: 0.85 }).addTo(map);
  const travelled = L.polyline([route[0]], { color: "#ff3b5c", weight: 5, lineCap: "round" }).addTo(map);

  const cityIcon = (name, cls) => L.divIcon({ className: `city-pin ${cls}`, html: `<span>${name}</span>`, iconSize: [0, 0], iconAnchor: [0, 0] });
  L.marker(QAM, { icon: cityIcon("Qamashi", "is-tas"), interactive: false }).addTo(map);
  L.marker(DEL, { icon: cityIcon("Dehli", "is-del"), interactive: false }).addTo(map);

  const planeMarker = L.marker(route[0], {
    icon: L.divIcon({ className: "plane-icon", html: PLANE_HTML, iconSize: [72, 72], iconAnchor: [36, 36] }),
    interactive: false,
    zIndexOffset: 1000
  }).addTo(map);

  const bounds = L.latLngBounds([QAM, DEL]);
  function fit() {
    map.invalidateSize();
    const narrow = mapEl.clientWidth < 620;
    map.fitBounds(bounds, { paddingTopLeft: narrow ? [30, 40] : [60, 50], paddingBottomRight: narrow ? [30, 30] : [60, 40], animate: false });
  }
  fit();
  window.addEventListener("resize", fit);

  // ---------- Scroll-driven progress ----------
  const stages = Array.from(journey.querySelectorAll(".stage"));
  const bar = document.getElementById("journey-bar");
  const n = route.length - 1;

  function headingAt(i) {
    const a = map.latLngToContainerPoint(route[Math.max(0, i - 1)]);
    const b = map.latLngToContainerPoint(route[Math.min(n, i + 1)]);
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  }

  let lastIdx = -1;
  let sound = null; // assigned below
  function render(p) {
    const idx = Math.round(clamp(p, 0, 1) * n);
    if (idx !== lastIdx) {
      lastIdx = idx;
      planeMarker.setLatLng(route[idx]);
      travelled.setLatLngs(route.slice(0, idx + 1));
      const el = planeMarker.getElement();
      if (el) {
        const aircraft = el.querySelector(".aircraft-marker");
        if (aircraft) {
          aircraft.style.transform = `rotate(${headingAt(idx) + 90}deg)`;
        }
      }
    }
    if (bar) bar.style.transform = `scaleX(${p})`;
    const si = Math.min(stages.length - 1, Math.floor(p * stages.length));
    stages.forEach((s, i) => s.classList.toggle("active", i === si));
    if (sound) sound.setLevel(p);
  }

  if (reduceMotion) {
    render(1);
  } else {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = journey.getBoundingClientRect();
        const total = journey.offsetHeight - window.innerHeight;
        render(total > 0 ? clamp(-rect.top / total, 0, 1) : 1);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Engine sound (Web Audio, user-started) ----------
  sound = (() => {
    let ctx = null, master = null, lp = null, tone = null, on = false;

    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // Brown noise → low-pass = jet rumble
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = clamp(last * 3.5, -1, 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      noise.connect(lp);
      lp.connect(master);
      noise.start();

      // Low turbine whine
      tone = ctx.createOscillator();
      tone.type = "sawtooth";
      tone.frequency.value = 62;
      const tg = ctx.createGain();
      tg.gain.value = 0.035;
      const tlp = ctx.createBiquadFilter();
      tlp.type = "lowpass";
      tlp.frequency.value = 260;
      tone.connect(tlp);
      tlp.connect(tg);
      tg.connect(master);
      tone.start();
    }

    return {
      get on() { return on; },
      toggle() {
        on ? this.stop() : this.start();
        return on;
      },
      start() {
        try {
          if (!ctx) build();
          ctx.resume();
          master.gain.setTargetAtTime(0.32, ctx.currentTime, 0.4);
          on = true;
        } catch (e) { on = false; }
        this.sync();
      },
      stop() {
        if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        on = false;
        this.sync();
      },
      setLevel(p) {
        if (!ctx || !on) return;
        const t = ctx.currentTime;
        lp.frequency.setTargetAtTime(340 + 800 * p, t, 0.3);
        tone.frequency.setTargetAtTime(58 + 36 * p, t, 0.3);
      },
      sync() {
        const btn = document.getElementById("sound-toggle");
        if (!btn) return;
        btn.setAttribute("aria-pressed", String(on));
        btn.textContent = window.I18n.t(on ? "journey.sound.on" : "journey.sound.off");
      }
    };
  })();

  const soundBtn = document.getElementById("sound-toggle");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => sound.toggle());
    sound.sync();
  }
  document.addEventListener("langchange", () => sound.sync());
  // Silence when the tab is hidden
  document.addEventListener("visibilitychange", () => { if (document.hidden && sound.on) sound.stop(); });
})();
