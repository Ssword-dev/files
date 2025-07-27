import { ReconcilerHost } from "../engine";
import { Flags } from "../flags";
import { FiberNode } from "../models";
import { getHostParentFiber } from "../utils";
import commitDeletion from "./commitDeletion";
import commitPlacement from "./commitPlacement";
import commitUpdates from "./commitUpdates";
import { ReconcilerState } from "./host";

function commitWork(
  fiber: FiberNode,
  state: ReconcilerState,
  host: ReconcilerHost
) {
  const flags = fiber.flags;
  const parentFiber = getHostParentFiber(fiber);
  const parent = parentFiber?.stateNode;

  if (host.willCommitUnitOfWork) {
    host.willCommitUnitOfWork();
  }

  if (!parent) return;

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
