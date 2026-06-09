const { AsyncQueue } = require("./asyncQueue");

const aiQueue = new AsyncQueue({
  concurrency: Number(process.env.AI_QUEUE_CONCURRENCY) || 2,
  maxQueueSize: Number(process.env.AI_QUEUE_MAX_SIZE) || 20,
});

module.exports = aiQueue;
