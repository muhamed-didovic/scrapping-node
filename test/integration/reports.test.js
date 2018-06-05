"use strict";

process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const supertest = require('supertest');
const app = require('../../app');
const moment = require('moment');
const mongoose = require('mongoose');
const fixturesDocs = require('../fixtures/device-model');
const Device = mongoose.model('Device');
mongoose.Promise = global.Promise;

//console.log(moment().subtract(1, 'days').format("DD/MM/YYYY"));

describe('#/reports', function () {
  this.timeout(100e3);

  describe('Routes:', () => {
    beforeEach(done => {
      Device.collection.drop();
      return done();
    });

    /**
     * GET request to reports page
     */
    it('should return 200 for GET /reports', done => {
      supertest(app)
        .get('/reports')
        .expect(200)
        .end((err, res) => {
          expect(res.text).include('WATER');
          expect(res.text).include('Reports');
          expect(res.status).to.be.equal(200);
          expect(res.body.error).to.be.equal(undefined);
          return done();
        });
    });

    /**
     * POST request to get all available documents in MongoDB
     * but DB is empty so we shouldn't get anything
     */
    it('should return 200 for POST /reports but without Excel', done => {
      supertest(app)
        .post('/reports')
        .expect(200)
        .end((err, res) => {
          expect(res.text).include('No data has been found');
          expect(res.status).to.be.equal(200);
          expect(res.body.error).to.be.equal(undefined);
          return done();
        });
    });

    /**
     * POST request to get all available documents in MongoDB
     * with GET request to /scrape url to fill the DB
     */
    // it('should return 200 for POST /reports with Excel', done => {
    //   supertest(app)
    //     .get('/scrape')
    //     .end((err, res) => {
    //       expect(res.text).include('WATER');
    //       expect(res.text).include('Successfully scraped 7 pages');
    //       expect(res.status).to.be.equal(200);
    //       expect(res.body.error).to.be.equal(undefined);
    //
    //       supertest(app)
    //         .post('/reports')
    //         .end((err, res) => {
    //           expect(res.type).to.be.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //           expect(res.status).to.be.equal(200);
    //           expect(res.body.error).to.be.equal(undefined);
    //           return done();
    //         });
    //     });
    // });
  });

  describe('Validate form dates', () => {
    before(done => {
      supertest(app)
        .get('/scrape')
        .expect(200)
        .end((err, res) => {
          expect(res.text).include('WATER');
          expect(res.text).include('Successfully scraped 7 pages');
          expect(res.status).to.be.equal(200);
          expect(res.body.error).to.be.equal(undefined);
          return done();
        });
    });

    const tests = [
      {data: {from: 'sss', to: ''}, expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
      {data: {from: null, to: ''}, expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
      {data: {from: undefined, to: ''}, expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
      {data: {from: 'aaa', to: 'aaa'}, expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
      {
        data: {
          from: moment().subtract(1, 'days').format("YYYY-MM-DD"),
          to: moment().add(1, 'days').format("YYYY-MM-DD")
        },
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: moment().subtract(1, 'days').format("YYYY-MM-DD"), to: 'aaa'},
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {
          from: moment().format("YYYY-MM-DD"),
          to: moment().add(1, 'days').format("YYYY-MM-DD")
        },
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      // {
      //   data: {
      //     from: moment().add(1, 'days').format("YYYY-MM-DD"),
      //     to: moment().add(2, 'days').format("YYYY-MM-DD")
      //   }, expected: 'text/html'
      // },
      {
        data: {
          from: moment().subtract(2, 'days').format("YYYY-MM-DD"),
          to: moment().subtract(1, 'days').format("YYYY-MM-DD")
        },
        expected: 'text/html'
      }
    ];

    tests.forEach(test => {
      it(`validate POST: /reports ${test.data.from} - ${test.data.to}`, done => {
        supertest(app)
          .post('/reports')
          .send({from: test.data.from})
          .send({to: test.data.to})
          .end((err, res) => {
            if (res.type === 'type/html') {
              expect(res.text).include('No data has been found');
            }
            expect(res.type).to.be.equal(test.expected);
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(undefined);
            return done();
          });
      });
    });
  });

  describe('Validate range of data', () => {
    before(done => {
      Device.collection.drop();
      Device.insertMany(fixturesDocs)
        .then(() => {
          console.log('SAVED IN DB');
          return done();
        })
        .catch(done);
    });

    const tests = [
      {
        data: {from: 'sss', to: ''},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: 'sss', to: 'xxxx'},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '', to: ''},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: null, to: ''},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: null, to: null},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-24ssssss', to: '2016-10-25'},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-24', to: '2016-10-25 sdasdsda'},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-asd10-24', to: '2016-10-25'},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: undefined, to: ''},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '', to: ''},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: undefined, to: undefined},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: 'aaa', to: 'aaa'},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-24', to: '2016-10-28'},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-24', to: '2016-10-25'},
        length: 2,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-25', to: '2016-10-26'},
        length: 2,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-26', to: '2016-10-27'},
        length: 2,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-27', to: '2016-10-28'},
        length: 1,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        data: {from: '2016-10-23', to: '2016-10-24'},
        length: 0,
        expected: 'text/html'
      },
      {
        data: {from: '2016-10-28', to: '2016-10-24'},
        length: 0,
        expected: 'text/html'
      },
      {
        data: {from: '2016-10-28', to: '2016-10-29'},
        length: 0,
        expected: 'text/html'
      },
      {
        data: {from: '2015-10-28', to: '2016-10-29'},
        length: 7,
        expected: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ];

    tests.forEach(test => {
      it(`POST: /reports from:'${test.data.from}' - to:'${test.data.to}'`, done => {
        supertest(app)
          .post('/reports')
          .send({from: test.data.from})
          .send({to: test.data.to})
          .end((err, res) => {
            let filter = {};
            if (res.type === 'type/html') {
              expect(res.text).include('No data has been found');
            }

            if (moment(test.data.from, 'YYYY-MM-DD', 'en', true).isValid() && moment(test.data.to, 'YYYY-MM-DD', 'en', true).isValid()) {
              filter = {"date": {"$gte": test.data.from, "$lt": test.data.to}};
            }
            expect(res.type).to.be.equal(test.expected);
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(undefined);

            Device
              .find(filter)
              .then(docs => {
                expect(docs.length).to.be.equal(test.length);
                return done();
              })
              .catch(done);
          });
      });
    });
  });
});
