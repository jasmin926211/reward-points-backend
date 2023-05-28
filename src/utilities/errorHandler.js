class ErrorHandler extends Error {
  constructor(statusCode, message, title) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.title = title;
  }
}

module.exports = ErrorHandler;
