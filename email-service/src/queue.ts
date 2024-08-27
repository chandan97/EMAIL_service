class EmailQueue {
  private queue: (() => Promise<void>)[] = [];
  private processing: boolean = false;

  public add(task: () => Promise<void>): void {
    this.queue.push(task);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error(`Failed to process task: ${error}`);
        }
      }
    }

    this.processing = false;
  }
}

export { EmailQueue };
