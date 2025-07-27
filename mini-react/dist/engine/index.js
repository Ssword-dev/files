// TODO: Fragmentize this to improve code clarity later
import createFiberUpdateScheduleFunction from "./createFiberUpdateSchedulerFunction";
// * Explicit cast to reflect what it actually does at runtime
const ReconciliationEngine = function __local_reconciliation_engine_constructor(host) {
    // FIXME: Fix infinite loop problem somewhere
    const state = {
        workInProgress: null,
        workInProgressRoot: null,
        _workDepth: 0,
        get workDepth() {
            return this._workDepth;
        },
        set workDepth(value) {
            if (value > 20) {
                throw new Error("Depth too much to handle");
            }
            this._workDepth = value;
        },
    };
    this.state = state; // head
    this.host = host;
    this.scheduleWorkOnFiber = createFiberUpdateScheduleFunction(state, host);
};
export { ReconciliationEngine };
