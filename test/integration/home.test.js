"use strict";

process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const app = require('../../app');

describe('#/', () => {
  /**
   * Let's test homepage route
   */
  it('should return 200 for homepage', done => {
    supertest(app)
      .get('/')
      .end((err, res) => {
        expect(res.text).include('WATER');
        expect(res.status).to.be.equal(200);
        expect(res.body.error).to.be.equal(undefined);
        return done();
      });
  });
});
