const Joi = require('@hapi/joi');
const { combineValidationMessages } = require('utilities/validation');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');

const updateUserCryptoTokens = {
  body: Joi.object().keys({
    userId: Joi.string()
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter transferId',
        ),
      }),
    numberOfTokens: Joi.number()
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter number of tokens you want to decrease',
        ),
      }),
  }),
};

module.exports = updateUserCryptoTokens;
