'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
chai.use(require('chai-datetime'));
const expect = chai.expect;
const glob = require('glob');
const config = require('../../config/config');
const _ = require('lodash');
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

console.log('Reports unit test', config.db);

const fixturesDocs = require('../fixtures/device-model.json');
let Device;
let connection;
let reports;
const reconnectToMongo = (done) => {
  mongoose.connect(config.db);
  connection = mongoose.connection;

  const models = glob.sync(config.root + '/app/models/*.js');
  models.forEach(model => {
    require(model);
  });
  reports = require('../../app/modules/reports/index');

  Device = mongoose.model('Device');
  return done();
};

describe('Unit test for reports module', function () {
  this.timeout(20e3);
  before(done => {
    if (mongoose.connection.db) {
      mongoose.connection.close(() => {
        //console.log('Mongoose default connection with DB :' + config.db + ' is disconnected through app termination');
        return reconnectToMongo(done);
      });
    } else {
      return reconnectToMongo(done);
    }
  });

  beforeEach(done => {
    Device.collection.drop();
    return done();
  });

  after(done => {
    connection.close(function () {
      return done();
    });
  });

  // todo: what if there is not docs?
  it('should make xls file from fixtures', function (done) {
    const workbook = reports(fixturesDocs);

    workbook.xlsx.writeFile(config.filename).then(() => {
      fs.stat("./report.xlsx", (err, stats) => {
        expect(err).to.be.equal(null);
        expect(stats.mtime).to.equalDate(new Date());
        return done();
      });
    });
  });

  it('should make xls file from MongoDB', function (done) {
    Device.insertMany(fixturesDocs)
      .then(docs => {
        //console.log('SAVED IN DB', docs);
        expect(docs.length).to.be.equal(7);
        let workbook = reports(docs);

        workbook.xlsx.writeFile(config.filename).then(() => {
          fs.stat("./report.xlsx", (err, stats) => {
            expect(err).to.be.equal(null);
            expect(stats.mtime).to.equalDate(new Date());
            return done();
          });
        });
      })
      .catch(done);
  });
});
