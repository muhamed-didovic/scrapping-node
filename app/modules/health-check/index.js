'use strict';

const healthCheckSystem = require('health-check-system');

//const env = process.env.NODE_ENV || "development";
//process.env.NODE_ENV = 'test';
const config = require('../../../config/config.js');

const statuses = {
  mongodb: [
    {
      url: config.db
    }
  ],
  api: config.urls.map(url => {
    return {
      url,
      method: "GET",
      expectedStatusCode: 200
    };
  })
};

module.exports = conf => {
  conf = conf || statuses;
  const state = {
    MongoDB: {},
    "Scrape links": {}
  };
  return healthCheckSystem.do({mongodb: conf.mongodb})
    .then(results => {
      state.MongoDB.results = results;
    })
    .then(() => healthCheckSystem.do({api: conf.api}))
    .then(results => {
      state["Scrape links"].results = results;
      return state;
    });
};
