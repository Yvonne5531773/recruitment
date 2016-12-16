'use strict';


var gulp = require('gulp');
var runSequence = require('run-sequence');
var plugins = require('gulp-load-plugins')();
var config = require('./config/config');
var path = require('path');
gulp.task('eslint', function () {
  return gulp.src(['server.js', 'server/**/*.js', 'public/modules/**/*.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('watch', function() {
  // gulp.watch(['public/modules/**/*', 'webpack.config.js'], ['webpack']);
});

gulp.task('clean', function () {
  return gulp.src('dist',{read:false})
        .pipe(plugins.clean());
});

gulp.task('rev', ['revCss', 'revJs'], function () {
  gulp.src(['public/css/manifest/*.json','public/js/manifest/*.json', 'public/homePage.html'])
      .pipe(plugins.revCollector())
      .pipe(gulp.dest('public'));
  return gulp.src(['public/css/manifest/*.json','public/js/manifest/*.json', 'server/*/views/*'])
            .pipe(plugins.revCollector())
            .pipe(gulp.dest('server'));
});

gulp.task('revCss', function () {
  return gulp.src('public/css/**/*.css')
          .pipe(plugins.rev())
          .pipe(gulp.dest('public/css'))
          .pipe(plugins.rev.manifest())
          .pipe(gulp.dest('public/css/manifest'));
});

gulp.task('revJs', function () {
  return gulp.src('public/js/**/*.js')
          .pipe(plugins.rev())
          .pipe(gulp.dest('public/js'))
          .pipe(plugins.rev.manifest())
          .pipe(gulp.dest('public/js/manifest'));
});

gulp.task('nodemon', function() {
  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: ['--debug=5859'],
    ext: 'js,html',
    watch: ['server/**/*', 'config/**/*']
  });
});

gulp.task('start', function() {
  return plugins.nodemon({
    script: 'server.js'
  });
});

gulp.task('move', function () {
  return gulp.src(['public/!(css|js)/**/*'])
         .pipe(gulp.dest('dist'));
});


gulp.task('moveAll', ['move', 'js','libJs', 'css']);

gulp.task('css', function () {
  return gulp.src('public/css/**/*.!(css)')
         .pipe(gulp.dest('dist/css'));
});

gulp.task('js', function () {
  return gulp.src(['client/core/app/config.js','client/core/app/init.js','client/*/*.js','client/**/*.js'])
         .pipe(plugins.concat('allJs.js'))
         .pipe(plugins.uglify())
         .pipe(gulp.dest('dist/client'));
});

gulp.task('libJs', function () {
  return gulp.src(config.files.client.libJs.map(lib => path.join('public', lib)))
         .pipe(plugins.concat('allLib.js'))
         .pipe(plugins.uglify())
         .pipe(gulp.dest('dist/client'));
});

gulp.task('setEnv', function () {
  process.env.NODE_ENV = 'production';
});

gulp.task('dist', function (done) {
  runSequence('rev', 'start', done);
});

gulp.task('default', function (done) {
  runSequence('eslint', ['nodemon', 'watch'], done);
});
