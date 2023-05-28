const Joi = require('@hapi/joi');
const {
  combineValidationMessages,
  generalMinLengthMessage,
} = require('utilities/validation');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');

const claimPromoPoints = {
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
    promoId: Joi.number()
      .required()
      .valid(...[1, 2, 3, 4])
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter amount',
        ),
        'any.only': 'promoId should be one of 1,2,3,4.',
      }),
  }),
};

module.exports = claimPromoPoints;
