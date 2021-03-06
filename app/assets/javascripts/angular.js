var app = angular.module('poem2GIF', ['ngRoute']);

app.controller('MainController', ['$http', '$scope', 'poemService', '$location', function($http, $scope, poemService, $location){

  var controller = this;

  this.redirect = function(whereTo) {
    $location.path('/' + whereTo);
  };

  // get a welcome page GIF..
  $http.get('http://api.giphy.com/v1/gifs/search?q=poetry&limit=100&api_key=dc6zaTOxFJmzC ')
  .then(function(res){
    // console.log('res from intro API call is: ', res);

    // conditional to ensure that res.data.data.length > 0
    if (res.data.data.length > 0) {
      // generate a random index value based on data array length.. removing the +1 to avoid the id of undefined problem
      var random = Math.floor(Math.random() * res.data.data.length);

      // concat the gifURL using the random index
      var gifURL = 'https://media.giphy.com/media/' + res.data.data[random].id + '/giphy.gif';

      // if the URL is valid, assign the value.
      if (gifURL) {
        controller.introGIFUrl = gifURL;
      }
    }
  }, function(error){
    console.log("error during API call: ", error);
  });
}]);

app.controller('AllController', ['$http', '$scope', 'poemService', '$location', function($http, $scope, poemService, $location){

  var controller = this;

  this.redirect = function(whereTo) {
    $location.path('/' + whereTo);
  };

  // tried doing this through the service, but not loading correctly.
  $http.get('/poems').then(function(res){
    // console.log("res from get /poems call is: ", res);
    controller.poems = res.data.poems;
  }, function(error){
    console.log("there was an error: ", error);
  });
}]);

app.controller('ShowController', ['$http', '$scope', 'poemService', '$location', '$routeParams', function($http, $scope, poemService, $location, $routeParams){

  var controller = this;

  // load the one poem
  this.getOnePoem = function(){
    // controller.onePoem = poemService.getOnePoem();
    // console.log("controller.onePoem is now: ", controller.onePoem);
    $http.get('/poems/' + $routeParams.id).then(function(res){
      // console.log("res from getOnePoem is: ", res);

      poem = res.data.poemObj;
      poem.poemContent = poemService.parsePoemArray(poem.poemContent);

      // console.log("poem is: ", poem);

      controller.poem = poem;
      console.log("controller.poem is: ", controller.poem);
    }, function(error){
      console.log("there was an error: ", error);
    });
  };

  this.redirect = function(whereTo) {
    $location.path('/' + whereTo);
  };

  // run on controller instantiation
  this.getOnePoem();
}]);

app.controller('PoemController', ['$http', '$scope', 'poemService', '$location', function($http, $scope, poemService, $location){

  var controller = this;

  this.convert = function(){
    var poem = {
      title: controller.title,
      author: controller.author,
      body: controller.body
    };

    poemService.setPoemData(poem);

    var bodystring = poem.body;

    // replace all the periods, carriage returns, and line breaks..
    var noPeriods = bodystring.replace(/\.\r\n/g, "");

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
          $http.get('http://api.giphy.com/v1/gifs/search?q=' + wordEntry.word + '&limit=100&api_key=dc6zaTOxFJmzC ')
          .then(function(res){
            // console.log('res from API call when the word is ' + wordEntry.word + ' is: ', res);

            // conditional to ensure that res.data.data.length > 0
            if (res.data.data.length > 0) {
              // generate a random index value based on data array length.. removing the +1 to avoid the id of undefined problem
              var random = Math.floor(Math.random() * res.data.data.length);

              // concat the gifURL using the random index
              var gifURL = 'https://media.giphy.com/media/' + res.data.data[random].id + '/giphy.gif';

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

    // console.log("at the end of convert(), linesArray is now: ", linesArray);

    // store the updated array in the service
    poemService.setPoemArray(linesArray);

    // clear the fields:
    controller.title = "";
    controller.author = "";
    controller.body = "";

    // redirect
    $location.path('/results');
  }; // end of convert()
}]);

app.controller('ResultsController', ['$http', '$scope', 'poemService', '$location', function($http, $scope, poemService, $location){

  var controller = this;

  // get the authenticity_token for saving purposes
  var authenticity_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  controller.poemArray = poemService.getPoemArray();
  controller.poemData = poemService.getPoemData();

  console.log("in ResultsController, poemArray is: ", controller.poemArray);

  // NOTE: might have to remove any blank entries (usually from periods at end of line) otherwise there'll be an error because multidimensional arrays must have subarrays of equal length

  this.saveGIFPoem = function(poemArray){
    // console.log("poemArray in saveGIFPoem is: ", poemArray);

    var stringified = poemService.stringifyPoemArray(poemArray);

    console.log("stringified poem array in saveGIFPoem is: ", stringified);

    $http.post('/poems', {
      //include authenticity_token
      authenticity_token: authenticity_token,
      title: controller.poemData.title || "untitled",
      author: controller.poemData.author || "anonymous",
      poemContent: stringified
    }).then(function(res){
      console.log("success! res from saveGIFPoem() is: ", res);

      // then redirect
      $location.path('/all')
    }, function(error){
      console.log("there was an error: ", error);
    });
  };

  this.deleteForever = function() {
    poemService.clearPoemData();
    $location.path('/');
  };
}]);

app.service('poemService', ['$http', '$routeParams', function($http, $routeParams){
  var serviceThis = this;

  this.setPoemArray = function(poemArray) {
    serviceThis.poemArray = poemArray;
  };

  this.getPoemArray = function() {
    return serviceThis.poemArray;
  };

  this.stringifyPoemArray = function(to_stringy) {
    serviceThis.stringified = JSON.stringify(to_stringy);

    return serviceThis.stringified;
    // console.log("in setStringifiedPoemArray(), stringified is now: ", serviceThis.stringified);
  };

  this.parsePoemArray = function(to_parse) {
    serviceThis.parsed = JSON.parse(to_parse);

    return serviceThis.parsed;
  };

  this.setPoemData = function(poem) {
    serviceThis.poemData = {
      title: poem.title,
      author: poem.author
    };
  };

  this.getPoemData = function() {
    return serviceThis.poemData;
  };

  this.clearPoemData = function() {
    serviceThis.poemArray = null;
    serviceThis.poemData = null;
  };
}]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({ enabled: true });

  $routeProvider.
  when('/', {
    templateUrl: 'templates/welcome.html',
    controller: 'MainController',
    controllerAs: 'mainCtrl'
  }).
  when('/all', {
    templateUrl: 'templates/all.html',
    controller: 'AllController',
    controllerAs: 'allCtrl'
  }).
  when('/poem/:id', {
    templateUrl: 'templates/show-one.html',
    controller: 'ShowController',
    controllerAs: 'showCtrl'
  }).
  when('/new', {
    templateUrl: 'templates/new.html',
    controller: 'PoemController',
    controllerAs: 'poemCtrl'
  }).
  when('/results', {
    templateUrl: 'templates/results.html',
    controller: 'ResultsController',
    controllerAs: 'resultsCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);
