function waitFor(fn: Function, thisArg: unknown, args: unknown[]) {
  try {
    const result = fn.apply(thisArg, args);

    if (result instanceof Promise) {
      return new Promise((res, rej) => {
        result.then(res).catch(rej);
      });
    }

    return Promise.resolve(result);
  } catch (err) {
    throw err;
  }
}

/**
 * @returns {Promise<IdleDeadline>}
 */
function idle() {
  return new Promise((resolve) => {
    requestIdleCallback((deadline) => {
      resolve(deadline);
    });
  });
}

function wrap(fn) {
  return new Promise(fn);
}

export { idle, waitFor, wrap };
