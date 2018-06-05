'use strict';
/* eslint-disable import/no-extraneous-dependencies */


import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import plumber from 'gulp-plumber';
import livereload from 'gulp-livereload';
import sass from 'gulp-sass';
import eslint from 'gulp-eslint';
import excludeGitignore from 'gulp-exclude-gitignore';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-istanbul';
import nsp from 'gulp-nsp';
import coveralls from 'gulp-coveralls';
import isparta from 'isparta';
import browserify from 'browserify';
import uglify from 'gulp-uglify';
import path from 'path';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import flow from 'gulp-flowtype';
// import gutil from 'gulp-util';
// import path from 'path';

// Paths to libraries
const paths = {
  allSrcJs: './app/**/*.js',
  gulpFile: 'gulpfile.babel.js',
  libDir: 'public/js'
};

// SASS
gulp.task('sass', () => gulp.src('./public/css/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./public/css')));

// JAVASCRIPT
gulp.task('js', () => {
  const bundler = browserify({
    entries: ['./public/src/app.js'], // main js file and files you wish to bundle
    debug: true,
    extensions: [' ', 'js', 'jsx']
  }).transform(babelify.configure({
    presets: ['es2015'] // sets the preset to transpile to es2015 (you can also just define a .babelrc instead)
  }));

  // bundler is simply browserify with all presets set
  bundler.bundle()
    .on('error', function onError(err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('app.js')) // main source file
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true })) // create sourcemap before running edit commands so we know which file to reference
    .pipe(uglify()) // minify file
    // .pipe(rename("main-min.js")) // rename file
    .pipe(sourcemaps.write('./', { sourceRoot: './js' })) // sourcemap gets written and references wherever sourceRoot is specified to be
    .pipe(gulp.dest('./public/js'));
});

gulp.task('static', () => {
  return gulp.src([
    paths.allSrcJs,
    paths.gulpFile
  ])
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(flow({ abort: true }));
});

// gulp.task('static', () => {
//   return gulp.src('./app/**/*.js')
//     .pipe(excludeGitignore())
//     .pipe(eslint())
//     .pipe(eslint.format())
//     .pipe(eslint.failAfterError());
// });

gulp.task('nsp', cb => {
  nsp({package: path.resolve('package.json')}, cb);
});

// TESTING
gulp.task('pre-test', () => {
  return gulp.src('app/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], cb => {
  let mochaErr;

  gulp.src('test/**/*.test.js')
    .pipe(plumber())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', err => {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', () => {
      cb(mochaErr);
    });
});

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('develop', () => {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js coffee handlebars',
    stdout: false
  }).on('readable', function read() {
    this.stdout.on('data', (chunk) => {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

// Gulp watch syntax
// gulp.watch('files-to-watch', ['tasks', 'to', 'run']);
gulp.task('watch', () => {
  // gulp.watch(['./public/js/**/*.js', 'test/**'], ['test']);
  gulp.watch(['./public/src/**/*.js'], ['js']);
  gulp.watch('./public/css/*.scss', ['sass']);
});

gulp.task('prepublish', ['nsp']);
// gulp.task('default', ['static', 'test', 'coveralls']);

gulp.task('default', [
  'static',
  'sass',
  'js',
  // 'test',
  // 'coveralls',
  'develop',
  'watch'
]);
