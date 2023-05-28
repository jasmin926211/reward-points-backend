const schedule = require('node-schedule');
const PackageTransactions = require('models/PackageTransactions');
const { PRE, COMPLETED } = require('utilities/constants');
const PresellUser = require('models/PresellUser');

const job = () => {
  schedule.scheduleJob('*/15 * * * * *', async () => {
    const f = await PresellUser.find();
    f.forEach(async (user) => {
      const trx = await PackageTransactions.find({
        $and: [
          { type: PRE },
          { paymentStatus: COMPLETED },
          { publicAddress: user.publicAddress },
        ],
      });
      trx.map(async (element) => {
        const diff =
          Math.abs(
            new Date().getTime() - element.amountIncTime.getTime(),
          ) / 3600000;
        console.log(diff);
        if (diff >= 3) {
          const token = (element.amount / 0.2) * 0.0033;
          await PresellUser.updateOne(
            { publicAddress: element.publicAddress },
            {
              $inc: { token },
            },
          );
          // $set: { amountIncTime: new Date().toISOString() }
          await PackageTransactions.updateOne(
            {
              blockchainTransactionID:
                element.blockchainTransactionID,
            },
            { $set: { amountIncTime: new Date().toISOString() } },
          );
        }
      });
    });
  });
};

module.exports = job;
