'use strict';
const express = require('express'),
  router = express.Router(),
  config = require('../../config/config'),
  _ = require('lodash'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  reports = require('../modules/reports'),
  Device = mongoose.model('Device');

mongoose.Promise = global.Promise;

// @flow
module.exports = app => app.use('/reports', router);

router.get('/', (req, res) => {
  console.log(moment().format(), `GET /reports Entered route`);
  return res.render('reports', {
    title: 'Reports',
    message: ''
  });
});

router.post('/', (req, res, next) => {
  console.time('post reports route execution time');
  console.log(moment().format(), `POST /reports Entered route`);

  console.log(moment().format(), 'POST data FROM:', req.body.from, 'TO:', req.body.to);

  let filter = {};

  // sanitize and validate data
  if (!_.isEmpty(req.body.from) && !_.isEmpty(req.body.to) &&
    moment(req.body.from, 'YYYY-MM-DD', 'en', true).isValid() &&
    moment(req.body.to, 'YYYY-MM-DD', 'en', true).isValid()) {
    filter = {"date": {"$gte": new Date(req.body.from), "$lt": new Date(req.body.to)}};
  }
  console.log(moment().format(), `Filter for route:`, filter);
  Device.find(filter)
    .then(docs => {
      // if no docs are found
      if (!docs.length) {
        console.log(moment().format(), 'Docs not found');
        console.timeEnd('post reports route execution time');
        return res.render('reports', {
          title: 'Reports',
          message: 'No data has been found'
        });
      }

      const workbook = reports(docs);

      // todo: return this from package, create a class and return a promise?
      workbook.xlsx.writeFile(config.filename).then(() => {
        console.log(moment().format(), `xlsx file is written`);
        console.timeEnd('post reports route execution time');
        res.download(config.filename);
      });
    })
    .catch(err => {
      console.error(moment().format(), 'post reports Error:', err);
      return next(err);
    });
});
