import symbols from "./symbols";

/**
 * @template {object} T
 * @param {T} obj
 * @param {(obj: T)=>void|Promise<void>} fn
 */
function subscribe(obj, fn) {
  if (!obj[symbols.REACTIVE_OBJECT_SYMBOL]) {
    throw new Error("Invalid reactive object");
  }
  obj[symbols.REACTIVE_LISTENERS_SYMBOL].add(fn);
}

// TODO: Make this lazy recursive when i need it
// ! This is not recursive.
/**
 * @template {object} T
 * @param {T} obj
 * @returns {T} A reactive of T.
 */
function reactive(obj) {
  if (obj === null || typeof obj !== "object") {
    throw new Error("Cannot create reactive instance of non-object");
  }

  const subscribers = new Set();

  const notifyListeners = async () => {
    for (const fn of subscribers) {
      const maybePromise = fn(proxy);

      if (maybePromise instanceof Promise) {
        await maybePromise;
      }
    }
  };

  const proxy = new Proxy(obj, {
    get(target, property, receiver) {
      if (property === symbols.REACTIVE_OBJECT_SYMBOL) return true;
      if (property === symbols.REACTIVE_LISTENERS_SYMBOL) return subscribers;
      return Reflect.get(target, property, receiver);
    },

    async set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      if (oldValue !== value) {
        await notifyListeners();
      }
      return result;
    },
  });

  return proxy;
}

export { reactive, subscribe, symbols };
