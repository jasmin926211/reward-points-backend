const adminService = require('services/admin');
const Logger = require('config/logger');

const addUserToTree = (req, res, next) => {
  adminService
    .addUserToTree(req.body)
    .then((response) => {
      Logger.info('Exit log : User added successfully');
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = addUserToTree;
