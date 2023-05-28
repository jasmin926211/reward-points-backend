const { Schema, model } = require('mongoose');

const WithdrawTransactions = new Schema(
  {
    publicAddress: {
      type: String,
    },
    numberOfTokens: {
      type: Number,
      default: 0,
    },
    isTransfred: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = model('WithdrawTransactions', WithdrawTransactions);
