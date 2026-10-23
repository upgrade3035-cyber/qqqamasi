# Qamashi IT Centre — Vercel uchun

Bu paket faqat saytning kerakli fayllarini saqlaydi. Dizayn va ishlash tartibi o‘zgartirilmagan.

## GitHub orqali Vercelga joylash
1. ZIP faylni kompyuteringizda oching.
2. GitHub repozitoriyiga ZIPning o‘zini emas, ichidagi barcha fayl va papkalarni yuklang.
3. `index.html` repozitoriyning boshida tursin; qo‘shimcha tashqi papka ichida qolmasin.
4. Vercelda repozitoriyni import qiling.
5. Framework Preset: Other. Root Directory: repozitoriy boshi.
6. Build Command: bo‘sh qoldiring (Override yoqilgan bo‘lsa ham buyruq yozmang).
7. Output Directory: `.`
8. Install Command: bo‘sh qoldiring. Deploy tugmasini bosing.

Asosiy sayt: `/`. Admin panel: `/admin.html`. Chek sahifasi: `/receipt.html`.
`package.json`, `node_modules`, React va Lovable ishchi fayllari bu statik paketga kerak emas.

## Muhim cheklovlar
Admin kirishi brauzerda tekshiriladi; bu haqiqiy xavfsiz admin himoyasi emas.
Firebase konfiguratsiyasi to‘ldirilmagan bo‘lsa, arizalar faqat shu brauzerda saqlanadi,
boshqa telefon yoki kompyuterdagi admin panelga uzatilmaydi.
Vercelga yuklashning o‘zi bu cheklovlarni bartaraf etmaydi.
