const userService = require('services/user');
const Logger = require('config/logger');

const getTree = (req, res, next) => {
  userService
    .getTree(req.params.id)
    .then((response) => {
      Logger.info('Exit log : Tokens stack successfully');
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = getTree;
