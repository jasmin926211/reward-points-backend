const createException = require("./createException");
const Logger = require('config/logger');
class ConflictException extends Error {
  constructor(exception, data) {
    super();
    data ? Logger.error(exception + ' ' + data) : Logger.error(exception);
    createException(exception,'Conflict', this, 409);
  }
}

module.exports = ConflictException;
