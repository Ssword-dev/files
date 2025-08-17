import symbols from "./symbols";

// hold obj:proxy pairs for caching.
const reactiveObjectCache = new WeakMap();

/**
 * @template {object} T The type of the object you provided.
 * @param {T} obj A reactive object.
 * @param {(obj: T)=>void|Promise<void>} fn
 * @throws {}
 * This function lets you subscribe into a reactive object's property changes.
 *
 */
function subscribe(obj, fn) {
  if (!obj[symbols.REACTIVE_OBJECT_SYMBOL]) {
    throw new Error("Invalid reactive object");
  }
  obj[symbols.REACTIVE_LISTENERS_SYMBOL].add(fn);
}

function makeReactiveArray(arr, notifyListeners, deep) {
  // this is the bindings for this object.
  // it allows me to override methods that
  // modifies the array in any way to notify the listeners.
  const bindings = {
    push: null,
    pop: null,
    shift: null,
    unshift: null,
    splice: null,
    sort: null,
    reverse: null,
  };

  const cached = reactiveObjectCache.get(arr);

  if (cached && cached[symbols.REACTIVE_OBJECT_SYMBOL]) {
    return cached;
  }

  const arrayProxy = new Proxy(arr, {
    get(target, property, receiver) {
      if (property in bindings) {
        if (bindings[property] === null) {
          const fn = target[property];
          const newFn = function (...args) {
            const anyResult = fn.apply(this, args);
            notifyListeners(); // after modifications then call notify.
            return anyResult;
          };

          // bind the method.
          const newBinding = newFn.bind(arr);
          bindings[property] = newBinding;
        }

        return bindings[property];
      }

      const value = Reflect.get(target, property, receiver);

      if (!deep || typeof value !== "object") {
        return value;
      }

      return reactive(value);
    },
  });

  return arrayProxy;
}

/**
 * @template {object} T
 * @param {T} obj
 * @returns {T} A reactive of T.
 */
function reactive(obj) {
  if (obj === null || typeof obj !== "object") {
    throw new Error("Cannot create reactive instance of non-object");
  }

  const cached = reactiveObjectCache.get(obj);

  if (cached) {
    return cached; // avoids duplicates;
  }

  const subscribers = new Set();

  // XXX: Dont care about this not being awaited.
  // XXX: if i really need that functionality, i could just build
  // XXX: An entire reconciler and scheduler. but i do not...
  const notifyListeners = async () => {
    for (const fn of subscribers) {
      const maybePromise = fn(proxy);

      if (maybePromise instanceof Promise) {
        await maybePromise;
      }
    }
  };

  let proxy;

  if (Array.isArray(obj)) {
    proxy = makeReactiveArray(obj, notifyListeners, true);
  } else {
    // this proxy object is very special.
    // i made it so it calls all
    proxy = new Proxy(obj, {
      get(target, property, receiver) {
        if (property === symbols.REACTIVE_OBJECT_SYMBOL) return true;
        if (property === symbols.REACTIVE_LISTENERS_SYMBOL) return subscribers;

        const val = Reflect.get(target, property, receiver);

        if (typeof val !== "object") return val;
        return reactive(val);
      },

      set(target, property, value, receiver) {
        const oldValue = target[property];
        const result = Reflect.set(target, property, value, receiver);

        if (oldValue !== value) {
          notifyListeners();
        }

        return result;
      },
    });
  }

  reactiveObjectCache.set(obj, proxy);
  return proxy;
}

function state(initialValue) {
  const _internalProxy = reactive({ value: initialValue });

  const setState = (arg0) => {
    _internalProxy.value =
      typeof arg0 === "function" ? arg0(_internalProxy.value) : arg0;
  };

  const subscribeFn = (fn) => {
    const wrapped = (proxy) => fn(proxy.value);
    subscribe(_internalProxy, wrapped);

    fn(_internalProxy.value);

    return () => {
      _internalProxy[symbols.REACTIVE_LISTENERS_SYMBOL].delete(wrapped);
    };
  };

  return [subscribeFn, setState];
}

export { reactive, subscribe, state, symbols };
