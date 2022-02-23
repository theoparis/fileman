import * as chalk from "chalk";
import { execSync } from "child_process";
import { emitKeypressEvents, Key } from "readline";
import CommandPrompt from "./CommandPrompt";
import { Icons, Mode, Options } from "./definitions";
import FileViewer from "./FileViewer";
import centerAlign from "./libs/centerAlign";
import { termSize } from "./libs/termSize";

export default class FileManager {
  public opts: Options = {
    showExtras: false,
    showHidden: false,
    debug: false,
    exitWithCwd: true,
    dateRelative: true,
  };
  public mode = Mode.viewingDir;
  public viewer: FileViewer;
  public commandPrompt: CommandPrompt;
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
    this.commandPrompt = new CommandPrompt(this);
  }

  public onKeypress(key: Key) {
    if (key.sequence === ".") key.name = key.sequence;

    if (key && key.ctrl && key.name == "c") return this.exit();

    if (!key.ctrl) {
      if (key.name == "tab") {
        if (this.mode == Mode.viewingDir) {
          this.mode = Mode.commandPrompt;
          this.commandPrompt.reset();
          this.commandPrompt.update();
          return;
        } else if (this.mode == Mode.commandPrompt) {
          this.mode = Mode.viewingDir;
          this.viewer.update();
          return;
        }
      }
      if (this.mode == Mode.viewingDir) {
        this.viewer.onKeypress(key.name);
      } else if (this.mode == Mode.commandPrompt) {
        this.commandPrompt.onKeypress(key);
      }
    } else if (this.mode == Mode.viewingDir) this.viewer.update();
    else if (this.mode == Mode.commandPrompt) this.commandPrompt.update();
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

  public exit() {
    console.clear();
    console.log("Exiting...");
    // TODO: fix cd on exit
    if (this.opts.exitWithCwd) execSync(`cd ${this.cwd}`, {});
    process.exit();
  }
}
