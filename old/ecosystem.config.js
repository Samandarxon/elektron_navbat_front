// ecosystem.config.js
// ─────────────────────────────────────────────────────────────────────────────
// Production uchun pm2 konfiguratsiyasi (Next.js "standalone" serverni ishga tushiradi).
//
// MUHIM: Next.js'ning standalone server.js'i .env fayllarni O'ZI o'qimaydi —
// faqat haqiqiy environment o'zgaruvchilarini ko'radi. Shuning uchun bu fayl
// loyiha ildizidagi .env(.production/.local) ni o'qib, serverga uzatadi.
// Natijada qiymatlarni FAQAT .env orqali boshqarasiz — qayta build SHART EMAS.
//
// Ishlatish:
//   1) npm run build              # build + assetlarni standalone'ga ko'chiradi (postbuild)
//   2) .env.production ni tahrirlang (yoki .env) — IP'larni yozing
//   3) pm2 start ecosystem.config.js
//
// Konfiguratsiyani o'zgartirgandan keyin (rebuild emas, faqat restart):
//   pm2 reload ecosystem.config.js --update-env
//
// Eslatma: serverda avval `npm i -g pm2` o'rnatilgan bo'lishi kerak.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

// Oddiy .env parser (tashqi paketsiz). KEY=VALUE, # izohlar, qo'shtirnoqlar.
function parseEnvFile(filePath) {
  const result = {};
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return result; // fayl yo'q — bo'sh qaytaramiz
  }
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

// Ustuvorlik (past -> yuqori): .env.local < .env < .env.production
// Ya'ni .env.production eng kuchli — productionda shuni ishlating.
function loadEnvFiles() {
  const merged = {};
  for (const file of [".env.local", ".env", ".env.production"]) {
    Object.assign(merged, parseEnvFile(path.join(ROOT, file)));
  }
  return merged;
}

const fileEnv = loadEnvFiles();

module.exports = {
  apps: [
    {
      name: "iibb-navbat",
      // Nisbiy yo'l + cwd: yo'lda bo'sh joy bo'lsa ham ishlaydi.
      script: ".next/standalone/server.js",
      cwd: ROOT,
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      time: true, // loglarda vaqt belgisi
      env: {
        NODE_ENV: "production",
        // PORT/HOSTNAME ni .env'da ham belgilash mumkin (pastdagi spread ustun keladi)
        PORT: process.env.PORT || "3000",
        HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
        // .env(.production/.local) dan o'qilgan runtime qiymatlar:
        //   API_URL, WS_URL, PRINTER_URL, PRINTER_API_KEY
        ...fileEnv,
      },
    },
  ],
};
