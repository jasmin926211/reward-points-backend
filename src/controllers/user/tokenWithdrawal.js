const userService = require('services/user');
const Logger = require('config/logger');

const tokenWithdrawal = (req, res, next) => {
  userService
    .tokenWithdrawal(req.body)
    .then((response) => {
      Logger.info('Exit log : Tokens withdrawn successfully');
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = tokenWithdrawal;
