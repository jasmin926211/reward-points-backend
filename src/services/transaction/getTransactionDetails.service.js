/* eslint-disable no-underscore-dangle */
const PackageTransactions = require('models/PackageTransactions');
const { InternalServerException } = require('utilities/exceptions');
const { COMPLETED, FAIL, PENDING } = require('utilities/constants');

async function getTransactionDetails(publicAddress) {
  try {
    // fail, confirm and pending transactions
    const trx = await PackageTransactions.find({
      $and: [
        {
          publicAddress: publicAddress,
        },
        {
          paymentStatus: COMPLETED,
        },
        {
          actionPerformed: false,
        },
      ],
    });
    const failTrx = await PackageTransactions.find({
      $and: [
        { publicAddress: publicAddress },
        { paymentStatus: FAIL },
        {
          actionPerformed: false,
        },
      ],
    });
    const pendingTrx = await PackageTransactions.find({
      $and: [
        { publicAddress: publicAddress },
        { paymentStatus: PENDING },
        {
          actionPerformed: false,
        },
      ],
    });

    const responseData = {
      hasFailTransactions: failTrx,
      pendingTransactions: pendingTrx,
      confirmedTransactions: trx,
    };
    return Promise.resolve({ ...responseData });
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

module.exports = getTransactionDetails;
