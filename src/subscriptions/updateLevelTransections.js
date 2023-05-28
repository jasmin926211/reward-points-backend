/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
const User = require('models/User');
const SystemToken = require('models/SystemToken');
const config = require('config');
const {
  SILVER,
  GOLD,
  PLATINUM,
  DIAMOND,
  SILVER_POINTS,
  GOLD_POINTS,
  PLATINUM_POINTS,
  DIAMOND_POINTS,
} = require('utilities/constants');
const { InternalServerException } = require('utilities/exceptions');
const calculateCommunityBonus = require('./calculateCommunityBonus');

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

const checkPosition = (points, user) => {
  const levelPointsAndPosition = config.get('levelPointsAndPosition');
  let userPosition;
  console.log('userPosition length', levelPointsAndPosition.length);
  for (
    let index = 0;
    index < levelPointsAndPosition.length;
    index++
  ) {
    if (
      user.levelPoints + points >=
      levelPointsAndPosition[index].points
    )
      userPosition = levelPointsAndPosition[index].position;
  }
  return userPosition;
};

const isPackageValidForSuperBinary = (
  currentCryptoTokens,
  boughtPackages,
) => {
  // const date1 = new Date();
  // const date2 = new Date(updateDate);
  // const diffTime = Math.abs(date2 - date1);
  // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
  let responseBool = false;
  if (
    boughtPackages.includes(DIAMOND) &&
    currentCryptoTokens >= DIAMOND_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  } else if (
    boughtPackages.includes(PLATINUM) &&
    currentCryptoTokens >= PLATINUM_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  } else if (
    boughtPackages.includes(GOLD) &&
    currentCryptoTokens >= GOLD_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  }
  return responseBool;
};

const isPackageValidForBinary = (
  currentCryptoTokens,
  boughtPackages,
) => {
  // const date1 = new Date();
  // const date2 = new Date(updateDate);
  // const diffTime = Math.abs(date2 - date1);
  // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
  // const paymentPackages = config.get('paymentPackages');
  // const { points } = paymentPackages.find(
  //   (e) => e.name === currentPackage,
  // );
  let responseBool = false;
  if (
    boughtPackages.includes(DIAMOND) &&
    currentCryptoTokens >= DIAMOND_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  } else if (
    boughtPackages.includes(PLATINUM) &&
    currentCryptoTokens >= PLATINUM_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  } else if (
    boughtPackages.includes(GOLD) &&
    currentCryptoTokens >= GOLD_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  } else if (
    boughtPackages.includes(SILVER) &&
    currentCryptoTokens >= SILVER_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  }
  return responseBool;
};

