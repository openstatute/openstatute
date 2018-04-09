const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('css', () =>
  gulp.src('./client/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css')));

gulp.task('js', () =>
  gulp.src('client/js/app.js')
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/js')));

gulp.task('img', () =>
  gulp.src('./client/img/**/**')
    .pipe(gulp.dest('./public/img')));

gulp.task('default', ['css', 'js', 'img']);
