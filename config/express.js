'use strict';

const express = require('express');
const glob = require('glob');

const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');

module.exports = (app, config) => {
  const env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env === 'development';

  app.engine('handlebars', exphbs({
    layoutsDir: config.root + '/app/views/layouts/',
    defaultLayout: 'main',
    partialsDir: [config.root + '/app/views/partials/'],
    helpers: {
      inc: function (value, options) {
        return parseInt(value) + 1;
      },
      dec: function (value, options) {
        return parseInt(value) - 1;
      },
      compare: function (lvalue, operator, rvalue, options) {

        var operators, result;

        if (arguments.length < 3) {
          throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options === undefined) {
          options = rvalue;
          rvalue = operator;
          operator = "===";
        }

        operators = {
          '==': function (l, r) {
            return l == r;
          },
          '===': function (l, r) {
            return l === r;
          },
          '!=': function (l, r) {
            return l != r;
          },
          '!==': function (l, r) {
            return l !== r;
          },
          '<': function (l, r) {
            return l < r;
          },
          '>': function (l, r) {
            return l > r;
          },
          '<=': function (l, r) {
            return l <= r;
          },
          '>=': function (l, r) {
            return l >= r;
          },
          'typeof': function (l, r) {
            return typeof l == r;
          }
        };

        if (!operators[operator]) {
          throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }

        result = operators[operator](lvalue, rvalue);

        if (result) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    }
  }));
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'handlebars');

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  //app.use(methodOverride());
  app.use(methodOverride('X-HTTP-Method'));          // Microsoft
  app.use(methodOverride('X-HTTP-Method-Override')); // Google/GData
  app.use(methodOverride('X-Method-Override'));      // IBM
  app.use(methodOverride('_method'));

  const controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(controller => {
    require(controller)(app);
  });

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });
};
