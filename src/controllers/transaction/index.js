const express = require('express');

const router = express.Router();

const validateRequest = require('utilities/validateRequest');
const getTransactionDetails = require('./getTransactionDetails');
const updateTransaction = require('./updateTransaction');
const updateTransactionSchema = require('../../schema/updateTransactionSchema.schema');

router
  .route('/payment-status/:publicAddress')
  .get(getTransactionDetails);
router
  .route('/update-action')
  .put(validateRequest(updateTransactionSchema), updateTransaction);

module.exports = router;
