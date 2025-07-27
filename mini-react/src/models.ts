import { Flags } from "./flags";
import { RefFunction, RefObject } from "./ref";
import { WorkTag } from "./workTags";

/**
 * The model for attribute changes.
 *
 * The reconciler uses this to track property modifications,
 * primarily used by the reconciler to call specific environment functions to
 * react to a change in the tree.
 *
 * the environment can implement its own diffing algorithm via
 * implementing the `.diffProps` method. note: this
 * method takes in the old props and the new props and should
 * return a `ReconcilerAttributeChangeModel` or any provided
 * alias.
 */
interface ReconcilerAttributeChangeModel {
  /**
   * The record of what the reconciler or the environment
   * thinks changed in the old props vs the new props.
   */
  modifications: Record<string, any>;

  /**
   * The record of what the reconciler or the environment thinks
   * has been added to the new props that the old props does not.
   */
  additions: Record<string, any>;

  /**
   * The list of properties missing in the new props from the old props.
   * the properties here are marked to be deleted.
   */
  deletions: string[];
}

type ReconcilerAttributeChange = ReconcilerAttributeChangeModel; // type alias

type Primitive = string | number | bigint | boolean | null;
type Node<F = () => Element> = Element<any> | Primitive | Node<F>[];

interface Element<T = any> {
  type: T;
  key: any;
  ref: any;
  props: any;
  $$typeof: symbol;
}

interface UpdateQueue<State = any> {
  baseState: State;
  shared: {
    pending: any;
  };
}

interface FunctionComponent<P extends object = object> {
  (props: P): Node;
}

interface ComponentLifecycle<_ extends object> {
  componentWillUnmount(): void;
  componentDidMount(): void;
}

interface ComponentProperties<P extends object> {
  props: P;
}

interface ComponentMethods<P extends object> {
  render(): Node;
}

interface ComponentInstance<P extends object = object>
  extends ComponentLifecycle<P>,
    ComponentProperties<P>,
    ComponentMethods<P> {}

interface ComponentClass<P extends object = object> {
  new (props: P): ComponentInstance<P>;
  prototype: ComponentInstance<P> & {
    /**
     * seriously, do not modify, if you did...
     * then you are opting your self for a lot
     * of debugging later
     */
    __COMPONENT_MARKER_DO_NOT_MODIFY_OR_YOU_WILL_BE_FIRED: boolean;
  };
}

type ResolveFiberInstanceProperty<T> = T extends ComponentClass<infer P>
  ? ComponentInstance<P>
  : null;

interface FiberNode<
  P extends object = object,
  T extends
    | keyof HTMLElementTagNameMap
    | FunctionComponent<P>
    | ComponentClass<P> =
    | keyof HTMLElementTagNameMap
    | FunctionComponent<P>
    | ComponentClass<P>
> {
  tag: WorkTag;
  key: null | string;
  type: T | null;
  stateNode: any;

  child: FiberNode | null;
  sibling: FiberNode | null;
  return: FiberNode | null;

  pendingProps: any;
  memoizedProps: any;
  memoizedState: any;

  alternate: FiberNode | null;
  flags: Flags;

  firstEffect: FiberNode | null;
  lastEffect: FiberNode | null;
  nextEffect: FiberNode | null;

  updateQueue?: UpdateQueue;
  instance: ResolveFiberInstanceProperty<T>;
  ref?: RefObject<any> | RefFunction<any> | null;

  $$typeof: symbol;
}

interface FiberNodeConstructor {
  new (tag: WorkTag, pendingProps: any, key: any): FiberNode;
  createFiber(
    tag: WorkTag,
    pendingProps: any,
    key: any,
    type: FiberNode["type"],
    child?: FiberNode | null,
    sibling?: FiberNode | null,
    preturn?: FiberNode | null
  ): FiberNode;
  createHostRootFiber(): FiberNode;
  createFiberFromPrimitive(element: Primitive): FiberNode;
  createFiberFromElement(element: Element): FiberNode;
  createWorkInProgress(oldFiber: FiberNode, props: any): FiberNode;
}

export type {
  ComponentClass,
  Element,
  FiberNode,
  FiberNodeConstructor,
  FunctionComponent,
  Node,
  Primitive,
  ReconcilerAttributeChangeModel,
  ReconcilerAttributeChange,
  UpdateQueue,
};
