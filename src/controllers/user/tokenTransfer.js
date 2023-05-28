const userService = require('services/user');
const Logger = require('config/logger');

const tokenTransfer = (req, res, next) => {
  userService
    .tokenTransfer(req.body)
    .then((response) => {
      Logger.info('Exit log : Tokens transferred successfully');
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = tokenTransfer;
