import { WorkTag } from "../workTags";
function commitDeletion(fiber, parent, state, host) {
    if (fiber.tag === WorkTag.HostComponent || fiber.tag === WorkTag.HostText) {
        host.removeChild(parent, fiber.stateNode);
    }
    else {
        // for composite nodes, recursively delete host children
        let child = fiber.child;
        while (child) {
            commitDeletion(child, parent, state, host); // recurse
            child = child.sibling;
        }
    }
}
export default commitDeletion;
