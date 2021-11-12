const fs = require("fs");
const path = require("path");
const readline = require("readline");
const termSize = require("./termSize");
const chalk = require("chalk");

const State = {
  viewingDir: 1,
  editingFile: 2,
};

let currentDir = process.cwd();
let scroll = 0;
let state = State.viewingDir;

console.clear();
readline.emitKeypressEvents(process.stdin);
process.stdin.on("keypress", (ch, key) => {
  if (key && key.ctrl && key.name == "c") {
    console.log("Exiting...");
    process.exit();
  }
  if (!key.ctrl && !key.meta && !key.shift) {
    if (state == State.viewingDir) {
      switch (key.name) {
        case "up":
        case "w":
          scroll--;
          break;
        case "down":
        case "s":
          scroll++;
          break;
      }
    }
  }
  if (state == State.viewingDir) listDir();
});

if (process.stdin.isTTY) process.stdin.setRawMode(true);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function listDir() {
  console.clear();
  let files = fs.readdirSync(currentDir);
  let fileMap = files.map((f) => {
    let fullPath = path.join(currentDir, f);
    let stat = fs.statSync(fullPath);
    return { name: f.split(/[\/\\]/g).pop(), path: fullPath, isDir: stat.isDirectory() };
  });
  fileMap = fileMap.sort((f1, f2) => {
    f1.name.toLowerCase() > f2.name.toLowerCase() ? 1 : -1;
  });
  let maxScroll = fileMap.length - 1;
  if (scroll < 0) scroll = maxScroll;
  if (scroll > maxScroll) scroll = 0;
  let write = [];
  fileMap.forEach((f, ind) => {
    let sliced = f.name.slice(0, termSize().width / 2);
    if (f.isDir) sliced = chalk.blue(sliced);
    if (scroll == ind) sliced = chalk.bgWhite.black(sliced);
    write.push(`${sliced}`);
  });
  process.stdout.cursorTo(0, 0);
  console.log(write.join("\n"));
  process.stdout.cursorTo(0, termSize().height);
}
listDir();
