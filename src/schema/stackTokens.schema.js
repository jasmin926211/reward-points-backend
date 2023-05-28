const Joi = require('@hapi/joi');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');

const stackTokensSchema = {
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
    numberOfStackingTokens: Joi.number()
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter number of tokens you want to stack',
        ),
      }),
    stackingPeriod: Joi.number()
      .valid(...[90, 180, 270])
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter stacking period',
        ),
        'any.only':
          'stackingPeriod has to be one of 90, 180 or 270 days',
      }),
  }),
};

module.exports = stackTokensSchema;
