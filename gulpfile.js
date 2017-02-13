var gulp = require('gulp');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var less = require('gulp-less');
var uglify = require('gulp-uglify');

gulp.task('default', [
  'vendor'
]);

gulp.task('vendor', [
  'vendor_js',
  'vendor_css'
]);

gulp.task('vendor_js', function () {
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/BigScreen/bigscreen.min.js',
    'bower_components/simplebar/dist/simplebar.min.js',
    'bower_components/gmaps-marker-clusterer/src/markerclusterer.js'
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
