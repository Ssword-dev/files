import { FiberNode } from "./fiber.js";
import { symbols } from "./symbols.js";
function createFiberRootNode(container, tag) {
    // sanity checks
    if (!(container instanceof Node)) {
        throw new Error("the provided container is not a Node");
    }
    const host = FiberNode.createHostRootFiber();
    const self = {
        containerInfo: container,
        current: host, // fiber
        tag,
        dispose() {
            delete self.containerInfo.___FIBER_SOURCE;
        },
        $$typeof: symbols.fiberRootNode,
    };
    self.containerInfo.___FIBER_SOURCE = self;
    return self;
}
export { createFiberRootNode };
