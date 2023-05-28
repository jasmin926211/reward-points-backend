/* eslint-disable indent */
const schedule = require('node-schedule');
const PackageTransactions = require('models/PackageTransactions');
const User = require('models/User');
const PreSellUser = require('models/PresellUser');
const { InternalServerException } = require('utilities/exceptions');
const { PENDING, COMPLETED, FAIL } = require('utilities/constants');
const checkTransaction = require('utilities/tronweb');
const config = require('config');
const updateData = require('./updateLevelTransections');
const { TOKENPAYMENT, PRE } = require('../utilities/constants');

const updateUserPackageDetails = async (successTrx) => {
  try {
    const weeklyCapDays = config.get('weeklyCapDays');
    const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
    const updatedSuccessTrx = await successTrx.map(async (trx) => {
      const transactionDetails = await PackageTransactions.findOne({
        blockchainTransactionID: trx,
      });
      console.log('transactionDetails', transactionDetails);
      const userData = await User.findOne({
        publicAddress: transactionDetails.publicAddress,
      });
      console.log('userData', userData);
      const paymentPackages = config.get('paymentPackages');
      const { points, days, tokenPrice } = paymentPackages.find(
        (e) => e.name === transactionDetails.package,
      );
      // checks for user has bought package or not before
      let packageUpdateValue = userData.hasBoughtFirstPackage
        ? { hasPackageUpdated: true, hasBoughtFirstPackage: true }
        : { hasPackageUpdated: false, hasBoughtFirstPackage: true };

      const getPacIndex = paymentPackages
        .map((e) => e.name)
        .indexOf(transactionDetails.package);
      if (getPacIndex >= 1) {
        packageUpdateValue = {
          hasPackageUpdated: true,
          hasBoughtFirstPackage: true,
        };
      }
      console.log('packageUpdateValue', packageUpdateValue);
      let boughtPackagesQuery;
      if (
        userData.boughtPackages.includes(transactionDetails.package)
      ) {
        boughtPackagesQuery = {
          $push: { boughtPackages: null },
        };
      } else {
        boughtPackagesQuery = {
          $push: { boughtPackages: transactionDetails.package },
        };
      }
      // reset values and weekly cap to zero
      const user = await User.findOneAndUpdate(
        { publicAddress: transactionDetails.publicAddress },
        {
          $set: {
            currentPackage: transactionDetails.package,
            packageUpdateDate: new Date(),
            weekEndDate: new Date(
              Date.now() + weeklyCapDays * 24 * 60 * 60 * 1000,
            ).toISOString(),
            packageEndDate: new Date(
              Date.now() + days * 24 * 60 * 60 * 1000,
            ).toISOString(),
            earningsPerWeek: 0,
            superBinaryIncome: 0,
            ...packageUpdateValue,
          },
          $inc: { cryptoToken: tokenPrice * cryptoTokenMultiplier },
          ...boughtPackagesQuery,
        },
        { new: true },
      );
      // reset values for community bonus redeemed to false
      if (user.communityRewards.length > 0) {
        await User.findOneAndUpdate(
          { systemID: user.systemID },
          {
            $set: {
              'communityRewards.$[elem].rewardRedeemed': false,
            },
          },
          { arrayFilters: [{ 'elem.rewardRedeemed': true }] },
        );
      }
      await updateData(user.systemID, points);
    });
    return Promise.all(updatedSuccessTrx);
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

const updateTrx = async () => {
  schedule.scheduleJob('*/5 * * * * *', async () => {
    const packagesTrx = await PackageTransactions.find({
      $or: [{ paymentStatus: PENDING }, { status: 'defaultError' }],
    });
    const tokenTrx = await PackageTransactions.find({
      paymentStatus: TOKENPAYMENT,
    });

    const tokenTrxID = tokenTrx.map(
      (element) => element.blockchainTransactionID,
    );

    const trx = packagesTrx.map(
      (element) => element.blockchainTransactionID,
    );
    const trxStatus = await checkTransaction(trx);
    console.log(trxStatus);
    const successTrx = [];
    const failTrx = [];
    const defaultTrx = [];
    const completedTransactions = [];
    const pre = packagesTrx.filter((r) => r.type === PRE);

    trxStatus.forEach(async (singleTrx) => {
      if (singleTrx.status === COMPLETED) {
        completedTransactions.push(singleTrx.blockchainTransactionID);
      }
      const on = pre.find(
        (r) =>
          r.blockchainTransactionID ===
          singleTrx.blockchainTransactionID,
      );
      console.log('popopopo', on);
      if (singleTrx.status === COMPLETED && on) {
        const f = await PreSellUser.update(
          { publicAddress: on.publicAddress },
          {
            $inc: { token: (on.amount / 0.2) * 10 },
          },
        );
        console.log({ f });
      }
    });
    const systemTransaction = await PackageTransactions.find({
      blockchainTransactionID: {
        $in: completedTransactions,
      },
    });

    trxStatus.forEach(async (el) => {
      switch (el.status) {
        case COMPLETED: {
          systemTransaction.forEach((transaction) => {
            if (
              el.blockchainTransactionID ===
                transaction.blockchainTransactionID &&
              +el.amount === transaction.amount
            ) {
              successTrx.push(el.blockchainTransactionID);
            }
          });
          break;
        }
        case FAIL:
          failTrx.push(el.blockchainTransactionID);
          break;

        default:
          defaultTrx.push(el.blockchainTransactionID);
          break;
      }
    });
    successTrx.push(...tokenTrxID);
    await PackageTransactions.updateMany(
      {
        blockchainTransactionID: { $in: successTrx },
      },
      {
        $set: {
          paymentStatus: COMPLETED,
        },
      },
    );
    await PackageTransactions.updateMany(
      {
        blockchainTransactionID: { $in: failTrx },
      },
      { paymentStatus: FAIL },
    );
    await PackageTransactions.updateMany(
      {
        blockchainTransactionID: { $in: defaultTrx },
      },
      { status: 'defaultError' },
    );
    updateUserPackageDetails(successTrx);
  });
};

module.exports = updateTrx;
