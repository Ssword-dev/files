import { FiberNode } from "../models";
import { ReconcilerHost, ReconcilerState } from "./host";
import workLoop from "./workloop";

function createFiberUpdateScheduleFunction(
  state: ReconcilerState,
  host: ReconcilerHost
) {
  let workloopIdleCallback = function () {
    return workLoop(state, host);
  };

  return function scheduleUpdateOnFiber(root: FiberNode) {
    state.workInProgressRoot = root;
    state.workInProgress = root;

    // requestIdleCallback(workloopIdleCallback);
    workloopIdleCallback();
  };
}

export default createFiberUpdateScheduleFunction;
