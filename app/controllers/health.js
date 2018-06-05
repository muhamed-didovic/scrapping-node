'use strict';
const express = require('express'),
  router = express.Router(),
  moment = require('moment');

const healthCheck = require('../modules/health-check');

// @flow
module.exports = app => app.use('/health', router);

router.get('/', (req, res) => {
  console.log(moment().format(), `GET #/health Entered route`);

  healthCheck()
    .then(results => {
      console.info(moment().format(), 'Health route responds with these result:', {results});
      return res.render('health', {
        title: 'Health check',
        results
      });
    })
    .catch(error => {
      console.error(moment().format(), 'Health is NOT ok with these errors:', {error});
      return res.render('health', {
        title: 'Health check',
        results: error
      });
    });
});
