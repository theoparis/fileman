import chalk from "chalk";
import { readdirSync, statSync } from "fs";
import { DateTime } from "luxon";
import { join } from "path";
import { CustomFiles, File, Icons } from "./definitions.js";
import FileManager from "./FileManager.js";
import { formatBytes } from "./libs/formatters.js";
import { termSize } from "./libs/termSize.js";

let numEntries = () => termSize().height - 2;
let minS = 0;
let maxS = numEntries();

export default class FileViewer {
  public scroll = 0;
  public maxScroll = 0;
  public selected: File | undefined;
  public files: File[] = [];

  constructor(public man: FileManager) {}

  public onKeypress(key: string) {
    this.selected = this.files[this.scroll];

    switch (key) {
      case "up":
      case "w":
        this.scroll--;
        break;
      case "down":
      case "s":
        this.scroll++;
        break;
      case "left":
      case "a":
      case "escape":
        this.scroll = 0;
        this.selected = this.files[0];
        this.openSelected();
        break;
      case "home":
        this.scroll = 0;
        break;
      case "end":
        this.scroll = this.maxScroll;
        break;
      case "l":
        this.man.opts.showExtras = !this.man.opts.showExtras;
        break;
      case "h":
      case ".":
        this.man.opts.showHidden = !this.man.opts.showHidden;
        break;
      case "space":
      case "d":
        this.openSelected();
        break;
    }
    this.update();
  }

  public openSelected() {
    if (this.selected?.isDir) {
      this.man.cwd = this.selected.path;
      this.scroll = 0;
      this.update();
      // TODO: file editor
    } else {
    }
  }

  public update() {
    const files = readdirSync(this.man.cwd);
    let fileArr = files.map((f) => {
      const fullPath = join(this.man.cwd, f),
        stat = statSync(fullPath),
        name = f.split(/[/\\]/g).pop();
      return {
        name,
        path: fullPath,
        isDir: stat.isDirectory(),
        lastModified: DateTime.fromJSDate(new Date(stat.mtimeMs)),
        size: stat.size,
        hidden: name.startsWith("."),
      };
    });

    if (!this.man.opts.showHidden) fileArr = fileArr.filter((f) => !f.hidden);
    this.files = [{ name: "..", path: join(this.man.cwd, ".."), isDir: true }];
    this.files.push(
      ...fileArr
        .filter((f) => f.isDir)
        .sort((f1, f2) =>
          f1.name.toLowerCase() > f2.name.toLowerCase() ? 1 : -1
        )
    );
    this.files.push(
      ...fileArr
        .filter((f) => !f.isDir)
        .sort((f1, f2) =>
          f1.name.toLowerCase() > f2.name.toLowerCase() ? 1 : -1
        )
    );
    this.maxScroll = this.files.length - 1;
    if (this.scroll < 0) this.scroll = 0;
    if (this.scroll > this.maxScroll) this.scroll = this.maxScroll;

    if (this.scroll == 0) {
      minS = 0;
      maxS = numEntries();
    }
    if (this.scroll == this.maxScroll) {
      maxS = Math.max(numEntries(), this.maxScroll);
      minS = Math.max(0, maxS - numEntries());
    }

    if (this.scroll == maxS) {
      maxS++;
      minS++;
      this.scroll = maxS - 1;
    }
    if (this.scroll == minS - 1) {
      minS--;
      maxS--;
      this.scroll = minS;
    }
    let write = this.man.opts.debug ? [`${this.scroll} ${minS} ${maxS}`] : [];

    this.files.slice(minS, maxS).forEach((f) => {
      let ind = this.files.indexOf(f);
      let sliced = f.name.slice(0, termSize().width / 2);
      let ico = "";
      Object.entries(CustomFiles).forEach((ent) => {
        if (
          f.name.match(
            new RegExp(ent[1].toString().replace(/\/$/, "$").substring(1))
          )?.length
        )
          ico = ent[0];
      });
      if (f.isDir) {
        if (!ico) ico = Icons.folderGeneric;
      } else {
        if (!ico) ico = Icons.fileGeneric;
      }
      let formattedDate = f.lastModified?.toFormat("ff");
      if (this.man.opts.dateRelative)
        formattedDate = f.lastModified?.toRelative();
      let formattedSize = f.isDir ? "" : formatBytes(f.size);

      let written = `${ico} ${sliced} ${this.man.opts.debug ? ` ${ind}` : ""}`
        .length;
      let endItems =
        this.man.opts.showExtras && f.lastModified
          ? [formattedSize, formattedDate].filter((e) => e).join(" - ")
          : "";

      let pad = " ".repeat(
        Math.max(1, termSize().width - written - endItems.length)
      );

      write.push(
        `${ico} ` +
          (this.scroll == ind ? chalk.black.bgWhite : String)(
            `${sliced} ${this.man.opts.debug ? ` ${ind}` : ""}${pad}${endItems}`
          )
      );
    });

    this.man.title = this.man.cwd.slice(0, termSize().width - 4);
    this.man.footer = Object.entries({
      W: Icons.up,
      S: Icons.down,
      A: Icons.back,
      D: Icons.forward,
      L: Icons.details,
      H: this.man.opts.showHidden ? Icons.eyeCross : Icons.eye,
    })
      .map((ic) => `${ic[0]} ${ic[1]}`)
      .join(" | ");

    console.clear();
    this.man.printTitle();
    process.stdout.cursorTo(0, 1);
    process.stdout.write(write.join("\n"));
    this.man.printFooter(termSize().height - 1);
    process.stdout.cursorTo(0, termSize().height);
  }
}
