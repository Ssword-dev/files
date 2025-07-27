import { Flags } from "../flags";
import { getHostParentFiber } from "../utils";
import commitDeletion from "./commitDeletion";
import commitPlacement from "./commitPlacement";
import commitUpdates from "./commitUpdates";
function commitWork(fiber, state, host) {
    const flags = fiber.flags;
    const parentFiber = getHostParentFiber(fiber);
    const parent = parentFiber?.stateNode;
    if (host.willCommitUnitOfWork) {
        host.willCommitUnitOfWork();
    }
    if (!parent)
        return;
    if (flags & Flags.Placement) {
        commitPlacement(fiber, parent, state, host);
    }
    if (flags & Flags.Update) {
        commitUpdates(fiber, state, host);
    }
    if (flags & Flags.Deletion) {
        commitDeletion(fiber, parent, state, host);
    }
    // clear the flag after applying
    fiber.flags = Flags.NoFlags;
}
export default commitWork;
