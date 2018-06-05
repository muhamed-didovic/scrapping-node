"use strict";

process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
let Device = mongoose.model('Device');
mongoose.Promise = global.Promise;
// console.log('ENV', process.env.NODE_ENV);

// todo: add tests for POST VALIDATION
// todo: play with dates
// todo: should we clean and add some data?
describe('#/scrape', function () {
  this.timeout(100e3);

  beforeEach(done => {
    Device.collection.drop();
    return done();
  });

  /**
   * GET request to scrape page
   */
  it('should return 200 for GET /scrape', done => {
    supertest(app)
      .get('/scrape')
      .end((err, res) => {
        expect(res.text).include('WATER');
        expect(res.text).include('Successfully scraped 7 pages');
        expect(res.status).to.be.equal(200);
        expect(res.body.error).to.be.equal(undefined);
        return done();
      });
  });
});
