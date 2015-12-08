var app = angular.module('poem2GIF', ['ngRoute']);

app.controller('MainController', ['$http', '$scope', function($http, $scope){

  var controller = this;



}]);

app.controller('PoemController', ['$http', '$scope', 'poemFactory', function($http, $scope, poemFactory){

  var controller = this;

  this.convert = function(){
    var poem = {
      title: controller.title,
      body: controller.body
    };
    // controller.poemArray = poemService.convert(poem);

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

    console.log("before entering the for loops, linesArray is: ", linesArray);

    //here, make the API calls (using the public beta key) through the factory, by iterating through the array and passing in each individual search term
    for (var j = 0; j < linesArray.length; j++) {
      for (var k = 0; k < linesArray[j].length; k++) {

        // set each entry up as an object
        if (linesArray[j][k]) {
          linesArray[j][k] = {
            linkToGIF: null,
            word: linesArray[j][k]
          }

          var promise = poemFactory.getGIF(linesArray[j][k]);
          promise.then(function(data){
            // do stuff with data
            console.log('data from API call #j(' + j + ') #k(' + k + ') is: ', data);

            // conditional to ensure that data.data.data.length > 0
            if (data.data.data.length > 0) {
              // generate a random index value based on data array length
              var random = Math.floor(Math.random() * data.data.data.length) + 1;

              // concat the gifURL using the random index
              var gifURL = 'https://media.giphy.com/media/' + data.data.data[random].id + '/giphy.gif';

              // if the URL is valid, assign the value.
              if (gifURL) {
                linesArray[j][k].linkToGIF = gifURL;
              }
            }
          }, function(error){
            // handle the error
            console.log("error during API call: ", error);
          });
        }

        // if it's not a blank entry, make the API call
        // if (linesArray[j][k]) {
        //   var promise = poemFactory.getGIF(linesArray[j][k]);
        //   promise.then(function(data){
        //     // do stuff with data
        //     console.log('data from API call #j(' + j + ') #k(' + k + ') is: ', data);
        //
        //     // conditional to ensure that data.data.data.length > 0
        //     if (data.data.data.length > 0) {
        //       // generate a random index value based on data array length
        //       var random = Math.floor(Math.random() * data.data.data.length) + 1;
        //
        //       // concat the gifURL using the random index
        //       var gifURL = 'https://media.giphy.com/media/' + data.data.data[random].id + '/giphy.gif';
        //
        //       // if the URL is valid, assign the value.
        //       if (gifURL) {
        //         linesArray[j][k].linkToGIF = gifURL;
        //       }
        //     }
        //   }, function(error){
        //     // handle the error
        //     console.log("error during API call: ", error);
        //   });
        // } // end of if (linesArray[j][k])
      } // end of inner for loop
    } // end of outer for loop

    console.log("at the end of convert(), linesArray is now: ", linesArray);

    // clear the fields:
    // controller.title = "";
    // controller.body = "";
  };

}]);

app.factory('poemFactory', ['$http', function($http){
  return {
    getGIF: function(searchTerm) {
      return $http.get('http://api.giphy.com/v1/gifs/search?q=' + searchTerm + '&api_key=dc6zaTOxFJmzC');
    }
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
  when('/new', {
    templateUrl: 'templates/new.html.erb',
    controller: 'PoemController',
    controllerAs: 'poemCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);
