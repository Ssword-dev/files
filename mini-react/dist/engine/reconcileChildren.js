import { FiberNode } from "../fiber";
import { Flags } from "../flags";
import { isPrimitive } from "../utils";
function reconcileChildren(parentFiber, children, state) {
    state.workDepth++;
    let prevFiber = null;
    let oldFiber = parentFiber.child;
    let childIndex = 0;
    const childArray = Array.isArray(children) ? children : [children];
    for (const child of childArray) {
        let newFiber = null;
        const sameType = oldFiber &&
            typeof child === "object" &&
            child !== null &&
            child.type === oldFiber.type;
        // reuse old fiber if same type
        if (sameType) {
            newFiber = FiberNode.createWorkInProgress(oldFiber, child.props);
            newFiber.return = parentFiber;
        }
        else {
            // delete the old fiber
            if (oldFiber) {
                oldFiber.flags |= Flags.Deletion;
            }
            // create new fiber
            if (isPrimitive(child)) {
                newFiber = FiberNode.createFiberFromPrimitive(child);
            }
            else if (typeof child === "object" && child !== null) {
                newFiber = FiberNode.createFiberFromElement(child);
            }
            if (newFiber) {
                newFiber.flags |= Flags.Placement; // <-- important: mark for placement
                newFiber.return = parentFiber;
            }
        }
        if (prevFiber) {
            prevFiber.sibling = newFiber;
        }
        else {
            parentFiber.child = newFiber;
        }
        prevFiber = newFiber;
        oldFiber = oldFiber?.sibling ?? null;
        childIndex++;
    }
    // any remaining old fibers should be deleted
    while (oldFiber) {
        oldFiber.flags |= Flags.Deletion;
        oldFiber = oldFiber.sibling;
    }
}
export default reconcileChildren;
