/* ==========================================================
   i18n — centralized translation dictionary.
   Default language: Uzbek (uz). Add a language by adding a new
   object here and a button with data-lang in index.html.
   Markup uses data-i18n="key", data-i18n-html="key" (trusted
   markup only), data-i18n-aria="key".
   ========================================================== */
(() => {
  const DICT = {
    uz: {
      "meta.title": "Qamashi IT Centre — Kelajak sari parvoz",
      "a11y.skip": "Asosiy mazmunga o‘tish",
      "common.close": "Yopish",
      "nav.menu": "Menyu",
      "nav.journey": "Yo‘l",
      "nav.courses": "Kurslar",
      "nav.winners": "G‘oliblar",
      "nav.team": "Jamoa",
      "nav.intl": "Xalqaro",
      "nav.projects": "Loyihalar",
      "nav.news": "Yangiliklar",
      "nav.register": "Ro‘yxatdan o‘tish",

      "hero.eyebrow": "Qamashi · O‘zbekiston",
      "hero.headline": "KELAJAK SARI <em>PARVOZ</em> SHU YERDAN BOSHLANADI.",
      "hero.line1": "QAMASHI IT CENTER",
      "hero.line2": "KELAJAKNI BIZ BILAN QURING",
      "hero.lead": "Dasturlash, sun’iy intellekt, ma’lumotlar fani va veb-dasturlash bo‘yicha amaliy IT ta’lim markazi.",
      "hero.cta1": "Kurslarni ko‘rish",
      "stat.students": "O‘quvchilar",
      "stat.courses": "Kurslar",
      "stat.instructors": "Instruktorlar",
      "stat.partners": "Hamkorlar",
      "stat.sample": "Namuna qiymatlar — administrator tomonidan tahrirlanadi.",

      "journey.hint": "Pastga aylantiring",
      "journey.kicker": "Sayohat",
      "journey.title": "Qamashidan Dehligacha",
      "journey.city1": "Toshkent",
      "journey.city2": "Dehli, Hindiston",
      "journey.s1.title": "Kod yozish",
      "journey.s1.text": "Birinchi qator kod — birinchi qadam.",
      "journey.s2.title": "Aeroport",
      "journey.s2.text": "Yo‘l shu yerdan boshlanadi.",
      "journey.s3.title": "Parvoz",
      "journey.s3.text": "Bulutlar ustida, yangi imkoniyatlar sari.",
      "journey.s4.title": "Dehli",
      "journey.s4.text": "Xalqaro ta’lim, tajriba va hamkorlik.",

      "courses.kicker": "Kurslar",
      "courses.title": "Kasbingizni shu yerda boshlang",
      "courses.lead": "Quyida namuna kurslar ko‘rsatilgan. Davomiylik va narx ma’lumotlari administrator tomonidan kiritiladi.",
      "courses.sample": "Namuna ma’lumot",
      "courses.duration": "Davomiylik",
      "courses.durValue": "3 oy · namuna",
      "courses.register": "Ro‘yxatdan o‘tish",
      "python.title": "Python dasturlash",
      "python.desc": "Python asoslari, algoritmlar va kichik loyihalar — noldan boshlab.",
      "ai.title": "Sun’iy intellekt",
      "ai.desc": "Mashinani o‘qitish asoslari va amaliy AI vositalari bilan ishlash.",
      "ds.title": "Data Science",
      "ds.desc": "Ma’lumotlarni tahlil qilish, vizualizatsiya va statistik asoslar.",
      "smm.title": "SMM va kontent",
      "smm.desc": "Ijtimoiy tarmoqlarda marketing, kontent yaratish va reklama kampaniyalari.",
      "english.title": "Ingliz tili",
      "english.desc": "Noldan B2 darajagacha, amaliy suhbat va IELTS tayyorgarligi.",
      "web.title": "Veb-dasturlash",
      "web.desc": "HTML, CSS, JavaScript va zamonaviy veb-saytlar yaratish.",

      "winners.kicker": "G‘oliblar",
      "winners.title": "Markaz talabalarining yutuqlari",
      "winners.lead": "G‘olib o‘quvchilarimizning yutuqlari.",
      "winners.sample": "NAMUNA",
      "winners.name": "Ism Familiya",
      "winners.compValue": "Tanlov nomi",
      "winners.compLabel": "Tanlov",
      "winners.placeLabel": "Natija",
      "winners.placeValue": "1-o‘rin (namuna)",
      "winners.yearLabel": "Yil",
      "winners.view": "Batafsil →",
      "winners.detail": "Yutuq tavsifi shu yerda chiqadi. Administrator tanlov nomi, o‘rin va rasmni kiritadi.",
      "winners.previous": "Oldingi rasm",
      "winners.next": "Keyingi rasm",
      "winners.pageCount": "{current} / {total}",
      "winners.pageAlt": "G‘oliblar albomi, {page}-sahifa",
      "winners.photoCaption": "G‘olib o‘quvchilarimiz",
      "winners.albumTitle": "G‘oliblar albomi",
      "winners.empty": "Rasm sahifalari yo‘q. Yangi rasmlarni administrator qo‘shadi.",

      "team.kicker": "Jamoa",
      "team.title": "Bizning mutaxassislar",
      "team.lead": "Quyidagi lavozimlar va ismlar namuna. Haqiqiy xodimlar ma’lumoti administrator tomonidan kiritiladi.",
      "team.name": "Ism Familiya",
      "team.director": "Direktor",
      "team.lead_instructor": "Bosh instruktor",
      "team.instructor_py": "Python instruktori",
      "team.instructor_ai": "AI instruktori",
      "team.bio": "Qisqa biografiya shu yerda joylashadi.",

      "intl.kicker": "Xalqaro imkoniyatlar",
      "intl.title": "Qamashidan dunyoga",
      "intl.text": "Markaz xalqaro IT ta’lim yo‘nalishlari, hamkor dasturlar va amaliy tajriba almashish imkoniyatlarini targ‘ib qiladi. Dastur tafsilotlari faqat administrator tasdiqlagandan keyin ko‘rsatiladi.",
      "intl.card1.title": "Hamkor dasturlar",
      "intl.card1.text": "Dastur nomi, muddati va shartlari administrator tomonidan kiritiladi.",
      "intl.card2.title": "Amaliy tajriba",
      "intl.card2.text": "Xalqaro tadbirlar, konferensiyalar va stajirovka imkoniyatlari.",
      "intl.card3.title": "Yo‘nalish: O‘zbekiston → Hindiston",
      "intl.card3.text": "Parvoz yo‘nalishi ramz sifatida ishlatilgan — haqiqiy reys ma’lumoti emas.",

      "projects.kicker": "Talabalar loyihalari",
      "projects.title": "G‘oyadan mahsulotgacha",
      "projects.lead": "Namuna loyiha kartochkalari. Haqiqiy loyihalar rasmi, texnologiyalari va demo havolasi administrator tomonidan qo‘shiladi.",
      "projects.name": "Loyiha nomi",
      "projects.desc": "Loyiha tavsifi shu yerda.",

      "news.kicker": "Yangiliklar",
      "news.title": "E’lonlar va yangiliklar",
      "news.sample": "Namuna yangilik",
      "news.date": "Namuna sana",
      "news.excerpt": "Yangilik qisqacha mazmuni shu yerda chiqadi.",
      "news.read": "O‘qish →",
      "news.body": "Yangilikning to‘liq matni administrator tomonidan kiritiladi.",

      "reg.kicker": "Ro‘yxatdan o‘tish",
      "reg.title": "Kursga ariza topshiring",
      "reg.demo": "Ariza faqat shu brauzerda saqlanadi, markazga yuborilmaydi va server tasdig‘i yo‘q.",
      "reg.name": "To‘liq ism",
      "reg.phone": "Telefon raqami",
      "reg.age": "Yosh",
      "reg.course": "Kurs",
      "reg.coursePick": "Kursni tanlang",
      "reg.message": "Qo‘shimcha xabar (ixtiyoriy)",
      "reg.consent": "Shaxsiy ma’lumotlarimni ariza ko‘rib chiqilishi uchun qayta ishlashga roziman.",
      "reg.submit": "Ro‘yxatdan o‘tish",
      "reg.submitting": "Saqlanmoqda…",
      "reg.saved": "Arizangiz yuborildi. Tez orada siz bilan bog‘lanamiz.",
      "reg.error": "Saqlashda xatolik yuz berdi. Qayta urinib ko‘ring.",
      "reg.cardName": "Ism familiya",
      "reg.cardSend": "Yuborish",
      "reg.cardOk": "Arizangiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.",
      "reg.clear": "Demo arizalarni tozalash",
      "reg.clearConfirm": "Shu brauzerdagi barcha demo arizalar o‘chirilsinmi?",
      "reg.cleared": "Demo arizalar o‘chirildi.",
      "reg.count": "Shu brauzerdagi demo arizalar: {n}",
      "err.name": "Ism kamida 3 ta belgidan iborat bo‘lishi kerak.",
      "err.phone": "Telefonni +998-XX-XXX-XX-XX formatida kiriting.",
      "err.course": "Kursni tanlang.",
      "reg.course": "Kurs",
      "reg.coursePick": "Kursni tanlang",
      "err.age": "Yosh 10 dan 80 gacha bo‘lishi kerak.",
      "err.course": "Kursni tanlang.",
      "err.consent": "Rozilikni tasdiqlang.",

      "footer.text": "© 2026 Qamashi IT Centre. Barcha huquqlar himoyalangan.",
      "footer.demo": "Demo versiya — namuna ma’lumotlar.",
      "footer.admin": "Admin panel",

      "nav.region": "Qashqadaryo",
      "journey.sound.on": "Ovoz: yoqiq",
      "journey.sound.off": "Ovoz yoqish",
      "winners.title2": "G‘olib",
      "region.kicker": "Qashqadaryo viloyati",
      "region.title": "Qashqadaryodan O‘zbekiston bo‘ylab",
      "region.lead": "Tumanlar bo‘ylab chiziq bilan sayohat qiling, so‘ng Qashqadaryodan Buyuk ipak yo‘li bo‘ylab butun O‘zbekiston va qo‘shni davlatlarga o‘ting.",
      "region.tour": "Turni boshlash",
      "region.next": "Keyingi",
      "region.all": "Butun viloyat",
      "region.schematic": "Tumanlar tugagach, Qashqadaryodan Samarqandga va Buyuk ipak yo‘li bo‘ylab barcha viloyatlar orqali yo‘l chiziladi, so‘ng Qirg‘iziston va Tojikistonga.",
      "region.pick": "Tumanni tanlang — tarixiy obidalari shu yerda chiqadi.",
      "region.featured": "Bizning tuman",
      "region.other": "Tuman haqidagi ma’lumot administrator tomonidan qo‘shiladi.",
      "region.noPhotos": "Bu tuman uchun rasmlar hali qo‘shilmagan.",
      "region.national": "O‘zbekiston viloyatlari",
      "region.route": "Qamashi → Samarqand → Buyuk ipak yo‘li → Qirg‘iziston → Tojikiston",
      "region.done": "O‘zbekiston bo‘ylab sayohat yakunlandi",
      "region.doneNote": "Qamashi IT Centre · O‘zbekiston",
      "region.logoAlt": "Qamashi IT Centre logotipi",
      "dist.qamashi.note": "Markazimiz joylashgan tuman."
    },

    en: {
      "meta.title": "Qamashi IT Centre — The flight starts here",
      "a11y.skip": "Skip to main content",
      "common.close": "Close",
      "nav.menu": "Menu",
      "nav.journey": "Journey",
      "nav.courses": "Courses",
      "nav.winners": "Winners",
      "nav.team": "Team",
      "nav.intl": "International",
      "nav.projects": "Projects",
      "nav.news": "News",
      "nav.register": "Register",

      "hero.eyebrow": "Qamashi · Uzbekistan",
      "hero.headline": "THE FLIGHT TO THE FUTURE <em>STARTS HERE.</em>",
      "hero.line1": "QAMASHI IT CENTER",
      "hero.line2": "BUILD THE FUTURE WITH US",
      "hero.lead": "A practical IT education center in programming, artificial intelligence, data science and web development.",
      "hero.cta1": "Explore courses",
      "stat.students": "Students",
      "stat.courses": "Courses",
      "stat.instructors": "Instructors",
      "stat.partners": "Partners",
      "stat.sample": "Sample values — editable by the administrator.",

      "journey.hint": "Scroll down",
      "journey.kicker": "The journey",
      "journey.title": "From Qamashi to Delhi",
      "journey.city1": "Tashkent",
      "journey.city2": "Delhi, India",
      "journey.s1.title": "Writing code",
      "journey.s1.text": "The first line of code is the first step.",
      "journey.s2.title": "Airport",
      "journey.s2.text": "The journey starts here.",
      "journey.s3.title": "Flight",
      "journey.s3.text": "Above the clouds, toward new opportunities.",
      "journey.s4.title": "Delhi",
      "journey.s4.text": "International learning, experience and partnership.",

      "courses.kicker": "Courses",
      "courses.title": "Start your career here",
      "courses.lead": "Sample courses are shown below. Duration and pricing are entered by the administrator.",
      "courses.sample": "Sample data",
      "courses.duration": "Duration",
      "courses.durValue": "3 months · sample",
      "courses.register": "Register",
      "python.title": "Python Programming",
      "python.desc": "Python fundamentals, algorithms and small projects — from zero.",
      "ai.title": "Artificial Intelligence",
      "ai.desc": "Machine learning basics and hands-on work with practical AI tools.",
      "ds.title": "Data Science",
      "ds.desc": "Data analysis, visualization and statistical foundations.",
      "smm.title": "SMM & Content",
      "smm.desc": "Social media marketing, content creation and advertising campaigns.",
      "english.title": "English",
      "english.desc": "From zero to B2, practical speaking and IELTS preparation.",
      "web.title": "Web Development",
      "web.desc": "HTML, CSS, JavaScript and building modern websites.",

      "winners.kicker": "Winners",
      "winners.title": "Our students' achievements",
      "winners.lead": "The achievements of our winning students.",
      "winners.sample": "SAMPLE",
      "winners.name": "Full Name",
      "winners.compValue": "Competition name",
      "winners.compLabel": "Competition",
      "winners.placeLabel": "Result",
      "winners.placeValue": "1st place (sample)",
      "winners.yearLabel": "Year",
      "winners.view": "Details →",
      "winners.detail": "Achievement details appear here. The administrator enters the competition, place and photo.",
      "winners.previous": "Previous photo",
      "winners.next": "Next photo",
      "winners.pageCount": "{current} / {total}",
      "winners.pageAlt": "Winners album, page {page}",
      "winners.photoCaption": "Our winning students",
      "winners.albumTitle": "Winners album",
      "winners.empty": "The album has no pages. An administrator can add photos.",

      "team.kicker": "Team",
      "team.title": "Our specialists",
      "team.lead": "Roles and names are placeholders. Real staff details are entered by the administrator.",
      "team.name": "Full Name",
      "team.director": "Director",
      "team.lead_instructor": "Lead instructor",
      "team.instructor_py": "Python instructor",
      "team.instructor_ai": "AI instructor",
      "team.bio": "A short biography goes here.",

      "intl.kicker": "International opportunities",
      "intl.title": "From Qamashi to the world",
      "intl.text": "The center promotes international IT programs, partner schemes and practical exchange. Program details are shown only after the administrator confirms them.",
      "intl.card1.title": "Partner programs",
      "intl.card1.text": "Program name, duration and conditions are entered by the administrator.",
      "intl.card2.title": "Practical experience",
      "intl.card2.text": "International events, conferences and internship opportunities.",
      "intl.card3.title": "Route: Uzbekistan → India",
      "intl.card3.text": "The flight route is a visual symbol — not real flight information.",

      "projects.kicker": "Student projects",
      "projects.title": "From idea to product",
      "projects.lead": "Sample project cards. Real project images, technologies and demo links are added by the administrator.",
      "projects.name": "Project title",
      "projects.desc": "Project description goes here.",

      "news.kicker": "News",
      "news.title": "News & announcements",
      "news.sample": "Sample news",
      "news.date": "Sample date",
      "news.excerpt": "A short summary appears here.",
      "news.read": "Read →",
      "news.body": "The full article text is entered by the administrator.",

      "reg.kicker": "Registration",
      "reg.title": "Apply for a course",
      "reg.demo": "The application is saved only in this browser, not sent to the center, and there is no server confirmation.",
      "reg.name": "Full name",
      "reg.phone": "Phone number",
      "reg.age": "Age",
      "reg.course": "Course",
      "reg.coursePick": "Choose a course",
      "reg.message": "Additional message (optional)",
      "reg.consent": "I consent to the processing of my submitted information for the review of my application.",
      "reg.submit": "Register",
      "reg.submitting": "Saving…",
      "reg.saved": "Your application was sent. We will contact you soon.",
      "reg.error": "Something went wrong while saving. Please try again.",
      "reg.cardName": "Full name",
      "reg.cardSend": "Send",
      "reg.cardOk": "Your application is received. We will contact you soon.",
      "reg.clear": "Clear demo applications",
      "reg.clearConfirm": "Delete all demo applications in this browser?",
      "reg.cleared": "Demo applications deleted.",
      "reg.count": "Demo applications in this browser: {n}",
      "err.name": "Name must be at least 3 characters.",
      "err.phone": "Enter a valid phone number starting with +998 (e.g. +998 90 123 45 67).",
      "err.course": "Choose a course.",
      "reg.course": "Course",
      "reg.coursePick": "Choose a course",
      "err.age": "Age must be between 10 and 80.",
      "err.course": "Please choose a course.",
      "err.consent": "Please confirm your consent.",

      "footer.text": "© 2026 Qamashi IT Centre. All rights reserved.",
      "footer.demo": "Demo version — sample content.",
      "footer.admin": "Admin panel",

      "nav.region": "Qashqadaryo",
      "journey.sound.on": "Sound: on",
      "journey.sound.off": "Enable sound",
      "winners.title2": "Winner",
      "region.kicker": "Qashqadaryo region",
      "region.title": "From Qashqadaryo across Uzbekistan",
      "region.lead": "Follow the line through the districts, then trace the route from Qashqadaryo to Samarkand and explore Uzbekistan’s provinces.",
      "region.tour": "Start tour",
      "region.next": "Next",
      "region.all": "Whole region",
      "region.schematic": "After all 14 districts, a route is drawn from Qashqadaryo to Samarkand and Uzbekistan’s provinces appear in sequence.",
      "region.pick": "Select a district — its historic landmarks appear here.",
      "region.featured": "Our district",
      "region.other": "Information about this district is added by the administrator.",
      "region.noPhotos": "No photos have been added for this district yet.",
      "region.national": "Provinces of Uzbekistan",
      "region.route": "Qamashi → Samarkand → Silk Road → Kyrgyzstan → Tajikistan",
      "region.done": "Uzbekistan tour complete",
      "region.doneNote": "Qamashi IT Centre · Uzbekistan",
      "region.logoAlt": "Qamashi IT Centre logo",
      "dist.qamashi.note": "The district where our center is located."
    }
  };

  const STORAGE_KEY = "qamashi.lang";
  let current = "uz";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICT[saved]) current = saved;
  } catch (e) { /* storage blocked: keep default */ }

  function t(key, vars) {
    let str = (DICT[current] && DICT[current][key]) ?? DICT.uz[key] ?? key;
    if (vars) Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
    return str;
  }

  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  }

  function setLang(lang) {
    if (!DICT[lang]) return;
    current = lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    apply();
    document.title = t("meta.title");
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }

  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });

  window.I18n = {
    t,
    apply,
    setLang,
    get lang() { return current; }
  };

  setLang(current);
})();
