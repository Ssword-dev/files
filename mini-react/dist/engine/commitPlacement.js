import { WorkTag } from "../workTags";
function commitPlacement(fiber, parent, state, host) {
    function insertAllChildren(fiber, parentDom) {
        let child = fiber.child;
        while (child) {
            if (child.tag === WorkTag.HostComponent) {
                host.addChild(parentDom, child.stateNode);
                insertAllChildren(child, child.stateNode);
            }
            else if (child.tag === WorkTag.HostText) {
                host.addText(parentDom, child.stateNode);
            }
            child = child.sibling;
        }
    }
    if (fiber.tag === WorkTag.HostComponent) {
        host.addChild(parent, fiber.stateNode);
        insertAllChildren(fiber, fiber.stateNode);
    }
    else if (fiber.tag === WorkTag.HostText) {
        host.addText(parent, fiber.stateNode);
    }
}
export default commitPlacement;
