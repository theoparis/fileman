import fs from "fs";
import path from "path";
import readline from "readline";
import chalk from "chalk";
import { termSize } from "./termSize.js";
import { execSync } from "child_process";
import { DateTime } from "luxon";

/**
 * @enum {number}
 * @readonly
 */
const Mode = {
  viewingDir: 1,
  editingFile: 2,
};
// https://www.nerdfonts.com/cheat-sheet
const Icons = {
  folder: "\ue5ff",
  fileGeneric: "\uf713",
};

let scroll = 0;
let maxScroll = 0;
/**
 * @type {{
 * selected: {
 *   name: string;
 *   path: string;
 *   isDir: boolean;
 *   lastModified: Date;
 * } | undefined;
 * mode: Mode;
 * showExtras: boolean;
 * showHidden: boolean;
 * debug: boolean;
 * exitWithCwd: boolean;
 * currentDir: string;
 * }}
 */
let state = {
  mode: Mode.viewingDir,
  showExtras: false,
  showHidden: true,
  debug: process.env.DEBUG === "true",
  // exitWithCwd: process.env.EXIT_CWD === "true"
  exitWithCwd: true,
  currentDir: process.cwd(),
  selected: undefined,
  dateRelative: true,
  dateFormat: "ff", // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
};
/**
 * @type {{
 * name: string;
 * path: string;
 * isDir: boolean;
 * lastModified: Date;
 * }[]
 * }
 */
let fileMap = [];

const openSelected = () => {
  if (state.selected.isDir) {
    state.currentDir = state.selected.path;
    scroll = 0;
    listDir();
    // TODO: file editor
  } else {
  }
};

console.clear();
readline.emitKeypressEvents(process.stdin);
process.stdin.on("keypress", (_ch, key) => {
  if (key.sequence === ".") key.name = key.sequence;
  if (key && key.ctrl && key.name == "c") {
    console.log("Exiting...");
    // FIXME: cd on exit
    if (state.exitWithCwd) execSync(`cd ${state.currentDir}`, {});
    process.exit();
  }
  if (!key.ctrl && !key.meta && !key.shift) {
    if (state.mode == Mode.viewingDir) {
      state.selected = fileMap[scroll];

      switch (key.name) {
        case "up":
        case "w":
          scroll--;
          break;
        case "down":
        case "s":
          scroll++;
          break;
        case "home":
          scroll = 0;
          break;
        case "end":
          scroll = maxScroll;
          break;
        case "l":
          state.showExtras = !state.showExtras;
          break;
        case "h":
        case ".":
          state.showHidden = !state.showHidden;
          break;
        case "space":
          openSelected();
          break;
      }
    }
  }
  if (state.mode == Mode.viewingDir) listDir();
});

if (process.stdin.isTTY) process.stdin.setRawMode(true);

// may come into use later
/* const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
}); */

let numEntries = () => termSize().height - 2;
let minS = 0;
let maxS = numEntries();

const listDir = () => {
  let files = fs.readdirSync(state.currentDir);
  let fileArr = files.map((f) => {
    let fullPath = path.join(state.currentDir, f);
    let stat = fs.statSync(fullPath);
    const name = f.split(/[/\\]/g).pop();

    return {
      name,
      path: fullPath,
      isDir: stat.isDirectory(),
      lastModified: DateTime.fromJSDate(new Date(stat.mtimeMs)),
    };
  });

  if (!state.showHidden) fileArr = fileArr.filter((f) => !f.hidden);
  fileMap = [{ name: "..", path: path.join(state.currentDir, ".."), isDir: true }];
  fileMap.push(
    ...fileArr
      .filter((f) => f.isDir)
      .sort((f1, f2) => (f1.name.toLowerCase() > f2.name.toLowerCase() ? 1 : -1))
  );
  fileMap.push(
    ...fileArr
      .filter((f) => !f.isDir)
      .sort((f1, f2) => (f1.name.toLowerCase() > f2.name.toLowerCase() ? 1 : -1))
  );
  maxScroll = fileMap.length - 1;
  if (scroll < 0) scroll = 0;
  if (scroll > maxScroll) scroll = maxScroll;

  if (scroll == 0) {
    minS = 0;
    maxS = numEntries();
  }
  if (scroll == maxScroll) {
    maxS = Math.max(numEntries(), maxScroll);
    minS = Math.max(0, maxS - numEntries());
  }

  if (scroll == maxS) {
    maxS++;
    minS++;
    scroll = maxS - 1;
  }
  if (scroll == minS - 1) {
    minS--;
    maxS--;
    scroll = minS;
  }
  let write = state.debug ? [`${scroll} ${minS} ${maxS}`] : [];

  fileMap.slice(minS, maxS).forEach((f) => {
    let ind = fileMap.indexOf(f);
    let sliced = f.name.slice(0, termSize().width / 2);
    let ico = Icons.fileGeneric;
    if (f.isDir) {
      ico = Icons.folder;
    }
    let formattedDate = f.lastModified?.toFormat(state.dateFormat);
    if (state.dateRelative) formattedDate = f.lastModified?.toRelative();

    let written = `${ico} ${sliced} ${state.debug ? ` ${ind}` : ""}`.length;
    let endItems = `${state.showExtras ? formattedDate || "" : ""}`;

    let pad = " ".repeat(Math.max(1, termSize().width - written - endItems.length));

    write.push(
      `${ico} ` +
        (scroll == ind ? chalk.bgWhite.black : String)(
          `${sliced} ${state.debug ? ` ${ind}` : ""}${pad}${endItems}`
        )
    );
  });

  console.clear();
  process.stdout.cursorTo(0, 0);
  process.stdout.write(write.join("\n"));
  process.stdout.cursorTo(0, termSize().height);
};
listDir();
