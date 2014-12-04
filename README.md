# Building Wiz-Dev-Env

This README describes how we built the development environment to facilitate 
building AngularJS frontend applications with TDD and an
automated build.  Leveraging free and open source tools, this environment can
be leveraged to build applications using vi, emacs or any IDE.  Technologies
used include:

  1. Node
  1. Bower (for component management)
  1. Angular 
  1. Karma/Jasmine/PhantomJS/Angular-Mocks (for running tests)
  1. Twitter Bootstrap/Sass (for CSS framework)
  1. Gulp (for automated build)

We will build:

  1. configuration files for npm, bower, karma
  1. well-tested utility functions for building walking skeletons in AngularJS
  1. gulp scripts:
    a. minimize files, build out the css.
    a. test server.
    a. build a production version suitable for CI deployment on Heroku 


## Fundamentals

The following will assume a working build of NodeJS/Npm.

```bash
#create directories
mkdir wiz-dev-env wiz-dev-env/app wiz-dev-env/app/styles wiz-dev-env/lib wiz-dev-env/test

#install bower
sudo npm install -g bower

#create npm package (select all defaults)
yes "" | npm init

#install karama/jasmine/phantomjs
npm install karma karma-jasmine karma-phantomjs-launcher --save-dev

#globally install karmaa-cli for convenience
sudo npm install -g karma-cli

#build karma configuration file (select defaults)
yes "" | karma init
```

add the following text to karma.conf.js

```bash
files: [
  'app/*.js',
  'test/*.js'
],

...
# replace Chrome with PhantomJS
browsers: ['PhantomJS'],

```

We startup karma and write a test.

```bash
karma start
```

and then write a test to confirm we are working.

in test/environment.js:
```javascript
'use strict';

describe('Test a sure thing to confirm the environment is up', function() {
  it('should pass', function(){
    expect(1===1).toBe(true);
  });
});
```

and then write a test to confirm we are loading .js code from the app dir.

adding to test/environment.js:

```javascript
describe('Test a sure thing to confirm the environment has access to app/', function() {
  /* global result: true */
  it('result should be 1', function(){
    expect(result()).toBe(1);
  });
});
```

and make it pass with:

in app.js:
```javascript
function result(){
  return 1;
};

```

## Add Bower, AngularJS and testing tools

```bash
# create bower config file, all defaults
yes "" | bower init
bower install angular --save
bower install angular-mocks jquery --save-dev
```

```javascript
files: [
  'bower_components/jquery/dist/jquery.js',
  'bower_components/angular/angular.js',
  'bower_components/angular-mocks/angular-mocks.js',
  '**/*.html'
  '*.js',
  '!(bower_components)/**/*.js',
  '../test/**/*.js'
],
```

And then punch out tests and utility fuctions to load up ng objects from html,
and from .html. 

in test/environment.js
```javascript
'use strict';

/* global describe: true */
/* global it: true */
/* global expect: true */
/* global inject: true */
/* global ngFrom: true */
/* global ngFromHtml: true */

describe('Test a sure thing to confirm the environment is up', function() {
  it('should pass', function(){
    expect(1===1).toBe(true);
  });
});

describe('Test a sure thing to confirm the environment has access to app/', function() {
  /* global result: true */
  it('result should be 1', function(){
    expect(result()).toBe(1);
  });
});

describe('ngFromHtml()', function() {
  it('should work for non-dynamic html', function(){
    var html = '<div></div>';
    var ng_html = '<div class="ng-scope"></div>';
    var ng = ngFromHtml(html);
    expect(ng.prop('outerHTML')).toBe(ng_html);
  });

  it('should work for simple dynamic html', function(){
    var html = '<div>{{1+1}}</div>';
    expect(ngFromHtml(html).text()).toBe('2');
  });

  it('should work for dynamic html with scope data', function() {
    var html = '<div>{{vm.result}}</div>';
    var vm = {result: 1};
    expect(ngFromHtml(html, vm).text()).toBe('1');
  });
});

describe('ngFrom()', function() {
  it('should work for non-dynamic html', function() {
    inject(function($templateCache){
      $templateCache.put('foo.html', '<div></div>');
    });
    var ng_html = '<div class="ng-scope"></div>';
    var ng = ngFrom('foo.html');
    expect(ng.prop('outerHTML')).toBe(ng_html);
  });

  it('should work for dynamic html with scope data', function() {
    var vm = {result: 1};
    inject(function($templateCache){
      $templateCache.put('foo.html', '<div>{{vm.result}}</div>');
    });
    expect(ngFrom('foo.html', vm).text()).toBe('1');
  });

});
```

