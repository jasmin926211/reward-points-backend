const Joi = require('@hapi/joi');
const { combineValidationMessages } = require('utilities/validation');
const { MANDATORY_FIELD_RULE } = require('utilities/constants');

const addLevelPoints = {
  body: Joi.object().keys({
    userId: Joi.string()
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter transferId',
        ),
      }),
    points: Joi.number()
      .required()
      .messages({
        ...combineValidationMessages(
          MANDATORY_FIELD_RULE,
          'Please enter number of points you want to increase',
        ),
      }),
  }),
};

module.exports = addLevelPoints;
