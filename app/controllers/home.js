'use strict';

const express = require('express'),
  packageJson = require('../../package.json'),
  moment = require('moment'),
  router = express.Router();

// @flow
module.exports = app => app.use('/', router);

/**
 * Show information about package with all available endpoints
 * https://github.com/properotech/audit-service/tree/rabbit-ack#get-info
 */
router.get('/info', (req, res) => {
  console.log(moment().format(), `GET /info Entered route`);
  return res.render('info', {
    title: 'Info',
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    homepage: packageJson.homepage,
    author: packageJson.author,
    routes: [
      {url: '/health'},
      {url: '/devices'},
      {url: '/reports'},
      {url: '/scrape'},
      {url: '/info'}
    ]
  });
});

router.get('/', (req, res) => {
  console.log(moment().format(), `Home route entered`);
  return res.render('index', {
    title: 'WATER',
    devices: []
  });
});
