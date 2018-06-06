'use strict';

const Xray = require('x-ray'),
  _ = require('lodash'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  Device = mongoose.model('Device');

mongoose.Promise = global.Promise;

let x = Xray()
  .throttle(1, '4s')
  // .concurrency(5)
  .delay('1s');

x = Xray({
  filters: {
    trim: value => (typeof value === 'string' ? value.trim() : value),
    reverse: value => (typeof value === 'string' ? value.split('').reverse().join('') : value),
    slice: (value, start, end) => (typeof value === 'string' ? value.slice(start, end) : value)
  }
});

const toObj = (keys, values) => keys.reduce((o, k, i) => {
  // check if it is not empty
  if (k.length > 0) {
    // todo: we can't store 'dot' in mongodb as key
    k = k.replace(/\./g, "");
    o[k] = values[i];
  }
  return o;
}, {});

// @flow
module.exports = url => {
  if (!url.includes('209.234.181.18:880/auto')) {
    //throw new Error('Url is not valid');
    Promise.reject('Url is not valid');
  }

  return new Promise((resolve, reject) => {
    console.log(moment().format(), 'COLLECTING DATA FROM:', url);
    console.time(url);
    x(url, 'body', [{
      name: 'body p font b',
      keys: x('table', ['tr td:first-child | trim']),
      values: x('table', ['tr td:last-child | trim'])
    }])((err, data) => {
      if (err) {
        console.error(moment().format(), 'x-ray Error:', err);
        return reject(err);
      }

      //check if we can reach the page
      if ( _.some(data, { name: 'Authorization Required' })){
        return reject('Can scrape from URL, Authorization is Required');
      }

      console.log(moment().format(), 'Successfully scraped from:', url, 'Data:', data);
      let obj = {};

      // if we don't find anything
      if (_.isEmpty(data)) {
        return resolve(obj);
      }

      // console.log('112', data[0].keys.length, '-', data[0].values.length);
      // ensure that we really have some data inside of arrays
      if (data[0].keys.length < 2 || data[0].values.length < 2) {
        return resolve(obj);
      }

      // check is data available
      if (data !== undefined) { // && newData.keys.length === newData.values.length
        // todo: check length of arrays??
        const newData = data[0];

        newData.keys = newData.keys.slice(1);
        newData.values = newData.values.slice(1);

        // check if devices are OFFLINE OR NO DATA IS AVAILABLE like '-----'
        // if (newData.values[0] === 'OFFLINE' ||
        //   newData.values[1] === 'OFFLINE' ||
        //   newData.values[0] === '-----' ||
        //   newData.values[1] === '-----') {
        //   return resolve(obj);
        // }

        // combine keys array and values array into object
        obj = toObj(newData.keys, newData.values);

        // add device name
        obj['DeviceName'] = data[0].name;
      }
      console.timeEnd(url);
      // console.log('INCOMING OBJECT', obj);
      if (_.isEmpty(obj)) {
        return resolve(obj);
      }

      const doc = new Device({
        name: obj.DeviceName,
        data: obj
      });

      return doc.save()
        .then(doc => {
          console.log(moment().format(), 'SAVED IN DB', url);
          return resolve(doc);
        })
        .catch(err => {
          console.error(moment().format(), 'Device on save Error:', err);
          throw new Error(err);
        });
    });
  });
};
