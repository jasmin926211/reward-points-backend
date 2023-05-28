/* eslint-disable no-shadow */
const jwt = require('jsonwebtoken');
const config = require('config');
const {
  ForbiddenException,
  BadRequestException,
} = require('./exceptions');

const verifyAdminToken = (req, res, next) => {
  if (!req.headers.authorization) {
    throw new BadRequestException('Please provide token');
  } else {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(
      token,
      config.get('adminLoginSecret'),
      (error, data) => {
        if (error) {
          throw new ForbiddenException('Invalid token', error);
        } else {
          req.id = data.id;
          next();
        }
      },
    );
  }
};

module.exports = {
  verifyAdminToken,
};
