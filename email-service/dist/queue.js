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
exports.EmailQueue = void 0;
class EmailQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    add(task) {
        this.queue.push(task);
        this.processQueue();
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.processing)
                return;
            this.processing = true;
            while (this.queue.length > 0) {
                const task = this.queue.shift();
                if (task) {
                    try {
                        yield task();
                    }
                    catch (error) {
                        console.error(`Failed to process task: ${error}`);
                    }
                }
            }
            this.processing = false;
        });
    }
}
exports.EmailQueue = EmailQueue;
