const fs = require("fs");
const path = require("path");
const readline = require("readline");

readline.emitKeypressEvents(process.stdin);

let currentDir = process.cwd();
function listDir() {
  let files = fs.readdirSync(currentDir);
  let fileMap = files.map((f) => {
    let fullPath = path.join(currentDir, f);
    let stat = fs.statSync(fullPath);
    return { name: f.split(/[\/\\]/g).pop(), path: fullPath, isDir: stat.isDirectory() };
  });
  console.log(fileMap);
}
listDir();

process.stdin.on("keypress", (ch, key) => {
  console.log('got "keypress"', ch, key);
  if (key && key.ctrl && key.name == "c") {
    console.log("Exiting...");
    process.exit();
  }
  console.log("\n");
  console.log(ch);
});

if (process.stdin.isTTY) process.stdin.setRawMode(true);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
