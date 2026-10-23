/* ==========================================================
   Content layer (demo, browser-only).
     - ContentStore: team, winners, district photos, settings
     -> localStorage (small JSON)
     - Messages: admin-managed messages -> localStorage
   - RegistrationService lives in registration.js
   INTEGRATION POINT: when Supabase is connected, replace the
   bodies of these objects with Supabase table/storage calls. The
   public site and admin only talk to these APIs.
   ========================================================== */
(() => {
  const CONTENT_KEY = "qamashi.content.v1";
  const MESSAGES_KEY = "qamashi.messages.v1";

  const DEFAULTS = {
    team: [
      { id: "team-1", sample: true, roleKey: "team.director", photo: null },
      { id: "team-2", sample: true, roleKey: "team.lead_instructor", photo: null },
      { id: "team-3", sample: true, roleKey: "team.instructor_py", photo: null },
      { id: "team-4", sample: true, roleKey: "team.instructor_ai", photo: null }
    ],
    winners: [
      { id: "win-1", sample: true, year: "2026", photo: null },
      { id: "win-2", sample: true, year: "2026", photo: null },
      { id: "win-3", sample: true, year: "2026", photo: null }
    ],
    winnerPages: [
      { id: "winner-page-1", photo: "assets/images/winners/winner-1.jpg", caption: "G‘olib o‘quvchilarimiz" },
      { id: "winner-page-2", photo: "assets/images/winners/winner-2.jpg", caption: "G‘olib o‘quvchilarimiz" },
      { id: "winner-page-3", photo: "assets/images/winners/winner-3.jpg", caption: "G‘olib o‘quvchilarimiz" }
    ],
    // district id -> [{ photo: dataURL | url, caption }]
    districtPhotos: {
      shahrisabz: [
        { photo: "assets/images/landmarks/landmark-mausoleum.jpg", caption: "Tarixiy obida (namuna rasm)" },
        { photo: "assets/images/landmarks/landmark-portal.jpg", caption: "Tarixiy bino (namuna rasm)" }
      ]
    }
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  // Site text the admin can override. Empty string = the built-in translation.
  const SITE_COURSES = ["python", "ai", "data", "web", "smm", "english"];
  function normalizeSite(raw) {
    const r = raw && typeof raw === "object" ? raw : {};
    const courses = {};
    SITE_COURSES.forEach((k) => {
      const c = (r.courses && r.courses[k]) || {};
      courses[k] = { title: String(c.title || ""), desc: String(c.desc || "") };
    });
    return { line1: String(r.line1 || ""), line2: String(r.line2 || ""), lead: String(r.lead || ""), courses };
  }

  const ContentStore = {
    load() {
      let stored = {};
      try { stored = JSON.parse(localStorage.getItem(CONTENT_KEY)) || {}; } catch (e) { stored = {}; }
      const data = { ...clone(DEFAULTS), ...stored };
      delete data.videos;
      delete data.uploadedVideosAdded;
      delete data.settings;
      data.winners = data.winners.map(({ videoKey, videoUrl, media, ...winner }) => winner);
      if (!Array.isArray(data.winnerPages)) data.winnerPages = clone(DEFAULTS.winnerPages);
      data.site = normalizeSite(stored.site);
      return data;
    },
    /** Throws if storage is full or blocked — callers show an error. */
    save(data) {
      const saved = { ...data };
      delete saved.videos;
      delete saved.uploadedVideosAdded;
      delete saved.settings;
      saved.winners = saved.winners.map(({ videoKey, videoUrl, media, ...winner }) => winner);
      if (!Array.isArray(saved.winnerPages)) throw new TypeError("Winner album pages must be an array.");
      saved.site = normalizeSite(saved.site);
      localStorage.setItem(CONTENT_KEY, JSON.stringify(saved));
      window.dispatchEvent(new CustomEvent("contentchange"));
    },
    reset() {
      localStorage.removeItem(CONTENT_KEY);
      window.dispatchEvent(new CustomEvent("contentchange"));
    }
  };

  /** Resizes an image File to JPEG dataURL (keeps localStorage small). */
  function resizeImage(file, max = 900) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad-image")); };
      img.src = url;
    });
  }

  // ---------- Contact messages (demo: browser only) ----------
  const Messages = {
    list() {
      try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || []; } catch (e) { return []; }
    },
    add(msg) {
      const list = this.list();
      const rec = { id: `msg-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), status: "new", ...msg };
      list.unshift(rec);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(list));
      return rec;
    },
    update(id, patch) {
      const list = this.list().map((m) => (m.id === id ? { ...m, ...patch } : m));
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(list));
    },
    remove(id) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(this.list().filter((m) => m.id !== id)));
    }
  };

  window.ContentStore = ContentStore;
  window.Messages = Messages;
  window.resizeImage = resizeImage;
})();
