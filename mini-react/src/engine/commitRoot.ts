import { ReconcilerHost } from "../engine";
import { FiberNode } from "../fiber";
import commitWork from "./commitWork";
import { ReconcilerState } from "./host";

function commitRoot(
  root: FiberNode,
  state: ReconcilerState,
  host: ReconcilerHost
) {
  let nextEffect = root.firstEffect;

  while (nextEffect !== null) {
    commitWork(nextEffect, state, host);
    nextEffect = nextEffect.nextEffect;
  }

  root.firstEffect = null;
  root.lastEffect = null;
}

export default commitRoot;
