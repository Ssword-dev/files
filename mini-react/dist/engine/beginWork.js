import { symbols } from "../symbols";
import { isClassComponent } from "../utils";
import reconcileChildren from "./reconcileChildren";
function beginWork(fiber, state, host) {
    state.workDepth++;
    const type = fiber.type;
    if (typeof type === "function") {
        let children;
        if (isClassComponent(type)) {
            fiber.instance = new type(fiber.pendingProps);
            children = fiber.instance.render(); // call the render method
        }
        else {
            children = type(fiber.pendingProps);
        }
        reconcileChildren(fiber, children, state);
    }
    else if (typeof type === "string") {
        fiber.stateNode = host.createInstance(type, fiber.pendingProps);
    }
    else if (typeof type === "symbol") {
        // todo: implement fragment, etc
    }
    else {
        if (fiber.$$typeof !== symbols.fiberRootNode) {
            throw new Error(`Invalid type, expected a function or a class for composite components, or a string for intrinsic components. received: ${typeof type}`);
        }
    }
    return fiber.child;
}
export { beginWork };
