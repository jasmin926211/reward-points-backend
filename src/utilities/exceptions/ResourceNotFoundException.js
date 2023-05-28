const createException = require('./createException');
const Logger = require('config/logger');
class ResourceNotFoundException extends Error {
  constructor(exception, data) {
    super();
    data ? Logger.error(exception + ' ' + data): Logger.error(exception);
    createException(exception,'Resource Not Found', this, 404);
  }
}

module.exports = ResourceNotFoundException;
