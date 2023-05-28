const presaleServices = require('services/presale');
const Logger = require('config/logger');

const invest = (req, res, next) => {
  presaleServices
    .invest(req.body)
    .then((response) => {
      Logger.info('Exit log : Investment updated successfully');
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = invest;
