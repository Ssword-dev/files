import { WorkTag } from "./workTags";
import { isClassComponent } from "./utils";
import { symbols } from "./symbols";
/**
 * @internal
 * ! This should not be called directly ANYWHERE, instead, use the static methods.
 */
const FiberNode = function __local_fiber_constructor(tag, pendingProps, key) {
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
};
FiberNode.createFiber = function createFiber(tag, pendingProps, key, type, child = null, sibling = null, preturn = null) {
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
FiberNode.createFiberFromPrimitive = function (node) {
    return this.createFiber(WorkTag.HostText, node, null, null);
};
FiberNode.createFiberFromElement = function (element) {
    const { type, props, key, ref } = element;
    const fiber = this.createFiber(isClassComponent(type) ? WorkTag.ClassComponent : WorkTag.FunctionComponent, props, key, type, null);
    fiber.ref = ref;
    console.log("[Fiber Creation] (from element to ElementFiber)");
    return fiber;
};
FiberNode.createWorkInProgress = function (old, props) {
    if (!old.alternate) {
        old.alternate = this.createFiber(old.tag, old.pendingProps, old.key, old.type, old.child, old.sibling, old.return);
        Object.assign(old.alternate, old);
        old.alternate.pendingProps = props;
    }
    return old.alternate;
};
export { FiberNode };
