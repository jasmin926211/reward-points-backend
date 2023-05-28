const { Schema, model } = require('mongoose');
const { PACKAGE } = require('./Enum');

const User = new Schema(
  {
    publicAddress: {
      type: String,
    },
    uniqueId: {
      type: String,
      required: true,
      index: {
        unique: true,
        collation: { locale: 'en', strength: 2 },
      },
    },
    isUniqueIdUpdated: {
      type: Boolean,
      default: false,
    },
    systemID: Number,
    parentID: Number,
    referenceID: Number,
    level: Number,
    transfredToken: {
      type: Number,
      default: 0,
    },
    isLeft: {
      type: Boolean,
      default: false,
    },
    firstIncome: {
      type: Number,
      default: 0,
    },
    currentIncome: {
      type: Number,
      default: 0,
    },
    currentIncomeUpdatedAt: {
      type: Date,
    },
    lastAddedChildAt: {
      type: Date,
    },
    isRight: {
      type: Boolean,
      default: false,
    },
    hasLeft: {
      type: Boolean,
      default: false,
    },
    hasRight: {
      type: Boolean,
      default: false,
    },
    rightPoint: {
      type: Number,
      default: 0,
    },
    leftPoint: {
      type: Number,
      default: 0,
    },
    levelPoints: {
      type: Number,
      default: 0,
    },
    userPosition: {
      type: String,
    },
    internalToken: {
      type: Number,
      default: 0,
    },
    totalInternalToken: {
      type: Number,
      default: 0,
    },
    currentPackage: {
      type: String,
      enum: PACKAGE,
    },
    cryptoToken: {
      type: Number,
      default: 0,
    },
    withdrawalRequest: {
      type: Boolean,
      default: false,
    },
    tokensRequestedForWithdrawal: {
      type: Number,
      default: 0,
    },
    withdrawalIds: {
      type: Array,
    },
    totalTransferredInternalTokens: {
      type: Number,
      default: 0,
    },
    totalTransferredCryptoTokens: {
      type: Number,
      default: 0,
    },
    packageUpdateDate: Date,
    packageEndDate: Date,
    weekEndDate: Date,
    earningsPerWeek: {
      type: Number,
      default: 0,
    },
    superBinaryIncome: {
      type: Number,
      default: 0,
    },
    hasBoughtFirstPackage: {
      type: Boolean,
      default: false,
    },
    hasPackageUpdated: {
      type: Boolean,
      default: false,
    },
    hasEnoughReferrals: {
      type: Boolean,
      default: false,
    },
    isCommunityBonusRedeemed: {
      type: Boolean,
      default: false,
    },
    communityRewards: [
      {
        userId: {
          type: Number,
        },
        rewardRedeemed: {
          type: Boolean,
          default: false,
        },
        level: {
          type: Number,
        },
      },
    ],
    promo1: {
      pointsRedeemed: {
        type: Boolean,
        default: false,
      },
      redeemedPoints: {
        type: Number,
        default: 0,
      },
    },
    promo2: {
      pointsRedeemed: {
        type: Boolean,
        default: false,
      },
      redeemedPoints: {
        type: Number,
        default: 0,
      },
    },
    promo3: {
      pointsRedeemed: {
        type: Boolean,
        default: false,
      },
      redeemedPoints: {
        type: Number,
        default: 0,
      },
    },
    promo4: {
      pointsRedeemed: {
        type: Boolean,
        default: false,
      },
      redeemedPoints: {
        type: Number,
        default: 0,
      },
    },
    boughtPackages: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = model('User', User);
