'use strict';
const express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  // _ = require('lodash'),
  mongoose = require('mongoose'),
  Device = mongoose.model('Device');

mongoose.Promise = global.Promise;

// @flow
module.exports = app => app.use('/devices', router);

router.route('/:id')
  .get((req, res, next) => {
    console.time('get devices/:id route execution time');
    console.log(moment().format(), `GET /devices/:id Entered route`);
    const query = {"_id": req.params.id};
    console.log('query', query);
    Device.findOne(query)
      .then(doc => {
        console.log(moment().format(), `GET /devices/:id Entered route`);
        return res.render('device', {
          title: 'Edit device ',
          device: doc
        });
      })
      .catch(next);
  })
  .put((req, res, next) => {
    console.time('put devices/:id route execution time');
    console.log(moment().format(), `PUT /devices/:id Entered route`);
    const query = {"_id": req.params.id};
    const update = req.body;
    Device.findOneAndUpdate(query, {$set: {'data': update}}, (err, doc) => {
      if (err) {
        return next(err);
      }
      console.log(moment().format(), `PUT /devices/:id Entered route`);
      res.redirect(301, `/devices/${doc._id}`);
    });
  })
  .delete((req, res, next) => {
    console.time('delete devices/:id route execution time');
    console.log(moment().format(), `DELETE /devices/:id Entered route`);
    Device
      .remove({_id: req.params.id})
      .then(() => {
        console.log(moment().format(), `DELETE /devices/:id Entered route`);
        res.redirect(301, `/devices`);
      })
      .catch(next);
  });


/**
 * GET route
 * Get all devices from mongodb and paginate
 */
router.route('/')
  .get((req, res, next) => {
    console.time('get devices route execution time');
    console.log(moment().format(), `GET /devices ENTERED route`);//   .catch(next);

    const query = {};
    const options = {
      sort: {date: -1},
      // populate: 'author',
      // lean: true,
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10
    };

    Device
      .paginate(query, options)
      .then(result => {
        console.log(moment().format(), `GET /devices END route`, {result});
        return res.render('devices', {
          title: 'Devices',
          devices: result,
          page: req.query.page || 1,
          limit: req.query.limit || 10
        });
      })
      .catch(next);
  });
