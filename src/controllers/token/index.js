const express = require('express');

const router = express.Router();

const getAvailableTokenDetails = require('./getAvailableTokenDetails.controller');

router
  .route('/current-value/:publicAddress')
  .get(getAvailableTokenDetails);

module.exports = router;
