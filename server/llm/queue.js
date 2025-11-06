// server/llm/queue.js
// Simple single-process queue to rate-limit requests (RPM) and ensure polite spacing.

const { setTimeout: delay } = require("timers/promises");

class RequestQueue {
  constructor(rpm = 20) {
    this.rpm = Math.max(1, Number(rpm || 20));
    // ms between requests: 60_000 / rpm
    this.msBetween = Math.ceil(60000 / this.rpm);
    this.queue = [];
    this.running = false;
  }

  async push(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      // start processing if not running
      if (!this.running) this._process();
    });
  }

  async _process() {
    this.running = true;
    while (this.queue.length) {
      const { fn, resolve, reject } = this.queue.shift();
      try {
        const out = await fn();
        resolve(out);
      } catch (err) {
        reject(err);
      }
      // wait spacing before next request
      await delay(this.msBetween);
    }
    this.running = false;
  }
}

module.exports = { RequestQueue };
