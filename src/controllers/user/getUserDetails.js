const userService = require('services/user');
const Logger = require('config/logger');

const getUserDetails = (req, res, next) => {
  userService
    .getUserDetails(req.params.id)
    .then((response) => {
      Logger.info('Exit log : User details fetched successfully');
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = getUserDetails;
