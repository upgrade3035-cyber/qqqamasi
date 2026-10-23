/* ==========================================================
   Admin panel — simple login gate (demo). Session lives in sessionStorage.
   All user-entered text is written with textContent (no HTML).
   ========================================================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v ?? "");
  const DISTRICTS = [
    ["qamashi", "Qamashi"], ["yakkabog", "Yakkabog‘"], ["chiroqchi", "Chiroqchi"], ["shahrisabz", "Shahrisabz"],
    ["qarshi", "Qarshi"], ["kitob", "Kitob"], ["koson", "Koson"], ["kasbi", "Kasbi"], ["muborak", "Muborak"],
    ["nishon", "Nishon"], ["dehqonobod", "Dehqonobod"], ["guzar", "G‘uzor"], ["mirishkor", "Mirishkor"]
  ];
  const COURSES = { python: "Python", ai: "Sun’iy intellekt", data: "Data Science", web: "Veb-dasturlash", smm: "SMM va kontent", english: "Ingliz tili" };
  const STATUS = { new: "Yangi", accepted: "Qabul qilingan", rejected: "Rad etilgan" };
  const MAX_IMG = 8 * 1024 * 1024;

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === undefined || v === null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "on") Object.entries(v).forEach(([ev, fn]) => n.addEventListener(ev, fn));
      else n.setAttribute(k, v === true ? "" : v);
    });
    children.forEach((c) => c && n.appendChild(c));
    return n;
  }
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" }); } catch (e) { return ""; } };
  function setStatus(id, kind, msg) { const n = document.getElementById(id); n.className = `status ${kind || ""}`; n.textContent = msg; }

  // ---------- Auth gate (demo) ----------
  // NOTE: client-side only. Anyone who can read this file can read the login.
  // Real protection needs server-side auth before the site holds real data.
  const ADMIN_LOGIN = "qamashi";
  const ADMIN_PASSWORD = "itcenter";
  const SESSION_KEY = "qamashi.admin.session";
  const loginView = $("#login-view");
  const appView = $("#app-view");
  const loginForm = $("#login-form");
  const loginError = $("#l-error");

  function isAuthed() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { return false; }
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("#l-user").value.trim();
    const pass = $("#l-pass").value;
    $("#l-pass").value = "";
    if (user === ADMIN_LOGIN && pass === ADMIN_PASSWORD) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (err) { /* private mode: still works for this tab */ }
      loginError.textContent = "";
      showApp();
    } else {
      loginError.textContent = "Login yoki parol noto‘g‘ri.";
    }
  });

  $("#logout").addEventListener("click", () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (err) { /* ignore */ }
    appView.hidden = true;
    loginView.hidden = false;
    $("#l-pass").value = "";
    loginError.textContent = "";
  });

  function showApp() {
    loginView.hidden = true;
    appView.hidden = false;
    show("dashboard");
  }

  // ---------- Navigation ----------
  const renderers = {};
  function show(view) {
    $$("[data-view]").forEach((s) => { s.hidden = s.dataset.view !== view; });
    $$("[data-view-link]").forEach((b) => b.setAttribute("aria-current", b.dataset.viewLink === view ? "page" : "false"));
    if (renderers[view]) renderers[view]();
  }
  $$("[data-view-link]").forEach((b) => b.addEventListener("click", () => show(b.dataset.viewLink)));

  // ---------- Content helpers ----------
  function loadContent() { return window.ContentStore.load(); }
  function saveContent(mutator) {
    try {
      const data = loadContent();
      mutator(data);
      window.ContentStore.save(data);
      return true;
    } catch (e) {
      alert("Saqlashda xatolik: brauzer xotirasi to‘lib qolgan bo‘lishi mumkin. Kattaroq fayllar o‘rniga havola ishlating.");
      return false;
    }
  }
  const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  // ---------- Dashboard ----------
  renderers.dashboard = () => {
    const c = loadContent();
    const regs = window.RegistrationService.list();
    const msgs = window.Messages.list();
    const kpis = [
      ["Yangi arizalar", regs.filter((r) => r.status === "new").length],
      ["Jami arizalar", regs.length],
      ["To‘lov qilganlar", regs.filter((r) => r.paid).length],
      ["Jami tushum (so‘m)", regs.filter((r) => r.paid).reduce((a, r) => a + (Number(r.amount) || 0), 0).toLocaleString("uz-UZ")],
      ["Yangi xabarlar", msgs.filter((m) => m.status === "new").length],
      ["Jamoa a’zolari", c.team.filter((m) => !m.sample).length],
      ["G‘oliblar", c.winners.filter((w) => !w.sample).length]
    ];
    const box = $("#kpis");
    box.replaceChildren(...kpis.map(([label, n]) => el("div", { class: "kpi" }, [el("strong", { text: String(n) }), el("span", { text: label })])));
  };

  // ---------- Registrations ----------
  function renderRegs() {
    const q = $("#reg-search").value.trim().toLowerCase();
    const f = $("#reg-filter").value;
    const all = window.RegistrationService.list();
    const rows = all
      .filter((r) => f === "all" || r.status === f)
      .filter((r) => !q || `${(r.name || r.fullName || "")} ${r.phone}`.toLowerCase().includes(q))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    $("#reg-empty").hidden = all.length !== 0;
    const body = $("#reg-body");
    body.replaceChildren(...rows.map((r) => {
      const sel = el("select", { "aria-label": "Holat", on: { change: (e) => { window.RegistrationService.setStatus(r.id, e.target.value); renderRegs(); } } },
        Object.entries(STATUS).map(([v, label]) => el("option", { value: v, text: label, selected: r.status === v || null })));
      return el("tr", {}, [
        el("td", { text: esc((r.name || r.fullName || "")) }),
        el("td", { text: esc(r.phone) }),
        el("td", { text: esc(r.age || "—") }),
        el("td", { text: esc(COURSES[r.course] || r.course) }),
        el("td", { text: fmtDate(r.createdAt) }),
        el("td", {}, [sel]),
        el("td", {}, [el("button", { class: r.paid ? "btn btn-ghost btn-sm" : "btn btn-red btn-sm", type: "button", text: r.paid ? "✓ To‘langan" : "To‘lov qildi", on: { click: () => {
          if (r.paid) { if (!confirm("To‘lov bekor qilinsinmi?")) return; window.RegistrationService.update(r.id, { paid: false, amount: 0, paidAt: null }); }
          else {
            const a = prompt(`“${(r.name || r.fullName || "")}” qancha to‘ladi? (so‘m)`, "");
            if (a === null) return;
            window.RegistrationService.update(r.id, { paid: true, amount: Number(String(a).replace(/\D/g, "")) || 0, paidAt: new Date().toISOString(), status: "accepted" });
          }
          renderRegs();
        } } })]),
        el("td", {}, [el("button", { class: "btn btn-danger btn-sm", type: "button", text: "O‘chirish", on: { click: () => {
          if (!confirm(`“${(r.name || r.fullName || "")}” arizasi o‘chirilsinmi?`)) return;
          window.RegistrationService.remove(r.id); renderRegs();
        } } })])
      ]);
    }));
    if (!rows.length && all.length) body.appendChild(el("tr", {}, [el("td", { colspan: 8, class: "muted", text: "Filtr bo‘yicha natija yo‘q." })]));
  }
  renderers.regs = renderRegs;
  $("#reg-search").addEventListener("input", renderRegs);
  $("#reg-filter").addEventListener("change", renderRegs);

  // ---------- Paid students ----------
  function renderPaid() {
    const q = ($("#paid-search").value || "").trim().toLowerCase();
    const all = window.RegistrationService.list().filter((r) => r.paid);
    const rows = all.filter((r) => !q || `${(r.name || r.fullName || "")} ${r.phone} ${r.course}`.toLowerCase().includes(q))
      .sort((a, b) => ((a.paidAt || "") < (b.paidAt || "") ? 1 : -1));
    $("#paid-total").textContent = `${all.length} ta o‘quvchi · ${all.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString("uz-UZ")} so‘m`;
    $("#paid-empty").hidden = all.length !== 0;
    $("#paid-body").replaceChildren(...rows.map((r) => el("tr", {}, [
      el("td", { text: esc(r.name || r.fullName || "") }),
      el("td", { text: esc(r.phone) }),
      el("td", { text: esc(COURSES[r.course] || r.course) }),
      el("td", { text: `${(Number(r.amount) || 0).toLocaleString("uz-UZ")} so‘m` }),
      el("td", { text: r.paidAt ? fmtDate(r.paidAt) : "—" }),
      el("td", {}, [el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "Bekor qilish", on: { click: () => {
        if (!confirm("To‘lov bekor qilinsinmi?")) return;
        window.RegistrationService.update(r.id, { paid: false, amount: 0, paidAt: null }); renderPaid();
      } } })])
    ])));
  }
  renderers.paid = renderPaid;
  $("#paid-search").addEventListener("input", renderPaid);

  // ---------- Messages ----------
  function renderMsgs() {
    const list = window.Messages.list();
    $("#msg-empty").hidden = list.length !== 0;
    $("#msg-list").replaceChildren(...list.map((m) => el("article", { class: `item msg-item ${m.status === "read" ? "is-read" : ""}` }, [
      el("div", { class: "thumb", "aria-hidden": "true", text: "✉" }),
      el("div", {}, [
        el("p", { text: `${esc(m.name)} · ${fmtDate(m.createdAt)}` }),
        el("p", { class: "meta-line", text: esc(m.message) })
      ]),
      el("div", { class: "item-actions" }, [
        el("button", { class: "btn btn-ghost btn-sm", type: "button", text: m.status === "read" ? "Yangi qilish" : "O‘qildi", on: { click: () => {
          window.Messages.update(m.id, { status: m.status === "read" ? "new" : "read" }); renderMsgs();
        } } }),
        el("button", { class: "btn btn-danger btn-sm", type: "button", text: "O‘chirish", on: { click: () => {
          if (!confirm("Xabar o‘chirilsinmi?")) return;
          window.Messages.remove(m.id); renderMsgs();
        } } })
      ])
    ])));
  }
  renderers.msgs = renderMsgs;

  // ---------- Generic list item ----------
  function listItem(thumbNode, title, meta, onDelete) {
    return el("article", { class: "item" }, [
      el("div", { class: "thumb" }, [thumbNode]),
      el("div", {}, [el("p", { text: title }), el("p", { class: "meta-line", text: meta })]),
      el("div", { class: "item-actions" }, [el("button", { class: "btn btn-danger btn-sm", type: "button", text: "O‘chirish", on: { click: onDelete } })])
    ]);
  }
  const imgThumb = (src) => (src ? el("img", { src, alt: "" }) : el("span", { text: "—" }));

  // ---------- Team ----------
  function renderTeam() {
    const c = loadContent();
    $("#team-list").replaceChildren(...c.team.map((m) => listItem(
      imgThumb(m.photo),
      m.sample ? "(namuna) Ism Familiya" : esc(m.name),
      m.sample ? "Namuna a’zo" : esc(m.role),
      () => {
        if (!confirm("Bu a’zo o‘chirilsinmi?")) return;
        saveContent((d) => { d.team = d.team.filter((x) => x.id !== m.id); });
        renderTeam();
      }
    )));
  }
  renderers.team = renderTeam;

  $("#team-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#tm-name").value.trim();
    const role = $("#tm-role").value.trim();
    const bio = $("#tm-bio").value.trim();
    const file = $("#tm-photo").files[0];
    if (name.length < 3 || role.length < 2) return setStatus("tm-status", "error", "Ism (3+ belgi) va lavozimni kiriting.");
    if (file && file.size > MAX_IMG) return setStatus("tm-status", "error", "Rasm 8 MB dan katta.");
    setStatus("tm-status", "", "Saqlanmoqda…");
    try {
      const photo = file ? await window.resizeImage(file) : null;
      if (saveContent((d) => { d.team.push({ id: uid("team"), name, role, bio, photo }); })) {
        setStatus("tm-status", "success", "A’zo qo‘shildi.");
        e.target.reset();
        renderTeam();
      }
    } catch (err) { setStatus("tm-status", "error", "Rasmni o‘qib bo‘lmadi."); }
  });

  // ---------- Winners (book pages) ----------
  function renderWinnersAdmin() {
    const pages = loadContent().winnerPages || [];
    $("#winner-empty").hidden = pages.length !== 0;
    $("#winner-list").replaceChildren(...pages.map((page, index) => listItem(
      imgThumb(page.photo),
      esc(page.title || page.caption || `G‘olib ${index + 1}`),
      `${index + 1}-sahifa${page.desc ? " · " + String(page.desc).slice(0, 70) : ""}`,
      () => {
        if (!confirm("G‘olib kitobdan o‘chirilsinmi?")) return;
        saveContent((d) => { d.winnerPages = d.winnerPages.filter((x) => x.id !== page.id); });
        renderWinnersAdmin();
      }
    )));
  }
  renderers.winners = renderWinnersAdmin;

  $("#winner-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = $("#w-title").value.trim();
    const desc = $("#w-desc").value.trim();
    const file = $("#w-photo").files[0];
    if (title.length < 3) return setStatus("w-status", "error", "Sarlavhani kamida 3 ta belgi bilan kiriting.");
    if (!file) return setStatus("w-status", "error", "G‘olib rasmini yuklang.");
    if (file.size > MAX_IMG) return setStatus("w-status", "error", "Rasm 8 MB dan katta.");
    setStatus("w-status", "", "Saqlanmoqda…");
    try {
      const photo = await window.resizeImage(file, 1000);
      const item = { id: uid("winner-page"), title, desc, photo };
      if (!saveContent((d) => { d.winnerPages.push(item); })) {
        setStatus("w-status", "error", "Saqlab bo‘lmadi: xotira to‘lgan bo‘lishi mumkin.");
        return;
      }
      e.target.reset();
      setStatus("w-status", "success", "G‘olib kitobga qo‘shildi. Bosh sahifada ko‘rinadi.");
      renderWinnersAdmin();
    } catch (err) {
      setStatus("w-status", "error", "Rasmni o‘qib bo‘lmadi.");
    }
  });

  // ---------- Districts (landmark photos) ----------
  function renderDistrictPhotos() {
    const id = $("#d-select").value;
    const c = loadContent();
    const list = c.districtPhotos[id] || [];
    $("#district-photos").replaceChildren(...list.map((p, i) => el("figure", {}, [
      el("img", { src: p.photo, alt: "" }),
      el("figcaption", {}, [
        el("span", { text: p.caption || "—" }),
        el("button", { class: "btn btn-danger btn-sm", type: "button", text: "O‘chirish", on: { click: () => {
          if (!confirm("Rasm o‘chirilsinmi?")) return;
          saveContent((d) => { d.districtPhotos[id] = (d.districtPhotos[id] || []).filter((_, j) => j !== i); });
          renderDistrictPhotos();
        } } })
      ])
    ])));
    if (!list.length) $("#district-photos").appendChild(el("p", { class: "muted", text: "Bu tuman uchun rasm yo‘q." }));
  }
  renderers.districts = () => {
    const sel = $("#d-select");
    if (!sel.options.length) {
      DISTRICTS.forEach(([id, name]) => sel.appendChild(el("option", { value: id, text: name })));
    }
    renderDistrictPhotos();
  };
  $("#d-select").addEventListener("change", renderDistrictPhotos);
  $("#district-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = $("#d-photo").files[0];
    if (!file) return setStatus("d-status", "error", "Rasm tanlang.");
    if (file.size > MAX_IMG) return setStatus("d-status", "error", "Rasm 8 MB dan katta.");
    setStatus("d-status", "", "Saqlanmoqda…");
    try {
      const photo = await window.resizeImage(file);
      const id = $("#d-select").value;
      const caption = $("#d-caption").value.trim();
      if (saveContent((d) => { d.districtPhotos[id] = [...(d.districtPhotos[id] || []), { photo, caption }]; })) {
        setStatus("d-status", "success", "Rasm qo‘shildi.");
        e.target.reset();
        renderDistrictPhotos();
      }
    } catch (err) { setStatus("d-status", "error", "Rasmni o‘qib bo‘lmadi."); }
  });

  $("#reset-content").addEventListener("click", () => {
    if (!confirm("Jamoa va g‘oliblar namunaga qaytarilsinmi?")) return;
    window.ContentStore.reset();
    setStatus("s-status", "success", "Namunaga qaytarildi.");
  });

  // ---------- Site text ----------
  const SITE_COURSE_KEYS = ["python", "ai", "data", "web", "smm", "english"];
  renderers.site = () => {
    const s = loadContent().site;
    $("#st-line1").value = s.line1;
    $("#st-line2").value = s.line2;
    $("#st-lead").value = s.lead;
    SITE_COURSE_KEYS.forEach((k) => {
      $(`#st-${k}-title`).value = s.courses[k].title;
      $(`#st-${k}-desc`).value = s.courses[k].desc;
    });
  };
  $("#site-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const courses = {};
    SITE_COURSE_KEYS.forEach((k) => {
      courses[k] = { title: $(`#st-${k}-title`).value.trim(), desc: $(`#st-${k}-desc`).value.trim() };
    });
    const site = { line1: $("#st-line1").value.trim(), line2: $("#st-line2").value.trim(), lead: $("#st-lead").value.trim(), courses };
    if (saveContent((d) => { d.site = site; })) setStatus("st-status", "success", "Saqlandi. Bosh sahifada darhol ko‘rinadi.");
  });

  // Keep dashboard and lists fresh when another tab changes storage
  window.addEventListener("storage", () => {
    const active = $$("[data-view]").find((s) => !s.hidden);
    if (active && renderers[active.dataset.view]) renderers[active.dataset.view]();
  });

  // Password visibility toggle ("ko‘zcha")
  const eye = document.getElementById("pw-eye");
  const pass = document.getElementById("l-pass");
  if (eye && pass) {
    eye.addEventListener("click", () => {
      const show = pass.type === "password";
      pass.type = show ? "text" : "password";
      eye.setAttribute("aria-pressed", String(show));
      eye.setAttribute("aria-label", show ? "Parolni yashirish" : "Parolni ko‘rsatish");
      pass.focus();
    });
  }

  // Live sync with Firebase: new applications appear instantly
  window.RegistrationService.subscribe && window.RegistrationService.subscribe(() => {
    const active = $$("[data-view]").find((s) => !s.hidden);
    if (active && renderers[active.dataset.view]) renderers[active.dataset.view]();
  });

  if (isAuthed()) showApp();
})();
