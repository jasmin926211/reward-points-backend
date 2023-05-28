const express = require('express');

const router = express.Router();
const validateRequest = require('utilities/validateRequest');
const buyLevelSchema = require('../../schema/buyLevel.schema');
const stackTokensSchema = require('../../schema/stackTokens.schema');
const tokenTransferSchema = require('../../schema/tokenTransfer.schema');
const tokenWithdrawalSchema = require('../../schema/tokenWithdrawal.schema');
const updateUniqueIdSchema = require('../../schema/updateUniqueId.schema');
const claimPromoPointsSchema = require('../../schema/claimPromoPoints.schema');
const stackTokens = require('./stackTokens');
const buyLevel = require('./buyLevel');
const tokenTransfer = require('./tokenTransfer');
const tokenWithdrawal = require('./tokenWithdrawal');
const getTree = require('./getTree');
const getUserDetails = require('./getUserDetails');
const getUserEarning = require('./getUserEarning');
const getWithdraw = require('./getWithdraw');
const updateUniqueId = require('./updateUniqueId');
const claimPromoPoints = require('./claimPromoPoints');

router
  .route('/buy-level')
  .post(validateRequest(buyLevelSchema), buyLevel);
router
  .route('/stack-token')
  .post(validateRequest(stackTokensSchema), stackTokens);
router
  .route('/token-transfer')
  .post(validateRequest(tokenTransferSchema), tokenTransfer);
router
  .route('/token-withdrawal')
  .post(validateRequest(tokenWithdrawalSchema), tokenWithdrawal);
router.route('/get-tree/:id').get(getTree);
router.route('/basic-info/:id').get(getUserDetails);
router.route('/earning/:id').get(getUserEarning);
router.route('/withdraw-table/:id').get(getWithdraw);
router
  .route('/uniqueId')
  .put(validateRequest(updateUniqueIdSchema), updateUniqueId);
router
  .route('/claim-points')
  .put(validateRequest(claimPromoPointsSchema), claimPromoPoints);

module.exports = router;
