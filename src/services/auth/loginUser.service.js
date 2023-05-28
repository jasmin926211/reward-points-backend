/* eslint-disable no-underscore-dangle */
const User = require('models/User');
const SystemToken = require('models/SystemToken');
const WithdrawTransactions = require('models/WithdrawTransactions');
const TransferTransaction = require('models/TransferTransactions');
const TokenStacking = require('models/TokenStacking');
const PackageTransactions = require('models/PackageTransactions');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');
const { getTree } = require('utilities/getTree');
const {
  COMPLETED,
  FAIL,
  PENDING,
  SILVER,
  GOLD,
  PLATINUM,
  DIAMOND,
  SILVER_POINTS,
  GOLD_POINTS,
  PLATINUM_POINTS,
  DIAMOND_POINTS,
} = require('utilities/constants');
const config = require('config');

async function loginValidation(user, data) {
  try {
    if (!user) {
      return Promise.reject(
        new ResourceNotFoundException(
          'User not found',
          data.publicAddress,
        ),
      );
    }
    if (user.isUserDeleted) {
      return Promise.reject(
        new ResourceNotFoundException(
          'User is deleted',
          data.publicAddress,
        ),
      );
    }
    return Promise.resolve();
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

const currentActivePackage = (
  currentCryptoTokens,
  boughtPackages,
) => {
  const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
  let activePackage = null;
  if (
    boughtPackages.includes(DIAMOND) &&
    currentCryptoTokens >= DIAMOND_POINTS * cryptoTokenMultiplier
  ) {
    activePackage = DIAMOND;
  } else if (
    boughtPackages.includes(PLATINUM) &&
    currentCryptoTokens >= PLATINUM_POINTS * cryptoTokenMultiplier
  ) {
    activePackage = PLATINUM;
  } else if (
    boughtPackages.includes(GOLD) &&
    currentCryptoTokens >= GOLD_POINTS * cryptoTokenMultiplier
  ) {
    activePackage = GOLD;
  } else if (
    boughtPackages.includes(SILVER) &&
    currentCryptoTokens >= SILVER_POINTS * cryptoTokenMultiplier
  ) {
    activePackage = SILVER;
  }
  return activePackage;
};

async function loginUser(data) {
  try {
    // const [user, findUserError] = await handleAsync(
    //   User.findOne({ publicAddress: data.publicAddress }).lean(),
    // );
    // if (findUserError) {
    //   Promise.reject(
    //     new InternalServerException(
    //       'Internal Server Error',
    //       findUserError,
    //     ),
    //   );
    // }
    let user;
    user = await User.findOne({
      publicAddress: data.publicAddress,
    }).lean();
    if (!user) {
      const userDetails = await User.findOne({
        publicAddress: data.publicAddress.toLowerCase(),
      }).lean();
      if (userDetails) {
        user = await User.findOneAndUpdate(
          { publicAddress: data.publicAddress.toLowerCase() },
          { $set: { publicAddress: data.publicAddress } },
          { new: true },
        ).lean();
        console.log('user', user);
        await SystemToken.updateMany(
          { publicAddress: data.publicAddress.toLowerCase() },
          { $set: { publicAddress: data.publicAddress } },
        );
        await WithdrawTransactions.updateMany(
          { publicAddress: data.publicAddress.toLowerCase() },
          { $set: { publicAddress: data.publicAddress } },
        );
        await TransferTransaction.updateMany(
          { publicAddress: data.publicAddress.toLowerCase() },
          { $set: { publicAddress: data.publicAddress } },
        );
      }
    }
    await loginValidation(user, data);
    // partners reference and last24hours partners logic
    let ref = await User.find({
      $and: [
        { systemID: { $ne: user.systemID } },
        { referenceID: user.systemID },
      ],
    });

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

    user.last24HourPatner = last24HourPatner.length;
    user.ref = ref;
    user.totalPatners = treeData.length ? treeData.length - 1 : 0;
    // token stacking and available tokens
    const stackingData = await TokenStacking.find({
      publicAddress: data.publicAddress,
      isStackingPeriodExpired: false,
    });
    let stackedTokens = 0;
    stackingData.forEach((element) => {
      stackedTokens = stackedTokens + element.numberOfStackingTokens;
    });
    const totalCryptoTokens =
      user.cryptoToken + user.totalTransferredCryptoTokens;
    const currentInternalTokens =
      user.internalToken +
      stackedTokens +
      user.tokensRequestedForWithdrawal;

    // fail, confirm and pending transactions
    const trx = await PackageTransactions.find({
      $and: [
        {
          publicAddress: user.publicAddress,
        },
        {
          paymentStatus: COMPLETED,
        },
      ],
    });
    const failTrx = await PackageTransactions.find({
      $and: [
        { publicAddress: user.publicAddress },
        { paymentStatus: FAIL },
      ],
    });
    const pendingTrx = await PackageTransactions.find({
      $and: [
        { publicAddress: user.publicAddress },
        { paymentStatus: PENDING },
      ],
    });

    // active package
    const activePackage = currentActivePackage(
      user.cryptoToken,
      user.boughtPackages,
    );

    const responseData = {
      ...user,
      currentInternalTokens,
      totalCryptoTokens,
      hasFailTransactions: failTrx,
      pendingTransactions: pendingTrx,
      confirmedTransactions: trx,
      activePackage,
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

module.exports = loginUser;
