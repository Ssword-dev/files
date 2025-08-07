import {
  // * This class is a class that auto adjust
  // * name of the error based on subclass's name.
  BaseError,
} from "./bases.js";

// ! Things that need special conversion should be listed here
// ! This is created as an object with null prototype because
// ! some keys (like __proto__) causes unexpected behaviour
/** @type {Record<string, string>} */
const evtSpecMap = Object.create(null);

/**
 * evt name (camel) -> spec compatible name
 */
function evtToSpecCompat(name) {
  if (typeof name !== "string") return null;

  if (typeof evtSpecMap[name] === "string") {
    return evtSpecMap[name];
  }

  return name.slice(2).toLowerCase();
}

function createIntrinsicElement(type, properties = {}, ...children) {
  const node = document.createElement(type);

  for (const p in properties) {
    const value = properties[p];
    const thirdCharPoint = p.charCodeAt(2);

    // * detects if its a listener property
    if (
      p[0] === "o" &&
      p[1] === "n" &&
      thirdCharPoint >= 65 &&
      thirdCharPoint <= 90
    ) {
      const eventName = evtToSpecCompat(p);
      if (eventName && typeof value === "function") {
        node.addEventListener(eventName, value);
      }
    } else {
      node.setAttribute(p, String(value));
    }
  }

  for (const child of children) {
    node.append(
      typeof child === "string" ? document.createTextNode(child) : child,
    );
  }

  return node;
}

function createFunctionalComponentElement(type, properties = {}, ...children) {
  /** @type {Record<string, any>} */
  const newProps = {};
  Object.assign(newProps, properties, { children });
  return type(newProps);
}

// symbolic components
const symbols = {
  fragment: Symbol.for("fragment"),
};

function createSymbolicComponent(type, properties = {}, ...children) {
  switch (type) {
    case symbols.fragment:
      const frag = document.createDocumentFragment();

      for (const child of children) {
        frag.appendChild(child);
      }

      return frag;

    default:
      return null;
  }
}

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

class SemanticFunctionError extends BaseError {
  /** super */
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

  return createIntrinsicElement(type, ...args); // pass directly.
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

export default utils;
