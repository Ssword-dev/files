# react-like renderer todo

uses:

- Y: done
- N: not yet
- S: soon

---

## implemented

- Y basic fiber tree construction
- Y beginWork, completeUnitOfWork, performUnitOfWork
- Y reconcileChildren for primitive/text nodes
- Y effect list collection (firstEffect, lastEffect)
- Y commitRoot, commitPlacement, commitUpdates
- Y host config for DOM mounting
- Y support for function and class components
- Y text node handling via createFiberFromPrimitive

---

## high priority

- S scheduleWorkOnFiber with workLoop

  - N implement render loop
  - N process units of work
  - N trigger commit phase when tree is built

- S proper .alternate work-in-progress linking

  - N createWorkInProgress
  - N link current <-> wip correctly
  - N track updated vs reused fibers

- S fragment support

  - N internal symbol (e.g. react_fragment)
  - N handle fragment in beginWork
  - N reconcile fragment children

- S improved reconcileChildren diffing
  - N handle keyed arrays
  - N reuse existing fibers
  - N remove stale children

---

## medium priority

- S normalize prop, key, and ref handling

  - N support ref attribute on fibers
  - N store key and ref properly
  - N forward ref to host nodes

- N deletion support

  - N track removed fibers
  - N commit deletions

- S effect flags cleanup
  - N use placement, update, deletion flags
  - N support multiple flags per fiber

---

## stretch goals

- N basic useState hook

  - N track hook index and state
  - N dispatcher for hooks
  - N rerender on setState

- N interruptible rendering

  - N requestIdleCallback work loop
  - N yield fiber units

- N devtool overlay
  - N visualize fiber tree
  - N debug reconciler/effect steps

---

## polish

- N internal error boundaries
- S strip debug logs in prod
- N test each phase (begin, complete, commit)
