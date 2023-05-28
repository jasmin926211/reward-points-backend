const { Schema, model } = require('mongoose');
const { PENDING, PRE } = require('../utilities/constants');
const { PAYMENT_STATUS, TYPE, PACKAGE } = require('./Enum');

const packageTransactionsSchema = new Schema(
  {
    point: {
      type: Number,
    },
    isToken: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: PENDING,
    },
    package: {
      type: String,
      enum: PACKAGE,
    },
    type: {
      type: String,
      enum: TYPE,
      default: PRE,
    },
    publicAddress: {
      type: String,
    },
    actionPerformed: {
      type: Boolean,
      default: false,
    },
    amountIncTime: Date,
    blockchainTransactionID: {
      type: String,
    },
    status: String,
  },
  { timestamps: true, toObject: { virtuals: true } },
);
packageTransactionsSchema.virtual('user', {
  ref: 'PresellUser',
  localField: 'user',
  foreignField: 'publicAddress',
  justOne: true,
});
module.exports = model(
  'PackageTransactions',
  packageTransactionsSchema,
);
