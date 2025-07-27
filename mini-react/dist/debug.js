import path from "path";
import { FiberNode } from "./fiber";
import { ReconciliationEngine } from "./reconciler";
import fs from "fs";
import { createElement } from "element";
function createDebugHost() {
    return {
        createInstance: function (type, props) { },
        createText: function (contents) { },
        removeChild: function (parent, node) { },
        removeText: function (parent, node) { },
        addAttribute: function (target, name, value) { },
        setAttribute: function (target, name, value) { },
        removeAttribute: function (target, name) { },
        addChild(parent, node) { },
        addText(parent, node) { },
    };
} // stub host that doesn't use DOM
// config
const MAX_EXECUTION_TIME_MS = 10000; // 3s timeout for hang detection
// timeout killer
const hangTimeout = setTimeout(() => {
    console.error("[reconciler-debug] detected hang — killing process");
    const jsonState = JSON.stringify(reconciler.state);
    // record state
    fs.writeFileSync(path.join(process.cwd(), "reconciler-state.json"), jsonState);
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
rootFiber.child = FiberNode.createFiberFromElement(createElement("div", {}, "Hello world!"));
reconciler.scheduleWorkOnFiber(rootFiber);
clearHangDetector();
