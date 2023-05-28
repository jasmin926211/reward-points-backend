const { Schema, model } = require('mongoose');

const PresellUser = new Schema(
  {
    publicAddress: {
      type: String,
      lowercase: true,
    },
    point: {
      type: Number,
      default: 0,
    },
    token: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = model('PresellUser', PresellUser);
