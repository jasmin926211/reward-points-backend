const { Schema, model } = require('mongoose');
const { BONUSVALUE } = require('./Enum');

const SystemToken = new Schema(
  {
    publicAddress: {
      type: String,
    },
    numberOfTokens: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: BONUSVALUE,
    },
    cryptoToken: Number,
    systemID: Number,
    level: Number,
  },
  { timestamps: true },
);

module.exports = model('SystemToken', SystemToken);
