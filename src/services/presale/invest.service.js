/* eslint-disable no-underscore-dangle */
const PresellUser = require('models/PresellUser');
const PackageTransaction = require('models/PackageTransactions');

const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');

async function userValidation(user, data) {
  try {
    if (!user) {
      await PresellUser.create({ ...data });
      return Promise.resolve();
    }
    if (user.isUserDeleted) {
      return Promise.reject(
        new ResourceNotFoundException(
          'User is deleted',
          data.publicAddress,
        ),
      );
    }
    return Promise.resolve();
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

async function invest(data) {
  try {
    const [user, findUserError] = await handleAsync(
      PresellUser.findOne({
        publicAddress: data.publicAddress,
      }).lean(),
    );
    if (findUserError) {
      Promise.reject(
        new InternalServerException(
          'Internal Server Error',
          findUserError,
        ),
      );
    }
    await userValidation(user, data);
    const transactionData = await PackageTransaction.create({
      ...data,
      amountIncTime: new Date().toISOString(),
    });

    return Promise.resolve({ transactionData });
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

module.exports = invest;
