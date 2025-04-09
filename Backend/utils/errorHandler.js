class ErrorHandler extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // Optional: store extra details about the error (e.g., validation issues)

    // Capture the stack trace (important for debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
