const { Schema, model } = require('mongoose');

const User = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    publicAddress: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = model('adminUser', User);
