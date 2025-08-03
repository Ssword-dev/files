import * as cp from "./component-parser.js";

async function lazy(url) {
  const res = await fetch(url);
  const text = await res.text();
  const file = cp.parseTemplateFile(text);
  return file;
}

export { lazy };
