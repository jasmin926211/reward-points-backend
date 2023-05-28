const createException = require("./createException");

class BadRequestException extends Error {
  constructor(exception) {
    super();
    createException(exception,'Bad Request', this, 400);
  }
}

module.exports = BadRequestException;
