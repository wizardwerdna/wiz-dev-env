'use strict';

var gulp        = require('gulp');
var wiredep     = require('wiredep').stream;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'browser-sync']
});

function handleError(err) {
  console.error(err.toString());
  this.emit('end');
}

var reload = $.browserSync.reload;

gulp.task('reload', function(){
  gulp.src(['app/**/*.{js,html,css}', '!app/bower_components/**'])
    .pipe(reload({stream: true}));
});

gulp.task('scripts', function () {
  return gulp.src(['app/**/*.js', '!app/bower_components/**'])
      .pipe($.jshint('.jshintrc'))
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets = $.useref.assets();

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('styles', function () {
  return gulp.src('app/**/*.scss')
    .pipe($.rubySass())
    .on('error', handleError)
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('app/'))
    .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

gulp.task('clean', function () {
  return gulp.src(['dist/styles', 'dist/scripts', 'dist/images', 'dist/fonts'],
    { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts']);

gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter([
      '**/*.eot',
      '**/*.svg',
      '**/*.ttf',
      '**/*.woff'
    ]))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

gulp.task('wiredep', function () {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      directory: 'app/bower_components',
      ignorePath: 'app/bower_components/'
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'app/bower_components',
      ignorePath: 'app/'
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['wiredep', 'scripts','styles'] ,function () {
  gulp.watch(['app/**/*.js', '!app/bower_components/**'],['scripts', 'reload']);
  gulp.watch(['app/**/*.{html,css}', '!app/bower_components/**'],['reload']);
  gulp.watch(['app/**/*.scss', '!app/bower_components/**'], ['styles']);

  gulp.watch('app/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});


// Static server
gulp.task('serve', ['watch'], function() {
  $.browserSync({
    server: {
      baseDir: './app'
    }
  });
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
