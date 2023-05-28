const User = require('models/User');
const mongoose = require('mongoose');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');

const checkUserExistOrNot = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = undefined;
      if (mongoose.Types.ObjectId.isValid(data)) {
        user = await User.findOne({ _id: data });
      } else {
        user = await User.findOne({ email: data });
      }
      if (!user) {
        return reject(
          new ResourceNotFoundException('User not found', data),
        );
      }
      resolve(user);
    } catch (error) {
      reject(
        new InternalServerException('Internal Server Error', error),
      );
    }
  });
};

module.exports = { checkUserExistOrNot };
