const authServices = require('services/admin');
const Logger = require('config/logger');

const updateUserCryptoTokens = (req, res, next) => {
  authServices
    .updateUserCryptoTokens(req.body)
    .then((response) => {
      Logger.info('Exit log : Tokens updated successfully');
      res.status(204).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = updateUserCryptoTokens;
