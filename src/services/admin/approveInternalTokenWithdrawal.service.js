/* eslint-disable no-param-reassign */
const User = require('models/User');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');
const checkDuplicateEntry = require('utilities/checkDuplicateEntry');

const approveInternalTokenWithdrawal = async (data) => {
  try {
    const [users, findUserError] = await handleAsync(
      User.find({
        publicAddress: { $in: data.publicAddress },
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
    if (!users) {
      return Promise.reject(
        new ResourceNotFoundException(`No matching users available`),
      );
    }

    let bulk = User.collection.initializeUnorderedBulkOp();
    users.forEach((user) => {
      bulk.find({ publicAddress: user.publicAddress }).update({
        $set: {
          tokensRequestedForWithdrawal: 0,
          withdrawalRequest: false,
        },
        $inc: {
          totalTransferredInternalTokens:
            user.tokensRequestedForWithdrawal,
        },
      });
    });
    bulk.execute();

    // await User.findOneAndUpdate(
    //   { publicAddress: data.publicAddress },
    //   {
    //     $set: {
    //       tokensRequestedForWithdrawal: 0,
    //       withdrawalRequest: false,
    //     },
    //     $inc: {
    //       totalTransferredInternalTokens:
    //         user.tokensRequestedForWithdrawal,
    //     },
    //   },
    //   { new: true },
    // );
    return Promise.resolve({
      message: 'Tokens transferred successfully!',
    });
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

module.exports = approveInternalTokenWithdrawal;
