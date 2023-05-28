const userService = require('services/user');
const Logger = require('config/logger');

const buyLevel = (req, res, next) => {
  userService
    .buyLevel(req.body)
    .then((response) => {
      Logger.info('Exit log : User registered successfully');
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = buyLevel;
