const express = require('express');

const router = express.Router();
const registerUserSchema = require('schema/registerUser.schema');
const loginSchema = require('schema/login.schema');
const validateRequest = require('utilities/validateRequest');
const registerUser = require('./registerUser.controller');
const loginUser = require('./loginUser.controller');

router
  .route('/register')
  .post(validateRequest(registerUserSchema), registerUser);
router.route('/login').post(validateRequest(loginSchema), loginUser);

module.exports = router;
