'use strict';
var fs = require('fs');
var gulp = require('gulp');
var webpack = require('webpack-stream');

var replace = require('gulp-replace');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');

//var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var minifyCss = require('gulp-minify-css');

var runner = require('run-sequence');
var del = require('del');

var webpackConfig = require('./webpack.prd');

var config = {
  imgDir: 'assets/images/',
  jsDir: 'assets/js/',
  cssDir: 'assets/css/',
  distDir: 'dist/',
  htmlDir: './',
  webroot: '/agentonline/'
};

gulp.task('js', function() {
  return gulp.src([config.jsDir + '*.js'])
    .pipe(webpack(webpackConfig))

    //.pipe(uglify())
    .pipe(rev())
    .pipe(replace(/url\(\/assets/g, 'url(' + config.webroot + 'assets'))
    .pipe(gulp.dest(config.distDir + config.jsDir))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./tmp/rev/js'));
});

gulp.task('css', function() {
  return gulp.src([config.cssDir + '*.css'])
    .pipe(minifyCss())
    .pipe(rev())
    .pipe(replace(/url\(\/assets/g, 'url(' + config.webroot + 'assets'))
    .pipe(gulp.dest(config.distDir + config.cssDir))
    .pipe(rev.manifest())
//    .pipe(replace(/url\(\/assets/g, 'url(' + config.webroot + 'assets'))
    .pipe(gulp.dest('./tmp/rev/css'));
});

gulp.task('images', function() {
  return gulp.src(['assets/images/**/*'])
    .pipe(gulp.dest(config.distDir + 'assets/images/'));
});

gulp.task('vendors', function() {
  return gulp.src(['assets/vendors/**/*'])
    .pipe(gulp.dest(config.distDir + 'assets/vendors/'));
});

gulp.task('fonts', function() {
  return gulp.src(['assets/fonts/**/*'])
    .pipe(gulp.dest(config.distDir + 'assets/fonts/'));
});

gulp.task('html', function() {
  return gulp.src([
      './tmp/rev/**/*.json',
      config.htmlDir + '**/*.html',
      '!' + config.htmlDir + config.distDir + '**/*',
      '!' + config.htmlDir + 'app/**/*.html',
      '!' + config.htmlDir + 'assets/**/*.html',
      '!' + config.htmlDir + 'node_modules/**/*.html',
      '!' + config.htmlDir + 'staticpage/**/*.html'
    ])
    .pipe(revCollector())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(replace(/\/assets/g, config.webroot + 'assets'))
    .pipe(gulp.dest(config.distDir));
});


gulp.task('common-css', function() {
  return gulp.src([config.cssDir + 'brokerwb-basic.css', config.cssDir + 'brokerwb-index.css', config.htmlDir + 'assets/vendors/iconfont/iconfont.css'])
    .pipe(replace(/url\(\/assets/g, 'url(' + config.webroot + 'assets'))
    .pipe(concat('common.css'))
    .pipe(minifyCss())
    .pipe(rev())
    .pipe(gulp.dest(config.distDir + config.cssDir))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./tmp/rev/css'));
});

gulp.task('replace-root-html', function() {
  return gulp.src([
      './tmp/rev/**/*.json',
      config.htmlDir + '*.html'
    ])
    .pipe(replace('</title>', '</title><link rel="stylesheet" type="text/css" href="/assets/css/common.css">'))
    .pipe(replace('id="app">', 'id="app">' + fs.readFileSync(config.htmlDir + 'app/html.tpl').toString()))
    .pipe(replace(/\/assets/g, config.webroot + 'assets'))
    .pipe(revCollector())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(config.distDir));
});

gulp.task('replace-analysis-html', function() {
  return gulp.src([
      './tmp/rev/**/*.json',
      config.htmlDir + 'analysis/*.html'
    ])
    .pipe(replace('</title>', '</title><link rel="stylesheet" type="text/css" href="/assets/css/common.css">'))
    .pipe(replace('id="app">', 'id="app">' + fs.readFileSync(config.htmlDir + 'app/html.tpl').toString()))
    .pipe(replace(/\/assets/g, config.webroot + 'assets'))
    .pipe(revCollector())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(config.distDir + 'analysis'));
});

gulp.task('prepare', function() {
  return del([
    './dist'
  ]);
});

gulp.task('clean', function() {
  return del([
    './tmp'
  ]);
});

gulp.task('default', function(callback) {
  runner(
    'prepare',
    ['js', 'css', 'images', 'vendors', 'fonts'],
    'html',
    'clean',
    callback);
});

gulp.task('rebuild', function(callback) {
  runner(
    'prepare',
    ['js', 'css', 'images', 'vendors', 'fonts'],
    'html',
    'common-css', 'replace-root-html', 'replace-analysis-html',
    'clean',
    callback);
});
