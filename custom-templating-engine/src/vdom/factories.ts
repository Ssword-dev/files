import { evtToSpecCompat } from "./events";
import { EffectNode, ElementNode, FunctionComponentNode, SymbolicNode, VirtualNode } from "./types";

function createIntrinsicElement(type, properties = {}, ...children): ElementNode {

  return {type, properties, children, parent: null, stateNode:null, alternate:null,};
}

function createFunctionalComponentElement(type, properties = {}, ...children): FunctionComponentNode {
  /** @type {Record<string, any>} */
  const newProps: Record<string, any> = {};
  Object.assign(newProps, properties, { children });
  return {
    type: type,
    properties: newProps,
    parent: null,
    stateNode: null,
    alternate: null,
  };
}

// symbolic components
const symbols = {
  fragment: Symbol.for("fragment"),
};

function createSymbolicComponent(type, properties = {}, ...children): SymbolicNode | null {
  switch (type) {
    case symbols.fragment:
      return {type: symbols.fragment, properties: properties, children: children, parent: null}

    default:
      return null;
  }
}

function createEffectNode<T extends VirtualNode | null>(value: T): EffectNode<T> {
  return {
  value,
  flag: 0,
  nextEffect: null
  }
}

function createEffectNodeHead(){
  return createEffectNode(null);
}

export {
  createFunctionalComponentElement,
  createIntrinsicElement,
  createSymbolicComponent,
  createEffectNode
};
