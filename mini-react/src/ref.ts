interface RefObject<T> {
  current: T;
}

interface RefFunction<T> {
  (documentReference: T): void;
}

export type { RefFunction, RefObject };
