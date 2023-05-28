/* eslint-disable no-loop-func */
const User = require('models/User');
const {
  generateSuccessResponse,
} = require('utilities/generateResponse');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const TokenStacking = require('models/TokenStacking');
const config = require('config');
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

const getUserDetails = async (id) => {
  try {
    const user = await User.findOne({
      $or: [
        { publicAddress: id.toString() },
        { uniqueId: id.toString().toLowerCase() },
      ],
    });
    if (!user) {
      return Promise.reject(
        new ResourceNotFoundException('User not found', id),
      );
    }
    const tokenStacking = await TokenStacking.find({
      publicAddress: id.toString(),
    });

    // active package
    const activePackage = currentActivePackage(
      user.cryptoToken,
      user.boughtPackages,
    );

    return Promise.resolve(
      generateSuccessResponse('successfully', {
        user,
        tokenStacking,
        activePackage,
      }),
    );
  } catch (error) {
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = getUserDetails;
