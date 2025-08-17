"use strict";

import { cls } from "./classname-utils";
import { SemanticFunctionError } from "./errors";
import {
  createFunctionalComponentElement,
  createIntrinsicElement,
  createSymbolicComponent,
} from "./factories";
import { reactive, subscribe } from "./reactive";
import style from "./style-utils";
import symbols from "./symbols";

// -------------------- types --------------------

type Properties = Record<string, any>;

type Child = any;
// -------------------- main callable --------------------

/**
 * utility function to create HTML elements with optional properties and children.
 * it is also a namespace for helper functions.
 */
function utils(
  type: string | symbol | ((props: any) => Node),
  properties: Properties = {},
  ...children: Child[]
) {
  switch (typeof type) {
    case "string":
      return createIntrinsicElement(type, properties, ...children);

    case "function":
      return createFunctionalComponentElement(type, properties, ...children);

    case "symbol":
      return createSymbolicComponent(type, properties, ...children);

    default:
      return null;
  }
}

export default utils;
