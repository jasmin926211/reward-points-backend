/* eslint-disable no-param-reassign */
const User = require('models/User');
const SystemToken = require('models/SystemToken');
const TokenStacking = require('models/TokenStacking');
const { InternalServerException } = require('utilities/exceptions');
const {
  checkResourceAvailability,
} = require('utilities/checkResourceAvailability');
const config = require('config');
const handleAsync = require('utilities/handleAsync');

const stackTokens = async (data) => {
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

    const stackingEndDate = new Date(
      Date.now() + data.stackingPeriod * 24 * 60 * 60 * 1000,
    ).toISOString();
    const earnedCryptoTokens =
      (data.stackingPeriod * data.numberOfStackingTokens * 0.08) / 30;
    let stackedTokens;
    if (data.numberOfStackingTokens <= availableInternalToken) {
      stackedTokens = await TokenStacking.create({
        ...data,
        ...{ stackingEndDate, earnedCryptoTokens },
      });
      await User.findOneAndUpdate(
        { publicAddress: data.publicAddress },
        { $inc: { internalToken: -data.numberOfStackingTokens } },
        { new: true },
      );
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message: `You can stack maximum ${availableInternalToken} tokens`,
      });
    }
    return Promise.resolve({ stackedTokens });
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = stackTokens;
