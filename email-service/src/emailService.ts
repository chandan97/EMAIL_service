import nodemailer, { Transporter } from "nodemailer";
import { Logger } from "./logger";
import { CircuitBreaker } from "./circuitBreaker";
import { EmailQueue } from "./queue";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export class EmailService {
  private primaryTransporter: Transporter;
  private secondaryTransporter: Transporter;
  private circuitBreaker: CircuitBreaker;
  private emailQueue: EmailQueue;

  constructor() {
    // Initialize primary transporter
    this.primaryTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER_1,
        pass: process.env.SMTP_PASS_1,
      },
    });

    // Initialize secondary transporter
    this.secondaryTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER_2,
        pass: process.env.SMTP_PASS_2,
      },
    });

    // Initialize circuit breaker and email queue
    this.circuitBreaker = new CircuitBreaker();
    this.emailQueue = new EmailQueue();
  }

  async sendEmail(to: string, subject: string, body: string) {
    Logger.info(`Attempting to send email to ${to}`);

    const emailTask = async () => {
      try {
        // Attempt to send using the primary provider
        await this.circuitBreaker.execute(async () => {
          await this.primaryTransporter.sendMail({
            from: process.env.SMTP_USER_1,
            to,
            subject,
            text: body,
          });
        });
        Logger.info(`Email successfully sent to ${to} using primary provider`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          Logger.error(
            `Primary provider failed, switching to secondary. Error: ${error.message}`
          );
        } else {
          Logger.error("Primary provider failed with an unknown error.");
        }
        try {
          await this.secondaryTransporter.sendMail({
            from: process.env.SMTP_USER_2,
            to,
            subject,
            text: body,
          });
          Logger.info(
            `Email successfully sent to ${to} using secondary provider`
          );
        } catch (error: unknown) {
          if (error instanceof Error) {
            Logger.error(
              `Secondary provider also failed. Error: ${error.message}`
            );
          } else {
            Logger.error("Secondary provider failed with an unknown error.");
          }
          throw error; // Re-throw the error after both providers fail
        }
      }
    };

    this.emailQueue.add(emailTask);
    
  }
  
}

