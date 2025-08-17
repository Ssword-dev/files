import { waitFor, idle, wrap } from "./promise-utils";

// 16 is one of the sweet spots for budgeting
// frames.
const FRAME_BUDGET = 16; // ms
const style = {
  state: { scheduled: false },
  queues: {
    read: [],
    reflow: [],
    write: [],
  },
};

function enqueue(type, fn) {
  style.queues[type].push(() => waitFor(fn));
  style.schedule();
}

async function doWork(queue) {
  const done = await wrap((resolve) => {
    requestAnimationFrame(async () => {
      let deadline = await idle();
      const startTime = performance.now();
      while (queue.length) {
        const task = queue.shift();
        await task(); // wait on the task

        const now = performance.now();
        const diff = now - startTime;
        if (deadline.timeRemaining <= 0 || diff > FRAME_BUDGET) {
          resolve(false);
          return; // suspend the work to next idle frame
        }
      }
      resolve(true);
    });
  });

  if (!done) {
    await doWork(queue);
  }
}

style.read = (fn) => enqueue("read", fn);
style.reflow = (fn) => enqueue("reflow", fn);
style.write = (fn) => enqueue("write", fn);

style.schedule = async function (afterFlush) {
  if (this.state.scheduled) return;
  this.state.scheduled = true;

  try {
    // phase 1: read
    await doWork(this.queues.read);

    // phase 2: reflow
    await doWork(this.queues.reflow);

    // phase 3: write
    await doWork(this.queues.write);
  } catch (err) {
    console.error("batch error:", err);
  } finally {
    this.state.scheduled = false;
    if (afterFlush) afterFlush();
  }
};

export default style;
