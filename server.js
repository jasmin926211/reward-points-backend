require('dotenv').config();

process.env.NODE_CONFIG_DIR = './config/env';

const express = require('express');

const app = express();
const config = require('config');
const cors = require('cors');
const mongoose = require('mongoose');
const mongoConnection = require('./config/connection');
const job = require('./src/subscriptions/pre-sale');
const updateTransection = require('./src/subscriptions/updateTransections');
const checkStackingPeriod = require('./src/subscriptions/checkStackingPeriod');
const updateWeekEndDate = require('./src/subscriptions/updateWeekEndDate');
const updatePromoAvailability = require('./src/subscriptions/updatePromoAvailability');

app.use(cors());

// Initiate database connection
mongoConnection();

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting middleware for static resources
app.use(express.static('public'));

// Loading all the routes
require('./src/controllers')(app);

// Database health
app.get('/health', (req, res) => {
  const healthStatus = { status: 'UP' };
  if (mongoose.connection.readyState === 0)
    healthStatus.status = 'DOWN';
  res.send(healthStatus);
});

// Default 404 is returned if the route is not available
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

app.use((error, req, res, next) => {
  // eslint-disable-next-line no-param-reassign
  error.statusCode = error.statusCode || 500;
  // eslint-disable-next-line no-param-reassign
  error.status = error.status || 'Something went wrong!!';

  res.status(error.statusCode).json({
    title: error.title,
    message: error.message,
  });
});

// Function to start express server
function startServer() {
  const port = config.get('port');
  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Service Monitor Running on port ${port} in ${process.env.NODE_ENV} environment`,
    );
    job();
    updateTransection();
    checkStackingPeriod();
    updateWeekEndDate();
    updatePromoAvailability();
  });
}

// This function is not used much, it can be used in test-cases when server is mocked
function stopServer() {
  app.close(() => {
    process.exit();
  });
}

// Start the server
startServer();

/**
 *  We are exporting start and stop server so that this
 * can be accessed by test cases to mock the server
 * */

module.exports = {
  startServer,
  stopServer,
};
