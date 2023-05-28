const userService = require('services/user');
const Logger = require('config/logger');

const updateUniqueId = (req, res, next) => {
  userService
    .updateUniqueId(req.body)
    .then((response) => {
      Logger.info('Exit log : Unique id updated successfully');
      res.status(204).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = updateUniqueId;
