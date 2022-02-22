import * as chalk from "chalk";
import { execSync } from "child_process";
import { emitKeypressEvents, Key } from "readline";
import { Icons, Mode, Options } from "./definitions";
import FileViewer from "./FileViewer";
import centerAlign from "./libs/centerAlign";
import { termSize } from "./libs/termSize";

export default class FileManager {
  public opts: Options = {
    showExtras: false,
    showHidden: false,
    debug: process.env.DEBUG === "true",
    exitWithCwd: true,
    dateRelative: true,
    title: "FileMan",
    footer: "",
  };
  public mode = Mode.viewingDir;
  public viewer: FileViewer;
  public cwd = process.cwd();

  public title = "";
  public footer = "";

  constructor() {
    console.clear();
    emitKeypressEvents(process.stdin);
    process.stdin.on("keypress", (_, key) => {
      this.onKeypress(key);
    });
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    this.viewer = new FileViewer(this);
    this.viewer.update();
  }

  public onKeypress(key: Key) {
    if (key.sequence === ".") key.name = key.sequence;

    if (key && key.ctrl && key.name == "c") {
      console.log("Exiting...");
      // TODO: fix cd on exit
      if (this.opts.exitWithCwd) execSync(`cd ${this.cwd}`, {});
      process.exit();
    }
    if (!key.ctrl && !key.shift) {
      if (this.mode == Mode.viewingDir) this.viewer.onKeypress(key.name);
    }
    if (this.mode == Mode.viewingDir) this.viewer.update();
  }

  public printTitle() {
    let title = this.title + " - FileMan";
    process.stdout.cursorTo(0, 0);
    process.stdout.write(
      chalk.bgBlue.white(
        Icons.window +
          (centerAlign(title, termSize().width - 1) + "  ").slice(1)
      )
    );
  }
  public printFooter(y: number) {
    let footer = this.footer;
    process.stdout.cursorTo(0, y);
    process.stdout.write(
      chalk.white(centerAlign(footer, termSize().width - 1) + "  ")
    );
  }
}
