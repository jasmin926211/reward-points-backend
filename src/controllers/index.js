/* eslint-disable global-require */
const config = require('config');

const apiVersion = config.get('apiVersion');

module.exports = (app) => {
  app.use(`/${apiVersion}/auth`, require('./auth'));
  app.use(`/${apiVersion}/pre-sale`, require('./presale'));
  app.use(`/${apiVersion}/admin`, require('./admin'));
  app.use(`/${apiVersion}/user`, require('./user'));
  app.use(`/${apiVersion}/token`, require('./token'));
  app.use(`/${apiVersion}/transaction`, require('./transaction'));
};
