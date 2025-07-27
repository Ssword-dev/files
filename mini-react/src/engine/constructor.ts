import { ReconcilerHost } from "../engine";
import { FiberNode } from "../models";
import { ReconcilerState } from "./host";

/**
 * Creates a new Reconciliation engine
 */
interface ReconciliationEngineConstructor {
  createReconciliationEngine(): ReconciliationEngine;
  new (host: ReconcilerHost): ReconciliationEngine;
}

/**
 *  A new Reconciliation engine.
 *
 * a Reconciliation engine is what powers most functionality of this
 * thingy (sorry dont know what to call it yet)
 */
interface ReconciliationEngine<HDT = any, HDTT = any> {
  scheduleWorkOnFiber(fiber: FiberNode): void;
  host: ReconcilerHost<HDT, HDTT>;
  state: ReconcilerState;
}

/**
 * The internal structure of the reconciliation engine.
 * may differ from what is shown in the public interface
 */
interface InternalReconciliationEngineStruct extends ReconciliationEngine {}

export type {
  InternalReconciliationEngineStruct,
  ReconciliationEngine,
  ReconciliationEngineConstructor,
};
