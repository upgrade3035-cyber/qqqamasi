/* ==========================================================
   Course registration — DEMO MODE
   - Only name and phone are required. Phone: +998-XX-XXX-XX-XX.
   - Saves ONLY to this browser's localStorage. Nothing is sent to
     the IT center and no server confirmation is claimed.
   - INTEGRATION POINT: when Supabase is connected, replace the body
     of RegistrationService.create() with an insert into the
     `registrations` table. The form code does not need to change.
   ========================================================== */
(() => {
  const STORAGE_KEY = "qamashi.demoRegistrations.v1";

  // ---- Firebase (Firestore) ----
  // Firebase Console -> Project settings -> Your apps -> Web app config ni shu yerga qo'ying.
  // Bo'sh bo'lsa, arizalar faqat shu brauzerda saqlanadi.
  const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };
  const COLLECTION = "registrations";
  const hasFirebase = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
  let dbPromise = null;
  function loadScript(src) {
    return new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = src; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); });
  }
  function getDb() {
    if (!hasFirebase) return Promise.resolve(null);
    if (!dbPromise) {
      const v = "10.12.2";
      dbPromise = loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-app-compat.js`)
        .then(() => loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore-compat.js`))
        .then(() => { if (!window.firebase.apps.length) window.firebase.initializeApp(FIREBASE_CONFIG); return window.firebase.firestore(); })
        .catch(() => null);
    }
    return dbPromise;
  }
  const readLocal = () => { try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(d) ? d : []; } catch (e) { return []; } };
  const writeLocal = (list) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ } };

  const RegistrationService = {
    cloud: hasFirebase,
    list() { return readLocal(); },
    async create(payload) {
      const record = {
        id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        status: "new",
        paid: false,
        ...payload
      };
      const db = await getDb();
      if (db) {
        await db.collection(COLLECTION).doc(record.id).set(record);
      }
      const list = readLocal(); list.push(record); writeLocal(list);
      return { mode: db ? "cloud" : "local", record };
    },
    // Admin: live updates from Firestore; calls onChange whenever data changes.
    async subscribe(onChange) {
      const db = await getDb();
      if (!db) return false;
      db.collection(COLLECTION).onSnapshot((snap) => {
        writeLocal(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        onChange && onChange();
      }, () => {});
      return true;
    },
    clear() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ } },
    save(list) { writeLocal(list); },
    update(id, patch) {
      this.save(this.list().map((r) => (r.id === id ? { ...r, ...patch } : r)));
      getDb().then((db) => db && db.collection(COLLECTION).doc(id).set(patch, { merge: true }));
    },
    setStatus(id, status) { this.update(id, { status }); },
    remove(id) {
      this.save(this.list().filter((r) => r.id !== id));
      getDb().then((db) => db && db.collection(COLLECTION).doc(id).delete());
    }
  };
  window.RegistrationService = RegistrationService;

  const t = (k, v) => window.I18n.t(k, v);

  // Phone: keeps only the 9 subscriber digits after +998 and formats them live.
  function phoneDigits(value) {
    let d = String(value || "").replace(/\D/g, "");
    if (d.startsWith("998")) d = d.slice(3);
    return d.slice(0, 9);
  }
  function formatPhone(value) {
    const d = phoneDigits(value);
    if (!d) return "";
    let out = "+998";
    if (d.length > 0) out += "-" + d.slice(0, 2);
    if (d.length > 2) out += "-" + d.slice(2, 5);
    if (d.length > 5) out += "-" + d.slice(5, 7);
    if (d.length > 7) out += "-" + d.slice(7, 9);
    return out;
  }

  const form = document.getElementById("reg-form");
  if (!form) return;

  const btn = document.getElementById("reg-submit");
  const status = document.getElementById("reg-status");
  const courseInput = document.getElementById("r-course");
  let submitting = false;

  const fields = {
    name: document.getElementById("r-name"),
    phone: document.getElementById("r-phone")
  };

  function setError(key, message) {
    const input = fields[key];
    const err = document.getElementById(`${input.id}-err`);
    if (err) err.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }
  function setStatus(kind, message) {
    status.className = `status ${kind}`;
    status.textContent = message;
  }

  // Course list in the bottom form comes from the course cards (same keys and titles).
  document.querySelectorAll("[data-course-select]").forEach((a) => {
    const card = a.closest(".course-card");
    const title = (card && card.querySelector("h3") ? card.querySelector("h3").textContent : a.dataset.courseSelect).trim();
    const opt = document.createElement("option");
    opt.value = a.dataset.courseSelect;
    opt.textContent = title;
    courseInput.appendChild(opt);
    // the card button also preselects its course in the bottom form
    a.addEventListener("click", () => { courseInput.value = a.dataset.courseSelect; });
  });

  fields.phone.addEventListener("input", () => {
    fields.phone.value = formatPhone(fields.phone.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    const name = fields.name.value.trim();
    const errors = {};
    if (name.length < 3) errors.name = t("err.name");
    if (phoneDigits(fields.phone.value).length !== 9) errors.phone = t("err.phone");
    const courseErr = document.getElementById("r-course-err");
    if (!courseInput.value) { errors.course = t("err.course"); }
    if (courseErr) courseErr.textContent = errors.course || "";
    courseInput.setAttribute("aria-invalid", errors.course ? "true" : "false");
    Object.keys(fields).forEach((key) => setError(key, errors[key]));
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      (fields[firstInvalid] || courseInput).focus();
      setStatus("", "");
      return;
    }

    submitting = true;
    btn.disabled = true;
    btn.textContent = t("reg.submitting");
    setStatus("loading", t("reg.submitting"));
    try {
      await RegistrationService.create({
        name,
        phone: formatPhone(fields.phone.value),
        course: courseInput.options[courseInput.selectedIndex] ? courseInput.options[courseInput.selectedIndex].text : ""
      });
      setStatus("success", t("reg.saved"));
      form.reset();
      courseInput.value = "";
    } catch (err) {
      setStatus("error", t("reg.error"));
    } finally {
      submitting = false;
      btn.disabled = false;
      btn.textContent = t("reg.submit");
    }
  });

  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener("input", () => {
      if (fields[key].getAttribute("aria-invalid") === "true") setError(key, "");
    });
  });

  // ---------- Inline form inside each course card ----------
  // "Ro‘yxatdan o‘tish" opens name + phone right under the button,
  // so the page does not jump down to the bottom form.
  const fmtPhoneEl = (input) => { input.value = formatPhone(input.value); };
  document.querySelectorAll("[data-course-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".course-card");
      const body = card && card.querySelector(".card-body");
      if (!body) return;
      const open = body.querySelector(".card-reg");
      if (open) { open.querySelector("input").focus({ preventScroll: true }); return; }

      const courseTitle = (body.querySelector("h3") || {}).textContent || "";
      const cardForm = document.createElement("form");
      cardForm.className = "card-reg";
      cardForm.noValidate = true;
      cardForm.innerHTML = `
        <input name="name" maxlength="60" autocomplete="name" placeholder="${t("reg.cardName")}" aria-label="${t("reg.cardName")}">
        <input name="phone" type="tel" inputmode="tel" maxlength="17" placeholder="+998-XX-XXX-XX-XX" aria-label="Telefon">
        <button class="btn btn-red btn-sm" type="submit">${t("reg.cardSend")}</button>
        <p class="status" role="status" aria-live="polite"></p>`;
      body.appendChild(cardForm);
      btn.setAttribute("aria-expanded", "true");
      const nameIn = cardForm.elements.name, phoneIn = cardForm.elements.phone, msg = cardForm.querySelector(".status");
      phoneIn.addEventListener("input", () => fmtPhoneEl(phoneIn));
      nameIn.focus({ preventScroll: true }); // keep the page where the visitor clicked

      cardForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = nameIn.value.trim();
        if (name.length < 3) { msg.className = "status error"; msg.textContent = t("err.name"); nameIn.focus(); return; }
        if (phoneDigits(phoneIn.value).length !== 9) { msg.className = "status error"; msg.textContent = t("err.phone"); phoneIn.focus(); return; }
        const submitBtn = cardForm.querySelector("button");
        submitBtn.disabled = true;
        try {
          await RegistrationService.create({ name, phone: formatPhone(phoneIn.value), course: courseTitle.trim() });
          msg.className = "status success";
          msg.textContent = t("reg.cardOk");
          cardForm.reset();
        } catch (err) {
          msg.className = "status error";
          msg.textContent = t("reg.error");
        } finally {
          submitBtn.disabled = false;
        }
      });
    });
  });
})();
