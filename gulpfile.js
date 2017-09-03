const gulp = require('gulp');
const fs = require('fs');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglifyCss = require('gulp-uglifycss');
const pump = require('pump');
const runSequence = require('run-sequence');
const handlebars = require('gulp-compile-handlebars');
const sitemap = require('gulp-sitemap');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');

const config = require('./config.json');

// tasks
gulp.task('uglifyCss', () => {
  return gulp.src('./dist/css/*.css')
    .pipe(uglifyCss({
      uglyComments: true
    }))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('sass', () => {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('templates', function () {
  // read the config each run so we can detect changes
  const {
    templateData
  } = JSON.parse(fs.readFileSync('./config.json', 'utf-8').toString());
  const options = {
    batch: ['./src/templates/partials'],
    helpers: {
      capitals: function (str) {
        return str.toUpperCase();
      }
    }
  };

  return gulp.src('src/templates/*.hbs')
    .pipe(handlebars(templateData, options))
    .pipe(rename({
      extname: ".html"
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('minifyHtml', function () {
  return gulp.src('dist/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('sitemap', function () {
  gulp.src('dist/**/*.html', {
      read: false
    })
    .pipe(sitemap({
      siteUrl: config.siteUrl
    }))
    .pipe(gulp.dest('./dist'));
});


// main tasks
gulp.task('watch', ['sass', 'templates'], () => {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch(['./config.json', './src/templates/**/*.hbs'], ['templates']);
});

gulp.task('build', (cb) => {
  runSequence(['sass', 'templates'], ['uglifyCss', 'minifyHtml', 'sitemap'], cb);
});