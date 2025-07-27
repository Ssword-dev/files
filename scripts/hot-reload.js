/*
(EN)
This file contains the *development server*
that allows files to hot reload on file changes.
(although poorly put together, works... and i am not
fixing it... because it is not broken...)
*/

const { EventEmitter } = require("events");
const ansiStyles = require("ansi-styles").default;
const cc = require("change-case");
const chokidar = require("chokidar");
const WebSocket = require("ws");
const stripJsonComments = require("strip-json-comments").default;
const path = require("path");
const fs = require("fs");

class ConfigLoader {
  loadJsonConfig(configFile) {
    const configPath = path.resolve(process.cwd(), configFile);
    const contents = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(stripJsonComments(contents));
  }
}

const loader = new ConfigLoader();

class Logger {
  preprocess(s, context) {
    return s.replace(
      /\\(?<command>\w+)(?:\[(?<parameter>\w+)\])?(?<text>[^\\;]*)(?:;)?/gs,
      (...args) => {
        const groups = args.at(-1);
        const { command: cmd, parameter: param, text } = groups;

        if (!param) return text;

        if (
          cmd !== "style" &&
          ["underline", "strikethrough", "bold", "italic"].includes(param)
        ) {
          throw new Error(
            `invalid command: used '${param}' on \\${cmd}, but it's a style modifier`,
          );
        }

        switch (cmd) {
          case "color":
          case "style":
            return (
              ansiStyles[param]?.open + text + ansiStyles[param]?.close || text
            );
          case "bg":
            const bgKey = "bg" + cc.pascalCase(param);
            return (
              ansiStyles[bgKey]?.open + text + ansiStyles[bgKey]?.close || text
            );
          case "endcolor":
            return ansiStyles.color.close + text;
          case "endbackground":
            return ansiStyles.bgColor.close + text;
          case "var":
            return String(context.variables?.[param] ?? args[0]);
          default:
            return args[0];
        }
      },
    );
  }

  log(o, context = { variables: {} }) {
    console.log(this.preprocess(String(o), context));
  }
  warn(o, context = { variables: {} }) {
    console.warn(this.preprocess(String(o), context));
  }
  error(o, context = { variables: {} }) {
    console.error(this.preprocess(String(o), context));
  }
}

const logger = new Logger();

// Abstract class. only extend. do not instantiate.
class DevelopmentServerModule {
  init(ds) {
    this.owner = ds;
  }
  dispose() {
    this.owner = null;
  }
  connect(ws) {}
  fsEvent(evt, path, stat) {}
}

class HotReloadModule extends DevelopmentServerModule {
  constructor() {
    super();
    this.config = loader.loadJsonConfig("dev-server.config.jsonc");
  }

  fsEvent(evt, path) {
    logger.log(
      this.config.texts?.["hot-reload"] ??
        "\\color[brightGreen][hot-reload] all client hot reloaded due to \\var[path]\\endcolor;",
      {
        variables: { evt, path },
      },
    );
    for (const client of this.owner.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload");
      }
    }
  }

  connect(ws) {
    logger.log("\\color[blue][hot-reload] client connected\\color[reset]");
  }
}

class DevelopmentServer extends EventEmitter {
  /**
   * @param {*} superOptions
   * @param {{watcherOptions: chokidar.ChokidarOptions & {paths: string[]}, serverOptions: {port: number}}} param1
   */
  constructor(superOptions, { watcherOptions, serverOptions }) {
    super(superOptions);
    const { paths, ignored, ...options } = watcherOptions;
    this.config = loader.loadJsonConfig("dev-server.config.jsonc");
    this.watcher = chokidar.watch(paths, {
      ignoreInitial: true,
      ignored: [...(ignored || []), ...(this.config.ignoreFiles || [])],
      ...options,
    });
    this.wss = new WebSocket.Server({ port: serverOptions.port });
    this.modules = new Set();
  }

  init() {
    this.watcher.on("all", (evt, path, stat) => {
      for (const mod of this.modules) {
        mod.fsEvent(evt, path, stat);
      }
    });

    this.watcher.on("ready", () => {
      logger.log("[watcher] ready and watching files...");
    });

    this.wss.on("connection", (ws, req) => {
      for (const mod of this.modules) {
        mod.connect?.(ws, req);
      }
    });

    for (const mod of this.modules) {
      mod.init?.(this);
    }

    logger.log(
      `[dev-server] started on ws://localhost:${this.wss.options.port}`,
    );
  }

  async term() {
    logger.log("[dev-server] shutting down...");
    this.wss.close();
    await this.watcher.close();
    for (const mod of this.modules) {
      mod.dispose?.();
    }
    process.exit(0);
  }

  handle() {
    return {
      init: this.init.bind(this),
      close: this.term.bind(this),
      use: (mod) => this.modules.add(mod),
    };
  }
}

const dev = new DevelopmentServer(
  {},
  {
    watcherOptions: {
      paths: ".",
      ignored: [".git\\**\\*"],
      awaitWriteFinish: true, // makes it wait for the writes... mainly here for css and js stuff
    },
    serverOptions: {
      port: 4008,
    },
  },
);

const { init, close, use } = dev.handle();
use(new HotReloadModule());

process.on("SIGINT", close).on("SIGTERM", close);
init();
