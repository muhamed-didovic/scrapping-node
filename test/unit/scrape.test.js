'use strict';

process.env.NODE_ENV = 'test';

const decache = require('decache');
const expect = require('chai').expect;
const glob = require('glob');
const config = require('../../config/config');
const _ = require('lodash');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

console.log('Scrape unit test:', config.db);

let Device;
let connection;
let scrape;
const reconnectToMongo = (done) => {
  mongoose.connect(config.db);
  connection = mongoose.connection;

  const models = glob.sync(config.root + '/app/models/*.js');
  models.forEach(model => {
    require(model);
  });
  scrape = require('../../app/modules/scrape');
  Device = mongoose.model('Device');
  return done();
};
describe('Unit test for scrape module', function () {
  this.timeout(100e3);

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
    connection.close(() => done());
  });

  it('should return 7 devices', done => {
    // lets fire 7 ajax calls to get data
    const promises = config.urls.map(url => {
      return scrape(url);
    });

    Promise.all(promises)
      .then(docs => {
        expect(docs.length).to.equal(7);
        expect(promises.length).to.equal(docs.length);
        return done();
      })
      .catch(done);
  });

  it('should return 1 device', done => {
    scrape(config.urls[1])
      .then(data => {
        expect(data).to.be.an('object');
        Device.find()
          .then(doc => {
            expect(doc.length).to.equal(1);
            expect(data.data).to.deep.equal(doc[0].data);
            return done();
          });
      })
      .catch(done);
  });

  it('should not return 1 device for google.com', done => {
    scrape('http://google.com')
      .then(data => {
        expect(data).to.be.an('object');
        expect(data).to.be.deep.equal({});
        return done();
      })
      .catch(done);
  });

  it('should not return 1 device for not existing link', done => {
    scrape('http://blsadsaa.co')
      .catch(err => {
        expect(err.message).to.be.equal("getaddrinfo ENOTFOUND blsadsaa.co blsadsaa.co:80");
        return done();
      });
  });
});

