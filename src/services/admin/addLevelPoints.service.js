/* eslint-disable no-param-reassign */
const User = require('models/User');
const {
  InternalServerException,
  ResourceNotFoundException,
} = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');
const checkDuplicateEntry = require('utilities/checkDuplicateEntry');
const config = require('config');

const checkPosition = (points, user) => {
  const levelPointsAndPosition = config.get('levelPointsAndPosition');
  let userPosition;
  console.log('userPosition length', levelPointsAndPosition.length);
  for (
    let index = 0;
    index < levelPointsAndPosition.length;
    index++
  ) {
    if (
      user.levelPoints + points >=
      levelPointsAndPosition[index].points
    )
      userPosition = levelPointsAndPosition[index].position;
  }
  return userPosition;
};

const addLevelPoints = async (data) => {
  try {
    const userUniqueId = data.userId.toLowerCase();
    const [user, findUserError] = await handleAsync(
      User.findOne({ uniqueId: userUniqueId }).lean(),
    );
    if (findUserError) {
      Promise.reject(
        new InternalServerException(
          'Internal Server Error',
          findUserError,
        ),
      );
    }
    if (!user) {
      return Promise.reject(
        new ResourceNotFoundException(
          `User id is not valid ${userUniqueId}`,
        ),
      );
    }

    const userPosition = checkPosition(data.points, user);
    await User.findOneAndUpdate(
      { uniqueId: userUniqueId },
      {
        $inc: { levelPoints: data.points },
        $set: { userPosition: userPosition },
      },
      { new: true },
    );
    return Promise.resolve({
      message: 'Points added to user successfully',
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

module.exports = addLevelPoints;
