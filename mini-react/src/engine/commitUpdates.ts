import { FiberNode } from "../models";
import { defaultDiff } from "../utils";
import { WorkTag } from "../workTags";
import { ReconcilerHost, ReconcilerState } from "./host";

function commitUpdates(
  fiber: FiberNode,
  state: ReconcilerState,
  host: ReconcilerHost
) {
  // div, etc
  if (fiber.tag === WorkTag.HostComponent) {
    const oldProps = fiber.pendingProps;
    const newProps = fiber.alternate!.pendingProps;

    const changes = host.diffProps
      ? host.diffProps(oldProps, newProps)
      : defaultDiff(oldProps, newProps);

    for (const d of changes.deletions) {
      host.removeAttribute(fiber.stateNode, d);
    }

    for (const ak in changes.additions) {
      host.addAttribute(fiber.stateNode, ak, changes.additions[ak]);
    }

    for (const mk in changes.modifications) {
      host.setAttribute(fiber.stateNode, mk, changes.modifications[mk]);
    }
  }

  // TODO: implement other stuff
}

export default commitUpdates;
