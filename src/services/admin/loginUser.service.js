/* eslint-disable no-underscore-dangle */
const User = require('models/adminUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
  InternalServerException,
  ResourceNotFoundException,
  UnauthorizedException,
} = require('utilities/exceptions');
const handleAsync = require('utilities/handleAsync');

async function loginValidation(user, data) {
  try {
    if (!user) {
      return Promise.reject(
        new ResourceNotFoundException('User not found', data.email),
      );
    }
    if (!bcrypt.compareSync(data.password, user.password)) {
      return Promise.reject(
        new UnauthorizedException('Invalid password'),
      );
    }
    if (user.isUserDeleted) {
      return Promise.reject(
        new ResourceNotFoundException('User is deleted', data.email),
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
    const [user, findUserError] = await handleAsync(
      User.findOne({ email: data.email }),
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
    const key = config.get('adminLoginSecret');
    const token = jwt.sign({ id: user._id }, key);

    return Promise.resolve({ email: user.email, token });
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

module.exports = loginUser;
