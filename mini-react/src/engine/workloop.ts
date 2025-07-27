import { ReconcilerHost } from "../engine";
import commitRoot from "./commitRoot";
import { ReconcilerState } from "./host";
import performUnitOfWork from "./performUnitOfWork";

function workLoop(state: ReconcilerState, host: ReconcilerHost) {
  while (state.workInProgress !== null) {
    if (host.willPerformUnitOfWork) {
      host.willPerformUnitOfWork();
    }

    state.workInProgress = performUnitOfWork(state.workInProgress, state, host);
  }

  if (state.workInProgress === null && state.workInProgressRoot !== null) {
    commitRoot(state.workInProgressRoot, state, host);

    // reset after commit
    state.workInProgressRoot = null;
  }

  state.workDepth = 0;
}

export default workLoop;
