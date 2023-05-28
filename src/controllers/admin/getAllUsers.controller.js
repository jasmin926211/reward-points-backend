const adminService = require('services/admin');
const Logger = require('config/logger');

const getAllUsers = (req, res, next) => {
  adminService
    .getAllUsers(req.query)
    .then((response) => {
      Logger.info('Exit log : Users get successfully');
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = getAllUsers;
