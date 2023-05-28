const tokenServices = require('services/token');
const Logger = require('config/logger');

const getAvailableTokenDetails = (req, res, next) => {
  tokenServices
    .getAvailableTokenDetails(req.params.publicAddress)
    .then((response) => {
      Logger.info(
        'Exit log : Token current details fetched successfully',
      );
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = getAvailableTokenDetails;
