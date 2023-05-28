const Joi = require('@hapi/joi');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');
const {
  SILVER,
  GOLD,
  PLATINUM,
  DIAMOND,
} = require('utilities/constants');

const addUserToTreeSchema = {
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
    package: Joi.string()
      .valid(...[SILVER, GOLD, PLATINUM, DIAMOND])
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter a package',
        ),
        'any.only':
          'Package should be one of Silver, Gold, Platinum or Diamond',
      }),
  }),
};

module.exports = addUserToTreeSchema;
