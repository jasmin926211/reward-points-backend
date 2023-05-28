/* eslint-disable no-underscore-dangle */
const PackageTransactions = require('models/PackageTransactions');
const { InternalServerException } = require('utilities/exceptions');

async function updateTransaction(data) {
  try {
    // fail, confirm and pending transactions
    await PackageTransactions.findOneAndUpdate(
      {
        $and: [
          {
            publicAddress: data.publicAddress,
          },
          {
            blockchainTransactionID: data.blockchainTransactionID,
          },
        ],
      },
      {
        actionPerformed: true,
      },
    );
    return Promise.resolve();
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

module.exports = updateTransaction;
