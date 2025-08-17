import symbols from "./symbols";

declare module "./bases.js" {
  export class BaseError extends Error {
    constructor(message: string);
  }
}

type ClassCandidate =
  | string
  | symbol
  | Record<string, boolean | (() => boolean)>
  | ClassCandidate[]
  | null
  | undefined
  | false
  | 0;

declare namespace ClassUtils {
  export function cls(...args: ClassCandidate[]): string;

  export namespace cls {
    function flattenRecord(
      record: Record<string, boolean | (() => boolean)>,
    ): string;

    function flattenArray(arr: ClassCandidate[]): string;

    function serializeSymbol(sym: symbol): string;
  }
}

declare namespace EventUtils {
  export function evtToSpecCompat(name: string): string;
}

declare namespace Factories {
  export function createIntrinsicElement(
    type: string,
    properties: Record<string, string | boolean | Function>,
    ...children: Node[]
  ): Element;

  export function createSymbolicElement(
    type: symbol,
    properties: Record<string, any>,
    ...children: Node[]
  ): Node;

  export function createFunctionalComponentElement<
    T extends (arg1: object) => Node,
  >(
    type: T,
    properties: Omit<Parameters<T>[0], "children">,
    ...children: Node[]
  ): Node;
}

declare namespace ReactiveModule {
  export interface ReactiveObjectiveInternals {
    [symbols.REACTIVE_OBJECT_SYMBOL]: true;
    [symbols.REACTIVE_LISTENERS_SYMBOL]: Set<Function>;
  }

  /**
   * Deep Reactivity Model Type for this reactivity system.
   */
  export type ReactiveObject<T extends object = object> = {
    [K in keyof T]: T[K] extends object ? ReactiveObject<T[K]> : T[K];
  };

  export type UnreactiveObject<T> =
    T extends ReactiveObject<infer O> ? O : never;

  /**
   * A type helper that does not wrap a reactive object in a reactive object.
   */
  export type ReactiveObjectIfNotAlready<T extends object> =
    T extends ReactiveObject<object> ? T : ReactiveObject<T>;

  /**
   * @param host The host object for the wrapper proxy.
   */
  export function reactive<T extends object>(host: T): ReactiveObject<T>;

  /**
   *
   * @param wrapper The object returned by `utils.reactive`.
   * @param listener The listener to be notified.
   */
  export function subscribe<T extends ReactiveObject>(
    wrapper: T,
    listener: (value: UnreactiveObject<T>) => void,
  ): void;
}

declare function utils(
  ...args: Parameters<typeof Factories.createIntrinsicElement>
): ReturnType<typeof Factories.createIntrinsicElement>;

declare function utils(
  ...args: Parameters<typeof Factories.createSymbolicElement>
): ReturnType<typeof Factories.createSymbolicElement>;

declare function utils(
  ...args: Parameters<typeof Factories.createFunctionalComponentElement>
): ReturnType<typeof Factories.createFunctionalComponentElement>;

declare namespace utils {
  export const element: typeof Factories.createIntrinsicElement;
  export const fragment: (...children: Node[]) => DocumentFragment;
  export const className: typeof ClassUtils.cls;
  export const reactive: typeof ReactiveModule.reactive;
  export const subscribe: typeof ReactiveModule.subscribe;
}

export default utils;
