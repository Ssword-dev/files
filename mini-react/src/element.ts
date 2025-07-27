// element.js
import { Element, Node } from "./models";
import { RefFunction, RefObject } from "./ref";
import { symbols } from "./symbols";

export function createElement(
  type: any,
  config: any = {},
  ...children: Node[]
): Element {
  let key = config.key ?? null;
  let ref = config.ref ?? null;
  const props: any = {};

  for (const prop in config) {
    if (prop !== "key" && prop !== "ref") {
      props[prop] = config[prop];
    }
  }

  props.children = Array.isArray(children) ? children : [children];

  if (typeof ref === "object" && ref !== null) {
    ref.current = null;
  }

  return {
    $$typeof: symbols.element,
    type,
    key,
    ref,
    props,
  };
}

export const Fragment = symbols.fragment;
