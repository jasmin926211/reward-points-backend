const express = require('express');

const router = express.Router();
const loginSchema = require('schema/admin/login.schema');
const updateUserCryptoTokensSchema = require('schema/admin/updateUserCryptoTokens.schema');
const addUserToTreeSchema = require('schema/admin/addUserToTree.schema');
const approveInternalTokenWithdrawalSchema = require('schema/admin/approveInternalTokenWithdrawal.schema');
const addLevelPointsSchema = require('schema/admin/addLevelPoints.schema');
const validateRequest = require('utilities/validateRequest');
const { verifyAdminToken } = require('utilities/verifyJwtToken');
const getAllInvestment = require('./getAllInvestment.controller');
const getDasboardData = require('./getDasboardData.controller');
const loginUser = require('./loginUser.controller');
const withdrawToken = require('./withdrawToken.controller');
const updateUserCryptoTokens = require('./updateUserCryptoTokens.controller');
const addUserToTree = require('./addUserToTree.controller');
const approveInternalTokenWithdrawal = require('./approveInternalTokenWithdrawal.controller');
const addLevelPoints = require('./addLevelPoints.controller');
const getAllUsers = require('./getAllUsers.controller');

router.route('/login').post(validateRequest(loginSchema), loginUser);
router
  .route('/get-investment')
  .get(verifyAdminToken, getAllInvestment);
router
  .route('/get-dashboard-data')
  .get(verifyAdminToken, getDasboardData);

router.route('/withdraw-token').post(verifyAdminToken, withdrawToken);
router
  .route('/update-crypto')
  .put(
    verifyAdminToken,
    validateRequest(updateUserCryptoTokensSchema),
    updateUserCryptoTokens,
  );
router
  .route('/add-user')
  .post(
    verifyAdminToken,
    validateRequest(addUserToTreeSchema),
    addUserToTree,
  );
router
  .route('/withdraw-internal-token')
  .post(
    verifyAdminToken,
    validateRequest(approveInternalTokenWithdrawalSchema),
    approveInternalTokenWithdrawal,
  );
router
  .route('/level-points')
  .post(
    verifyAdminToken,
    validateRequest(addLevelPointsSchema),
    addLevelPoints,
  );

router.route('/getUsers').get(verifyAdminToken, getAllUsers);

module.exports = router;
