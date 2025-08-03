const { sources, Compilation } = require("webpack");

// casual parsing html
const cheerio = require("cheerio");

// casual parsing css
const postcss = require("postcss");
const selectorParser = require("postcss-selector-parser");
// fs stuff
const fs = require("fs").promises;
const fg = require("fast-glob");

// config stuff
const postcssrc = require("postcss-load-config");

// name mangling plugin & walker
class JXNameMangler {
  constructor() {
    this._dictionary = Object.create(null);
    this.transform = selectorParser((selectors) => {
      selectors.walkClasses((classNode) => {
        classNode.value = this.translate(classNode.value);
        classNode.spaces.before = "";
        classNode.spaces.after = "";
      });
    });
  }

  generateRandomString(length, characters) {
    let result = "";
    while (result.length < length) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  translate(name) {
    if (!this._dictionary[name]) {
      const len = name.length || 1;
      const first = this.generateRandomString(
        1,
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      );
      const rest = this.generateRandomString(
        len - 1,
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-",
      );
      this._dictionary[name] = first + rest;
    }
    return this._dictionary[name];
  }

  // DFS html class mangling
  mangleHtml(root, $) {
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      const tag = node[0] && node[0].tagName;
      if (tag === "style" || tag === "script") continue;
      const cls = node.attr("class");
      if (cls) {
        const mangled = cls
          .split(/\s+/)
          .filter(Boolean)
          .map((c) => this.translate(c))
          .join(" ");
        node.attr("class", mangled);
      }

      node
        .children()
        .toArray()
        .forEach(
          /** @param {cheerio.Cheerio} child */ (child) => stack.push($(child)),
        );
    }
  }

  // PostCSS plugin to mangle css selectors
  pluginFactory() {
    const transform = this.transform;
    return {
      postcssPlugin: "jx-selector-mangler",
      Rule(rule) {
        try {
          rule.selector = transform.processSync(rule.selector);
        } catch (_) {
          // ignore invalid selectors
        }
      },
    };
  }
}

class JXBundler {
  constructor(context) {
    /** @type {{cheerio: import('cheerio').CheerioAPI, style: string}} */
    this.context = context;
    this.mangler = new JXNameMangler();
  }

  async addToBundle(template) {
    const $tpl = cheerio.load(template, {}, false);
    const $ = this.context.cheerio;

    const root = $tpl(
      $tpl($tpl.root().get(0)), // refers to the root itself
    );

    const $el = $tpl(root).children("template").first();
    const $styles = $tpl(root).children("style");

    // clone for html
    const htmlClone = $el.clone();
    htmlClone.find("style, script").remove();
    htmlClone.html(); // i think cheerio is lazy, this is needed, dont know why.
    // mangle classes
    this.mangler.mangleHtml(htmlClone, $tpl);

    $("#template-group").append(htmlClone.html());

    // clone for css
    const cssClone = $el.clone();
    const styles = $styles
      .map((i, s) => $tpl(s).text())
      .get()
      .join("\n");

    // console.log(`Styles: ${styles}`);
    // console.log(`Style Elements: ${cssClone.filter("style")}`);
    // console.log(`Css Clone: ${cssClone.html()}`);
    this.context.style += await this.processCss(styles);
  }

  async processCss(cssText) {
    let plugins = [],
      options = { from: undefined };
    try {
      ({ plugins, options } = await postcssrc());
    } catch {}
    plugins.push(this.mangler.pluginFactory());
    const result = await postcss(plugins).process(cssText, options);
    return result.css || "";
  }

  reportLint() {}
}

class JXTemplatePlugin {
  constructor(options = {}) {
    this.input = options.input || [];
    this.output = options.output || "bundle.template";
    this.CONSTANTS = {
      STATIC_TEMPLATE_BLANK: '<div id="template-group"></div>',
    };
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("JXTemplatePlugin", (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: "JXTemplatePlugin",
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        async () => {
          const dom = cheerio.load(
            this.CONSTANTS.STATIC_TEMPLATE_BLANK,
            {},
            false,
          );
          const context = { cheerio: dom, style: "" };
          const bundler = new JXBundler(context);
          const files = await fg(this.normalizeArray(this.input), {
            cwd: process.cwd(),
          });
          for (const f of files) {
            try {
              const content = await fs.readFile(f, "utf8");
              await bundler.addToBundle(content);
            } catch (e) {
              compilation.errors.push(e);
            }
          }
          compilation.emitAsset(this.output, new sources.RawSource(dom.html()));
          compilation.emitAsset(
            "template-bundle.css",
            new sources.RawSource(context.style),
          );
        },
      );
    });
  }

  normalizeArray(items) {
    return Array.isArray(items) ? items : [items];
  }
}

module.exports = JXTemplatePlugin;
