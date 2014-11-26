'use strict';

var gulp        = require('gulp');

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

gulp.task('styles', function () {
  return gulp.src('app/**/*.scss')
    .pipe($.rubySass())
    .on('error', handleError)
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('app/'))
    .pipe($.size());
});

gulp.task('watch', ['styles'] ,function () {
  gulp.watch(['app/**/*.{js,html,css}', '!app/bower_components/**'],['reload']);
  gulp.watch('app/**/*.scss', ['styles']);
});

// Static server
gulp.task('serve', ['watch'], function() {
  $.browserSync({
    server: {
      baseDir: './app'
    }
  });
});
