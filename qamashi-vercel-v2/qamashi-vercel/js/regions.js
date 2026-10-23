/* ==========================================================
   Qashqadaryo region — interactive map with current OSM district borders.
   - District boundaries and town pins share the same projected coordinates.
   - Click a district: zoom + show its historic landmarks (photos
     managed in admin → "Tumanlar").
   - "Turni boshlash": Qamashi → Yakkabog' → Chiroqchi → Shahrisabz
     → Qarshi → other districts.
   ========================================================== */
(() => {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("region-svg");
  if (!svg) return;
  const stage = document.getElementById("region-stage");
  const trailsG = document.getElementById("region-trails");
  const pinsG = document.getElementById("region-pins");
  const boundariesG = document.getElementById("region-boundaries");
  const nationalMap = document.getElementById("national-map");
  const provinceBoundariesG = document.getElementById("province-boundaries");
  const provinceLabelsG = document.getElementById("province-labels");
  const nationalMarkersG = document.getElementById("national-markers");
  const nationalRoute = document.getElementById("national-route");
  const panel = document.getElementById("district-panel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const provinces = window.UZBEKISTAN_PROVINCES;
  if (!provinces) throw new Error("Uzbekistan province boundary data did not load.");

  // District town coordinates are projected into the 800×500 viewBox.
  const DISTRICTS = [
    { id: "qamashi", name: "Qamashi", latitude: 38.81565, longitude: 66.46656, featured: true, labelOffset: [10, 20] },
    { id: "yakkabog", name: "Yakkabog‘", latitude: 38.97846, longitude: 66.68309, labelOffset: [10, 22] },
    { id: "chiroqchi", name: "Chiroqchi", latitude: 39.03341, longitude: 66.57580, labelOffset: [-82, -10] },
    { id: "shahrisabz", name: "Shahrisabz", latitude: 39.05258, longitude: 66.82786, labelOffset: [-92, 19] },
    { id: "qarshi", name: "Qarshi", latitude: 38.83982, longitude: 65.79278 },
    { id: "kitob", name: "Kitob", latitude: 39.11796, longitude: 66.87363, labelOffset: [10, -11] },
    { id: "koson", name: "Koson", latitude: 39.04068, longitude: 65.58590 },
    { id: "kasbi", name: "Kasbi", latitude: 38.94837, longitude: 65.41336 },
    { id: "muborak", name: "Muborak", latitude: 39.26155, longitude: 65.15805 },
    { id: "nishon", name: "Nishon", latitude: 38.62114, longitude: 65.68950 },
    { id: "dehqonobod", name: "Dehqonobod", latitude: 38.34752, longitude: 66.49424, labelOffset: [-106, 4] },
    { id: "guzar", name: "G‘uzor", latitude: 38.62154, longitude: 66.25254 },
    { id: "mirishkor", name: "Mirishkor", latitude: 38.89014, longitude: 65.30881, labelOffset: [-78, 20] },
    { id: "kokdala", name: "Ko‘kdala", latitude: 39.22232, longitude: 66.16312, labelOffset: [10, -10] }
  ].map((d) => ({
    ...d,
    x: 400 + (d.longitude - 66.03952) * 220 * Math.cos(38.74319 * Math.PI / 180),
    y: 250 - (d.latitude - 38.74319) * 220
  }));
  // Tour: Qamashi → Yakkabog‘ → Chiroqchi → Shahrisabz → Kitob → Qarshi → the other districts
  const TOUR_ORDER = ["qamashi", "yakkabog", "chiroqchi", "shahrisabz", "kitob", "qarshi"];

  // National route (after the districts): Qashqadaryo → Samarqand → along the Silk Road through
  // every province → Kyrgyzstan → Tajikistan. Schematic: stops are placed by real coordinates,
  // the line is not a road path. Foreign stops are markers only (no outline data for them).
  const NATIONAL_STOPS = [
    { uz: "Qamashi", en: "Qamashi", lat: 38.81565, lon: 66.46656 },
    { uz: "Surxondaryo", en: "Surkhandarya", lat: 37.2242, lon: 67.2783, lx: -92, ly: 16 },
    { uz: "Samarqand", en: "Samarkand", lat: 39.6542, lon: 66.9597 },
    { uz: "Buxoro", en: "Bukhara", lat: 39.7747, lon: 64.4286, lx: -70, ly: 16 },
    { uz: "Navoiy", en: "Navoi", lat: 40.1030, lon: 65.3686 },
    { uz: "Xorazm", en: "Khorezm", lat: 41.5500, lon: 60.6333 },
    { uz: "Qoraqalpog‘iston", en: "Karakalpakstan", lat: 42.4600, lon: 59.6166, lx: 12, ly: 16 },
    { uz: "Jizzax", en: "Jizzakh", lat: 40.1158, lon: 67.8422, lx: -50, ly: 16 },
    { uz: "Sirdaryo", en: "Syrdarya", lat: 40.4897, lon: 68.7836, lx: -40, ly: -10 },
    { uz: "Toshkent", en: "Tashkent", lat: 41.2995, lon: 69.2401, lx: -62, ly: -14 },
    { uz: "Toshkent viloyati", en: "Tashkent Region", lat: 41.4689, lon: 69.5822, lx: -20, ly: -20 },
    { uz: "Namangan", en: "Namangan", lat: 40.9983, lon: 71.6726, lx: 10, ly: -10 },
    { uz: "Farg‘ona", en: "Fergana", lat: 40.3864, lon: 71.7864, lx: -40, ly: 18 },
    { uz: "Andijon", en: "Andijan", lat: 40.7821, lon: 72.3442, lx: -12, ly: -14 },
    { uz: "Qirg‘iziston", en: "Kyrgyzstan", lat: 40.5283, lon: 72.7985, foreign: true, lx: -30, ly: 24 },
    { uz: "Tojikiston", en: "Tajikistan", lat: 38.5598, lon: 68.7870, foreign: true, lx: 10, ly: 18 }
  ];
  const projectNational = (lat, lon) => ({ x: 60 + (lon - 55.8) * 39.5, y: 35 + (45.8 - lat) * 49 });

  const byId = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));
  const tourQueue = [...TOUR_ORDER, ...DISTRICTS.map((d) => d.id).filter((id) => !TOUR_ORDER.includes(id))];

  const t = (k, v) => window.I18n.t(k, v);

  // Simplified Qashqadaryo ADM1 boundary from GeoBoundaries/OSM (2017).
  const outline = document.getElementById("region-outline");
  outline.setAttribute("d", "M239.7 94.7 L238.6 95.9 L228.7 102.8 L221.4 106.4 L217.1 116.6 L214 116.6 L213.5 117 L195.7 133.2 L195 134.2 L193.9 136.8 L193.7 138 L194.3 141.2 L195.1 143.1 L196.9 145.7 L200 148.9 L203 153.2 L203.9 155.1 L203.6 156.4 L202.8 157.4 L179.7 165.6 L135.6 182 L116.4 204 L140.1 227.2 L164 243.9 L167.6 245.4 L170.3 247.1 L173 248 L184.6 257.5 L186.8 260.3 L190.8 263.2 L198.1 263.6 L204 265.9 L206.6 268.5 L215.3 275.6 L217.6 276.5 L221 279 L227 279.8 L228.1 280.2 L248.4 299 L251 302.9 L276.5 321 L314.6 347.5 L313.9 348.2 L313.9 349.5 L314.2 349.9 L318 349.8 L331.3 352.9 L356.3 356.5 L363.8 357.2 L364.5 357.7 L364.3 358.3 L365.4 358.5 L366.1 357.8 L366.6 355.6 L367.7 353.2 L371.3 352.2 L375.3 352.2 L378.6 353.1 L382.4 356.6 L385.7 360.4 L389.1 362.7 L392.2 363.7 L397.2 363.4 L399 364.1 L400.9 366.4 L401.8 367.1 L405 367.6 L407.6 368.7 L409.4 369.1 L411.2 372.7 L413.6 374.2 L417.9 375.7 L426.6 378.1 L433.6 378.5 L435.3 379.6 L440.2 388.4 L446.9 396.2 L449 397.5 L452.7 399.3 L457.3 402.3 L461.9 406.4 L466.5 407.6 L468.6 407.4 L478.4 404.3 L487.8 405.1 L490.3 405.6 L495.2 407.6 L499.6 410.4 L508.5 421 L507.5 417.5 L511.4 401.5 L513 396.8 L556 351.3 L569.1 344.4 L575.9 339.6 L584.9 330.5 L586.5 327.2 L587.9 322 L588.5 316.3 L590.4 306.2 L591.2 303.7 L624.2 270.6 L628.6 262.3 L631.6 257.4 L633.8 255 L635.5 253.8 L639.7 252.5 L645 252.8 L648.7 254 L650.5 255.3 L654 259.3 L654.9 259.9 L656 260 L660.7 245.5 L660.9 244 L660.5 228.3 L659.9 226.4 L658.5 224.7 L654.7 216.8 L652.7 205.2 L652.9 203.7 L654.6 200.6 L657.1 198.5 L659 197.5 L662.2 196.6 L673.5 196.2 L677 195.7 L679 194.8 L680.6 193.6 L683.6 190.4 L681.7 189.4 L682.5 188 L681.3 184.9 L682.1 184 L682.1 181.7 L681.7 180.8 L680.1 179.5 L680.4 177.7 L679.4 174.9 L680.5 171.7 L681.1 165.1 L680.7 161.6 L678.5 161.9 L675.1 161.8 L672.9 161.3 L672 160 L672 156.8 L669.4 154.4 L665.1 152.1 L662.4 153.1 L659.2 153.8 L656.5 153.9 L651.1 153.2 L650.6 150.2 L644.1 148.8 L640.5 146.9 L633.8 144.8 L633.6 143.7 L625.8 143.4 L621.6 141.3 L626.2 130.8 L622.9 128.3 L622.6 126.3 L619.4 123.3 L611.1 125.9 L607.2 124.6 L597.6 120.5 L583.6 116.4 L581.1 115.8 L578.9 115.8 L577.8 116 L576.9 116.6 L576.2 117.8 L576.1 120 L576.5 122.2 L576.5 124.4 L576.1 125.7 L574.5 127.4 L571.5 128.2 L557.1 129.1 L553.7 129.1 L550.1 128.5 L546.6 126.6 L545.8 125.8 L545.4 124.8 L545.2 122.7 L546.9 116.4 L547.3 111.7 L545.5 106.8 L544.9 105.9 L543.1 104.4 L511.3 98.7 L506.9 99 L503.9 100 L500.8 103.5 L496.7 110.1 L493.7 113.6 L492.8 114.2 L480.2 119.4 L479.1 119.4 L476.5 118.2 L470.4 113.9 L464.3 108.6 L459.9 105.9 L457.6 105.3 L429.6 112.2 L417.4 118.3 L409.2 123.5 L408.2 123.7 L403.6 123.6 L392.1 120.7 L389.5 119.8 L388.6 119 L388.3 113.5 L378 96.3 L365.8 82.3 L349.7 79 L349.6 80.3 L348.9 81.2 L343.6 85.2 L338.7 87.2 L333.2 87.9 L301.9 87.2 L268 85.9 L265.5 85.3 L264.9 86.3 L264 86.9 L262 87.7 L252.4 89.2 L247.2 90.5 L244.3 91.9 L239.7 94.7 Z");

  const boundaryData = window.QASHQADARYO_DISTRICT_BOUNDARIES;
  if (!boundaryData) throw new Error("Qashqadaryo district boundary data did not load.");
  const boundaryEls = {};
  Object.entries(boundaryData).forEach(([id, paths]) => {
    boundaryEls[id] = paths.map((d) => {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "district-boundary");
      path.setAttribute("pathLength", "1");
      path.dataset.id = id;
      boundariesG.appendChild(path);
      return path;
    });
  });

  const provinceLabelEls = [];
  provinces.forEach((province, index) => {
    const path = document.createElementNS(svgNS, "path");
    const highlight = province.id === "UZ-QA" || province.id === "UZ-SA" ? " is-highlighted" : "";
    path.setAttribute("d", province.path);
    path.setAttribute("class", `province-shape${highlight}`);
    path.setAttribute("pathLength", "1");
    path.dataset.id = province.id;
    path.style.setProperty("--draw-delay", `${index * 150}ms`);
    provinceBoundariesG.appendChild(path);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", province.labelX);
    label.setAttribute("y", province.labelY);
    label.setAttribute("class", "province-label");
    label.dataset.nameUz = province.nameUz;
    label.dataset.nameEn = province.nameEn;
    label.textContent = window.I18n.lang === "en" ? province.nameEn : province.nameUz;
    provinceLabelsG.appendChild(label);
    provinceLabelEls.push(label);
  });

  function updateProvinceLabels() {
    provinceLabelEls.forEach((label) => {
      label.textContent = window.I18n.lang === "en" ? label.dataset.nameEn : label.dataset.nameUz;
    });
  }

  // ---------- Pins ----------
  const pinEls = {};
  DISTRICTS.forEach((d) => {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", `pin${d.featured ? " is-featured" : ""}`);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", d.name);
    g.dataset.id = d.id;

    if (d.featured) {
      const ring = document.createElementNS(svgNS, "circle");
      ring.setAttribute("cx", d.x); ring.setAttribute("cy", d.y); ring.setAttribute("r", 14);
      ring.setAttribute("class", "pin-ring");
      g.appendChild(ring);
    }
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", d.x); dot.setAttribute("cy", d.y); dot.setAttribute("r", d.featured ? 8 : 5.5);
    dot.setAttribute("class", "pin-dot");
    g.appendChild(dot);

    const label = document.createElementNS(svgNS, "text");
    const [labelDx, labelDy] = d.labelOffset || [10, 4];
    label.setAttribute("x", d.x + labelDx); label.setAttribute("y", d.y + labelDy);
    label.setAttribute("class", "pin-label");
    label.textContent = d.name;
    g.appendChild(label);

    g.addEventListener("click", () => {
      tourStop();
      select(d.id, true);
    });
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tourStop();
        select(d.id, true);
      }
    });
    pinsG.appendChild(g);
    pinEls[d.id] = g;
  });

  // ---------- Zoom ----------
  let current = null;
  function zoomTo(d, scale) {
    const k = d ? scale : 1;
    stage.style.setProperty("--k", k);
    stage.style.transform = d
      ? `translate(400px, 250px) scale(${k}) translate(${-d.x}px, ${-d.y}px)`
      : "translate(0px, 0px) scale(1)";
  }

  // ---------- Panel ----------
  function renderPanel(d) {
    panel.replaceChildren();
    if (!d) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = t("region.pick");
      panel.appendChild(p);
      return;
    }
    const h = document.createElement("h3");
    h.textContent = d.name;
    panel.appendChild(h);

    if (d.featured) {
      const tag = document.createElement("span");
      tag.className = "tag tag-red";
      tag.textContent = t("region.featured");
      panel.insertBefore(tag, h);
    }
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = d.featured ? t("dist.qamashi.note") : t("region.other");
    panel.appendChild(note);

    const photos = (window.ContentStore ? ContentStore.load().districtPhotos[d.id] : null) || [];
    const grid = document.createElement("div");
    grid.className = "landmark-grid";
    if (!photos.length) {
      const empty = document.createElement("p");
      empty.className = "muted small";
      empty.textContent = t("region.noPhotos");
      panel.appendChild(empty);
    } else {
      photos.forEach((ph) => {
        const fig = document.createElement("figure");
        const img = document.createElement("img");
        img.src = ph.photo;
        img.alt = ph.caption || d.name;
        img.loading = "lazy";
        const cap = document.createElement("figcaption");
        cap.textContent = ph.caption || "";
        fig.append(img, cap);
        grid.appendChild(fig);
      });
      panel.appendChild(grid);
    }
  }

  function renderTourComplete() {
    panel.replaceChildren();
    panel.classList.add("tour-complete");
    const h = document.createElement("h3");
    h.textContent = t("region.done");
    const img = document.createElement("img");
    img.src = "assets/images/qamashi-mark.png";
    img.alt = t("region.logoAlt");
    img.width = 112;
    img.height = 112;
    img.className = "region-completion-logo";
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = t("region.doneNote");
    panel.append(h, img, note);
    stateLabel(null, t("region.done"));
  }

  function select(id, zoom) {
    const d = byId[id];
    if (!d) return;
    showDistrictMap();
    current = d;
    panel.classList.remove("tour-complete");
    Object.entries(pinEls).forEach(([k, el]) => el.classList.toggle("is-active", k === id));
    Object.entries(boundaryEls).forEach(([k, paths]) => {
      paths.forEach((path) => path.classList.toggle("is-active", k === id));
    });
    renderPanel(d);
    zoomTo(d, zoom ? (reduceMotion ? 1.8 : 2.4) : 1);
    stateLabel(d);
  }

  function stateLabel(d, label) {
    const el = document.getElementById("region-state");
    if (el) el.textContent = label || (d ? d.name : t("region.all"));
  }

  function showDistrictMap() {
    stage.classList.remove("is-hidden");
    nationalMap.classList.remove("is-visible");
    stage.setAttribute("aria-hidden", "false");
    nationalMap.setAttribute("aria-hidden", "true");
  }

  function showNationalMap() {
    current = null;
    zoomTo(null);
    stage.classList.add("is-hidden");
    nationalMap.classList.add("is-visible");
    stage.setAttribute("aria-hidden", "true");
    nationalMap.setAttribute("aria-hidden", "false");
    provinceBoundariesG.querySelectorAll(".province-shape").forEach((path) => {
      path.classList.remove("is-revealed");
    });
    nationalRoute.classList.remove("is-drawing");
    nationalRoute.setAttribute("d", "");
    clearNationalRoute();
  }

  function drawDistrictTrail(from, to) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", `M${from.x} ${from.y} L${to.x} ${to.y}`);
    path.setAttribute("pathLength", "1");
    path.setAttribute("class", "district-trail");
    trailsG.appendChild(path);
    requestAnimationFrame(() => path.classList.add("is-drawing"));
  }

  let routeTimer = null;
  function addNationalMarker(point) {
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute("class", "national-marker" + (point.foreign ? " is-foreign" : ""));
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", point.x.toFixed(1));
    dot.setAttribute("cy", point.y.toFixed(1));
    dot.setAttribute("r", point.foreign ? "4.5" : "5");
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", (point.x + (point.lx ?? 8)).toFixed(1));
    label.setAttribute("y", (point.y + (point.ly ?? -8)).toFixed(1));
    label.setAttribute("class", "national-city-label");
    label.dataset.uz = point.uz;
    label.dataset.en = point.en;
    label.textContent = window.I18n.lang === "en" ? point.en : point.uz;
    group.append(dot, label);
    nationalMarkersG.appendChild(group);
  }
  function clearNationalRoute() {
    if (routeTimer !== null) { window.clearTimeout(routeTimer); routeTimer = null; }
    nationalMap.querySelectorAll(".national-route-seg").forEach((n) => n.remove());
    nationalMarkersG.replaceChildren();
  }
  // Draws the route one leg at a time, placing a marker at each stop; calls onDone at the end.
  function drawNationalRoute(onDone) {
    clearNationalRoute();
    const pts = NATIONAL_STOPS.map((stop) => ({ ...stop, ...projectNational(stop.lat, stop.lon) }));
    addNationalMarker(pts[0]);
    let i = 0;
    const step = () => {
      routeTimer = null;
      if (i >= pts.length - 1) { if (onDone) onDone(); return; }
      const a = pts[i], b = pts[i + 1];
      i += 1;
      const seg = document.createElementNS(svgNS, "path");
      seg.setAttribute("d", `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      seg.setAttribute("pathLength", "1");
      seg.setAttribute("class", "national-route national-route-seg");
      seg.style.animationDuration = reduceMotion ? "0s" : "0.9s";
      nationalRoute.parentNode.insertBefore(seg, nationalMarkersG);
      requestAnimationFrame(() => seg.classList.add("is-drawing"));
      addNationalMarker(b);
      routeTimer = window.setTimeout(step, reduceMotion ? 0 : 1000);
    };
    step();
  }

  // ---------- Tour ----------
  let tourIndex = -1;
  let tourTimer = null;
  let tourPhase = "idle";
  function tourNext() {
    if (tourTimer !== null) {
      window.clearTimeout(tourTimer);
      tourTimer = null;
    }
    if (tourPhase === "idle" || tourPhase === "done") {
      tourStart();
      return;
    }
    if (tourPhase === "national") {
      tourPhase = "done";
      current = null;
      Object.values(pinEls).forEach((el) => el.classList.remove("is-active"));
      Object.values(boundaryEls).flat().forEach((path) => path.classList.remove("is-active"));
      renderTourComplete();
      return;
    }

    if (tourIndex + 1 >= tourQueue.length) {
      tourPhase = "national";
      showNationalMap();
      panel.classList.remove("tour-complete");
      const heading = document.createElement("h3");
      heading.textContent = t("region.national");
      const routeNote = document.createElement("p");
      routeNote.className = "muted";
      routeNote.textContent = t("region.route");
      panel.replaceChildren(heading, routeNote);
      stateLabel(null, t("region.national"));
      tourTimer = window.setTimeout(() => {
        provinceBoundariesG.querySelectorAll(".province-shape").forEach((path) => {
          requestAnimationFrame(() => path.classList.add("is-revealed"));
        });
        drawNationalRoute(() => {
          tourTimer = window.setTimeout(tourNext, 2600);
        });
      }, 350);
      return;
    }

    const previous = current;
    tourIndex += 1;
    const next = byId[tourQueue[tourIndex]];
    if (previous) drawDistrictTrail(previous, next);
    select(next.id, true);
    tourTimer = window.setTimeout(tourNext, 3200);
  }

  function tourStop() {
    if (tourTimer !== null) {
      window.clearTimeout(tourTimer);
      tourTimer = null;
    }
    clearNationalRoute();
    tourIndex = -1;
    tourPhase = "idle";
  }

  function tourStart() {
    tourStop();
    showDistrictMap();
    trailsG.replaceChildren();
    panel.classList.remove("tour-complete");
    current = null;
    Object.values(pinEls).forEach((el) => el.classList.remove("is-active"));
    Object.values(boundaryEls).flat().forEach((path) => path.classList.remove("is-active"));
    tourPhase = "districts";
    tourNext();
  }

  document.getElementById("tour-start").addEventListener("click", () => {
    tourStart();
  });
  document.getElementById("tour-next").addEventListener("click", tourNext);
  document.getElementById("tour-reset").addEventListener("click", () => {
    tourStop();
    showDistrictMap();
    trailsG.replaceChildren();
    current = null;
    Object.values(pinEls).forEach((el) => el.classList.remove("is-active"));
    Object.values(boundaryEls).flat().forEach((path) => path.classList.remove("is-active"));
    panel.classList.remove("tour-complete");
    zoomTo(null);
    renderPanel(null);
    stateLabel(null);
  });

  // Refresh panel photos when admin changes content
  window.addEventListener("contentchange", () => { if (current) renderPanel(current); });
  document.addEventListener("langchange", () => {
    updateProvinceLabels();
    if (panel.classList.contains("tour-complete")) renderTourComplete();
    else if (tourPhase === "national") {
      const heading = panel.querySelector("h3");
      const note = panel.querySelector("p");
      if (heading) heading.textContent = t("region.national");
      if (note) note.textContent = t("region.route");
      nationalMarkersG.querySelectorAll(".national-city-label").forEach((label) => {
        label.textContent = window.I18n.lang === "en" ? label.dataset.en : label.dataset.uz;
      });
      stateLabel(null, t("region.national"));
    } else { renderPanel(current); stateLabel(current); }
  });

  // Initial state: Qamashi is highlighted, but not zoomed (overview first)
  renderPanel(null);
  stateLabel(null);
  const qamashiPin = pinEls.qamashi;
  if (qamashiPin) qamashiPin.classList.add("is-featured-idle");

  const regionSection = document.getElementById("region");
  let tourAutoStarted = false;
  function startTourWhenVisible() {
    if (tourAutoStarted || reduceMotion) return;
    const rect = regionSection.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
    tourAutoStarted = true;
    tourStart();
    tourObserver.disconnect();
    window.removeEventListener("scroll", startTourWhenVisible);
  }
  const tourObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) startTourWhenVisible();
  }, { threshold: 0.25 });
  tourObserver.observe(regionSection);
  window.addEventListener("scroll", startTourWhenVisible, { passive: true });
  requestAnimationFrame(startTourWhenVisible);
})();
