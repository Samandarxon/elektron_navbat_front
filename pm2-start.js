const { exec } = require("child_process");

exec("npm run dev", { shell: true }, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
