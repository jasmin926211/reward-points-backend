/* eslint-disable no-loop-func */
const WithdrawTransactions = require('models/WithdrawTransactions');
const TransferTransaction = require('models/TransferTransactions');

const {
  generateSuccessResponse,
} = require('utilities/generateResponse');
const { InternalServerException } = require('utilities/exceptions');

const getUserEarning = async (id) => {
  try {
    const trx = await WithdrawTransactions.find({
      publicAddress: id.toString(),
    });
    console.log(id);
    const transferTrx = await TransferTransaction.find({
      publicAddress: id.toString(),
    });
    return Promise.resolve(
      generateSuccessResponse('successfully', {
        withDrawtrx: trx,
        transferTrx,
      }),
    );
  } catch (error) {
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = getUserEarning;
