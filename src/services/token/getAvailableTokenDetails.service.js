/* eslint-disable no-underscore-dangle */
const User = require('models/User');
const TokenStacking = require('models/TokenStacking');
const SystemToken = require('models/SystemToken');
const { InternalServerException } = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');
const config = require('config');
const {
  checkResourceAvailability,
} = require('utilities/checkResourceAvailability');
const { getTree } = require('utilities/getTree');

async function getAvailableTokenDetails(publicAddress) {
  try {
    const [user, findUserError] = await handleAsync(
      User.findOne({ publicAddress }).lean(),
    );
    if (findUserError) {
      Promise.reject(
        new InternalServerException(
          'Internal Server Error',
          findUserError,
        ),
      );
    }
    const stackingData = await TokenStacking.find({
      publicAddress,
      isStackingPeriodExpired: false,
    });
    let stackedTokens = 0;
    stackingData.forEach((element) => {
      stackedTokens += element.numberOfStackingTokens;
    });
    const totalCryptoTokens =
      user.cryptoToken + user.totalTransferredCryptoTokens;
    const currentInternalTokens =
      user.internalToken +
      stackedTokens +
      user.tokensRequestedForWithdrawal;

    const days = config.get('holdingPeriod');
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - days);
    const userData = await SystemToken.find({
      publicAddress,
      createdAt: { $gt: lastWeekDate },
    });
    await checkResourceAvailability(publicAddress, userData, 'User');
    let nonUsableInternalToken = 0;
    userData.forEach((details) => {
      nonUsableInternalToken += details.numberOfTokens;
    });
    const availableInternalToken =
      user.internalToken - nonUsableInternalToken;
    const UserData = await User.find();
    const treeData = getTree(UserData, user.systemID);
    const todayDate = new Date().toISOString();
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - 1);
    const last24HourPatner = treeData.filter(
      (res) =>
        res.createdAt.toISOString() <= todayDate &&
        res.createdAt.toISOString() > lastDate.toISOString() &&
        res.systemID !== user.systemID,
    );

    const u = await User.find({ referenceID: user.systemID }).count();

    user.last24HourPatner = last24HourPatner.length;
    user.totalPatners = treeData.length ? treeData.length - 1 : 0;

    const responseData = {
      ...user,
      currentInternalTokens,
      totalCryptoTokens,
      stackedTokens,
      availableInternalToken,
      refPatner: u,
    };
    delete responseData.internalToken;
    return Promise.resolve({ responseData });
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

module.exports = getAvailableTokenDetails;
