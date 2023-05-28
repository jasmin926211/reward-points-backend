const Joi = require('@hapi/joi');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');
const { SILVER, GOLD } = require('utilities/constants');

const approveInternalTokenWithdrawal = {
  body: Joi.object().keys({
    publicAddress: Joi.array()
      .allow(null, '')
      .items(Joi.string())
      .required(),
  }),
};

module.exports = approveInternalTokenWithdrawal;
