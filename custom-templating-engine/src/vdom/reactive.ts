import symbols from "./symbols";

// hold obj:proxy pairs for caching.
const reactiveObjectCache = new WeakMap();

function subscribe<T>(obj: T, fn: (obj: T) => void | Promise<void>) {
  if (!obj[symbols.REACTIVE_OBJECT_SYMBOL]) {
    throw new Error("Invalid reactive object");
  }
  obj[symbols.REACTIVE_LISTENERS_SYMBOL].add(fn);
}

function reactive<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    throw new Error("Cannot create reactive instance of non-object");
  }

  const cached = reactiveObjectCache.get(obj);

  if (cached) {
    return cached; // avoids duplicates;
  }

  const subscribers = new Set<(proxy: T)=>void|Promise<void>>();

  const notifyListeners = async () => {
    for (const fn of subscribers) {
      const maybePromise = fn(proxy);

      if (maybePromise instanceof Promise) {
        await maybePromise;
      }
    }
  };

  // this proxy object is very special.
  // i made it so it calls all
  const proxy = new Proxy(obj, {
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
