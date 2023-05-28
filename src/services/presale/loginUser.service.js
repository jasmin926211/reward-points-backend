/* eslint-disable no-underscore-dangle */
const PresellUser = require('models/PresellUser');
const PackageTransaction = require('models/PackageTransactions');
const { COMPLETED, FAIL, PENDING } = require('utilities/constants');

const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');

async function loginValidation(user, data) {
  try {
    if (!user) {
      return Promise.reject(
        new ResourceNotFoundException(
          'User not found',
          data.publicAddress,
        ),
      );
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

async function loginUser(data) {
  try {
    console.log(data);
    const [user, findUserError] = await handleAsync(
      PresellUser.findOne({
        publicAddress: data.publicAddress.toLowerCase(),
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
    await loginValidation(user, data);
    const trx = await PackageTransaction.aggregate([
      {
        $match: {
          publicAddress: user.publicAddress.toLowerCase(),
          paymentStatus: COMPLETED,
        },
      },
      { $group: { _id: null, amount: { $sum: '$amount' } } },
    ]);
    const failTrx = await PackageTransaction.find({
      $and: [
        { publicAddress: user.publicAddress.toLowerCase() },
        { paymentStatus: FAIL },
      ],
    });
    const pendingTrx = await PackageTransaction.find({
      $and: [
        { publicAddress: user.publicAddress.toLowerCase() },
        { paymentStatus: PENDING },
      ],
    });
    user.amount = 0;
    if (trx.length) {
      user.amount = trx[0].amount / 0.2;
    }
    return Promise.resolve({
      user,
      hasFailTransaction: failTrx,
      pendingTransaction: pendingTrx,
    });
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

module.exports = loginUser;
