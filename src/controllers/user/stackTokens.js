const userService = require('services/user');
const Logger = require('config/logger');

const stackTokens = (req, res, next) => {
  userService
    .stackTokens(req.body)
    .then((response) => {
      Logger.info('Exit log : Tokens stack successfully');
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = stackTokens;
