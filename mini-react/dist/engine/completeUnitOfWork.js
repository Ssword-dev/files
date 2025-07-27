import { Flags } from "../flags";
function completeUnitOfWork(fiber, state, host) {
    state.workDepth--;
    // this fiber is the deepest descendant of its branch (one of the tree's tail)
    let current = fiber;
    let iters = 0;
    do {
        // .return is a reference to the fiber up the tree
        const parentFiber = current.return;
        console.log(`CUOW iteration ${iters}`);
        if (parentFiber) {
            // stage 1: bubble up to the parent
            if (!parentFiber.firstEffect) {
                parentFiber.firstEffect = current.firstEffect;
            }
            if (current.lastEffect) {
                if (parentFiber.lastEffect) {
                    // this sets the next item of the effect list
                    parentFiber.lastEffect.nextEffect = current.firstEffect;
                }
                // sets the last parents's last effect to the current node's last effect
                // basically sets the tail of the effect list
                parentFiber.lastEffect = current.lastEffect;
            }
            // stage 2: collect effects
            // check if it has flags
            if (current.flags !== Flags.NoFlags) {
                if (parentFiber.lastEffect) {
                    // makes the parent's last effect next effect the current node because we ourself have an effect
                    parentFiber.lastEffect.nextEffect = current;
                }
                else {
                    // we are the first effect
                    parentFiber.firstEffect = current;
                }
                // sets as last effect in parent (basically .push but linked list)
                parentFiber.lastEffect = current;
            }
            const sibling = current.sibling;
            if (sibling) {
                return sibling; // work on the sibling next
            }
        }
        // go up 1 step, this occurs when there is no next in line sibling
        current = parentFiber;
        iters++;
    } while (
    // quite literally is what it looks like.
    // though for context, current is being assigned to the
    // parent per iteration, so this terminates when we have reached the root
    // of the tree
    current != null &&
        iters < 10000);
    return null;
}
export default completeUnitOfWork;
