import { ReconcilerAttributeChange, FiberNode } from "../models";

/**
 * A reconciler environment. a layer of interop between the reconciler
 * and the environment it is used in. it describes
 * to the reconciler how to create, remove, and modify a
 * DOM node. primarily used to render
 * elements in the DOM.
 */
interface ReconcilerEnvironment<DT = any, DTT = any> {
  // ! loose types

  /**
   * @param type The type of tag name of what to create. e.g: `div`
   * @param props The props used in the jsx. note, this may or may not include listeners
   */
  createInstance(type: string, props: any): DT;

  /**
   * @param contents A primitive value
   * @returns A DOM text object
   */
  createText(contents: any): DTT;

  /**
   * @param parent The parent node for the new node
   * @param node The child node to be added
   */
  addChild(parent: DT, node: DT): void;

  /**
   * @param parent The parent node that has the given node to be removed
   * @param node The child node to be removed
   */
  removeChild(parent: DT, node: DT): void;

  /**
   * @param parent The parent node that has the text node that is to be added
   * @param node the text node to added
   */
  addText(parent: DT, node: DTT): void;

  /**
   * @param parent The parent node that has the text node that is to be removed
   * @param node the text node to be removed
   */
  removeText(parent: DT, node: DTT): void;

  /**
   * A custom diffing implementation
   * @param oldProps The old props
   * @param newProps The new props
   */
  diffProps?(oldProps: object, newProps: object): ReconcilerAttributeChange;

  /**
   * Adds an attribute to a given target node
   */
  addAttribute(target: DT, name: string, value: any): void;

  /**
   * Sets an attribute to a given value to the target node
   */
  setAttribute(target: DT, name: string, value: any): void;

  /**
   * Removes an attribute from the target node
   */
  removeAttribute(target: DT, name: string): void;

  willPerformUnitOfWork?(): void;
  willCommitUnitOfWork?(): void;
}

interface ReconcilerState {
  workInProgress: FiberNode | null;
  workInProgressRoot: FiberNode | null;
  workDepth: number;
  [key: string]: any;
}

interface ReconcilerHost<DT = any, DTT = any>
  extends ReconcilerEnvironment<DT, DTT> {}

export type { ReconcilerEnvironment, ReconcilerHost, ReconcilerState };
