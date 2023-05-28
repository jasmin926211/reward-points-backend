/* eslint-disable no-loop-func */
const SystemToken = require('models/SystemToken');
const {
  generateSuccessResponse,
} = require('utilities/generateResponse');
const { InternalServerException } = require('utilities/exceptions');

const getUserEarning = async (id) => {
  try {
    const user = await SystemToken.find({
      publicAddress: id.toString(),
    });
    return Promise.resolve(
      generateSuccessResponse('successfully', { user }),
    );
  } catch (error) {
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = getUserEarning;
