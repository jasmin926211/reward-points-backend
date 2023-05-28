/* eslint-disable no-param-reassign */
const User = require('models/User');
const SystemToken = require('models/SystemToken');
const WithdrawTransactions = require('models/WithdrawTransactions');

const { InternalServerException } = require('utilities/exceptions');
const {
  checkResourceAvailability,
} = require('utilities/checkResourceAvailability');
const handleAsync = require('utilities/handleAsync');
const config = require('config');

const tokenWithdrawal = async (data) => {
  try {
    const [user, findUserError] = await handleAsync(
      User.findOne({ publicAddress: data.publicAddress }).lean(),
    );
    if (findUserError) {
      Promise.reject(
        new InternalServerException(
          'Internal Server Error',
          findUserError,
        ),
      );
    }

    const days = config.get('holdingPeriod');
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - days);
    const userData = await SystemToken.find({
      publicAddress: data.publicAddress,
      createdAt: { $gt: lastWeekDate },
    });
    await checkResourceAvailability(
      data.publicAddress,
      userData,
      'User',
    );
    let nonUsableInternalToken = 0;
    userData.forEach((details) => {
      nonUsableInternalToken += details.numberOfTokens;
    });
    const availableInternalToken =
      user.internalToken - nonUsableInternalToken;
    if (data.numberOfTokens <= availableInternalToken) {
      const withdraw = await WithdrawTransactions.create(data);
      await User.findOneAndUpdate(
        { publicAddress: data.publicAddress },
        {
          $set: { withdrawalRequest: true },
          $inc: {
            internalToken: -data.numberOfTokens,
            tokensRequestedForWithdrawal: data.numberOfTokens,
          },
          $push: {
            withdrawalIds: withdraw.createdAt,
          },
        },
        { new: true },
      );
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message: `You can withdraw maximum ${availableInternalToken} tokens`,
      });
    }
    return Promise.resolve({
      message: `${data.numberOfTokens} tokens withdrawal request sent successfully`,
    });
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = tokenWithdrawal;
