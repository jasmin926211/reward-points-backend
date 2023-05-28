const User = require('models/User');
const mongoose = require('mongoose');
const Logger = require('config/logger');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');

const getUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    Logger.info('executing getUserById');
    try {
      const user = await User.findOne(
        { _id: mongoose.Types.ObjectId(id) },
        { password: 0 },
      );
      if (!user) {
        reject(new ResourceNotFoundException('User not found', id));
        return;
      }
      Logger.info('User fetched successfully');
      return resolve(user);
    } catch (error) {
      return reject(
        new InternalServerException('Internal Server Error', error),
      );
    }
  });
};

module.exports = getUserById;
