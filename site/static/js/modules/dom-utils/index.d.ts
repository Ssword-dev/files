const __INTERNAL_SYMBOL_1 = Symbol("IS1");

type ReactiveObject<T> = T & { [__INTERNAL_SYMBOL_1]?: void | undefined };

type ExtractOriginalObjectFromReactiveWrapper<
  T extends ReactiveObject<object>,
> = T extends ReactiveObject<infer U> ? U : never;

type StateChangeHandler<T> = (current: T) => void;

type StateSubscriberFunction<T> = (fn: StateUpdaterFunction<T>) => void;

type StateUpdaterFunction<T> = (current: T | ((current: T) => T)) => void;

type StateFunctionReturn<T> = [
  StateSubscriberFunction<T>,
  StateUpdaterFunction<T>,
];

interface ReactivityApi {
  subscribe(obj: object): void;
  reactive<T extends object>(obj: T): ReactiveObject<T>;
  state<T extends ReactiveObject<object>>(
    initialValue: ExtractOriginalObjectFromReactiveWrapper<T>,
  ): StateFunctionReturn<T>;
}

interface UtilsApi extends ReactivityApi {}
