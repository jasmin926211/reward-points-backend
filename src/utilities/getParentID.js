const User = require('models/User');

// const checkHasLeftOrRight = async (refID, side) => {
//   const refUser = await User.find({ parentID: refID }).lean();
//   if (refUser.length) {
//     const user = refUser.find((d) => d[side]);
//     if (user) {
//       return checkHasLeftOrRight(user.systemID, side);
//     }
//   }
//   return refID;
// };

const travelOnOneSide = async (refID, side) => {
  const refUser = await User.findOne({
    $and: [{ parentID: refID }, { [side]: true }],
  }).lean();

  if (refUser) {
    return travelOnOneSide(refUser.systemID, side);
  }
  return refID;
};

async function getParentID(refID) {
  const refUser = await User.findOne({ systemID: refID }).lean();
  let userID = '';

  const directUser = await User.find({ referenceID: +refID }).lean();

  if (directUser.length === 0) {
    if ((!refUser.hasRight && refUser.isRight) || refUser.hasLeft) {
      // userID = await checkHasLeftOrRight(refID, 'isRight');
      userID = await travelOnOneSide(refID, 'isRight');
      return {
        systemID: +userID,
        isLeft: false,
        isRight: true,
        userToUpdate: refID,
      };
    }

    if ((!refUser.hasLeft && refUser.isLeft) || refUser.hasRight) {
      // userID = await checkHasLeftOrRight(refID, 'isLeft');
      userID = await travelOnOneSide(refID, 'isLeft');
      return {
        systemID: +userID,
        isLeft: true,
        isRight: false,
        userToUpdate: refID,
      };
    }
  }

  if (refUser.leftPoint > refUser.rightPoint) {
    userID = await travelOnOneSide(refID, 'isRight');
    return {
      systemID: +userID,
      isLeft: false,
      isRight: true,
      userToUpdate: refID,
    };
  }

  if (refUser.rightPoint > refUser.leftPoint) {
    userID = await travelOnOneSide(refID, 'isLeft');
    return {
      systemID: +userID,
      isLeft: true,
      isRight: false,
      userToUpdate: refID,
    };
  }

  const rightTreeID = await travelOnOneSide(refID, 'isRight');
  const rightLevel = await User.findOne({
    systemID: rightTreeID,
  }).lean();
  const leftTreeID = await travelOnOneSide(refID, 'isLeft');
  const leftLevel = await User.findOne({
    systemID: leftTreeID,
  }).lean();

  const userData = {
    isLeft: rightLevel.level > leftLevel.level,
    isRight: rightLevel.level <= leftLevel.level,
    userToUpdate: refID,
  };

  if (userData.isLeft) {
    userData.systemID = leftTreeID;
  } else {
    userData.systemID = rightTreeID;
  }
  return userData;
}

module.exports = getParentID;
