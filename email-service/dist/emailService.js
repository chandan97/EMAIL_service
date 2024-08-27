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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
const circuitBreaker_1 = require("./circuitBreaker");
const queue_1 = require("./queue");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
class EmailService {
    constructor() {
        // Initialize primary transporter
        this.primaryTransporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER_1,
                pass: process.env.SMTP_PASS_1,
            },
        });
        // Initialize secondary transporter
        this.secondaryTransporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER_2,
                pass: process.env.SMTP_PASS_2,
            },
        });
        // Initialize circuit breaker and email queue
        this.circuitBreaker = new circuitBreaker_1.CircuitBreaker();
        this.emailQueue = new queue_1.EmailQueue();
    }
    sendEmail(to, subject, body) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.info(`Attempting to send email to ${to}`);
            const emailTask = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Attempt to send using the primary provider
                    yield this.circuitBreaker.execute(() => __awaiter(this, void 0, void 0, function* () {
                        yield this.primaryTransporter.sendMail({
                            from: process.env.SMTP_USER_1,
                            to,
                            subject,
                            text: body,
                        });
                    }));
                    logger_1.Logger.info(`Email successfully sent to ${to} using primary provider`);
                }
                catch (error) {
                    if (error instanceof Error) {
                        logger_1.Logger.error(`Primary provider failed, switching to secondary. Error: ${error.message}`);
                    }
                    else {
                        logger_1.Logger.error("Primary provider failed with an unknown error.");
                    }
                    try {
                        yield this.secondaryTransporter.sendMail({
                            from: process.env.SMTP_USER_2,
                            to,
                            subject,
                            text: body,
                        });
                        logger_1.Logger.info(`Email successfully sent to ${to} using secondary provider`);
                    }
                    catch (error) {
                        if (error instanceof Error) {
                            logger_1.Logger.error(`Secondary provider also failed. Error: ${error.message}`);
                        }
                        else {
                            logger_1.Logger.error("Secondary provider failed with an unknown error.");
                        }
                        throw error; // Re-throw the error after both providers fail
                    }
                }
            });
            this.emailQueue.add(emailTask);
        });
    }
}
exports.EmailService = EmailService;
