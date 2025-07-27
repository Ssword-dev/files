import { FiberNode } from "../fiber";
import { beginWork } from "./beginWork";
import completeUnitOfWork from "./completeUnitOfWork";
import { ReconcilerHost, ReconcilerState } from "./host";

function performUnitOfWork(
  fiber: FiberNode,
  state: ReconcilerState,
  host: ReconcilerHost
): FiberNode | null {
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
