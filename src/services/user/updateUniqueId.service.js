/* eslint-disable no-param-reassign */
const User = require('models/User');
const { InternalServerException } = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');
const checkDuplicateEntry = require('utilities/checkDuplicateEntry');

const updateUniqueId = async (data) => {
  try {
    const [user, findUserError] = await handleAsync(
      User.findOne({ publicAddress: data.publicAddress }).lean(),
    );
    if (findUserError) {
      Promise.reject(
        new InternalServerException(
          'Internal Server Error',
          findUserError,
        ),
      );
    }
    if (!user.isUniqueIdUpdated) {
      const updatedUniqueId = data.uniqueId.toLowerCase();
      await User.findOneAndUpdate(
        { publicAddress: data.publicAddress },
        {
          $set: {
            uniqueId: updatedUniqueId,
            isUniqueIdUpdated: true,
          },
        },
        { new: true },
      );
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message: `You have changed your unique id before.`,
      });
    }
    return Promise.resolve();
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    } else {
      const addBasicInfoError =
        checkDuplicateEntry(error, 'ID') ||
        new InternalServerException('Internal Server Error', error);
      return Promise.reject(addBasicInfoError);
    }
  }
};

module.exports = updateUniqueId;
