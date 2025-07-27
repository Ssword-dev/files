// TODO: Fragmentize this to improve code clarity later

import { FiberNode } from "../fiber";
import { Flags } from "../flags";
import {
  ComponentClass,
  FunctionComponent,
  Node,
  ReconcilerAttributeChange,
} from "../models";
import { symbols } from "../symbols";
import type { ReconcilerHost, ReconcilerState } from "./host";
import {
  defaultDiff,
  getHostParentFiber,
  isClassComponent,
  isPrimitive,
} from "../utils";
import { WorkTag } from "../workTags";
import {
  InternalReconciliationEngineStruct,
  ReconciliationEngineConstructor,
} from "./constructor";
import createFiberUpdateScheduleFunction from "./createFiberUpdateSchedulerFunction";

// * Explicit cast to reflect what it actually does at runtime
const ReconciliationEngine = function __local_reconciliation_engine_constructor(
  this: InternalReconciliationEngineStruct,
  host: ReconcilerHost
) {
  // FIXME: Fix infinite loop problem somewhere
  const state: ReconcilerState = {
    workInProgress: null,
    workInProgressRoot: null,
    _workDepth: 0,
    get workDepth() {
      return this._workDepth;
    },
    set workDepth(value: number) {
      if (value > 20) {
        throw new Error("Depth too much to handle");
      }

      this._workDepth = value;
    },
  };

  this.state = state; // head
  this.host = host;

  this.scheduleWorkOnFiber = createFiberUpdateScheduleFunction(state, host);
} as unknown as ReconciliationEngineConstructor;

export { ReconciliationEngine };
export { ReconcilerHost };
