/* eslint-disable no-param-reassign */
const User = require('models/User');
const { InternalServerException } = require('utilities/exceptions');
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

const travelOnOneSide = async (refID, side, f) => {
  const refUser = await User.findOne({
    $and: [{ parentID: refID }, { [side]: true }],
  }).lean();

  if (refUser) {
    refUser.activePackage = currentActivePackage(
      refUser.cryptoToken,
      refUser.boughtPackages,
    );
    f.push(refUser);
    return travelOnOneSide(refUser.systemID, side, f);
  }
  return f;
};

const getTree = async (data) => {
  try {
    const f = await User.findOne({ systemID: data }).lean();
    f.activePackage = currentActivePackage(
      f.cryptoToken,
      f.boughtPackages,
    );
    const ref = await User.find({ referenceID: data }).lean();

    ref.forEach((user) => {
      user.activePackage = currentActivePackage(
        user.cryptoToken,
        user.boughtPackages,
      );
    });

    const res = {
      root: f,
      AllRightMostChild: await travelOnOneSide(data, 'isRight', []),
      AllLeftMostChild: await travelOnOneSide(data, 'isLeft', []),
      referenceUsers: ref,
    };
    return Promise.resolve({ data: res });
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

module.exports = getTree;
