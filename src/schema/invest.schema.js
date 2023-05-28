const Joi = require('@hapi/joi');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');

const investSchema = {
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
    blockchainTransactionID: Joi.string().required(),
    amount: Joi.number()
      .required()
      .min(0)
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter amount',
        ),
        ...generalMinLengthMessage(
          'number.min',
          25000,
          'Package amount',
        ),
      }),
  }),
};

module.exports = investSchema;
