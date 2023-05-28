const authServices = require('services/auth');
const Logger = require('config/logger');

const loginUser = (req, res, next) => {
  authServices
    .loginUser(req.body)
    .then((response) => {
      Logger.info('Exit log : Login successfully');
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = loginUser;
