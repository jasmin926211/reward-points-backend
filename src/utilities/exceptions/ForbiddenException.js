const createException = require("./createException");
const Logger = require('config/logger');
class ForbiddenException extends Error {
  constructor(exception, data) {
    super();
    data ? Logger.error(exception + ' ' + data) : Logger.error(exception);
    createException(exception,'Forbidden', this, 403);
  }
}

module.exports = ForbiddenException;
