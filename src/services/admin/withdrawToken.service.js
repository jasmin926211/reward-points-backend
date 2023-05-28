/* eslint-disable indent */
const { InternalServerException } = require('utilities/exceptions');
// totalInternalToken
const User = require('models/User');
const ObjectsToCsv = require('node-create-csv');

async function withdrawToken(body) {
  try {
    let response = 'ok';
    if (body.single.length) {
      await User.update(
        { systemID: body.single[0].systemID },
        {
          $set: {
            withdrawalRequest: false,
            tokensRequestedForWithdrawal: 0,
          },
        },
      );
    }
    if (body.bulk.length) {
      const ids = body.bulk.map((res) => res.systemID);
      const allUser = await User.find({ systemID: { $in: ids } });
      const dataTOSave = allUser.map((res) => ({
        publicID: res.publicAddress,
        token: res.tokensRequestedForWithdrawal,
      }));
      const csv = new ObjectsToCsv(dataTOSave);

      // Save to file:
      await csv.toDisk('../../allData.csv');

      // Return the CSV file as string:
      response = await csv.toString();
      await User.updateMany(
        { systemID: { $in: ids } },
        {
          $set: {
            withdrawalRequest: false,
            tokensRequestedForWithdrawal: 0,
          },
        },
      );
    }
    // const withdrawal = await User.find({ withdrawalRequest: true });
    return Promise.resolve({ response });
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

module.exports = withdrawToken;
