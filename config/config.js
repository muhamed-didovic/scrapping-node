'use strict';

const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

const urls = [
  'http://209.234.181.18:880/auto/008',
  'http://209.234.181.18:880/auto/002',
  'http://209.234.181.18:880/auto/001',
  'http://209.234.181.18:880/auto/006',
  'http://209.234.181.18:880/auto/004',
  'http://209.234.181.18:880/auto/007',
  'http://209.234.181.18:880/auto/005'
  //'http://209.234.181.18:880/auto/003', // this is summary page it is not needed

];

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'node-water'
    },
    port: process.env.PORT || 8082,
    db: 'mongodb://localhost/node-water-development',
    urls,
    filename: 'report.xlsx'
  },

  test: {
    root: rootPath,
    app: {
      name: 'node-water'
    },
    port: process.env.PORT || 8082,
    db: 'mongodb://localhost/node-water-test',
    urls,
    filename: 'report.xlsx'
  },

  production: {
    root: rootPath,
    app: {
      name: 'node-water'
    },
    port: process.env.PORT || 8082,
    db: 'mongodb://localhost/node-water-production',
    urls,
    filename: 'report.xlsx'
  }
};
console.log('ENVIRONMENT', env);
//console.log('CONFIG', config[env]);
module.exports = config[env];
