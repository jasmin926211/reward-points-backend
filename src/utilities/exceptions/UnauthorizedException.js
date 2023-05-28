const createException = require("./createException");
const Logger = require('config/logger');
class UnauthorizedException extends Error {
  constructor(exception, data) {
    super();
    data ? Logger.error(exception + ' ' + data) : Logger.error(exception);
    createException(exception,'Unauthorized Request', this, 401);
  }
}

module.exports = UnauthorizedException;
