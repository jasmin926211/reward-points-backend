const transactionServices = require('services/transaction');
const Logger = require('config/logger');

const updateTransaction = (req, res, next) => {
  transactionServices
    .updateTransaction(req.body)
    .then((response) => {
      Logger.info(
        'Exit log : Transaction details updated successfully',
      );
      res.status(204).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = updateTransaction;
