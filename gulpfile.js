var gulp = require('gulp');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var less = require('gulp-less');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');

gulp.task('default', [
  'vendor',
  'less',
  'js'
]);

gulp.task('vendor', [
  'vendor_js',
  'vendor_css'
]);

gulp.task('vendor_js', function () {
  return gulp.src([
    'bower_components/BigScreen/bigscreen.min.js',
    'bower_components/simplebar/dist/simplebar.min.js',
//    'bower_components/gmaps-marker-clusterer/src/markerclusterer.js'
  ])
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
});

gulp.task('vendor_css', function () {
  return gulp.src([
    'bower_components/simplebar/dist/simplebar.css'
  ])
    .pipe(concat('vendor.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('dist'))
});

gulp.task('less', ['font'], function () {
  return gulp.src([
    'src/less/*.less'
  ])
    .pipe(concat('main.css'))
    .pipe(less())
    .pipe(cssnano())
    .pipe(replace("url(../fonts/", "url(fonts/"))// find another way to do this
    .pipe(gulp.dest('dist'))
});

gulp.task('font', function () {
  return gulp.src([
    'src/fonts/*.*'
  ])
    .pipe(gulp.dest('dist/fonts'))
});

gulp.task('js', function () {
  return gulp.src([
    'src/js/*.js'
  ])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
});