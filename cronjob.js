'use strict';

let glob = require('glob'),
  _ = require('lodash'),
  moment = require('moment'),
  config = require('./config/config'),
  mongoose = require('mongoose');

let cron = require('node-cron');
mongoose.connect(config.db);
let db = mongoose.connection;

db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});
db.once('open', function () {
  console.log('CONNECTED TO MONGOOSE');
});

let models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});

let scrape = require('./app/modules/scrape');

console.log('CURRENT TIME:', moment().format());
cron.schedule('1 * * * *', () => {
  console.time('test');
  console.log('STARTED at:', moment().format());
  let execute = () => {
    let urls = config.urls;
    let promises = [];

    // lets fire 8 ajax calls to get data
    urls.forEach(url => {
      promises.push(scrape(url));
    });
    // console.log('promises', promises);
    return Promise.all(promises);
  };

  execute()
    .then(data => {
      let dataLength = _.filter(data, obj => !_.isEmpty(obj)).length;
      console.log('FINISHED DATA LENGTH', dataLength);
      console.log('ENDED at:', moment().format());
      console.timeEnd('test');
    })
    .catch(err => {
      console.log('CRONJOB failed', err);
    });
});
