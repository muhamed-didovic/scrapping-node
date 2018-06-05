'use strict';
const config = require('./config'),
  glob = require('glob'),
  mongoose = require('mongoose');

mongoose.connect(config.db);
const db = mongoose.connection;

db.on('error', () => {
  throw new Error('unable to connect to database at ' + config.db);
});

db.once('open', () => {
  console.log('CONNECTED TO MONGOOSE');
});

const gracefulExit = () => {
  db.close(() => {
    console.log('Mongoose default connection with DB :' + config.db + ' is disconnected through app termination');
    process.exit(0);
  });
};

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

const models = glob.sync(config.root + '/app/models/*.js');
models.forEach(model => {
  require(model);
});

module.exports = db;

