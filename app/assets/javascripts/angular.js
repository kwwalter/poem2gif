var app = angular.module('poem2GIF', ['ngRoute']);

app.controller('MainController', ['$http', '$scope', 'poemService', '$location', function($http, $scope, poemService, $location){

  var controller = this;

  this.redirect = function(whereTo) {
    $location.path('/' + whereTo);
  };

  // load up all the current poems on controller instantiation
  controller.poems = poemService.getAll();

  // get a welcome page GIF..
  $http.get('http://api.giphy.com/v1/gifs/search?q=poetry&limit=100&api_key=dc6zaTOxFJmzC ')
  .then(function(data){
    console.log('data from intro API call is: ', data);

    // conditional to ensure that data.data.data.length > 0
    if (data.data.data.length > 0) {
      // generate a random index value based on data array length.. removing the +1 to avoid the id of undefined problem
      var random = Math.floor(Math.random() * data.data.data.length);

      // concat the gifURL using the random index
      var gifURL = 'https://media.giphy.com/media/' + data.data.data[random].id + '/giphy.gif';

      // if the URL is valid, assign the value.
      if (gifURL) {
        controller.introGIFUrl = gifURL;
      }
    }
  }, function(error){
    console.log("error during API call: ", error);
  });
}]);

app.controller('ShowController', ['$http', '$scope', 'poemService', '$location', '$routeParams', function($http, $scope, poemService, $location, $routeParams){

  var controller = this;

  // load the one poem
  this.getOnePoem = function(){
    // controller.onePoem = poemService.getOnePoem();
    // console.log("controller.onePoem is now: ", controller.onePoem);
    $http.get('/poems/' + $routeParams.id).then(function(data){
      console.log("data from getOnePoem is: ", data);
      controller.onePoem = data.data;
      console.log("controller.onePoem is now: ", controller.onePoem);
    }, function(error){
      console.log("there was an error: ", error);
    });
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

    // controller.poemArray = poemService.convert(poem);

    // poemService.convert(poem);

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
          .then(function(data){
            // console.log('data from API call when the word is ' + wordEntry.word + ' is: ', data);

            // conditional to ensure that data.data.data.length > 0
            if (data.data.data.length > 0) {
              // generate a random index value based on data array length.. removing the +1 to avoid the id of undefined problem
              var random = Math.floor(Math.random() * data.data.data.length);

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
    console.log("poemArray in saveGIFPoem is: ", poemArray);

    $http.post('/poems', {
      //include authenticity_token
      authenticity_token: authenticity_token,
      title: controller.title || "untitled",
      author: controller.author || "anonymous",
      poem: poemArray
    }).then(function(data){
      console.log("success! data from saveGIFPoem() is: ", data);
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

  this.getAll = function() {
    $http.get('/poems').then(function(data){
      // console.log("data from getAll call is: ", data);
      serviceThis.poems = data.data;
    }, function(error){
      console.log("there was an error: ", error);
    });

    return serviceThis.poems;
  };

  this.setPoemArray = function(poemArray) {
    serviceThis.poemArray = poemArray;
  };

  this.getPoemArray = function() {
    return serviceThis.poemArray;
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

  // this.convert = function(poem) {
  //   var bodystring = poem.body;
  //
  //   // replace all the periods..
  //   var noPeriods = bodystring.replace(/\./g, " ");
  //
  //   // break into lines..
  //   var linesArray = noPeriods.match(/[^\s.]+[^.\r\n]+[.]*/g);
  //
  //   for (var i = 0; i < linesArray.length; i++) {
  //     // remove all the punctuation first..
  //     linesArray[i] = linesArray[i].replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()&]/g,"");
  //
  //     // split the lines into words
  //     linesArray[i] = linesArray[i].split(" ");
  //   };
  //
  //   // console.log("linesArray is now: ", linesArray);
  //
  //   //here, make the API calls (using the public beta key), by iterating through the array
  //   for (var j = 0; j < linesArray.length; j++) {
  //     for (var k = 0; k < linesArray.length; k++) {
  //       // set each entry up as an object
  //       if (linesArray[j][k]) {
  //         linesArray[j][k] = {
  //           linkToGIF: null,
  //           word: linesArray[j][k]
  //         }
  //       }
  //
  //       // if it's not a blank entry, make the API call
  //       if (linesArray[j][k]) {
  //         $http.get('http://api.giphy.com/v1/gifs/search?q=' + linesArray[j][k] + '&api_key=dc6zaTOxFJmzC ')
  //         .then(function(data){
  //           console.log('data from API call #j(' + j + ') #k(' + k + ') is: ', data);
  //
  //           // conditional to ensure that data.data.data.length > 0
  //           if (data.data.data.length > 0) {
  //             // generate a random index value based on data array length
  //             var random = Math.floor(Math.random() * data.data.data.length) + 1;
  //
  //             // concat the gifURL using the random index
  //             var gifURL = 'https://media.giphy.com/media/' + data.data.data[random].id + '/giphy.gif';
  //
  //             // if the URL is valid, assign the value.
  //             if (gifURL) {
  //               linesArray[j][k].linkToGIF = gifURL;
  //             }
  //           }
  //         }, function(error){
  //           console.log("error during API call: ", error);
  //         });
  //       } // end of if (linesArray[j][k])
  //       console.log("j is now: ", j);
  //       console.log("k is now: ", k);
  //     } // end of inner for loop
  //   } // end of outer for loop
  //
  //   console.log("at the end of convert(), linesArray is now: ", linesArray);
  //
  //   // at the end, return the array we've been working with
  //   // return linesArray;
  //
  // }; // end of this.convert()
}]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({ enabled: true });

  $routeProvider.
  when('/', {
    templateUrl: 'templates/welcome.html.erb',
    controller: 'MainController',
    controllerAs: 'mainCtrl'
  }).
  when('/all', {
    templateUrl: 'templates/all.html.erb',
    controller: 'MainController',
    controllerAs: 'mainCtrl'
  }).
  when('/poem/:id', {
    templateUrl: 'templates/show-one.html.erb',
    controller: 'ShowController',
    controllerAs: 'showCtrl'
  }).
  when('/new', {
    templateUrl: 'templates/new.html.erb',
    controller: 'PoemController',
    controllerAs: 'poemCtrl'
  }).
  when('/results', {
    templateUrl: 'templates/results.html.erb',
    controller: 'ResultsController',
    controllerAs: 'resultsCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);
