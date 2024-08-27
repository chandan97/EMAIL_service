"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emailService_1 = require("./emailService");
const emailService = new emailService_1.EmailService();
emailService.sendEmail("dewangan.9713@gmail.com", "Test Subject", "Test Body");
