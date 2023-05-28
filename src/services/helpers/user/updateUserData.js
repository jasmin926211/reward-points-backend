const User = require('models/User');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const mongoose = require('mongoose');
const Logger = require('config/logger');

// update user data by userId and data query
const updateUserData = (userId, updateQuery) => {
  return new Promise(async (resolve, reject) => {
    try {
      Logger.info('Executing updateUserData');
      const userData = await User.findOneAndUpdate(
        {
          $and: [
            {
              _id: mongoose.Types.ObjectId(userId),
            },
            { isUserDeleted: false },
          ],
        },
        updateQuery,
      );
      if (!userData) {
        return reject(
          new ResourceNotFoundException('User doesn’t exist', userId),
        );
      }
      return resolve(userData);
    } catch (error) {
      reject(
        new InternalServerException('Internal Server Error', error),
      );
    }
  });
};

module.exports = { updateUserData };
