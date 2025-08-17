import { wrap } from "./promise-utils";

class Scheduler {
  constructor(phases, requester, quantum = 16) {
    if (!Array.isArray(phases) || !phases.length) {
      throw new Error("Scheduler requires a non-empty phases array.");
    }

    this.phases = phases;
    this.requester = requester;
    this.quantum = quantum;

    // queues per phase
    this.queues = {};
    for (const phase of phases) {
      this.queues[phase] = [];
    }

    this.state = { scheduled: false };
  }

  schedule(phase, fn) {
    if (!this.queues.hasOwnProperty(phase)) {
      throw new Error(`Unknown phase '${phase}'.`);
    }
    this.queues[phase].push(() => Promise.resolve(fn()));
    this._tryStart();
  }

  _tryStart() {
    if (this.state.scheduled) return;
    this.state.scheduled = true;
    this._beginWork().finally(() => {
      this.state.scheduled = false;
    });
  }

  async _beginWork() {
    for (const phase of this.phases) {
      await this._processPhase(phase);
    }
  }

  async _processPhase(phase) {
    const queue = this.queues[phase];
    while (queue.length) {
      const done = await new Promise((resolve) => {
        this.requester(async () => {
          const startTime = performance.now();
          while (queue.length) {
            const task = queue.shift();
            await task();

            const now = performance.now();
            if (now - startTime >= this.quantum) {
              resolve(false);
              return;
            }
          }
          resolve(true);
        });
      });

      if (done) break;
    }
  }
}

export default Scheduler;
