const Joi = require('@hapi/joi');
const {
  combineValidationMessages,
  generalMinLengthMessage,
  generalMaxLengthMessage,
} = require('utilities/validation');
const {
  MANDATORY_FIELD_RULE,
  ALPHA_NUMERIC_REGEX,
} = require('utilities/constants');

const updateUniqueIdSchema = {
  body: Joi.object().keys({
    uniqueId: Joi.string()
      .required()
      .min(5)
      .max(10)
      .pattern(ALPHA_NUMERIC_REGEX)
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter a uniqueId',
        ),
        ...generalMinLengthMessage('string.min', 5, 'UniqueId'),
        ...generalMaxLengthMessage('string.max', 10, 'UniqueId'),
        'string.pattern.base': 'Special characters not allowed',
      }),
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
  }),
};

module.exports = updateUniqueIdSchema;
