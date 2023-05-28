/* eslint-disable no-param-reassign */
const PackageTransaction = require('models/PackageTransactions');
const User = require('models/User');
const { InternalServerException } = require('utilities/exceptions');
const { MAIN } = require('utilities/constants');
const config = require('config');
const { v4: uuidv4 } = require('uuid');

const buyLevel = async (data) => {
  try {
    let transactionData;
    data.type = MAIN;
    if (!('isToken' in data) && !data.isToken) {
      const paymentPackages = config.get('paymentPackages');
      const { price } = paymentPackages.find(
        (e) => e.name === data.package,
      );
      data.amount = price;
      transactionData = await PackageTransaction.create({
        ...data,
      });
    } else {
      const paymentPackages = config.get('paymentPackages');
      const { tokenPrice } = paymentPackages.find(
        (e) => e.name === data.package,
      );
      const user = await User.findOne({
        publicAddress: data.publicAddress,
      });
      if (user.transfredToken >= tokenPrice) {
        data.amount = tokenPrice;
        transactionData = await PackageTransaction.create({
          ...data,
          paymentStatus: 'tokenPayment',
          blockchainTransactionID: uuidv4(),
        });
        const g = await User.update(
          { publicAddress: data.publicAddress },
          {
            $inc: {
              transfredToken: -tokenPrice,
            },
          },
        );
        console.log(g, tokenPrice, data.publicAddress);
      } else {
        return Promise.reject(
          new InternalServerException(
            'Insufficient Balance of transfer Token.',
          ),
        );
      }
    }

    return Promise.resolve({ transactionData });
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = buyLevel;
