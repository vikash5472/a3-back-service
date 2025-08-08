import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QueueService {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;
  private readonly logger = new Logger(QueueService.name);

  addToQueue(task: () => Promise<void>) {
    this.queue.push(task);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        if (typeof task === 'function') {
          void task();
        }
      } catch (error) {
        this.logger.error(
          `Error processing queue task: ${(error as any).message}`,
        );
      }
    }
    this.isProcessing = false;
  }
}
