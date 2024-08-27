"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    constructor() {
        this.failureCount = 0;
        this.failureThreshold = 3;
        this.state = "CLOSED";
        this.resetTimeout = 10000; // 10 seconds to reset
        this.lastFailureTime = Date.now();
    }
    execute(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state === "OPEN") {
                if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                    this.state = "HALF_OPEN";
                }
                else {
                    throw new Error("Circuit breaker is OPEN");
                }
            }
            try {
                const result = yield operation();
                this.reset();
                return result;
            }
            catch (error) {
                this.recordFailure();
                throw error;
            }
        });
    }
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = "OPEN";
        }
    }
    reset() {
        this.failureCount = 0;
        if (this.state === "HALF_OPEN") {
            this.state = "CLOSED";
        }
    }
}
exports.CircuitBreaker = CircuitBreaker;
