import { FiberNode } from "../models";
import { ReconcilerHost } from "../reconciler";
import { WorkTag } from "../workTags";
import { ReconcilerState } from "./host";

function commitPlacement(
  fiber: FiberNode,
  parent: any,
  state: ReconcilerState,
  host: ReconcilerHost
) {
  function insertAllChildren(fiber: FiberNode, parentDom: any) {
    let child = fiber.child;

    while (child) {
      if (child.tag === WorkTag.HostComponent) {
        host.addChild(parentDom, child.stateNode);
        insertAllChildren(child, child.stateNode);
      } else if (child.tag === WorkTag.HostText) {
        host.addText(parentDom, child.stateNode);
      }

      child = child.sibling;
    }
  }

  if (fiber.tag === WorkTag.HostComponent) {
    host.addChild(parent, fiber.stateNode);
    insertAllChildren(fiber, fiber.stateNode);
  } else if (fiber.tag === WorkTag.HostText) {
    host.addText(parent, fiber.stateNode);
  }
}

export default commitPlacement;