and, the utility functions go in lib/ng-utilities.js

```javascript
'use strict';
/* global inject: true */
function ngFromHtml(html, vm){
  var ng;
  inject(function($rootScope, $compile){
    $rootScope.vm = vm;
    ng = $compile(html)($rootScope);
    $rootScope.$digest();
  });
  return ng;
}

function ngFrom(templateName, vm){
  var ng;
  inject(function($templateCache){
    ng = ngFromHtml($templateCache.get(templateName), vm);
  });
  return ng;
}
```

##Test Server 

Despite 100% passing test coverage, we still want to run our code, at least,
inside a browser and see how things are working.  To accomplish this, we will
assume an index.html file that will load an SPA, together with all of its
support and utility code.  That said, we will want to be able to concurrently
run our test scaffold and make tweaks to the code, the html and the css and
be able to have the served browser code reloaded and visible.  To do this, we
will use gulp, browserSync, and Sass to preprocess and reload our code where
needed.  (Later on, we will build a more comprehensive gulpfile for doing
complete production rebuilds.)

First, lets load up some tech, starting with gulp, a few gulp plugins,
browserSync and sass.

```bash
npm install gulp browser-sync gulp-load-plugins gulp-ruby-sass gulp-size --save-dev
```

Now, lets build a small gulpfile to start a static browser loading our
index.html and app.js, which will reload when the code is changed.

```javascript
'use strict';

var gulp        = require('gulp');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'browser-sync']
});

var reload = $.browserSync.reload;

gulp.task('reload', function(){
  gulp.src(['app/**/*.{js,html,css}', '!app/bower_components/**'])
    .pipe(reload({stream: true}));
});

gulp.task('watch', [] ,function () {
  gulp.watch(['app/**/*.{js,html,css}', '!app/bower_components/**'],['reload']);
});

// Static server
gulp.task('serve', ['watch'], function() {
  $.browserSync({
    server: {
      baseDir: './app'
    }
  });
});
```

You can start the server with `gulp serve`, but the result will be unsatisfactory,
because the index file is incomplete.  Let's fill that out:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
  <link rel="stylesheet" href="styles/app.css" media="all">
</head>
<body ng-app>
  <div>
    <input ng-model="result">
    <div class="output">{{result}}</div>
  </div>
  <script src="bower_components/angular/angular.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

Change some files, for example, changing the color in app/styles/app.css:

```css
body {
  background: orange;
}
```

## Dynamic css and Bootstrap

Lets load up twitter bootstrap

```bash
bower install bootstrap-sass --save-dev 
```

and change app/styles/app.scss to read:

```scss
$icon-font-path: "/bower_components/bootstrap-sass/fonts/";

@import '../bower_components/bootstrap-sass/lib/bootstrap';

/* Put your CSS here */
html, body {
  margin: 20px;
}

body {
    background: #fafafa;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #333;
}
```

and confirm that you have the technology running by executing

```bash
sass app/styles/app.scss app/styles/app.css
```

and confirm the changes are made when you run the server.  Now set up the 
watcher and a gulp task to run rubySass by modifying the gulpfile to read:

```javascript
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
    // .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('app/'))
    .pipe($.size());
});

gulp.task('watch', [] ,function () {
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
```

## Add some tools

Add some .jslint files.  I chose one for the main folder and another for the test folder

```bash
npm install karma-ng-html2js-preprocessor

npm install --save-dev gulp-autoprefixer

npm install --save-dev gulp-jshint jshint-stylish gulp-filter gulp-useref gulp-uglify gulp-csso gulp-if wiredep gulp-clean gulp-imagemin gulp-cache gulp-bower-files gulp-flatten 
npm install --save gzippo express connect morgan
```
