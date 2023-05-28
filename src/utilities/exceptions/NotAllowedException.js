const createException = require('./createException');
const Logger = require('config/logger');
class NotAllowedException extends Error {
  constructor(exception) {
    super();
    Logger.error(exception);
    createException(exception,'Not Allowed', this, 405);
  }
}

module.exports = NotAllowedException;
