"use strict";

process.env.NODE_ENV = 'test';
const expect = require('chai').expect;
const supertest = require("supertest-as-promised");
//const healthCheck = require('../../app/modules/health-check/index');
//const config = require('../../config/config.js');
const app = require('../../app');

//require('../utils/clear-collections');

describe('HEALTHCHECK STATUS', function () {
  this.timeout(10e3);
  it('should get healthcheck route', done => {
    supertest(app)
      .get('/health')
      .expect(200)
      .then(res => {
        //console.log('RES', res);
        expect(res.body).to.be.an('object');
        expect(res.text).include('MongoDB - true');
        expect(res.text).include('Scrape links - true');
        return done();
      })
      .catch(done);
  });
});
