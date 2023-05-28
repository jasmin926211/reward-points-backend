const PresellUser = require('models/PresellUser');
const {
  generateSuccessResponse,
} = require('utilities/generateResponse');
const {
  InternalServerException,
  ConflictException,
} = require('utilities/exceptions');
const Logger = require('config/logger');

// check user exist or not for given email id
const checkUserExistOrNot = async (publicAddress) => {
  const user = await PresellUser.findOne(
    { publicAddress },
    { _id: 1 },
  );
  if (user) {
    throw new ConflictException('User already exist', publicAddress);
  }
};

const registerUser = async (data) => {
  Logger.info('execute registerUser');
  try {
    await checkUserExistOrNot(data.publicAddress);
    const newUser = await PresellUser.create({
      publicAddress: data.publicAddress,
    });
    // eslint-disable-next-line no-underscore-dangle
    delete newUser._id;
    Logger.info('User registered successfully');
    return Promise.resolve(
      generateSuccessResponse(
        'User registered successfully',
        newUser,
      ),
    );
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = registerUser;
