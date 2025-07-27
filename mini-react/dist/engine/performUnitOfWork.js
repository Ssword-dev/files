import { beginWork } from "./beginWork";
import completeUnitOfWork from "./completeUnitOfWork";
function performUnitOfWork(fiber, state, host) {
    // phase 1: begin work (has subphases btw)
    const next = beginWork(fiber, state, host);
    // phase 2: go deeper in the tree if there is a child
    if (next !== null) {
        return next; // move down the tree
    }
    // phase 3: no child, bubble up and complete
    // this climbs back up to the root
    return completeUnitOfWork(fiber, state, host);
}
export default performUnitOfWork;
