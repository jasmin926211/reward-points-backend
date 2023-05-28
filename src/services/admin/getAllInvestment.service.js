/* eslint-disable indent */
const { InternalServerException } = require('utilities/exceptions');
const PackageTransactions = require('models/PackageTransactions');
const {
  PRE,
  PENDING,
  COMPLETED,
  FAIL,
} = require('utilities/constants');
const checkTransaction = require('utilities/tronweb');

async function getAllInvestment() {
  try {
    const packagesTrx = await PackageTransactions.find({
      $and: [{ type: PRE }, { paymentStatus: PENDING }],
    });
    const trx = packagesTrx.map(
      (element) => element.blockchainTransactionID,
    );
    const trxStatus = await checkTransaction(trx);
    const successTrx = [];
    const failTrx = [];
    trxStatus.forEach((el) => {
      switch (el.status) {
        case COMPLETED:
          successTrx.push(el.blockchainTransactionID);
          break;
        case FAIL:
          failTrx.push(el.blockchainTransactionID);
          break;

        default:
          break;
      }
    });
    await PackageTransactions.updateMany(
      {
        blockchainTransactionID: { $in: successTrx },
      },
      { paymentStatus: COMPLETED },
    );
    await PackageTransactions.updateMany(
      {
        blockchainTransactionID: { $in: failTrx },
      },
      { paymentStatus: FAIL },
    );
    const data = await PackageTransactions.find({
      $and: [{ type: PRE }, { paymentStatus: COMPLETED }],
    });

    return Promise.resolve({ data });
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

module.exports = getAllInvestment;
