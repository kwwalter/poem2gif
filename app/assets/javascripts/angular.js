var app = angular.module('poem2GIF', ['ngRoute']);

app.controller('MainController', ['$http', '$scope', function($http, $scope){

  var controller = this;
  this.name = "kevin"; 

  alert('new controller instantiated.. ', controller);
}]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({ enabled: true });

  $routeProvider.
  when('/', {
    templateUrl: 'templates/welcome.html.erb',
    controller: 'MainController',
    controllerAs: 'mainCtrl'
  }).
  // when('/posts/:id', {
  //   templateUrl: 'templates/posts.html',
  //   controller: 'PostsController',
  //   controllerAs: 'postsCtrl'
  // }).
  otherwise({
    redirectTo: '/'
  });
}]);
