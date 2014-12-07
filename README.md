# Wiz-Dev-Env

## Introduction

Wiz-Dev-Env is the node a node and angular based environment 
used for my "Superheroic Katas" screencasts.  It is an excellent vehicle for
building applications from scratch using TDD.  Scripts are provided for
testing, serving a development browser, developing a production build with
full minification of assets and deploying the app to Heroku.

Underlying technologies include:

  1. NodeJS
  1. Bower
  1. AngularJS
  1. Karma/Jasmine/PhantomJS/Angular-Mocks
  1. Twitter Bootstrap/Sass
  1. Gulp and many many supporting plugins

For a complete list, review the package.js and bower.json files.

## Setting up the Global Environment.

To use this environment, you will need to install nodeJS (with NPM), bower, 
karma-cli and gulp.

### Installing Git, NodeJS and NPM

If you haven't already, install git.  Git can be obtained from various sources.

If you haven't already, install nodejs and npm by using the files provided
at the [nodejs.org website](http://nodejs.org/).

### Installing Global Application Code
From the command line, install bower, karama-cli and gulp

```bash
sudo npm install -g bower
sudo npm install -g karma-cli
sudo npm install -g gulp
```

## Building a new project

The following code should set up a new project in directory "foo."

```bash
git clone https://github.com/wizardwerdna/wiz-dev-env.git foo
npm install && bower install
```

## Karma configuration

The karma configuration should run properly right out of the box, with

```bash
karma start
```

which should autoload all code you place in the tests directory, and 
all scripts placed in the app directory.  Angular-mocks (particularly the 
`module` and `inject` helper functions) should be readily
available from the tests.  

### Template Cache
You should be able to load any
html files in the app directory, precompiled into js and available
from the template cache, for example, with

```javascript
beforeEach(function(){
  module('index.html');
  inject(function(){
    console.log($templateCache.get('index.html'));
  });
});
```

### Utilty functions

Wiz-Dev-Env provides two utility functions for building a dynamic angular
page object from html in the tests.

  `ngFromHtml`(\<string\>[, \<initialization>\])

returns an angularjs object compiled from \<string\> and applied to a 
$rootScope.  The \$rootScope is initialized with a `vm` property set to the 
optional \<initialization\> parameter.

  `ngFrom`(\<template string\>[, \<initialization\>])

returns an angularjs object compiled from \$templateCache(
\<template string>\) and applied to a \$rootScope.  The \$rootScope is 
initialized with a `vm` property set to the 
optional \<initialization\> parameter.

With index.html containing

```html
<div>
  <div class="foo">{{1+1}}</div>
</div>
```

the following tests illustrate how these functions can be used

```javascript
describe("Wiz-Dev-Env Utility Functions", function() {

  it("ngFromHtml Example", function() {

    var ng = ngFromHtml('<div><div class="foo">{{1+1}}</div></div>');
    expect(ng.find('.foo').text()).toBe('2');

  });

  it("ngFrom Example", function(){

    module('index.html');
    var ng = ngFrom('index.html');
    expect(ng.find('.foo').text()).toBe('2');

  });
});	
```

##Gulp scripts

Wiz-Dev-Env provides a number of useful scripts for development, typically
assuming that you will be driving the application from an index.html files
substantially as follows:
```html
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title></title>
 <!-- build:css css/combined.css -->
 <link rel="stylesheet" href="styles/app.css" media="all">
 <!-- endbuild -->
 </head>
 <body ng-app>
 
    {{1+1}}  
 
 <!-- build:js scripts/combined.js -->
 <!-- bower:js -->
 <!-- endbower -->
 <script src="app.js"></script>
 <!-- endbuild -->
 </body>
 </html>

```

The following gulp scripts will be helpful

`gulp serve`

This script will insert references to the bower_components where indicated,
compile scss files to css, prepare images files for webwork and launch a server
on app/index.html.  The script will set watches on .js, .html, .css, .scss,
images files and bower.json, and will reload, rebuild and update the browser when appropriate.

`gulp`
`gulp build`

This default script will minimize asset files as appropriate, concatenate 
them into appropriate locations of a "dist" folder, modifying the index 
files stored in dist to point to the correspondingly prepared assets.  
The index.html in dist can be then be used with any static server or deployed
with Heroku. 
