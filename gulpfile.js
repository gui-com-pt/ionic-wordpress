var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var templateCache = require('gulp-angular-templatecache');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['src/*.mdl.js', 'src/**/*.mdl.js', 'src/*.js', 'src/**/*.js'],
  templates: ['./www/templates/*.html']
};

gulp.task('templates', function () {
  return gulp.src(paths.templates)
    .pipe(templateCache())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {  
  gulp.src(paths.js)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));

});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./dist/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist/'))
    .on('end', done);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.templates, ['templates']);
});

gulp.task('default', ['sass', 'scripts', 'templates']);