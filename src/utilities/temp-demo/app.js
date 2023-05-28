let data = [
  {
    id: 1,
    parentID: 0,
    isLeft: false,
    isRight: false,
    hasLeft: true,
    hasRight: true,
    rightPoint: 0,
    leftPoint: 0,
    points: 0,
    referenceID: 0,
    level: 0,
  },
  {
    id: 2,
    parentID: 1,
    isLeft: false,
    isRight: true,
    hasLeft: false,
    hasRight: false,
    rightPoint: 0,
    leftPoint: 0,
    points: 0,
    referenceID: 1,
    level: 1,
  },
  {
    id: 3,
    parentID: 1,
    isLeft: true,
    isRight: false,
    hasLeft: false,
    hasRight: false,
    rightPoint: 0,
    leftPoint: 0,
    points: 0,
    referenceID: 1,
    level: 1,
  },
];

const checkHasLeftOrRight = (refID, side) => {
  const refUser = data.filter((r) => r.parentID === refID);

  const user = refUser.find((d) => d[side]);
  if (refUser) {
    return checkHasLeftOrRight(user.id, side);
  }
  return refID;
};

const travelOnOneSide = (refID, side) => {
  const refUser = data.find((r) => r[side] && r.parentID === refID);
  if (refUser) {
    return travelOnOneSide(refUser.id, side);
  }
  return refID;
};

const addUser = (
  parentID,
  referenceID,
  level,
  isLeft,
  isRight,
  id,
) => {
  data = data.map((e) => {
    if (e.id === parentID) {
      if (isLeft) {
        e.hasLeft = isLeft;
      } else {
        e.hasRight = isRight;
      }
    }
    return e;
  });
  data.push({
    id,
    parentID,
    isLeft,
    isRight,
    hasLeft: false,
    hasRight: false,
    rightPoint: 0,
    leftPoint: 0,
    points: 0,
    referenceID,
    level,
  });
};

const getParentID = (refID) => {
  const refUser = data.filter((r) => r.parentID === refID);
  let userID = '';

  if (!refUser.hasRight && refUser.isRight) {
    userID = checkHasLeftOrRight(refID, 'isRight');
    return { id: userID, isLeft: false, isRight: true };
  }

  if (!refUser.hasLeft && refUser.isLeft) {
    userID = checkHasLeftOrRight(refID, 'isLeft');
    return { id: userID, isLeft: true, isRight: false };
  }

  const rightTreeID = travelOnOneSide(refID, 'isRight');
  const rightLevel = data.find((ee) => ee.id === rightTreeID).level;
  const leftTreeID = travelOnOneSide(refID, 'isLeft');
  const leftLevel = data.find((ee) => ee.id === leftTreeID).level;
  const userData = {
    isLeft: rightLevel > leftLevel,
    isRight: rightLevel <= leftLevel,
  };

  if (userData.isLeft) {
    userData.id = leftTreeID;
  } else {
    userData.id = rightTreeID;
  }
  return userData;
};
// console.log(getParentID(1));
let g = 4;
[1, 2, 3, 4, 5, 6, 7].forEach((element) => {
  const { id, isLeft, isRight } = getParentID(element);
  let {
    // eslint-disable-next-line prefer-const
    id: parentID,
    // eslint-disable-next-line prefer-const
    referenceID,
    level,
  } = data.find((e) => e.id === id);
  // eslint-disable-next-line no-plusplus
  addUser(parentID, referenceID, level++, isLeft, isRight, g++);
});

console.log(data);
