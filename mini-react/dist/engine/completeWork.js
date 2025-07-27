import { WorkTag } from "../workTags";
/**
 * Creates the `stateNode` of the given fiber
 */
function completeWork(fiber, state, host) {
    // there is no use of recreating
    // if there is already a stateNode
    if (!fiber.stateNode) {
        if (!fiber.return) {
            return; // root
        }
        switch (fiber.tag) {
            case WorkTag.HostText:
                // pendingProps stores the value of the primitive
                fiber.stateNode = host.createText(fiber.pendingProps);
                break;
            // div, span, etc
            case WorkTag.HostComponent:
                const type = fiber.type;
                if (typeof type !== "string") {
                    throw new Error(`A fiber with tag HostComponent has typeof type '${typeof type}', expected 'string'`);
                }
                fiber.stateNode = host.createInstance(type, fiber.pendingProps);
                break;
        }
    }
}
export default completeWork;
