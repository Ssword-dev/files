import { InvalidClassCandidateError } from "./errors";

function cls(...args) {
  const self = cls;
  let classes = "";

  for (const arg of args) {
    if (!arg) continue; // skip falsy (null, undefined, false, 0, "")

    if (Array.isArray(arg)) {
      const result = self.flattenArray(arg);
      if (result) classes += classes ? " " + result : result;
      continue;
    }

    switch (typeof arg) {
      case "string":
        classes += classes ? " " + arg : arg;
        break;

      case "object":
        classes += classes
          ? " " + self.flattenRecord(arg)
          : self.flattenRecord(arg);
        break;

      case "symbol":
        classes += classes
          ? " " + self.serializeSymbol(arg)
          : self.serializeSymbol(arg);
        break;

      default:
        throw new InvalidClassCandidateError(
          `Cannot have a class candidate of type ${typeof arg}`,
        );
    }
  }

  return classes;
}

// flattens { foo: true, bar: false, baz: fn() } to
// a single class string.
cls.flattenRecord = function (record) {
  let classes = "";
  for (const key in record) {
    const val = record[key];
    const isActive = typeof val === "function" ? val() : val;
    if (isActive) classes += classes ? " " + key : key;
  }
  return classes;
};

// flattens arrays to a string using df
cls.flattenArray = function (arr) {
  const self = utils.class;
  let classes = "";

  // this is a stack.
  // a stack is a data structure that holds
  // items of other arrays, used for df-based
  // algorithms.
  const stack = [arr];

  // while(stack.length) works because
  // 0 is falsy in javascript.
  while (stack.length) {
    const item = stack.pop();
    if (!item) continue; // skip falsy

    if (Array.isArray(item)) {
      // push items in reverse so its
      // last in first out
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i]);
      }
      continue;
    }

    const str = (() => {
      switch (typeof item) {
        case "string":
          return item;
        case "object":
          return self.flattenRecord(item);
        case "symbol":
          return self.serializeSymbol(item);
        default:
          throw new InvalidClassCandidateError(
            `A class candidate array cannot have items of type ${typeof item}`,
          );
      }
    })();

    if (str) classes += classes ? " " + str : str;
  }

  return classes;
};

// converts a symbol to string
cls.serializeSymbol = function (sym) {
  const key = Symbol.keyFor(sym);
  return key == null ? sym.description : key;
};

export { cls };
