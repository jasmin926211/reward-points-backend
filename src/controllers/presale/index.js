const express = require('express');

const router = express.Router();
const registerUserSchema = require('schema/registerUser.schema');
const loginSchema = require('schema/login.schema');
const investSchema = require('schema/invest.schema');
const validateRequest = require('utilities/validateRequest');
const registerUser = require('./registerUser.controller');
const loginUser = require('./loginUser.controller');
const invest = require('./invest.controller');

router
  .route('/register')
  .post(validateRequest(registerUserSchema), registerUser);
router.route('/login').post(validateRequest(loginSchema), loginUser);
router.route('/invest').post(validateRequest(investSchema), invest);

module.exports = router;
