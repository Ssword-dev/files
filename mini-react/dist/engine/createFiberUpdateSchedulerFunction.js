import workLoop from "./workloop";
function createFiberUpdateScheduleFunction(state, host) {
    let workloopIdleCallback = function () {
        return workLoop(state, host);
    };
    return function scheduleUpdateOnFiber(root) {
        state.workInProgressRoot = root;
        state.workInProgress = root;
        // requestIdleCallback(workloopIdleCallback);
        workloopIdleCallback();
    };
}
export default createFiberUpdateScheduleFunction;
