var app = angular.module('poem2GIF', ['ngRoute']);

app.controller('MainController', ['$http', '$scope', function($http, $scope){

  var controller = this;



}]);

app.controller('PoemController', ['$http', '$scope', 'poemService', function($http, $scope, poemService){

  var controller = this;

  this.convert = function(){
    var poem = {
      title: controller.title,
      body: controller.body
    };
    poemService.convert(poem);
  };

}]);

app.service('poemService', function(){

  this.convert = function(poem) {
    // here, make the API calls
  };

});

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({ enabled: true });

  $routeProvider.
  when('/', {
    templateUrl: 'templates/welcome.html.erb',
    controller: 'MainController',
    controllerAs: 'mainCtrl'
  }).
  when('/new', {
    templateUrl: 'templates/new.html.erb',
    controller: 'PoemController',
    controllerAs: 'poemCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);
