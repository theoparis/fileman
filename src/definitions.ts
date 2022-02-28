import { DateTime } from "luxon";

export enum Mode {
  viewingDir,
  editingFile,
  commandPrompt,
}
// https://www.nerdfonts.com/cheat-sheet
export enum Icons {
  folderGeneric = "\ue5ff",
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
}
export interface File {
  name: string;
  path: string;
  isDir: boolean;
  lastModified?: DateTime;
  size?: number;
  hidden?: boolean;
}
export const validCharacters = `\`~1234567890!@#$%^&*()-=_+[]{}\\|;:'",<.>/?qwertyuiopasdfghjklzxcvbnm `;

export const CustomFiles = {
  "\ue5fb": /\.git/,
  "\ue702": /\.gitignore/,
  "\ue5fa": /node_modules/,
};