const getSetValue = async (
  parentUser,
  internalToken,
  cryptoToken,
  levelPoints,
  systemID,
  userPosition,
) => {
  try {
    const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
    const cryptoTokenPercentage = config.get('cryptoTokenPercentage');
    const internalTokensPercentage = config.get(
      'internalTokensPercentage',
    );
    const paymentPackages = config.get('paymentPackages');
    const userActivePackage = currentActivePackage(
      parentUser.cryptoToken,
      parentUser.boughtPackages,
    );
    const { superBinaryCap, superBinaryRewardPercentage, weeklyCap } =
      paymentPackages.find((e) => e.name === userActivePackage);
    // package is valid or weekly cap is reached
    if (
      !isPackageValidForBinary(
        parentUser.cryptoToken,
        parentUser.boughtPackages,
      ) ||
      parentUser.earningsPerWeek >= weeklyCap
    ) {
      internalToken = 0;
      cryptoToken = 0;
    }

    // binary income
    const binaryType = 'normal';
    let binaryInternalIncome = internalToken;
    let binaryCryptoIncome = cryptoToken * cryptoTokenMultiplier;
    // await SystemToken.create({
    //   publicAddress: parentUser.publicAddress,
    //   numberOfTokens: binaryInternalIncome,
    //   cryptoToken: binaryCryptoIncome,
    //   type: binaryType,
    //   systemID,
    // });
    // conditions for super binary reward
    let superBinaryIncome = 0;
    const superBinaryType = 'superbinary';
    if (
      parentUser.hasPackageUpdated &&
      parentUser.superBinaryIncome <= superBinaryCap &&
      isPackageValidForSuperBinary(
        parentUser.cryptoToken,
        parentUser.boughtPackages,
      )
    ) {
      superBinaryIncome =
        internalToken * superBinaryRewardPercentage +
        cryptoToken * superBinaryRewardPercentage;
      // check, after adding super binary weekly cap is exceeding or not
      if (
        parentUser.superBinaryIncome + superBinaryIncome >
        superBinaryCap
      ) {
        const superBinaryDiff =
          superBinaryCap - parentUser.superBinaryIncome;
        superBinaryIncome = superBinaryDiff;
        internalToken += superBinaryDiff * internalTokensPercentage;
        cryptoToken += superBinaryDiff * cryptoTokenPercentage;
      } else {
        internalToken += internalToken * superBinaryRewardPercentage;
        cryptoToken += cryptoToken * superBinaryRewardPercentage;
      }
    }
    let superBinaryInternalIncome =
      superBinaryIncome * internalTokensPercentage;
    let superBinaryCryptoIncome =
      superBinaryIncome *
      cryptoTokenPercentage *
      cryptoTokenMultiplier;
    // await SystemToken.create({
    //   publicAddress: parentUser.publicAddress,
    //   numberOfTokens: superBinaryInternalIncome,
    //   cryptoToken: superBinaryCryptoIncome,
    //   type: superBinaryType,
    //   systemID,
    // });
    // after counting all the rewards if its still exceeding weekly cap
    // then distribute remaining cap values in internal and crypto tokens
    let earningsPerWeek = internalToken + cryptoToken;
    if (earningsPerWeek + parentUser.earningsPerWeek > weeklyCap) {
      const earningDiff = weeklyCap - parentUser.earningsPerWeek;
      earningsPerWeek = earningDiff;
      internalToken = earningDiff * internalTokensPercentage;
      cryptoToken = earningDiff * cryptoTokenPercentage;

      if (internalToken <= binaryInternalIncome) {
        binaryInternalIncome = internalToken;
        superBinaryInternalIncome = 0;
      } else {
        superBinaryInternalIncome =
          internalToken - binaryInternalIncome;
      }
      if (cryptoToken <= binaryCryptoIncome) {
        binaryCryptoIncome = cryptoToken;
        superBinaryCryptoIncome = 0;
      } else {
        superBinaryCryptoIncome = cryptoToken - binaryCryptoIncome;
      }
    }

    // earnings entry
    // binary
    await SystemToken.create({
      publicAddress: parentUser.publicAddress,
      numberOfTokens: binaryInternalIncome,
      cryptoToken: binaryCryptoIncome,
      type: binaryType,
      systemID,
    });

    // superBinary
    await SystemToken.create({
      publicAddress: parentUser.publicAddress,
      numberOfTokens: superBinaryInternalIncome,
      cryptoToken: superBinaryCryptoIncome,
      type: superBinaryType,
      systemID,
    });

    if (parentUser.rightPoint > parentUser.leftPoint) {
      return {
        $inc: {
          rightPoint: -parentUser.leftPoint,
          internalToken,
          cryptoToken: cryptoToken * cryptoTokenMultiplier,
          levelPoints,
          earningsPerWeek,
          superBinaryIncome,
          totalInternalToken: internalToken,
        },
        $set: {
          leftPoint: 0,
          userPosition: userPosition,
        },
      };
    }
    return {
      $inc: {
        leftPoint: -parentUser.rightPoint,
        internalToken,
        cryptoToken: cryptoToken * cryptoTokenMultiplier,
        levelPoints,
        earningsPerWeek,
        superBinaryIncome,
        totalInternalToken: internalToken,
      },
      $set: {
        rightPoint: 0,
        userPosition: userPosition,
      },
    };
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

// eslint-disable-next-line consistent-return
const creditRewards = async (systemID, points) => {
  try {
    const cryptoTokenPercentage = config.get('cryptoTokenPercentage');
    const internalTokensPercentage = config.get(
      'internalTokensPercentage',
    );
    const profitPointsRewardPercentage = config.get(
      'profitPointsRewardPercentage',
    );
    // current user
    const user = await User.findOne({ systemID }).lean();
    console.log(user.parentID);
    // parent user
    let parentUser = await User.findOne({
      systemID: user.parentID,
    }).lean();
    const childUsersOfParents = await User.find({
      parentID: parentUser.systemID,
    });
    // credit left-right points to parent user
    let profitPoints = 0;
    if (
      parentUser.currentPackage &&
      isPackageValidForBinary(
        parentUser.cryptoToken,
        parentUser.boughtPackages,
      )
    ) {
      if (user.isLeft) {
        parentUser = await User.findOneAndUpdate(
          {
            systemID: user.parentID,
          },
          { $inc: { leftPoint: points } },
          { new: true },
        ).lean();

        profitPoints = Math.min(
          parentUser.rightPoint,
          parentUser.leftPoint,
        );
      }
      if (user.isRight) {
        parentUser = await User.findOneAndUpdate(
          {
            systemID: user.parentID,
          },
          { $inc: { rightPoint: points } },
          { new: true },
        ).lean();

        profitPoints = Math.min(
          parentUser.leftPoint,
          parentUser.rightPoint,
        );
      }
      // check if parent has 2 child or not
      if (childUsersOfParents.length === 2 && profitPoints > 0) {
        const internalToken =
          profitPoints *
          profitPointsRewardPercentage *
          internalTokensPercentage;
        const cryptoToken =
          profitPoints *
          profitPointsRewardPercentage *
          cryptoTokenPercentage;
        const levelPoints = profitPoints * 2;

        const userPosition = checkPosition(levelPoints, parentUser);

        const setValue = await getSetValue(
          parentUser,
          internalToken,
          cryptoToken,
          levelPoints,
          systemID,
          userPosition,
        );
        // setValue.cryptoToken *= 10;
        await User.updateOne({ systemID: user.parentID }, setValue);
        if (
          parentUser &&
          parentUser.parentID &&
          parentUser.parentID !== 0
        ) {
          await calculateCommunityBonus(
            parentUser,
            profitPoints,
            systemID,
          );
        }
      }
    }
    //   let setValue = { $set: { $inc: { rightPoint: points } } };
    //   if (user.isLeft) {
    //     setValue = { $set: { $inc: { leftPoint: points } } };
    //   }
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

const updateData = async (systemID, points) => {
  // credit points and binary, super binary and community bonus to all users till root user
  let UserSystemID = systemID;
  while (UserSystemID !== 1) {
    console.log(UserSystemID);
    await creditRewards(UserSystemID, points);
    const user = await User.findOne({ systemID: UserSystemID });
    const parentUser = await User.findOne({
      systemID: user.parentID,
    });
    UserSystemID = parentUser.systemID;
  }
  console.log('the end');
};

module.exports = updateData;
