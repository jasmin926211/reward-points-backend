const {
  PENDING,
  FAIL,
  COMPLETED,
  PRE,
  MAIN,
  SILVER,
  GOLD,
  PLATINUM,
  DIAMOND,
  TOKENPAYMENT,
  COMUNITY,
  NORMAL,
  SUPERBINARY,
} = require('../utilities/constants');

module.exports = {
  PAYMENT_STATUS: [PENDING, FAIL, COMPLETED, TOKENPAYMENT],
  TYPE: [PRE, MAIN],
  PACKAGE: [SILVER, GOLD, PLATINUM, DIAMOND],
  BONUSVALUE: [COMUNITY, NORMAL, SUPERBINARY],
};
