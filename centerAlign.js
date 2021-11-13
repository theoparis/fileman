// FROM THE CENTER-ALIGN PACKAGE AND ITS DEPS

function longest(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("expected an array");
  }

  let len = arr.length;
  if (len === 0) {
    return undefined;
  }

  let val = arr[0];
  if (typeof val === "number") {
    val = String(val);
  }

  let longest = val.length;
  let idx = 0;

  while (++idx < len) {
    let ele = arr[idx];
    if (ele == null) {
      continue;
    }

    if (typeof ele === "number") {
      ele = String(ele);
    }

    let elen = ele.length;
    if (typeof elen !== "number") {
      continue;
    }

    if (elen > longest) {
      longest = elen;
      val = ele;
    }
  }
  return val;
}

function align(val, fn) {
  let originalType = typeOf(val);
  let lines = val;

  if (originalType === "string") {
    lines = val.split(/(?:\r\n|\n)/);
  } else if (originalType !== "array") {
    throw new TypeError("No input found. Provide a string or array to align.");
  }

  let fnType = typeOf(fn);
  let max = longest(lines);
  let len = lines.length;
  let idx = -1;
  let res = [];

  while (++idx < len) {
    let line = String(lines[idx]);
    let diff;

    if (fnType === "function") {
      diff = fn(line.length, max.length, line, lines, idx);
    } else if (fnType === "number") {
      diff = fn;
    } else {
      diff = max.length - line.length;
    }

    if (typeOf(diff) === "number") {
      res.push(" ".repeat(diff) + line);
    } else if (typeOf(diff) === "object") {
      let result = (diff.character || " ").repeat(diff.indent || 0);
      res.push((diff.prefix || "") + result + line);
    }
  }

  if (originalType === "array") return res;
  return res.join("\n");
}

export default function centerAlign(val, width) {
  if (typeof width === "number" && typeof val === "string" && !/\n/.test(val)) {
    let padding = Math.floor((width - val.length) / 2);
    return " ".repeat(padding) + val + " ".repeat(padding);
  }

  return align(val, function (len, longest) {
    if (typeof width === "number") {
      return Math.floor((width - len) / 2);
    }
    return Math.floor((longest - len) / 2);
  });
}
