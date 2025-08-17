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
  return {
    type: type,
    properties: newProps,
    children: children,
  };
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

export {
  createFunctionalComponentElement,
  createIntrinsicElement,
  createSymbolicComponent,
};
