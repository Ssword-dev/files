import path from "path";
import { FiberNode } from "./fiber";
import { ReconcilerHost, ReconciliationEngine } from "./reconciler";
import fs from "fs";
import { createElement } from "element";

function createDebugHost(): ReconcilerHost<void, void> {
  return {
    createInstance: function (type: string, props: any): void {},
    createText: function (contents: any): void {},
    removeChild: function (parent: void, node: void): void {},
    removeText: function (parent: void, node: void): void {},
    addAttribute: function (target: void, name: string, value: any): void {},
    setAttribute: function (target: void, name: string, value: any): void {},
    removeAttribute: function (target: void, name: string): void {},
    addChild(parent, node) {},
    addText(parent, node) {},
  };
} // stub host that doesn't use DOM

// config
const MAX_EXECUTION_TIME_MS = 10000; // 3s timeout for hang detection

// timeout killer
const hangTimeout = setTimeout(() => {
  console.error("[reconciler-debug] detected hang — killing process");

  const jsonState = JSON.stringify(reconciler.state);

  // record state
  fs.writeFileSync(
    path.join(process.cwd(), "reconciler-state.json"),
    jsonState
  );
  process.kill(process.pid, "SIGTERM");
}, MAX_EXECUTION_TIME_MS);

// clear on success
function clearHangDetector() {
  clearTimeout(hangTimeout);
  console.log("[reconciler-debug] completed without hang");
}

// setup fake test
const host = createDebugHost();
const reconciler = new ReconciliationEngine(host);

const rootFiber = FiberNode.createHostRootFiber();

rootFiber.stateNode = null;
rootFiber.child = FiberNode.createFiberFromElement(
  createElement("div", {}, "Hello world!")
);

reconciler.scheduleWorkOnFiber(rootFiber);
clearHangDetector();
