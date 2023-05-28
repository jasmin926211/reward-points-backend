/* eslint-disable indent */
const schedule = require('node-schedule');
const TokenStacking = require('models/TokenStacking');
const User = require('models/User');

const checkStackingPeriod = () => {
  schedule.scheduleJob('5 * * * * *', async () => {
    const stackedData = await TokenStacking.find({
      isStackingPeriodExpired: false,
    });
    console.log(stackedData);
    const stackedDetails = await stackedData.map(async (element) => {
      if (element.stackingEndDate.getTime() < new Date().getTime()) {
        await TokenStacking.findOneAndUpdate(
          {
            publicAddress: element.publicAddress,
            numberOfStackingTokens: element.numberOfStackingTokens,
          },
          { isStackingPeriodExpired: true },
        );
        await User.findOneAndUpdate(
          { publicAddress: element.publicAddress },
          {
            $inc: {
              internalToken: element.numberOfStackingTokens,
              cryptoToken: element.earnedCryptoTokens,
            },
          },
        );
      }
    });
    return Promise.all(stackedDetails);
  });
};

module.exports = checkStackingPeriod;
