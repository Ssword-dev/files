// TODO: Fragmentize this to improve code clarity later
import { FiberNode } from "./fiber";
import { Flags } from "./flags";
import { symbols } from "./symbols";
import {
  defaultDiff,
  getHostParentFiber,
  isClassComponent,
  isPrimitive,
} from "./utils";
import { WorkTag } from "./workTags";
// * Explicit cast to reflect what it actually does at runtime
const ReconciliationEngine = function __local_reconciliation_engine_constructor(
  host
) {
  const state = {
    workInProgress: null,
    workInProgressRoot: null,
    _workDepth: 0,
    get workDepth() {
      return this._workDepth;
    },
    set workDepth(value) {
      if (value > 20) {
        throw new Error("Depth too much to handle");
      }
      this._workDepth = value;
    },
  };
  this.state = state; // head
  this.host = host;
  function scheduleUpdateOnFiber(root) {
    state.workInProgressRoot = root;
    state.workInProgress = root;
    requestIdleCallback(workLoop);
  }
  function workLoop(deadline) {
    while (state.workInProgress !== null && deadline.timeRemaining() > 1) {
      if (host.willPerformUnitOfWork) {
        host.willPerformUnitOfWork();
      }
      state.workDepth = 0;
      state.workInProgress = performUnitOfWork(state.workInProgress);
    }
    if (state.workInProgress === null && state.workInProgressRoot !== null) {
      commitRoot(state.workInProgressRoot);
      // reset after commit
      state.workInProgressRoot = null;
    }
  }
  function performUnitOfWork(fiber) {
    // phase 1: begin work (has subphases btw)
    const next = beginWork(fiber);
    // phase 2: go deeper in the tree if there is a child
    if (next !== null) {
      return next; // move down the tree
    }
    // phase 3: no child, bubble up and complete
    // this climbs back up to the root
    return completeUnitOfWork(fiber);
  }
  function beginWork(fiber) {
    state.workDepth++;
    const type = fiber.type;
    if (typeof type === "function") {
      let children;
      if (isClassComponent(type)) {
        fiber.instance = new type(fiber.pendingProps);
        children = fiber.instance.render(); // call the render method
      } else {
        children = type(fiber.pendingProps);
      }
      reconcileChildren(fiber, children);
    } else if (typeof type === "string") {
      fiber.stateNode = host.createInstance(type, fiber.pendingProps);
    } else if (typeof type === "symbol") {
      // todo: implement fragment, etc
    } else {
      if (fiber.$$typeof !== symbols.fiberRootNode) {
        throw new Error(
          `Invalid type, expected a function or a class for composite components, or a string for intrinsic components. received: ${typeof type}`
        );
      }
    }
    return fiber.child;
  }
  function completeUnitOfWork(fiber) {
    state.workDepth--;
    // this fiber is the deepest descendant of its branch (one of the tree's tail)
    let current = fiber;
    do {
      // .return is a reference to the fiber up the tree
      const parentFiber = current.return;
      if (parentFiber) {
        // stage 1: bubble up to the parent
        if (!parentFiber.firstEffect) {
          parentFiber.firstEffect = current.firstEffect;
        }
        if (current.lastEffect) {
          if (parentFiber.lastEffect) {
            // this sets the next item of the effect list
            parentFiber.lastEffect.nextEffect = current.firstEffect;
          }
          // sets the last parents's last effect to the current node's last effect
          // basically sets the tail of the effect list
          parentFiber.lastEffect = current.lastEffect;
        }
        // stage 2: collect effects
        // check if it has flags
        if (current.flags !== Flags.NoFlags) {
          if (parentFiber.lastEffect) {
            // makes the parent's last effect next effect the current node because we ourself have an effect
            parentFiber.lastEffect.nextEffect = current;
          } else {
            // we are the first effect
            parentFiber.firstEffect = current;
          }
          // sets as last effect in parent (basically .push but linked list)
          parentFiber.lastEffect = current;
        }
        const sibling = current.sibling;
        if (sibling) {
          return sibling; // work on the sibling next
        }
        // go up 1 step, this occurs when there is no next in line sibling
        current = parentFiber;
      }
    } while (
      // quite literally is what it looks like.
      // though for context, current is being assigned to the
      // parent per iteration, so this terminates when we have reached the root
      // of the tree
      current != null
    );
    return null;
  }
  function reconcileChildren(parentFiber, children) {
    state.workDepth++;
    let prevFiber = null;
    let oldFiber = parentFiber.child;
    let childIndex = 0;
    const childArray = Array.isArray(children) ? children : [children];
    for (const child of childArray) {
      let newFiber = null;
      const sameType =
        oldFiber &&
        typeof child === "object" &&
        child !== null &&
        child.type === oldFiber.type;
      // reuse old fiber if same type
      if (sameType) {
        newFiber = FiberNode.createWorkInProgress(oldFiber, child.props);
        newFiber.return = parentFiber;
      } else {
        // delete the old fiber
        if (oldFiber) {
          oldFiber.flags |= Flags.Deletion;
        }
        // create new fiber
        if (isPrimitive(child)) {
          newFiber = FiberNode.createFiberFromPrimitive(child);
        } else if (typeof child === "object" && child !== null) {
          newFiber = FiberNode.createFiberFromElement(child);
        }
        if (newFiber) newFiber.return = parentFiber;
      }
      if (prevFiber) {
        prevFiber.sibling = newFiber;
      } else {
        parentFiber.child = newFiber;
      }
      prevFiber = newFiber;
      oldFiber = oldFiber?.sibling ?? null;
      childIndex++;
    }
    // any remaining old fibers should be deleted
    while (oldFiber) {
      oldFiber.flags |= Flags.Deletion;
      oldFiber = oldFiber.sibling;
    }
  }
  function commitWork(fiber) {
    const flags = fiber.flags;
    const parentFiber = getHostParentFiber(fiber);
    const parent = parentFiber?.stateNode;
    if (!parent) return;
    if (flags & Flags.Placement) {
      commitPlacement(fiber, parent);
    }
    if (flags & Flags.Update) {
      commitUpdates(fiber);
    }
    if (flags & Flags.Deletion) {
      commitDeletion(fiber, parent);
    }
    // clear the flag after applying
    fiber.flags = Flags.NoFlags;
  }
  function commitRoot(root) {
    let nextEffect = root.firstEffect;
    while (nextEffect !== null) {
      commitWork(nextEffect);
      nextEffect = nextEffect.nextEffect;
    }
    root.firstEffect = null;
    root.lastEffect = null;
  }
  function commitPlacement(fiber, parent) {
    if (fiber.tag === WorkTag.HostComponent) {
      // insert dom node
      parent.appendChild(fiber.stateNode);
    } else if (fiber.tag === WorkTag.HostText) {
      // insert text node
      parent.appendChild(fiber.stateNode);
    }
  }
  function commitDeletion(fiber, parent) {
    if (fiber.tag === WorkTag.HostComponent || fiber.tag === WorkTag.HostText) {
      host.removeChild(parent, fiber.stateNode);
    } else {
      // for composite nodes, recursively delete host children
      let child = fiber.child;
      while (child) {
        commitDeletion(child, parent);
        child = child.sibling;
      }
    }
  }
  function commitUpdates(fiber) {
    // div, etc
    if (fiber.tag === WorkTag.HostComponent) {
      const oldProps = fiber.pendingProps;
      const newProps = fiber.alternate.pendingProps;
      const changes = host.diffProps
        ? host.diffProps(oldProps, newProps)
        : defaultDiff(oldProps, newProps);
      for (const d of changes.deletions) {
        host.removeAttribute(fiber.stateNode, d);
      }
      for (const ak in changes.additions) {
        host.addAttribute(fiber.stateNode, ak, changes.additions[ak]);
      }
      for (const mk in changes.modifications) {
        host.setAttribute(fiber.stateNode, mk, changes.modifications[mk]);
      }
    }
    // TODO: implement other stuff
  }
  this.scheduleWorkOnFiber = scheduleUpdateOnFiber;
};
export { ReconciliationEngine };
