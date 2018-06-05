"use strict";

process.env.NODE_ENV = 'test';
const expect = require('chai').expect;
const healthCheck = require('../../app/modules/health-check');
const config = require('../../config/config.js');

describe('HEALTHCHECK STATUS', function () {
  this.timeout(10e3);

  it('should get healthcheck message WITHOUT errors', done => {
    healthCheck()
      .then(result => {
        expect(result).to.be.an('object');
        expect(result).to.have.keys(['MongoDB', 'Scrape links']);
        expect(result).to.contain.any.keys({'MongoDB': {'results': {'error': undefined}}});
        expect(result).to.contain.any.keys({'Scrape links': {'results': {'error': undefined}}});
        return done();
      })
      .catch(done);
  });

  it('should get healthcheck message WITH errors of wrong MongoDB and one wrong url', done => {
    const configuration = {
      "mongodb": [
        {
          url: 'mongodb://invalidUrl:41140/dbInvalid'
        }
      ],
      "api": [
        {
          url: 'http://209.234.181.18:880/auto/008' + '1',
          method: "GET",
          expectedStatusCode: 200
        }
      ]

    };

    healthCheck(configuration)
      .then(result => {
        console.log('RESULT', result['Scrape links'].results.error);
        expect(result).to.be.an('object');
        expect(result).to.have.keys(['MongoDB', 'Scrape links']);
        //expect(result).to.have.property('MongoDB').and.equal('bar');
        expect(result).to.have.deep.property('MongoDB.results.health', false);
        expect(result).to.have.deep.property('Scrape links.results.health', false);
        //.that.deep.equals({health: false});
        return done();
      })
      .catch(done);
  });

  it('should get healthcheck message WITH errors of wrong MongoDB and one wrong url', done => {
    const urls = config.urls.map((url, index) => {
      return {
        url: 'http://209.234.181.18:880/auto/008' + index,
        method: "GET",
        expectedStatusCode: 200
      };
    });
    const configuration = {
      "mongodb": [
        {
          url: 'mongodb://invalidUrl:41140/dbInvalid'
        }
      ],
      "api": urls

    };

    healthCheck(configuration)
      .then(result => {
        console.log('RESULT', result['Scrape links'].results.error);
        expect(result).to.be.an('object');
        expect(result).to.have.keys(['MongoDB', 'Scrape links']);
        //expect(result).to.have.property('MongoDB').and.equal('bar');
        expect(result).to.have.deep.property('MongoDB.results.health', false);
        expect(result).to.have.deep.property('Scrape links.results.health', false);
        //.that.deep.equals({health: false});
        return done();
      })
      .catch(done);
  });

  it('should get error for healthcheck', done => {
    const configuration = {
      "mongodb": [
        {
          url: 'adsds'
        }
      ],
      "api": [
        {
          url: 'http://209.234.181.18:880/auto/008' + '1',
          method: "GET",
          expectedStatusCode: 200
        }
      ]
    };
    healthCheck(configuration)
      .catch(err => {
        expect(err).to.eql(new Error('Error: invalid schema, expected mongodb'));
        return done();
      });
  });
});
