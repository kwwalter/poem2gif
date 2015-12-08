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

    controller.poemArray = poemService.convert(poem);

    console.log("at the end of poemCtrl.convert(), poemArray is now: ", controller.poemArray);

    // clear the fields:
    controller.title = "";
    controller.body = "";
  }; // end of convert()
}]);

app.service('poemService', ['$http', function($http){
  this.convert = function(poem) {
    var bodystring = poem.body;

    // replace all the periods..
    var noPeriods = bodystring.replace(/\./g, " ");

    // break into lines..
    var linesArray = noPeriods.match(/[^\s.]+[^.\r\n]+[.]*/g);

    for (var i = 0; i < linesArray.length; i++) {
      // remove all the punctuation first..
      linesArray[i] = linesArray[i].replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()&]/g,"");

      // split the lines into words
      linesArray[i] = linesArray[i].split(" ");
    };

    // console.log("linesArray is now: ", linesArray);

    for (var j = 0; j < linesArray.length; j++) {
      for (var k = 0; k < linesArray[j].length; k++) {
        // set up each entry as an object
        if (linesArray[j][k]) {
          linesArray[j][k] = {
            linkToGIF: null,
            word: linesArray[j][k]
          }
        };
      }
    }
    // console.log("after the nested for loops, the linesArray is: ", linesArray);

    //here, make the API calls (using the public beta key), by iterating through the array.. using foreach instead
    linesArray.forEach(function(subarray){
      subarray.forEach(function(wordEntry){
        // console.log("entering the nested forEaches");

        // if it's not a blank entry, make the API call
        if (wordEntry) {
          $http.get('http://api.giphy.com/v1/gifs/search?q=' + wordEntry.word + '&api_key=dc6zaTOxFJmzC ')
          .then(function(data){
            console.log('data from API call when the word is ' + wordEntry.word + ' is: ', data);

            // conditional to ensure that data.data.data.length > 0
            if (data.data.data.length > 0) {
              // generate a random index value based on data array length
              var random = Math.floor(Math.random() * data.data.data.length) + 1;

              // concat the gifURL using the random index
              var gifURL = 'https://media.giphy.com/media/' + data.data.data[random].id + '/giphy.gif';

              // if the URL is valid, assign the value.
              if (gifURL) {
                wordEntry.linkToGIF = gifURL;
              }
            }
          }, function(error){
            console.log("error during API call: ", error);
          });
        } // end of if (wordEntry)
      }); // end of inner forEach
    }); // end of outer forEach

    console.log("at the end of poemService.convert(), linesArray is now: ", linesArray);

    return linesArray;
  }; // end of this.convert()
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
