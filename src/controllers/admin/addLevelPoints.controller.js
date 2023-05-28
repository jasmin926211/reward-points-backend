const adminService = require('services/admin');
const Logger = require('config/logger');

const addLevelPoints = (req, res, next) => {
  adminService
    .addLevelPoints(req.body)
    .then((response) => {
      Logger.info('Exit log : Points added successfully');
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = addLevelPoints;
