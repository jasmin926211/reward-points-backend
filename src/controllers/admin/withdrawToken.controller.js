const adminService = require('services/admin');
const Logger = require('config/logger');

const withdrawToken = (req, res, next) => {
  adminService
    .withdrawToken(req.body)
    .then((response) => {
      Logger.info('Exit log : Login successfully');
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = withdrawToken;
