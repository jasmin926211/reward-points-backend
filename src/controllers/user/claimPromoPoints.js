const userService = require('services/user');
const Logger = require('config/logger');

const claimPromoPoints = (req, res, next) => {
  userService
    .claimPromoPoints(req.body)
    .then((response) => {
      Logger.info(
        'Exit log : User has claimed promo points successfully',
      );
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = claimPromoPoints;
