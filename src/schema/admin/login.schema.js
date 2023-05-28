const Joi = require('@hapi/joi');
const {
  MANDATORY_FIELD_RULE,
  EMAIL_REGEX,
} = require('utilities/constants');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');

const loginSchema = {
  body: Joi.object().keys({
    email: Joi.string()
      .pattern(EMAIL_REGEX)
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter a email',
        ),
        'string.pattern.base': 'Please enter a valid email',
      }),
    password: Joi.string()
      .required()
      .min(7)
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter a password',
        ),
        ...generalMinLengthMessage('string.min', 7, 'password'),
      }),
  }),
};

module.exports = loginSchema;
