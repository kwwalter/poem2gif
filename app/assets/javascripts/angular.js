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

    // clear the fields:
    // controller.title = "";
    // controller.body = "";
  };

}]);

app.service('poemService', ['$http', function($http){

  this.convert = function(poem) {
    var bodystring = poem.body;
    // var linesArray = bodystring.match(/[^\r]/gm);
    // console.log("linesArray is: ", linesArray);
    var linesArray = bodystring.match(/[^\s.!?]+[^.!?\r\n]+[.!?]*/g);
    // console.log("linesArray is: ", linesArray);

    for (var i = 0; i < linesArray.length; i++) {
      // split the lines into words
      linesArray[i] = linesArray[i].split(/[ ,?.-]+/);
    };

    console.log("linesArray is now: ", linesArray);

    // here, make the API call (using the public beta key)
    $http.get('http://api.giphy.com/v1/gifs/search?q=' + poem.body + '&api_key=dc6zaTOxFJmzC ')
    .then(function(data){
      // var random = Math.floor(Math.random() * data.data.length) + 1;
      // console.log("data from promise2.success is: ", data);
      // show.gifURL = 'https://media.giphy.com/media/' + data.data[random].id + '/giphy.gif';
      // console.log(show.gifURL);
      console.log("data is: ", data);
    }, function(error){
      console.log("error during API call: ", error);
    });
  };
}]);

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
