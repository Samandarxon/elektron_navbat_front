# Serverga Deploy Qilish Qo'llanmasi

IIBB saytini (Next.js) build qilib, serverga ko'chirib, pm2 orqali ishga tushirish
bo'yicha to'liq ketma-ketlik.

> **Eslatma:** Bu frontend `db.json` / json-server ISHLATMAYDI. Barcha ma'lumotlar
> Go backend'dan keladi (`API_URL`, masalan `http://10.181.1.76:8085`). Shuning uchun
> deploy faqat bitta web jarayonidan iborat — backend alohida ishlaydi.

---

## 0. Qanday ishlaydi (qisqacha)

- `npm run build` — loyihani build qilib, **barcha kerakli fayllarni `deploy/`
  papkasiga** to'playdi (Next standalone server + `node_modules` + `.env` + pm2
  konfiguratsiyasi).
- `deploy/` papkasi **o'zicha to'liq** — serverda `npm install` qilish **shart emas**,
  faqat Node va pm2 bo'lsa kifoya.
- `.env` o'zgarsa, pm2 jarayonni avtomatik qayta ishga tushirib, yangi qiymatni
  o'qiydi — **qayta build qilish shart emas** (URL/port shu yerdan o'zgartiriladi).

> ⚠️ **Diqqat:** Har `npm run build` `deploy/` papkani **butunlay o'chirib, qaytadan
> yaratadi**. Shuning uchun `deploy/` ichidagi fayllarni qo'lda tahrirlamang.
> Sozlamalarni manbadan o'zgartiring:
> - URL'lar → `.env.local`
> - pm2 sozlamasi → `scripts/build-deploy.mjs`

---

## 1. Lokal kompyuterda: build qilish

Loyiha papkasida:

```bash
npm run build
```

Natijada `deploy/` papkasi yaratiladi. Ichida:

```
deploy/
├── server.js              # Next standalone server
├── run.js                 # .env ni o'qib serverni ishga tushiradi
├── ecosystem.config.js    # pm2 konfiguratsiyasi
├── .env                   # runtime env (.env.local dan ko'chiriladi)
├── .next/                 # build natijasi (server + static)
├── public/                # statik fayllar
└── node_modules/          # kerakli paketlar (Next traced deps)
```

---

## 2. `deploy/` papkani serverga ko'chirish

### Variant A — rsync (tavsiya etiladi)

```bash
rsync -avz --delete --exclude='.env' deploy/ user@SERVER_IP:/home/user/iibb/
```

- `--delete` — serverdan keraksiz eski fayllarni tozalaydi.
- `--exclude='.env'` — **serverdagi `.env` saqlanib qoladi** (server o'z URL'lari bilan).
  Birinchi marta ko'chirayotganda bu flagni olib tashlang yoki keyin `.env` ni qo'lda yarating.

### Variant B — scp

```bash
scp -r deploy user@SERVER_IP:/home/user/iibb
```

---

## 3. Serverda: bir martalik sozlash

SSH orqali serverga kiring va quyidagilarni tekshiring/o'rnating.

```bash
# Node 18+ borligini tekshiring (bo'lmasa nvm yoki apt orqali o'rnating)
node -v

# pm2 ni global o'rnating (bo'lmasa)
npm install -g pm2
```

> `npm install` qilish **shart emas** — barcha paketlar `deploy/node_modules` ichida.

---

## 4. Serverda: `.env` ni shu serverga moslash

```bash
cd /home/user/iibb
nano .env
```

Ichidagi qiymatlarni shu server uchun to'g'rilang (`NEXT_PUBLIC_` prefiksi YO'Q —
qiymatlar runtime'da o'qiladi):

```env
# Go backend manzili
API_URL=http://SERVER_IP:8085

# WebSocket (ixtiyoriy — bo'sh bo'lsa API_URL dan http->ws avtomatik hosil bo'ladi)
WS_URL=ws://SERVER_IP:8085

# Kiosk printer
PRINTER_URL=http://PRINTER_IP:8080
PRINTER_API_KEY=...
```

Saqlang (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 5. Serverda: ishga tushirish

```bash
cd /home/user/iibb
pm2 start ecosystem.config.js
```

Bitta jarayon ishga tushadi:
- **iibb-web** → port `3000` (sayt)

> Backend (Go server, `8085`) alohida ishlaydi — uni shu deploy boshqarmaydi.

Avtomatik (server reboot bo'lganda ham) ishlashi uchun:

```bash
pm2 save
pm2 startup
# chiqqan komandani nusxalab, bajaring (sudo bilan)
```

---

## 6. Tekshirish

```bash
pm2 list                                # "online" bo'lsin
curl http://localhost:3000              # sayt javob bersin
```

Brauzerdan: `http://SERVER_IP:3000`

---

## 7. Keyingi yangilanishlar

### A) Kod o'zgarsa (qayta build kerak)

**Lokalda:**
```bash
npm run build
rsync -avz --delete --exclude='.env' deploy/ user@SERVER_IP:/home/user/iibb/
```

**Serverda:**
```bash
cd /home/user/iibb
pm2 reload ecosystem.config.js
```

### B) Faqat URL / port o'zgarsa (kod o'zgarmasa)

Qayta build/ko'chirish **shart emas**. Serverda:

```bash
cd /home/user/iibb
nano .env        # qiymatni o'zgartiring va saqlang
```

`.env` saqlanishi bilan pm2 **iibb-web** ni avtomatik qayta ishga tushiradi va
yangi qiymat darhol kuchga kiradi.

---

## 8. Foydali pm2 komandalari

```bash
pm2 list                 # holatni ko'rish
pm2 logs                 # barcha loglar
pm2 logs iibb-web        # faqat sayt loglari
pm2 restart iibb-web     # qo'lda restart
pm2 stop all             # to'xtatish
pm2 delete all           # ro'yxatdan o'chirish
pm2 monit                # CPU/RAM monitoring
```

---

## Tez-tez uchraydigan muammolar

| Muammo | Yechim |
|--------|--------|
| Port 3000 band | `pm2 delete all` qiling yoki bandlagan jarayonni to'xtating |
| Sayt API'ga ulanmayapti | `.env` dagi `API_URL` to'g'riligini va Go backend ishlayotganini tekshiring, keyin `.env` saqlang |
| `.env` o'zgardi, lekin sayt eski qiymatni ko'rsatyapti | Brauzer keshi — sahifani `Ctrl+Shift+R` bilan yangilang |
| reboot'dan keyin ishlamadi | `pm2 save` va `pm2 startup` qilinganini tekshiring |
