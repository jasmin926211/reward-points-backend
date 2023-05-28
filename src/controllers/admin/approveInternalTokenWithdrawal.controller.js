const adminService = require('services/admin');
const Logger = require('config/logger');

const approveInternalTokenWithdrawal = (req, res, next) => {
  adminService
    .approveInternalTokenWithdrawal(req.body)
    .then((response) => {
      Logger.info(
        'Exit log : User internal tokens transferred successfully',
      );
      res.status(201).json(response);
    })
    .catch((error) => {
      Logger.error(new Error(`Exit log : ${error}`));
      next(error);
    });
};

module.exports = approveInternalTokenWithdrawal;
