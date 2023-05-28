/* eslint-disable indent */
const schedule = require('node-schedule');
const User = require('models/User');
const config = require('config');

const updateWeekEndDate = () => {
  schedule.scheduleJob('10 * * * * *', async () => {
    const days = config.get('weeklyCapDays');
    const date = new Date().toISOString();
    const users = await User.find({
      hasBoughtFirstPackage: true,
      weekEndDate: { $lt: date },
    }).lean();
    users.map(async (user) => {
      await User.findOneAndUpdate(
        { publicAddress: user.publicAddress },
        {
          $set: {
            weekEndDate: new Date(
              Date.now() + days * 24 * 60 * 60 * 1000,
            ).toISOString(),
            earningsPerWeek: 0,
            superBinaryIncome: 0,
          },
        },
      );
    });
  });
};

module.exports = updateWeekEndDate;
