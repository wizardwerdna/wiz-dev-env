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
