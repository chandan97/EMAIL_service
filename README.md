# Email Service

## Overview

The Email Service is a TypeScript-based application designed to handle sending emails through two mock email providers. It includes features such as retry logic with exponential backoff, fallback mechanisms, idempotency, rate limiting, and status tracking. Additionally, it incorporates a circuit breaker pattern and basic logging.

## Features

- **Retry Mechanism**: Automatically retries sending emails with exponential backoff in case of failure.
- **Fallback Mechanism**: Switches between primary and secondary email providers if the primary fails.
- **Idempotency**: Prevents duplicate email sends.
- **Rate Limiting**: Controls the rate of sending emails to avoid overloading the providers.
- **Status Tracking**: Keeps track of the status of email sending attempts.
- **Circuit Breaker**: Prevents system overload by stopping retries if a provider fails repeatedly.
- **Basic Logging**: Logs important events and errors.


