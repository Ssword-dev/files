import { ReconcilerHost, ReconciliationEngine } from "./engine/index";
import { WorkTag } from "./workTags";
import { FiberNode } from "./fiber";

function render(element: any, container: HTMLElement) {
  const hostConfig: ReconcilerHost<HTMLElement, Text> = {
    createInstance(type: string, props: any) {
      const el = document.createElement(type);
      for (const key in props) {
        if (key !== "children") {
          el.setAttribute(key, props[key]);
        }
      }

      console.log("Creating instance:", el);
      return el;
    },

    createText(content: string) {
      return document.createTextNode(content);
    },

    removeChild(parent: HTMLElement, child: HTMLElement) {
      parent.removeChild(child);
    },

    removeText(parent: HTMLElement, textNode: Text) {
      parent.removeChild(textNode);
    },

    addAttribute(target: HTMLElement, name: string, value: any) {
      target.setAttribute(name, value);
    },

    setAttribute(target: HTMLElement, name: string, value: any) {
      target.setAttribute(name, value);
    },

    removeAttribute(target: HTMLElement, name: string) {
      target.removeAttribute(name);
    },

    willPerformUnitOfWork() {
      console.log("Performing unit of work....");
    },

    willCommitUnitOfWork() {
      console.log("Commiting unit of work...");
    },
    addChild: function (parent: HTMLElement, node: HTMLElement): void {
      parent.appendChild(node);
    },
    addText: function (parent: HTMLElement, node: Text): void {
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

  (document.documentElement as any).__DEV_CAUSE_RERENDER = __DEV_CAUSE_RERENDER;
  (globalThis as any).__DEV_CAUSE_RERENDER = __DEV_CAUSE_RERENDER;
}

export { render };
