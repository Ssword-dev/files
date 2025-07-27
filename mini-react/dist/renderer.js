import { ReconciliationEngine } from "./engine/index";
import { FiberNode } from "./fiber";
function render(element, container) {
    const hostConfig = {
        createInstance(type, props) {
            const el = document.createElement(type);
            for (const key in props) {
                if (key !== "children") {
                    el.setAttribute(key, props[key]);
                }
            }
            console.log("Creating instance:", el);
            return el;
        },
        createText(content) {
            return document.createTextNode(content);
        },
        removeChild(parent, child) {
            parent.removeChild(child);
        },
        removeText(parent, textNode) {
            parent.removeChild(textNode);
        },
        addAttribute(target, name, value) {
            target.setAttribute(name, value);
        },
        setAttribute(target, name, value) {
            target.setAttribute(name, value);
        },
        removeAttribute(target, name) {
            target.removeAttribute(name);
        },
        willPerformUnitOfWork() {
            console.log("Performing unit of work....");
        },
        willCommitUnitOfWork() {
            console.log("Commiting unit of work...");
        },
        addChild: function (parent, node) {
            parent.appendChild(node);
        },
        addText: function (parent, node) {
            parent.appendChild(node);
        },
    };
    const engine = new ReconciliationEngine(hostConfig);
    const rootFiber = FiberNode.createHostRootFiber();
    rootFiber.stateNode = container;
    rootFiber.pendingProps = { children: [element] };
    engine.scheduleWorkOnFiber(rootFiber);
    function __DEV_CAUSE_RERENDER() {
        return engine.scheduleWorkOnFiber(rootFiber);
    }
    document.documentElement.__DEV_CAUSE_RERENDER = __DEV_CAUSE_RERENDER;
    globalThis.__DEV_CAUSE_RERENDER = __DEV_CAUSE_RERENDER;
}
export { render };
