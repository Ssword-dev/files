function generateRandomString(length, characters) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function globalNamespaceRegistry(name, value) {
  if (!value) {
    return globalNamespaceRegistry.namespaces[name];
  }

  globalNamespaceRegistry.namespaces[name] = value;
}

globalNamespaceRegistry.namespaces = {};
globalNamespaceRegistry.createNamespace = function () {
  const p = generateRandomString(
    1,
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  );
  let n = generateRandomString(
    9,
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-",
  );
  while (this.namespaces[p + n]) {
    n = generateRandomString(
      n.length + 1,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-",
    );
  }

  return p + n;
};
const SELECTORS = {
  ROOT: "div#template-group-root",
  TEMPLATE_ROOT: "template",
  TEMPLATE_STYLE: "style",
  TEMPLATE_SCRIPT: "script",
  TEMPLATE_BODY: 'div[role="template-body"]',
};

function createStylesheet(css, namespace) {
  const raw = new CSSStyleSheet();
  raw.replaceSync(css);

  const sheet = new CSSStyleSheet();

  for (const rule of raw.cssRules) {
    if (rule instanceof CSSStyleRule) {
      const scopedSelector = rule.selectorText
        .split(",")
        .map((sel) => `.${namespace} ${sel.trim()}`)
        .join(", ");
      sheet.insertRule(`${scopedSelector} { ${rule.style.cssText} }`);
    } else {
      sheet.insertRule(rule.cssText);
    }
  }

  return sheet;
}

function stylesheetToString(sheet) {
  return Array.from(sheet.cssRules)
    .map((rule) => rule.cssText)
    .join("\n");
}

function enqueueStylesheetInsertion(css, namespace) {
  const styleElement = document.createElement("style");
  const nss = createStylesheet(css, namespace);

  styleElement.innerText = stylesheetToString(nss);
  document.head.appendChild(styleElement);
  $(styleElement).attr("data-template-style-id", namespace["templateId"]);
}

function parseTemplateFormat(id, collection) {
  const root = $(collection);
  const body = root.filter(SELECTORS.TEMPLATE_BODY).last();
  const style = root.filter(SELECTORS.TEMPLATE_STYLE).last();
  const scriptEl = root.filter(SELECTORS.TEMPLATE_SCRIPT).last();
  const ns = globalNamespaceRegistry.createNamespace();
  return {
    templateId: id,
    namespace: ns,
    body,
    style,
    script: scriptEl,
  };
}

function parseTemplateFile(xmlString) {
  window.xmls = xmlString;
  const xml = $(xmlString);
  return Object.fromEntries(
    $(xml)
      .children("template")
      .toArray()
      .map((el) => [
        $(el).attr("id").split(" ")[0], // only take first id
        parseTemplateFormat($(el).attr("id").split(" ")[0], $(el).contents()), // parse in template format
      ]),
  );
}

window.parseTemplateFile = parseTemplateFile;

function createFromTemplate(temp) {
  const body = $(temp["body"]);
  const style = $(temp["style"]);
  const scriptEl = $(temp["script"]);
  const id = temp["templateId"];
  const namespace = temp["namespace"];

  // lazy load all styles.
  if (style.length && !$(`head style[data-template-style-id="${id}"]`).length) {
    enqueueStylesheetInsertion(style.text(), namespace);
  }

  const script = scriptEl.text();
  if (script) {
    const initFn = new Function(script);
    initFn();
  }

  return $(body)
    .clone(true)
    .children()
    .each((i, e) => $(e).addClass(namespace));
}

window.parseTemplateFile = parseTemplateFile;
export { parseTemplateFile, createFromTemplate };
