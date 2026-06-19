// Next.js standalone build'ini bitta self-contained `deploy/` papkaga to'playdi.
//
// Ma'lumotlar Go backend (API_URL) dan keladi — json-server/db.json ISHLATILMAYDI.
//
// Natija (deploy/):
//   server.js            <- Next standalone server
//   run.js               <- .env ni o'qib, keyin server.js ni ishga tushiradi
//   .next/...            <- server + static
//   public/...           <- statik fayllar
//   node_modules/...     <- Next traced deps
//   .env                 <- runtime env (pm2 buni kuzatadi)
//   ecosystem.config.js  <- pm2 konfiguratsiyasi
//
// Ishga tushirish:
//   cd deploy && pm2 start ecosystem.config.js

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEPLOY = path.join(ROOT, "deploy");

const log = (m) => console.log(`\x1b[36m[deploy]\x1b[0m ${m}`);

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

// 1. Next standalone build
log("next build ishlamoqda...");
execSync("next build", { cwd: ROOT, stdio: "inherit" });

const standalone = path.join(ROOT, ".next", "standalone");
if (!fs.existsSync(standalone)) {
  throw new Error(
    ".next/standalone topilmadi. next.config'da output: 'standalone' borligini tekshiring.",
  );
}

// 2. deploy/ ni tozalab, standalone'ni ko'chiramiz
log("deploy/ tozalanmoqda...");
fs.rmSync(DEPLOY, { recursive: true, force: true });
fs.mkdirSync(DEPLOY, { recursive: true });
copy(standalone, DEPLOY);

// 3. static + public (standalone bularni o'z ichiga olmaydi)
copy(path.join(ROOT, ".next", "static"), path.join(DEPLOY, ".next", "static"));
if (fs.existsSync(path.join(ROOT, "public"))) {
  copy(path.join(ROOT, "public"), path.join(DEPLOY, "public"));
}

// 4. runtime .env — manba sifatida .env.local yoki .env
const envSrc = [".env.local", ".env"]
  .map((f) => path.join(ROOT, f))
  .find((f) => fs.existsSync(f));
if (envSrc) {
  copy(envSrc, path.join(DEPLOY, ".env"));
  log(`runtime env: ${path.basename(envSrc)} -> deploy/.env`);
} else {
  fs.writeFileSync(path.join(DEPLOY, ".env"), "");
  log("env manba topilmadi, bo'sh deploy/.env yaratildi");
}

// 5. .env ni o'qib server.js ni ishga tushiruvchi wrapper
const runJs = `// .env ni o'qib (har restartda) Next standalone serverini ishga tushiradi.
const fs = require("fs");
const path = require("path");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\\r?\\n/)) {
    const m = line.match(/^\\s*([\\w.-]+)\\s*=\\s*(.*?)\\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    let [, key, val] = m;
    val = val.replace(/^["']|["']$/g, "");
    process.env[key] = val; // .env fayl ustun
  }
}

loadEnv(path.join(__dirname, ".env"));
require("./server.js");
`;
fs.writeFileSync(path.join(DEPLOY, "run.js"), runJs);

// 6. pm2 ecosystem — faqat Next web jarayoni (ma'lumot Go backend'dan keladi)
const ecosystem = `// pm2 konfiguratsiyasi — deploy papkasi ichidan ishlatiladi:
//   cd deploy && pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "iibb-web",
      script: "run.js",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      // .env o'zgarganda jarayon qayta ishga tushadi -> yangi env o'qiladi.
      watch: ["./.env"],
      ignore_watch: ["node_modules", ".next", "public"],
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
`;
fs.writeFileSync(path.join(DEPLOY, "ecosystem.config.js"), ecosystem);

log("Tayyor ✅  ->  cd deploy && pm2 start ecosystem.config.js");
