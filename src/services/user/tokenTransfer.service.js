/* eslint-disable no-param-reassign */
const User = require('models/User');
const SystemToken = require('models/SystemToken');
const TransferTransactions = require('models/TransferTransactions');

const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');

const {
  checkResourceAvailability,
} = require('utilities/checkResourceAvailability');
const handleAsync = require('utilities/handleAsync');
const config = require('config');

const tokenTransfer = async (data) => {
  try {
    const [user, findUserError] = await handleAsync(
      User.findOne({
        publicAddress: data.publicAddress,
      }).lean(),
    );
    await checkResourceAvailability(data.publicAddress, user, 'User');
    if (findUserError) {
      return Promise.reject(
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
    const receiverUserId = data.transferId.toLowerCase();
    const receiverUser = await User.findOne({
      uniqueId: receiverUserId,
    });
    if (!receiverUser) {
      return Promise.reject(
        new ResourceNotFoundException(
          `Transfer id is not valid ${receiverUserId}`,
        ),
      );
    }
    if (data.numberOfTokens <= availableInternalToken) {
      await User.findOneAndUpdate(
        { uniqueId: receiverUserId },
        {
          $inc: {
            transfredToken: data.numberOfTokens,
          },
        },
        { new: true },
      );
      await User.findOneAndUpdate(
        { publicAddress: data.publicAddress },
        { $inc: { internalToken: -data.numberOfTokens } },
        { new: true },
      );
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message: `You can transfer maximum ${availableInternalToken} tokens`,
      });
    }
    await TransferTransactions.create(data);
    return Promise.resolve({
      message: `${data.numberOfTokens} tokens transferred successfully`,
    });
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      return Promise.reject(error);
    }
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = tokenTransfer;
