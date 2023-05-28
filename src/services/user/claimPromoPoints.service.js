/* eslint-disable no-param-reassign */
const User = require('models/User');
const { InternalServerException } = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');
const config = require('config');

const checkPointsRedemption = (promoId, user) => {
  let pointsRedeemed = true;
  if (promoId === 1 && user.promo1.pointsRedeemed === false) {
    pointsRedeemed = false;
  } else if (promoId === 2 && user.promo2.pointsRedeemed === false) {
    pointsRedeemed = false;
  } else if (promoId === 3 && user.promo3.pointsRedeemed === false) {
    pointsRedeemed = false;
  } else if (promoId === 4 && user.promo4.pointsRedeemed === false) {
    pointsRedeemed = false;
  }
  return pointsRedeemed;
};

const createUpdateQuery = (promoId, points) => {
  const updateQuery = {
    1: {
      $set: { 'promo1.pointsRedeemed': true },
      $inc: { 'promo1.redeemedPoints': points },
    },
    2: {
      $set: { 'promo2.pointsRedeemed': true },
      $inc: { 'promo2.redeemedPoints': points },
    },
    3: {
      $set: { 'promo3.pointsRedeemed': true },
      $inc: { 'promo3.redeemedPoints': points },
    },
    4: {
      $set: { 'promo4.pointsRedeemed': true },
      $inc: { 'promo4.redeemedPoints': points },
    },
  };

  return updateQuery[promoId];
};

const claimPromoPoints = async (data) => {
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

    const promoPlans = config.get('promoPlans');
    const { points } = promoPlans.find(
      (e) => e.promoId === data.promoId,
    );
    const updateQuery = createUpdateQuery(data.promoId, points);
    if (!checkPointsRedemption(data.promoId, user)) {
      await User.findOneAndUpdate(
        {
          publicAddress: data.publicAddress,
        },
        updateQuery,
      );
      return Promise.resolve({
        message: 'Points redeemed successfully!',
      });
    } else {
      return Promise.reject({ message: 'Points already redeemed!' });
    }
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

module.exports = claimPromoPoints;
