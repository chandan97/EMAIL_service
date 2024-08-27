class CircuitBreaker {
  private failureCount: number = 0;
  private failureThreshold: number = 3;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private resetTimeout: number = 10000; // 10 seconds to reset
  private lastFailureTime: number = Date.now();

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  private reset(): void {
    this.failureCount = 0;
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
    }
  }
}

export { CircuitBreaker };
