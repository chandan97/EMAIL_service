import { CircuitBreaker } from "./circuitBreaker";

const breaker = new CircuitBreaker();

async function failOperation() {
  throw new Error("Operation failed");
}

async function testCircuitBreaker() {
  try {
    await breaker.execute(failOperation);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
}

testCircuitBreaker();
