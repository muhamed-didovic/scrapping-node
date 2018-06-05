'use strict';

//  Modified from https://github.com/elliotf/mocha-mongoose
process.env.NODE_ENV = 'test';
const config = require('../../config/config');
const mongoose = require('mongoose');
//const env = process.env.NODE_ENV || "test";

beforeEach(done => {
  function clearDB() {
    for (const i in mongoose.connection.collections) {
      if (mongoose.connection.collections.hasOwnProperty(i)) {
        mongoose.connection.collections[i].remove(() => {});
      }
    }
    return done();
  }

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.db, err => {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
});

afterEach(done => {
  mongoose.disconnect();
  return done();
});
