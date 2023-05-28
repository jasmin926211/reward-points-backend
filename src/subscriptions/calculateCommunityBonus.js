/* eslint-disable indent */
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

const isPackageValidForFirstLevel = (
  currentCryptoTokens,
  boughtPackages,
) => {
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

const isPackageValidForSecondLevel = (
  currentCryptoTokens,
  boughtPackages,
) => {
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
  }
  return responseBool;
};

const isPackageValidForThirdLevel = (
  currentCryptoTokens,
  boughtPackages,
) => {
  const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
  let responseBool = false;
  if (
    boughtPackages.includes(DIAMOND) &&
    currentCryptoTokens >= DIAMOND_POINTS * cryptoTokenMultiplier
  ) {
    responseBool = true;
  }
  return responseBool;
};

const checkCommunityBonusCriteria = async (
  currentNode,
  referralUserCount,
) => {
  try {
    const referralUsers = await User.find({
      referenceID: currentNode.systemID,
    });
    let responseBool = false;
    if (
      referralUsers.length >= referralUserCount &&
      currentNode.hasPackageUpdated
    ) {
      responseBool = true;
    }
    return responseBool;
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

const updateRewardTokens = async (
  node,
  tokens,
  communityBonusPercentage,
  systemID,
  level,
  weeklyCap,
) => {
  try {
    const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
    const cryptoTokenPercentage = config.get('cryptoTokenPercentage');
    const internalTokensPercentage = config.get(
      'internalTokensPercentage',
    );
    const profitPointsRewardPercentage = config.get(
      'profitPointsRewardPercentage',
    );

    let internalToken =
      tokens *
      communityBonusPercentage *
      profitPointsRewardPercentage *
      internalTokensPercentage;
    let cryptoToken =
      tokens *
      communityBonusPercentage *
      profitPointsRewardPercentage *
      cryptoTokenPercentage;

    let earningsPerWeek = internalToken + cryptoToken;
    if (earningsPerWeek + node.earningsPerWeek > weeklyCap) {
      const earningDiff = weeklyCap - node.earningsPerWeek;
      earningsPerWeek = earningDiff;
      internalToken = earningDiff * internalTokensPercentage;
      cryptoToken = earningDiff * cryptoTokenPercentage;
    }

    console.log('updateRewardTokens', internalToken, cryptoToken);
    await SystemToken.create({
      publicAddress: node.publicAddress,
      numberOfTokens: internalToken,
      cryptoToken: cryptoToken * cryptoTokenMultiplier,
      type: 'community',
      systemID,
      level,
    });
    const user = await User.findOneAndUpdate(
      {
        systemID: node.systemID,
      },
      {
        $inc: {
          internalToken,
          cryptoToken: cryptoToken * cryptoTokenMultiplier,
          totalInternalToken: internalToken,
          earningsPerWeek: earningsPerWeek,
        },
      },
    ).lean();
    if (!user) {
      Promise.reject(
        new InternalServerException('Internal Server Error'),
      );
    }
    return Promise.resolve();
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

const firstLevelBonusDistribution = async (
  currentNode,
  firstIncome,
  systemID,
  level,
) => {
  try {
    const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
    const firstLevelParent = await User.findOne({
      systemID: currentNode.referenceID,
    });
    if (!firstLevelParent) {
      return Promise.resolve({
        message: 'Parent user is not available',
      });
    }

    if (
      firstLevelParent.currentPackage &&
      isPackageValidForFirstLevel(
        firstLevelParent.cryptoToken,
        firstLevelParent.boughtPackages,
      )
    ) {
      const paymentPackages = config.get('paymentPackages');

      // eslint-disable-next-line prefer-const
      let { referralUserCount, communityBonusPercentage, weeklyCap } =
        paymentPackages[1];
      // check if regerral are valid package date validation
      const checkCommunityBonusCriteriaResponse =
        await checkCommunityBonusCriteria(
          firstLevelParent,
          referralUserCount,
        );
      if (checkCommunityBonusCriteriaResponse) {
        await updateRewardTokens(
          firstLevelParent,
          firstIncome,
          communityBonusPercentage,
          systemID,
          level,
          weeklyCap,
        );
      }
    }
    return Promise.resolve();
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

const secondLevelBonusDistribution = async (
  currentNode,
  firstIncome,
  systemID,
  level,
) => {
  try {
    const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
    const firstLevelParent = await User.findOne({
      systemID: currentNode.referenceID,
    });
    const secondLevelParent = await User.findOne({
      systemID: firstLevelParent.referenceID,
    });
    if (!secondLevelParent) {
      return Promise.resolve({
        message: 'Parent user is not available',
      });
    }

    if (
      secondLevelParent.currentPackage &&
      isPackageValidForSecondLevel(
        secondLevelParent.cryptoToken,
        secondLevelParent.boughtPackages,
      )
    ) {
      const paymentPackages = config.get('paymentPackages');

      // eslint-disable-next-line prefer-const
      let { referralUserCount, communityBonusPercentage, weeklyCap } =
        paymentPackages[2];
      // check if regerral are valid package date validation
      const checkCommunityBonusCriteriaResponse =
        await checkCommunityBonusCriteria(
          secondLevelParent,
          referralUserCount,
        );
      if (checkCommunityBonusCriteriaResponse) {
        await updateRewardTokens(
          secondLevelParent,
          firstIncome,
          communityBonusPercentage,
          systemID,
          level,
          weeklyCap,
        );
      }
    }
    return Promise.resolve();
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

const thirdLevelBonusDistribution = async (
  currentNode,
  firstIncome,
  systemID,
  level,
) => {
  try {
    const cryptoTokenMultiplier = config.get('cryptoTokenMultiplier');
    const firstLevelParent = await User.findOne({
      systemID: currentNode.referenceID,
    });
    const secondLevelParent = await User.findOne({
      systemID: firstLevelParent.referenceID,
    });
    if (!secondLevelParent) {
      return Promise.resolve({
        message: 'Parent user is not available',
      });
    }
    const thirdLevelParent = await User.findOne({
      systemID: secondLevelParent.referenceID,
    });
    if (!thirdLevelParent) {
      return Promise.resolve({
        message: 'Parent user is not available',
      });
    }

    if (
      thirdLevelParent.currentPackage &&
      isPackageValidForThirdLevel(
        thirdLevelParent.cryptoToken,
        thirdLevelParent.boughtPackages,
      )
    ) {
      const paymentPackages = config.get('paymentPackages');
      // eslint-disable-next-line prefer-const
      let { referralUserCount, communityBonusPercentage, weeklyCap } =
        paymentPackages[3];
      const checkCommunityBonusCriteriaResponse =
        await checkCommunityBonusCriteria(
          thirdLevelParent,
          referralUserCount,
        );
      if (checkCommunityBonusCriteriaResponse) {
        await updateRewardTokens(
          thirdLevelParent,
          firstIncome,
          communityBonusPercentage,
          systemID,
          level,
          weeklyCap,
        );
      }
    }
    return Promise.resolve();
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

const calculateCommunityBonus = async (
  currentNode,
  firstIncome,
  systemID,
) => {
  try {
    await firstLevelBonusDistribution(
      currentNode,
      firstIncome,
      systemID,
      1,
    );
    await secondLevelBonusDistribution(
      currentNode,
      firstIncome,
      systemID,
      2,
    );
    await thirdLevelBonusDistribution(
      currentNode,
      firstIncome,
      systemID,
      3,
    );
    console.log('end end');
    return Promise.resolve();
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

module.exports = calculateCommunityBonus;
