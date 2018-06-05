'use strict';
const express = require('express'),
  router = express.Router(),
  config = require('../../config/config'),
  moment = require('moment'),
  scrape = require('../modules/scrape'),
  _ = require('lodash');

// @flow
module.exports = app => app.use('/scrape', router);

router.get('/', (req, res, next) => {
  console.time('get scrape route execution time');
  console.log(moment().format(), `GET /scrape Entered route`);
  const execute = () => {
    console.log(moment().format(), `Entered execute method`);
    const urls = config.urls;
    const promises = [];

    // lets fire 7 ajax calls to get data
    urls.forEach(url => {
      promises.push(scrape(url));
    });
    console.log(moment().format(), `End of execute method`);
    return Promise.all(promises);
  };

  execute()
    .then(data => {
      const dataLength = _.filter(data, obj => !_.isEmpty(obj)).length;
      console.log(moment().format(), 'FINISHED DATA LENGTH', dataLength);
      console.timeEnd('get scrape route execution time');
      return res.render('scrape', {
        title: 'WATER',
        devices: dataLength
      });
    })
    .catch(err => {
      console.error(moment().format(), 'get scrape Error:', err);
      return next(err);
    });
});
