// server.js
// json-server o'chirildi — real navbat backend ishlatiladi (elektron_navbat_3)
const { exec } = require("child_process");

const next = exec("npx next dev", { shell: true });
next.stdout.pipe(process.stdout);
next.stderr.pipe(process.stderr);
