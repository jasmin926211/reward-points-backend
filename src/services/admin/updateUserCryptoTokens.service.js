/* eslint-disable no-param-reassign */
const User = require('models/User');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');
const checkDuplicateEntry = require('utilities/checkDuplicateEntry');

const updateUniqueId = async (data) => {
  try {
    const userUniqueId = data.userId.toLowerCase();
    const [user, findUserError] = await handleAsync(
      User.findOne({ uniqueId: userUniqueId }).lean(),
    );
    if (findUserError) {
      Promise.reject(
        new InternalServerException(
          'Internal Server Error',
          findUserError,
        ),
      );
    }
    if (!user) {
      return Promise.reject(
        new ResourceNotFoundException(
          `User id is not valid ${userUniqueId}`,
        ),
      );
    }
    await User.findOneAndUpdate(
      { uniqueId: userUniqueId },
      {
        $inc: { cryptoToken: -data.numberOfTokens },
      },
      { new: true },
    );
    return Promise.resolve();
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = updateUniqueId;
