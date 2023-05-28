const Joi = require('@hapi/joi');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');

const tokenTransferSchema = {
  body: Joi.object().keys({
    publicAddress: Joi.string()
      .required()
      .min(7)
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter a wallet address',
        ),
        ...generalMinLengthMessage('string.min', 7, 'wallet address'),
      }),
    transferId: Joi.string()
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
          'Please enter number of tokens you want to transfer',
        ),
      }),
  }),
};

module.exports = tokenTransferSchema;
