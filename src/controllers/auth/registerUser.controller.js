const authServices = require('services/auth');
const Logger = require('config/logger');

const registerUser = (req, res, next) => {
  authServices
    .registerUser(req.body)
    .then((response) => {
      Logger.info('Exit log : User registered successfully');
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = registerUser;
