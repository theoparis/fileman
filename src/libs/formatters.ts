// https://stackoverflow.com/a/18650828
export function formatBytes(bytes, decimals = 0) {
  if (bytes === 0) return "Empty";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["b", "kb", "mb", "gb", "tb", "pb", "eb"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}
