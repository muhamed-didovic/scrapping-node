'use strict';

process.env.NODE_ENV = 'test';

const glob = require('glob'),
  chai = require('chai'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  config = require('../../config/config'),
  _ = require('lodash'),
  mongoose = require('mongoose');
mongoose.Promise = global.Promise;

chai.use(chaiAsPromised);

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
describe('Scrape module with promises', function () {
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

  it('should resolve scrape module when valid url supplied', (done) => {
    const promise = scrape(config.urls[1]);
    expect(promise).to.fulfilled.and.notify(done);
  });

  it('should reject scrape module when invalid url supplied', () => {
    const promise = scrape('http://google.com');
    //expect(promise).to.fulfilled.and.notify(done);
    expect(promise).to.be.rejectedWith('Url is not valid');
    //expect(promise).to.eventually.equal('Url is not valid');
  });

  it('should reject scrape module when no url is supplied', () => {
    const promise = scrape('http://blsadsaa.co');
    //expect(promise).to.be.rejectedWith('getaddrinfo ENOTFOUND blsadsaa.co blsadsaa.co:80');
    expect(promise).to.be.rejectedWith('Url is not valid');
  });
});
