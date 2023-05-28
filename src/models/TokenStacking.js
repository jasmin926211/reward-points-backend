const { Schema, model } = require('mongoose');

const TokenStacking = new Schema(
  {
    publicAddress: {
      type: String,
    },
    numberOfStackingTokens: {
      type: Number,
      default: 0,
    },
    earnedCryptoTokens: {
      type: Number,
      default: 0,
    },
    stackingPeriod: {
      type: Number,
    },
    isStackingPeriodExpired: {
      type: Boolean,
      default: false,
    },
    stackingEndDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = model('TokenStacking', TokenStacking);
