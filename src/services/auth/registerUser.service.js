/* eslint-disable no-param-reassign */
const User = require('models/User');
const {
  generateSuccessResponse,
} = require('utilities/generateResponse');
const {
  InternalServerException,
  ConflictException,
} = require('utilities/exceptions');
const getParentID = require('utilities/getParentID');
const Logger = require('config/logger');

// check user exist or not for given email id
const checkUserExistOrNot = async (publicAddress) => {
  const user = await User.findOne({ publicAddress });
  if (user) {
    throw new ConflictException('User already exist', publicAddress);
  }
};

const generateUniqueId = async () => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength),
    );
  }
  return result.toLowerCase();
};

const updateParent = async (parentDetail) => {
  if (parentDetail.isLeft) {
    await User.updateOne(
      { systemID: +parentDetail.userToUpdate },
      { $set: { hasLeft: true } },
    );
  }
  if (parentDetail.isRight) {
    await User.updateOne(
      { systemID: +parentDetail.userToUpdate },
      { $set: { hasRight: true } },
    );
  }
};

const updateLevelUsers = async (user) => {
  try {
    const firstLevelParent = await User.findOneAndUpdate(
      { systemID: user.parentID },
      {
        $push: {
          communityRewards: {
            userId: user.systemID,
            rewardRedeemed: false,
            level: 1,
          },
        },
      },
    );
    let secondLevelParent;
    if (
      firstLevelParent &&
      firstLevelParent.systemID &&
      firstLevelParent.systemID !== 1
    ) {
      secondLevelParent = await User.findOneAndUpdate(
        { systemID: firstLevelParent.parentID },
        {
          $push: {
            communityRewards: {
              userId: user.systemID,
              rewardRedeemed: false,
              level: 2,
            },
          },
        },
      );
    }
    if (
      secondLevelParent &&
      secondLevelParent.systemID &&
      secondLevelParent.systemID !== 1
    ) {
      await User.findOneAndUpdate(
        { systemID: secondLevelParent.parentID },
        {
          $push: {
            communityRewards: {
              userId: user.systemID,
              rewardRedeemed: false,
              level: 3,
            },
          },
        },
      );
    }
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

const registerUser = async (data) => {
  Logger.info('execute registerUser');
  try {
    await checkUserExistOrNot(data.publicAddress);
    const userReferenceID = data.referenceID.toLowerCase();
    const referralUser = await User.findOne({
      uniqueId: userReferenceID,
    });
    if (!referralUser) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({ message: 'Referral ID is not valid' });
    }
    if (!referralUser.hasBoughtFirstPackage) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message:
          'Referral ID is not active to activate buy a package',
      });
    }
    const parentDetail = await getParentID(referralUser.systemID);
    const parentUser = await User.findOne({
      systemID: +parentDetail.systemID,
    });
    const systemID = await User.find({})
      .sort({ systemID: -1 })
      .limit(1);
    console.log({ systemID });
    const uniqueId = await generateUniqueId();
    const newUser = {
      parentID: parentUser.systemID,
      systemID: systemID[0].systemID + 1,
      level: parentUser.level + 1,
      isLeft: parentDetail.isLeft,
      isRight: parentDetail.isRight,
      uniqueId: uniqueId,
      publicAddress: data.publicAddress,
      referenceID: referralUser.systemID,
    };
    console.log({ parentDetail });
    await updateParent(parentDetail);
    console.log({ newUser });
    const user = await User.create({ ...newUser });
    await updateLevelUsers(user);
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
    console.log(error);
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
};

module.exports = registerUser;
