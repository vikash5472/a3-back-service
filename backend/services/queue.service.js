class QueueService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  addToQueue(task) {
    this.queue.push(task);
    void this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        if (typeof task === 'function') {
          await task();
        }
      } catch (error) {
        console.error(`Error processing queue task: ${error.message}`);
      }
    }
    this.isProcessing = false;
  }
}

module.exports = new QueueService();
