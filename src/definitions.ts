import { DateTime } from "luxon";

export enum Mode {
  viewingDir,
  editingFile,
}
// https://www.nerdfonts.com/cheat-sheet
export enum Icons {
  folderGeneric = "\ue5ff",
  folderGit = "\ue5fb",
  folderNPM = "\ue5fa",
  fileGeneric = "\uf713",
  window = "\ufaae",
  up = "\uf062",
  down = "\uf063",
  back = "\ufc30",
  forward = "\ufc33",
  details = "\uf05a",
  eye = "\uf707",
  eyeCross = "\uf708",
}
export interface Options {
  showExtras: boolean;
  showHidden: boolean;
  debug: boolean;
  exitWithCwd: boolean;
  dateRelative: boolean;
  title: string;
  footer: string;
}
export interface File {
  name: string;
  path: string;
  isDir: boolean;
  lastModified?: DateTime;
  size?: number;
  hidden?: boolean;
}
export interface Key {
  sequence: string;
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  code?: string;
}
