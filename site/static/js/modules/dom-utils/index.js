"use strict";

import { cls } from "./classname-utils";
import {
  createFunctionalComponentElement,
  createIntrinsicElement,
  createSymbolicComponent,
} from "./factories";
import { reactive, subscribe } from "./reactive";
import style from "./style-utils";
import symbols from "./symbols";

/**
 * Utility function to create HTML elements with optional properties and children.
 *
 * Also a namespace.
 * it allows building dom elements in a more abstract way
 * that is easy to visualize.
 *
 * @template {(keyof HTMLElementTagNameMap} T
 * @param {T | Function} type - HTML tag name (e.g. 'div') or a function component
 * @param {Partial<HTMLElementTagNameMap[T]> | Record<string, any>} properties - Element attributes or props
 * @param {...(HTMLElement | string)} children - Any number of children nodes or text
 * @returns {HTMLElementTagNameMap[T] | HTMLElement}
 */
function utils(type, properties = {}, ...children) {
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

/**
 * Creates a text node from any value.
 *
 * @param {any} s
 * @returns {Text}
 */
utils.text = function text(s) {
  return document.createTextNode(String(s));
};

/**
 * An alias (not really) to `utils`.
 *
 * this is used for creating intrinsic elements.
 */
utils.element = function element(type, ...args) {
  if (typeof type !== "string") {
    throw new SemanticFunctionError(
      "`utils.element` should only be used to create intrinsic elements!",
    );
  }

  return createIntrinsicElement(type, ...args);
};

/**
 *
 * @param  {...HTMLElement} children
 * @returns {DocumentFragment}
 */
utils.fragment = function fragment(...children) {
  return this(symbols.fragment, {}, ...children);
};

/**
 * An alias to `utils.fragment` for semantics/readability.
 */
utils.root = utils.fragment;

utils.class = cls;
utils.reactive = reactive;
utils.subscribe = subscribe;
utils.style = style;

export default utils;
