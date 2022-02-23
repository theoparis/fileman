import * as chalk from "chalk";
import { Key } from "readline";
import { Mode, validCharacters } from "./definitions";
import FileManager from "./FileManager";
import { termSize } from "./libs/termSize";

export default class CommandPrompt {
  public historyIndex = -1;
  public history: string[][] = [];
  public input: string[] = [];
  public cursorPos = 0;

  constructor(public man: FileManager) {}

  public onKeypress(key: Key) {
    if (key.name == "escape") {
      this.man.mode = Mode.viewingDir;
      this.man.viewer.update();
      return;
    } else if (key.name == "return" && this.input.length) {
      this.history.unshift(this.input);
      this.reset();
    } else if (key.name == "backspace") {
      if (this.input[this.cursorPos - 1])
        this.input.splice(this.cursorPos - 1, 1);
      this.cursorPos = Math.max(0, this.cursorPos - 1);
    } else if (key.name == "delete") {
      if (this.input[this.cursorPos]) this.input.splice(this.cursorPos, 1);
    } else if (key.name == "left") {
      this.cursorPos = Math.max(0, this.cursorPos - 1);
    } else if (key.name == "right") {
      this.cursorPos = Math.min(this.input.length, this.cursorPos + 1);
    } else if (key.name == "up") {
      this.historyIndex = Math.min(
        this.history.length - 1,
        this.historyIndex + 1
      );
      if (this.historyIndex == -1) {
        this.input = [];
        this.cursorPos = this.input.length;
      } else {
        this.input = this.history[this.historyIndex];
        this.cursorPos = this.input.length;
      }
    } else if (key.name == "down") {
      this.historyIndex = Math.max(-1, this.historyIndex - 1);
      if (this.historyIndex == -1) {
        this.input = [];
        this.cursorPos = this.input.length;
      } else {
        this.input = this.history[this.historyIndex];
        this.cursorPos = this.input.length;
      }
    } else if (key.name == "home") {
      this.cursorPos = 0;
    } else if (key.name == "end") {
      this.cursorPos = this.input.length;
    } else if (validCharacters.includes(key.sequence.toLowerCase())) {
      this.input.splice(this.cursorPos, 0, key.sequence);
      this.cursorPos++;
    }
    this.update();
  }

  public update() {
    this.man.title = this.man.cwd.slice(0, termSize().width - 4);

    console.clear();
    this.man.printTitle();
    process.stdout.cursorTo(0, 1);
    process.stdout.write("text");
    process.stdout.cursorTo(0, termSize().height);
    process.stdout.write(chalk.bgWhite.black(" ".repeat(termSize().width)));
    process.stdout.cursorTo(0, termSize().height);
    process.stdout.write(chalk.bgWhite.black("$ " + this.input.join("")));
    process.stdout.cursorTo(2 + this.cursorPos, termSize().height);
    process.stdout.write(chalk.bgMagenta(this.input[this.cursorPos] || " "));
    process.stdout.cursorTo(0, termSize().height);
  }

  public reset() {
    this.input = [];
    this.cursorPos = 0;
    this.historyIndex = -1;
  }
}
