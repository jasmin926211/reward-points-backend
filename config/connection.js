const mongoose = require('mongoose');
const config = require('config');
const Logger = require('./logger');

const mongoURI = config.get('dbConfig.connectionString');

module.exports = () => {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);

  mongoose.connection.on('connected', () => {
    Logger.info(`Mongoose connected to ${mongoURI}`);
  });

  mongoose.connection.on('error', (err) => {
    Logger.info(
      `Failed to connect mongoose to ${mongoURI} due to error ${err}`,
    );
    process.exit(0);
  });

  mongoose.connection.on('disconnected', () => {
    Logger.info(`Mongoose disconnected from ${mongoURI}`);
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      Logger.info(
        `Mongoose connection terminated due to termination of application`,
      );
      process.exit(0);
    });
  });
};
