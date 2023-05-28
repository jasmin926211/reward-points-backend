const Joi = require('@hapi/joi');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');

const registerUserSchema = {
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
    referenceID: Joi.string()
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter a referenceID',
        ),
      }),
  }),
};

module.exports = registerUserSchema;
