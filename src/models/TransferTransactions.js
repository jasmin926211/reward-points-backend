const { Schema, model } = require('mongoose');

const TransferTransaction = new Schema(
  {
    publicAddress: {
      type: String,
    },
    numberOfTokens: {
      type: Number,
      default: 0,
    },
    transferId: String,
  },
  { timestamps: true },
);

module.exports = model('TransferTransaction', TransferTransaction);
