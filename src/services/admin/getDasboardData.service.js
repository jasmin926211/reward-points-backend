/* eslint-disable indent */
const { InternalServerException } = require('utilities/exceptions');
// totalInternalToken
const User = require('models/User');

async function getDasboardData() {
  try {
    let data = [];
    const totalInternalToken = await User.aggregate([
      { $match: {} },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$totalInternalToken',
          },
          totalCrypto: {
            $sum: '$cryptoToken',
          },
          tokensRequestedForWithdrawal: {
            $sum: '$totalTransferredInternalTokens',
          },
          totalTransferredCryptoTokens: {
            $sum: '$totalTransferredCryptoTokens',
          },
        },
      },
    ]);

    const totalUsers = await User.countDocuments({}).exec();

    data = [
      {
        title: 'Total Internal Token',
        value: totalInternalToken[0].total,
      },
      {
        title: 'Total Internal Tokens Withdrawal',
        value: totalInternalToken[0].tokensRequestedForWithdrawal,
      },
      {
        title: 'Total Crypto Token',
        value: totalInternalToken[0].totalCrypto,
      },
      {
        title: 'Total Crypto Tokens Withdrawal',
        value: totalInternalToken[0].totalTransferredCryptoTokens,
      },
      {
        title: 'Total Users',
        value: totalUsers - 1,
      },
    ];
    // const withdrawal = await User.find({ withdrawalRequest: true });
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

module.exports = getDasboardData;
