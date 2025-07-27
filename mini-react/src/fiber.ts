import { Flags } from "./flags";
import { WorkTag } from "./workTags";
import {
  Element,
  FiberNodeConstructor,
  FiberNode as IFiberNode,
  Primitive,
} from "./models";
import { isClassComponent, isPrimitive } from "./utils";
import { symbols } from "./symbols";

/**
 * @internal
 * ! This should not be called directly ANYWHERE, instead, use the static methods.
 */
const FiberNode: FiberNodeConstructor = function __local_fiber_constructor(
  this: IFiberNode,
  tag: WorkTag,
  pendingProps: object,
  key: any
) {
  this.tag = tag;
  this.key = key;
  this.type = null;
  this.stateNode = null;
  this.child = null;
  this.sibling = null;
  this.return = null;
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.memoizedState = null;
  this.alternate = null;
  this.flags = 0;
  this.firstEffect = null;
  this.lastEffect = null;
  this.instance = null;

  this.$$typeof = symbols.fiberNode;

  if (tag === WorkTag.HostRoot) {
    this.updateQueue = {
      baseState: null,
      shared: {
        pending: null,
      },
    };
  }

  if (tag === WorkTag.HostComponent || tag === WorkTag.ForwardRef) {
    this.ref = null;
  }
} as unknown as FiberNodeConstructor;

FiberNode.createFiber = function createFiber(
  tag: WorkTag,
  pendingProps: object,
  key: any,
  type: keyof HTMLElementTagNameMap,
  child: IFiberNode | null = null,
  sibling: IFiberNode | null = null,
  preturn: IFiberNode | null = null
) {
  const fiber = new FiberNode(tag, pendingProps, key);
  fiber.type = type;
  fiber.child = child || null;
  fiber.sibling = sibling || null;
  fiber.return = preturn || null;
  return fiber;
};

FiberNode.createHostRootFiber = function createHostRootFiber() {
  const root = this.createFiber(WorkTag.HostRoot, {}, null, null, null);
  root.$$typeof = symbols.fiberRootNode;
  return root;
};

FiberNode.createFiberFromPrimitive = function (node: Primitive) {
  return this.createFiber(WorkTag.HostText, node, null, null);
};

FiberNode.createFiberFromElement = function (element: Element) {
  const { type, props, key, ref } = element;

  const fiber = this.createFiber(
    isClassComponent(type) ? WorkTag.ClassComponent : WorkTag.FunctionComponent,
    props,
    key,
    type,
    null
  );

  fiber.ref = ref;

  console.log("[Fiber Creation] (from element to ElementFiber)");
  return fiber;
};

FiberNode.createWorkInProgress = function (old, props) {
  if (!old.alternate) {
    old.alternate = this.createFiber(
      old.tag,
      old.pendingProps,
      old.key,
      old.type,
      old.child,
      old.sibling,
      old.return
    );

    Object.assign(old.alternate, old);
    old.alternate.pendingProps = props;
  }

  return old.alternate;
};

type FiberNode = IFiberNode;

export { FiberNode };
