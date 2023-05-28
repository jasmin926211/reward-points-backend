const Joi = require('@hapi/joi');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');
const {
  SILVER,
  GOLD,
  PLATINUM,
  DIAMOND,
} = require('../utilities/constants');

const buyLevelSchema = {
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
    package: Joi.string()
      .valid(SILVER, GOLD, PLATINUM, DIAMOND)
      .required(),
    blockchainTransactionID: Joi.string(),
    isToken: Joi.bool(),
  }),
};

module.exports = buyLevelSchema;
