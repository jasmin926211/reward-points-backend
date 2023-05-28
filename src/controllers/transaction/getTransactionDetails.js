const transactionServices = require('services/transaction');
const Logger = require('config/logger');

const getTransactionDetails = (req, res, next) => {
  transactionServices
    .getTransactionDetails(req.params.publicAddress)
    .then((response) => {
      Logger.info(
        'Exit log : Transactions details fetched successfully',
      );
      res.status(200).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = getTransactionDetails;
