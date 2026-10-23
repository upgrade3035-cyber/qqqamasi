/* ==========================================================
   Main site behaviour: header, nav, reveal,
   public content rendering (team, winners, settings),
   dialogs and public page interactions.
   The journey (flight.js) and region map (regions.js) are separate.
   ========================================================== */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t = (k, v) => window.I18n.t(k, v);

  // Small DOM helper — always uses textContent for user data (no HTML injection)
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === undefined || v === null || v === false) return;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v === true ? "" : v);
    });
    children.forEach((c) => c && node.appendChild(c));
    return node;
  }

  // ---------- Header & mobile nav ----------
  const header = $(".site-header");
  const onHeaderScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();

  const navToggle = $(".nav-toggle");
  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("#nav a").forEach((a) => a.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

  // ---------- Reveal animations ----------
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      revealIO.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  function observeReveal(root = document) {
    $$(".reveal", root).forEach((node) => { if (!node.classList.contains("in")) revealIO.observe(node); });
  }

  // ---------- Public content rendering (from admin / demo store) ----------
  function sampleOr(item, textValue, key) {
    return item.sample ? t(key) : textValue;
  }

  function renderTeam(content) {
    const grid = $("#team-grid");
    grid.replaceChildren();
    content.team.forEach((m) => {
      const portrait = m.photo
        ? el("div", { class: "portrait" }, [el("img", { src: m.photo, alt: "", loading: "lazy" })])
        : el("div", { class: "portrait", "aria-hidden": "true" }, [el("span", { text: initials(m.sample ? t("team.name") : m.name) })]);
      const role = m.sample ? t(m.roleKey) : m.role;
      const bio = m.sample ? t("team.bio") : m.bio;
      grid.appendChild(el("article", { class: "team-card reveal" }, [
        portrait,
        el("h3", { text: m.sample ? t("team.name") : m.name }),
        el("p", { class: "role", text: role }),
        el("p", { class: "muted", text: bio })
      ]));
    });
    observeReveal(grid);
  }

  function initials(name) {
    return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
  }

  // Open-book album: the spread shows [previous photo | current photo].
  // Turning a page animates a leaf across the spine; there is no back button —
  // the left page itself, arrow keys and swipe move backwards.
  let winnerPageIndex = 0;
  let winnerPageFlipping = false;

  function setBookPage(pageEl, img, photo) {
    if (photo && photo.photo) {
      img.src = photo.photo;
      img.alt = photo.caption || "";
      img.hidden = false;
      pageEl.classList.remove("is-cover");
    } else {
      img.removeAttribute("src");
      img.alt = "";
      img.hidden = true;
      pageEl.classList.add("is-cover");
    }
  }

  function renderWinners(content) {
    const pages = content.winnerPages || [];
    const book = $("#winner-book");
    const caption = $("#winner-book-caption");
    const count = $("#winner-book-count");
    const left = $("#book-left");
    const right = $("#book-right");

    winnerPageIndex = pages.length ? Math.min(winnerPageIndex, pages.length - 1) : 0;
    if (!pages.length) {
      setBookPage(left, $("#book-left-img"), null);
      setBookPage(right, $("#book-right-img"), null);
      book.classList.add("is-empty");
      caption.textContent = t("winners.empty");
      const descEmpty = $("#winner-book-desc");
      if (descEmpty) descEmpty.textContent = "";
      count.textContent = "";
      left.disabled = true;
      right.disabled = true;
      return;
    }

    book.classList.remove("is-empty");
    setBookPage(left, $("#book-left-img"), pages[winnerPageIndex - 1] || null);
    setBookPage(right, $("#book-right-img"), pages[winnerPageIndex]);
    const page = pages[winnerPageIndex];
    caption.textContent = page.title || page.caption || t("winners.photoCaption");
    const desc = $("#winner-book-desc");
    if (desc) desc.textContent = page.desc || "";
    count.textContent = t("winners.pageCount", { current: winnerPageIndex + 1, total: pages.length });
    left.disabled = winnerPageIndex === 0;
    right.disabled = winnerPageIndex >= pages.length - 1;

  }

  function turnWinnerPage(direction) {
    if (winnerPageFlipping) return;
    const pages = window.ContentStore.load().winnerPages || [];
    const target = winnerPageIndex + direction;
    if (target < 0 || target > pages.length - 1) return;

    winnerPageFlipping = true;
    const leaf = $("#book-leaf");
    const leftImg = $("#book-left-img");
    const rightImg = $("#book-right-img");
    const left = $("#book-left");
    const right = $("#book-right");

    if (direction > 0) {
      // Current right page lifts over the spine; the next photo waits underneath.
      const leafPhoto = pages[winnerPageIndex].photo;
      $("#leaf-front").src = leafPhoto;
      $("#leaf-back").src = leafPhoto;
      setBookPage(right, rightImg, pages[target]);
      leaf.className = "book-leaf is-forward";
    } else {
      // Left photo (the one before the current) lifts over to the right.
      const leafPhoto = pages[target].photo;
      $("#leaf-front").src = leafPhoto;
      $("#leaf-back").src = leafPhoto;
      setBookPage(left, leftImg, pages[target - 1] || null);
      leaf.className = "book-leaf is-backward";
    }

    window.setTimeout(() => {
      winnerPageIndex = target;
      leaf.className = "book-leaf";
      renderWinners(window.ContentStore.load());
      winnerPageFlipping = false;
    }, reduceMotion ? 0 : 720);
  }

  $("#book-left").addEventListener("click", () => turnWinnerPage(-1));
  $("#book-right").addEventListener("click", () => turnWinnerPage(1));

  const winnerBook = $("#winner-book");
  winnerBook.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); turnWinnerPage(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); turnWinnerPage(-1); }
  });
  let swipeStartX = null;
  winnerBook.addEventListener("touchstart", (e) => { swipeStartX = e.touches[0].clientX; }, { passive: true });
  winnerBook.addEventListener("touchend", (e) => {
    if (swipeStartX === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(dx) > 40) turnWinnerPage(dx < 0 ? 1 : -1);
  });

  // Hero title, lead and course texts: admin override, otherwise the translation.
  const COURSE_KEYS = { python: "python", ai: "ai", data: "ds", web: "web" };
  function renderSite(content) {
    const site = content.site || {};
    const line1 = document.querySelector('[data-hero-line="1"]');
    const line2 = document.querySelector('[data-hero-line="2"]');
    const lead = document.getElementById("hero-lead");
    if (line1) line1.textContent = site.line1 || t("hero.line1");
    if (line2) line2.textContent = site.line2 || t("hero.line2");
    if (lead) lead.textContent = site.lead || t("hero.lead");
    document.querySelectorAll("[data-course][data-role]").forEach((el) => {
      const key = el.dataset.course;
      const override = (site.courses && site.courses[key] || {})[el.dataset.role === "title" ? "title" : "desc"];
      const base = COURSE_KEYS[key] || key;
      el.textContent = override || t(`${base}.${el.dataset.role}`);
    });
  }

  function renderPublic() {
    if (!window.ContentStore) return;
    const content = ContentStore.load();
    renderSite(content);
    renderTeam(content);
    renderWinners(content);
  }

  renderPublic();
  window.addEventListener("contentchange", renderPublic);
  window.addEventListener("storage", (e) => { if (e.key && e.key.startsWith("qamashi.content")) renderPublic(); });
  document.addEventListener("langchange", renderPublic);

  // ---------- Generic detail dialog (news) ----------
  const detailDialog = $("#detail-dialog");
  $$("[data-detail]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tpl = document.getElementById(btn.dataset.detail);
      const body = $("#detail-body");
      if (tpl) { body.replaceChildren(tpl.content.cloneNode(true)); }
      window.I18n.apply(body);
      detailDialog.showModal();
      $("#detail-close").focus();
    });
  });
  $("#detail-close").addEventListener("click", () => detailDialog.close());
  detailDialog.addEventListener("click", (e) => { if (e.target === detailDialog) detailDialog.close(); });

  // ---------- Initial reveal ----------
  observeReveal(document);
  // Anything already in view at load: reveal immediately
  requestAnimationFrame(() => $$(".reveal").forEach((n) => {
    const r = n.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { n.classList.add("in"); }
  }));
})();
