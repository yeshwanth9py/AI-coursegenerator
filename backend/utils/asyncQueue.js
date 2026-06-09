class QueueFullError extends Error {
  constructor() {
    super("The AI service is busy. Please try again shortly.");
    this.name = "QueueFullError";
    this.statusCode = 503;
  }
}

//my custom message queue
class AsyncQueue {
  constructor({ concurrency = 2, maxQueueSize = 20 } = {}) {
    this.concurrency = concurrency;
    this.maxQueueSize = maxQueueSize;
    this.runningTasks = 0;
    this.pendingTasks = [];
  }

  enqueue(task) {
    if (typeof task !== "function") {
      return Promise.reject(new TypeError("Queue task must be a function"));
    }

    if (this.pendingTasks.length >= this.maxQueueSize) {
      return Promise.reject(new QueueFullError());
    }

    return new Promise((resolve, reject) => {
      this.pendingTasks.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    while (this.runningTasks < this.concurrency && this.pendingTasks.length > 0) {
      const nextTask = this.pendingTasks.shift();
      this.runTask(nextTask);
    }
  }

  async runTask({ task, resolve, reject }) {
    this.runningTasks += 1;

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.runningTasks -= 1;
      this.processQueue();
    }
  }
}

module.exports = { AsyncQueue, QueueFullError };
