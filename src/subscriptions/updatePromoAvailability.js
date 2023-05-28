/* eslint-disable indent */
const schedule = require('node-schedule');
const User = require('models/User');
const config = require('config');
const mongoose = require('mongoose');
const { InternalServerException } = require('utilities/exceptions');

const updatePromoAvailability = () => {
  const promoTimePeriod = config.get('promoTimePeriod');
  schedule.scheduleJob(promoTimePeriod, async () => {
    try {
      console.log(new Date().toISOString());
      const users = await User.find().lean();
      let bulk = User.collection.initializeUnorderedBulkOp();
      users.forEach((user) => {
        bulk.find({ _id: mongoose.Types.ObjectId(user._id) }).update({
          $set: {
            'promo1.pointsRedeemed': false,
            'promo2.pointsRedeemed': false,
            'promo3.pointsRedeemed': false,
            'promo4.pointsRedeemed': false,
          },
        });
      });
      bulk.execute();
      // users.map(async (user) => {
      //   await User.findOneAndUpdate(
      //     { publicAddress: user.publicAddress },
      //     {
      //       $set: {
      //         weekEndDate: new Date(
      //           Date.now() + days * 24 * 60 * 60 * 1000,
      //         ).toISOString(),
      //         earningsPerWeek: 0,
      //         superBinaryIncome: 0,
      //       },
      //     },
      //   );
      // });
    } catch (error) {
      if (error.statusCode) {
        return Promise.reject(error);
      }
      console.log(error);
      return Promise.reject(
        new InternalServerException('Internal Server Error', error),
      );
    }
  });
};

module.exports = updatePromoAvailability;
