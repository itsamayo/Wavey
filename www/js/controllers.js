angular.module('starter.controllers', ['ngStorage', 'ngCordova'])

.controller('AppCtrl', function ($scope, $state, $ionicPlatform, $ionicPopup, $ionicModal, LoginService, SpotsService, LoadingService, $localStorage, $rootScope, $http, Socket) {
    // Form data for the login modal
    $rootScope.isInChat = false;

    //LoginService.updateHeaders();

    var closed = true;
    $scope.$on('http:error', function (event, data) {
        // you could inspect the data to see if what you care about changed, or just update your own scope
        //$scope.isLoggedIn = $scope.service.user.id > 0;
        LoadingService.hide();
        //console.log(data.message);
        var message = data;
        if (data.message != null) message = data.message;
        if (closed) {
            closed = false;
            $ionicPopup.alert({
                title: 'Something went wrong...',
                template: message
            }).then(function () {
                closed = true;
                if (data.exit) {
                    ionic.Platform.exitApp();
                }
            });
        }
    });

    $scope.$on('user:login', function (event, data) {
        // you could inspect the data to see if what you care about changed, or just update your own scope
        $scope.isLoggedIn = $scope.service.user.id > 0;
    });

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        //$scope.refresh();
        //$rootScope.isInChat = false;
        $rootScope.isInChat = (toState.name == 'app.inchat');
        //$scope.refresh();
        //console.log(toState);
        //console.log(fromState);
    });
    Socket.init();
    $scope.service = LoginService;

    LoadingService.subscribe($scope, 'spots:regions');
    LoadingService.show();
    $scope.data = { name: '', email: '', password: '', confirmPassword: '' };

    SpotsService.downloadData();

    if ($localStorage.rememberMe) {
        $scope.service.loginUser($localStorage.email, $localStorage.password);
    }

    $scope.$on('user:login', function (event, data) {
        // you could inspect the data to see if what you care about changed, or just update your own scope
        $scope.isLoggedIn = $scope.service.user.id > 0;
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        //$scope.data.email = '';
        $scope.data.email = $localStorage.email;
        $scope.data.password = '';
        $scope.modal.show();
    };

    $scope.logout = function () {
        $scope.service.toggleLogin(false);
    };

    $scope.gochat = function (name, region) {
        //var username = $scope.service.user.username;
        //console.log('gochat, username: ', name);
        //console.log('gochat, profilePic: ', pic);
        $state.go('app.inchat', { 'username': name, 'room': region });
    };

    // Full report COMING SOON
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Coming soon!',
            template: 'I know, we are just as excited!'
        });
        alertPopup.then(function(res) {
            console.log('Thank you for understanding!');
        });
    };

})

.controller('LoginCtrl', function ($scope, LoginService, $ionicPopup, $state, $ionicModal, LoadingService, $http, $cordovaOauth) {
    $scope.service = LoginService;

    $scope.login = function () {
        LoadingService.show();
        $scope.service.loginUser($scope.data.email, $scope.data.password).success(function (data) {
            $scope.closeLogin();
            $state.go('app.favourites');
            LoadingService.hide();
        }).error(function (data) {
            LoadingService.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Oops! Login failed',
                template: data
            });
        });
    }

})

.controller('SignupCtrl', function ($scope, LoginService, $ionicPopup, $state, $ionicModal, LoadingService) {
    $scope.service = LoginService;

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.closeSignup = function () {
        $scope.modal.hide();
    };

    $scope.signup = function () {
        $scope.data.username = '';
        //$scope.data.email = '';
        $scope.data.password = '';
        $scope.data.confirmPassword = '';
        $scope.modal.show();
    };

    $scope.doSignup = function () {
        LoadingService.show();
        $scope.service.signupUser($scope.data.username, $scope.data.email, $scope.data.password, $scope.data.confirmPassword).success(function (data) {
            $scope.service.loginUser($scope.data.email, $scope.data.password);
            $scope.closeSignup();
            $scope.closeLogin();
            LoadingService.hide();
        }).error(function (data) {
            LoadingService.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Oops! Signup failed',
                template: data
            });
        });
    };

})

.controller('RegionsCtrl', function ($scope, regions, SpotsService) {
    $scope.$on('spots:regions', function (event, data) {
        // you could inspect the data to see if what you care about changed, or just update your own scope
        $scope.regions = SpotsService.regions;
    });
    $scope.regions = regions;
})

.controller('AddSpotCtrl', function ($scope, $ionicPopup, $state, $ionicModal, LoadingService, LoginService) {

    $ionicModal.fromTemplateUrl('templates/addspot.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.closeAddSpot = function () {
        $scope.modal.hide();
    };

    $scope.addspot = function () {
        $scope.data.spotName = '';
        $scope.data.region = '';
        $scope.data.country = '';
        $scope.data.coord = '';
        //$scope.data.addfor = '';
        $scope.modal.show();
    };
    $scope.doAddSpot = function () {
        LoadingService.show();
        LoginService.requestAddSpot($scope.data.spotName, $scope.data.region, $scope.data.country, $scope.data.coord)//, $scope.data.addfor)
            .success(function (data) {
                LoadingService.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Request Sent!',
                    template: data
                });
                $scope.closeAddSpot();
            }).error(function (data) {
                LoadingService.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Fill all fields',
                    template: data
                });
            });
    };

})

.controller('RegionCtrl', function ($scope, region, spots) {
     $scope.region = region;
     $scope.spots = spots;
 })

.controller('SpotCtrl', function ($scope, $http, $ionicPopup, $ionicModal, spot, SpotsService, LoginService, LoadingService) {
    LoadingService.show();

    $scope.$on('spot:toggleFavourite', function (event, data) {
	    // you could inspect the data to see if what you care about changed, or just update your own scope
        $scope.isFavourited = LoginService.isFavourited($scope.spot.id);
        LoadingService.hide();
	});

    $scope.spot = spot;
	$scope.spot.webcamAvailable = true;//($scope.spot.webcamURL != '');
	if ($scope.spot.webcamURL == '') {
		$scope.spot.webcamURL = 'http://www.wavescape.co.za/plugins/content/webcam/newfetch.php?pic=bigbay.jpg&rnd=1072332567';
	}

    $scope.isFavourited = LoginService.isFavourited($scope.spot.id);

    $scope.sunRise = "...";
    $scope.sunset = "...";
    $scope.airTemp = "...";
    $scope.weatherCondition = "...";
    $scope.windSpeed = "...";
    $scope.windDirection = "...";

    $scope.swellDirection = "...";
    $scope.waterTemp = "...";
    $scope.swellPeriod = "...";
    $scope.swellHeight = "...";

    $scope.tideType1 = "...";
    $scope.tideType2 = "...";
    $scope.tideType3 = "...";
    $scope.tideType4 = "...";
    $scope.tideTime1 = "...";
    $scope.tideTime2 = "...";
    $scope.tideTime3 = "...";
    $scope.tideTime4 = "...";

    $scope.toggleFavourite = function () {
        if (!LoginService.isLoggedIn()) {
            var alertPopup = $ionicPopup.alert({
                title: 'Want to Favourite?',
                template: 'Please Login or Signup to favourite this spot'
            });
        }
        else {
            LoadingService.show();
            LoginService.toggleFavourite($scope.spot.id);

        }
	};

  $ionicModal.fromTemplateUrl('templates/fullreport.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.fullReportModal = modal;
  });

  $scope.closeFullReport = function () {
        $scope.fullReportModal.hide();
    };
    $scope.fullReport = function () {
        $scope.fullReportModal.show();
    };

    SpotsService.getMarineWeather($scope.spot).success(function (marineWeather) {
        $scope.marineWeather = marineWeather;
        // Sunrise
        $scope.sunRise = marineWeather.data.weather[0].astronomy[0].sunrise;

        // Sunset
        $scope.sunSet = marineWeather.data.weather[0].astronomy[0].sunset;

        // Air temp
        $scope.airTemp = marineWeather.data.weather[0].hourly[0].tempC;

        // Weather conditions
        $scope.weatherCondition = marineWeather.data.weather[0].hourly[0].weatherDesc[0].value;

        // Wind speed
        $scope.windSpeed0 = marineWeather.data.weather[0].hourly[0].windspeedKmph;
        $scope.windSpeed1 = marineWeather.data.weather[0].hourly[3].windspeedKmph;
        $scope.windSpeed2 = marineWeather.data.weather[0].hourly[6].windspeedKmph;
        $scope.windSpeed3 = marineWeather.data.weather[0].hourly[0].windspeedKmph;
        $scope.windSpeed4 = marineWeather.data.weather[0].hourly[0].windspeedKmph;

        // Wind direction
        $scope.windDirection0 = marineWeather.data.weather[0].hourly[0].winddir16Point;
        $scope.windDirection1 = marineWeather.data.weather[0].hourly[3].winddir16Point;
        $scope.windDirection2 = marineWeather.data.weather[0].hourly[6].winddir16Point;
        $scope.windDirection3 = marineWeather.data.weather[0].hourly[0].winddir16Point;
        $scope.windDirection4 = marineWeather.data.weather[0].hourly[0].winddir16Point;

        // Swell direction
        $scope.swellDirection0 = marineWeather.data.weather[0].hourly[0].swellDir16Point;
        $scope.swellDirection1 = marineWeather.data.weather[0].hourly[3].swellDir16Point;
        $scope.swellDirection2 = marineWeather.data.weather[0].hourly[6].swellDir16Point;
        $scope.swellDirection3 = marineWeather.data.weather[0].hourly[0].swellDir16Point;
        $scope.swellDirection4 = marineWeather.data.weather[0].hourly[0].swellDir16Point;

        // Water temp
        $scope.waterTemp = marineWeather.data.weather[0].hourly[0].waterTemp_C;

        // Swell period
        $scope.swellPeriod0 = marineWeather.data.weather[0].hourly[0].swellPeriod_secs;
        $scope.swellPeriod1 = marineWeather.data.weather[0].hourly[0].swellPeriod_secs;
        $scope.swellPeriod2 = marineWeather.data.weather[0].hourly[0].swellPeriod_secs;
        $scope.swellPeriod3 = marineWeather.data.weather[0].hourly[0].swellPeriod_secs;
        $scope.swellPeriod4 = marineWeather.data.weather[0].hourly[0].swellPeriod_secs;

        // Swell height
        $scope.swellHeight0 = marineWeather.data.weather[0].hourly[0].swellHeight_m;
        $scope.swellHeight1 = marineWeather.data.weather[0].hourly[3].swellHeight_m;
        $scope.swellHeight2 = marineWeather.data.weather[0].hourly[6].swellHeight_m;
        $scope.swellHeight3 = marineWeather.data.weather[0].hourly[0].swellHeight_m;
        $scope.swellHeight4 = marineWeather.data.weather[0].hourly[0].swellHeight_m;

        // Check if there is tide data
        try {
            var tideData = marineWeather.data.weather[0].tides[0].tide_data;
            $scope.tideType1 = tideData[0].tide_type;
            $scope.tideTime1 = tideData[0].tideTime;

            $scope.tideType2 = tideData[1].tide_type;
            $scope.tideTime2 = tideData[1].tideTime;

            $scope.tideType3 = tideData[2].tide_type;
            $scope.tideTime3 = tideData[2].tideTime;
            if (tideData.length > 3) {
                $scope.tideType4 = tideData[3].tide_type;
                $scope.tideTime4 = tideData[3].tideTime;
            }
            else $('#tide4').hide();
        } catch (err) {
            $('#tide1').hide();
            $('#tide2').hide();
            $('#tide3').hide();
            $('#tide4').hide();
        }

        LoadingService.hide();
    }).error(function (data) {
        LoadingService.hide();
        var alertPopup = $ionicPopup.alert({
            title: 'Oops! Problem retrieving Marine Weather',
            template: data
        });
    });
})

.controller('CamCtrl', function ($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/cam.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.closeCam = function () {
        $scope.modal.hide();
    };
    $scope.cam = function () {
        $scope.modal.show();
    };
})

.controller('FullReportCtrl', function ($scope, $ionicModal, $ionicSlideBoxDelegate) {
    $ionicModal.fromTemplateUrl('templates/fullreport.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.closeFullReport = function () {
        $scope.modal.hide();
    };
    $scope.fullReport = function () {
        $scope.modal.show();
    };
})

.controller('ReportCtrl', function ($scope, $ionicPopup, $state, $ionicModal, LoginService, LoadingService) {

    $ionicModal.fromTemplateUrl('templates/report.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.closeReport = function () {
        $scope.modal.hide();
    };

    $scope.report = function () {
        if (!LoginService.isLoggedIn()) {
            var alertPopup = $ionicPopup.alert({
                title: 'Want to report an issue?',
                template: 'Please Login or Signup'
            });
        } else {
            $scope.data.airdata = false;
            $scope.data.seadata = false;
            $scope.data.cam = false;
            $scope.modal.show();
        }
    };
    $scope.doReport = function () {
        if (!$scope.data.airdata && !$scope.data.seadata && !$scope.data.cam) {
            var alertPopup = $ionicPopup.alert({
                title: "What's wrong?",
                template: "Let us know what's wrong by selecting 1 of the options."
            });
            return;
        }
        LoadingService.show();
        LoginService.reportIssue($scope.spot.id, $scope.data.airdata, $scope.data.seadata, $scope.data.cam)
            .success(function (data) {
                LoadingService.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Report Submmited!',
                    template: data
                });
                $scope.closeReport();
            }).error(function (data) {
                LoadingService.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Error Submitting!',
                    template: data
                });
            });
    };
})

.controller('PasswordCtrl', function ($scope, $ionicPopup, $state, $ionicModal, LoginService, LoadingService) {
    $scope.service = LoginService;

    $ionicModal.fromTemplateUrl('templates/password.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.closePassword = function () {
        $scope.modal.hide();
    };

    $scope.changePassword = function () {
        $scope.modal.show();
        LoadingService.show();
        $scope.service.updatePassword($scope.data.password).success(function (data) {
            $scope.closePassword();
            $state.go('app.settings');
            LoadingService.hide();
        }).error(function (data) {
            LoadingService.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Oops!',
                template: data//'Incorrect old password!'
            });
        });
    }
})

.controller('SettingsCtrl', function ($scope, $state, $ionicPopup, LoginService, $localStorage, $ionicModal, LoadingService) {
    $scope.rememberMe = { checked: $localStorage.rememberMe };
    $scope.service = LoginService;
    $scope.data = {};

    $ionicModal.fromTemplateUrl('templates/pass.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.profilepic = 'data:image/png;base64,' + $scope.service.user.profilepic;


    $scope.updateSettings = function () {
        LoginService.toggleRememberMe($scope.rememberMe.checked);
    };

    $scope.closePassword = function () {
        $scope.modal.hide();
    };

    $scope.changePassword = function () {
        $scope.data.password = '';
        $scope.data.newPassword = '';
        $scope.data.confirmNewPassword = '';
        $scope.modal.show();
    };

    $scope.updatePassword = function () {
        LoadingService.show();
        $scope.service.updatePassword($scope.data.password, $scope.data.newPassword, $scope.data.confirmNewPassword).success(function (data) {
            $scope.closePassword();
            $state.go('app.settings');
            LoadingService.hide();
        }).error(function (data) {
            LoadingService.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Oops!',
                template: data//'Incorrect old password!'
            });
        });
    };
})

.controller('FavouritesCtrl', function ($scope, favourites, LoginService, SpotsService, $filter) {
    $scope.favourites = favourites;
    $scope.spots = [];

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $scope.refresh();
    });

     $scope.refresh = function () {
         var tmp = [];
         LoginService.user.favourites.forEach(function (fav) {
             var spot = SpotsService.getSpot(fav.spotId).$$state.value;
             tmp.push(spot);
         });
         $scope.spots = $filter('orderBy')(tmp, 'name');
     };

     $scope.refresh();

})

.controller('ChatCtrl', function($scope, $timeout, $stateParams, Socket, $ionicScrollDelegate, $sce, $cordovaMedia, _){
    //replaced with $scope.room.messages
    //$scope.messages = [];
    //do we really need these here?
    $scope.region = ['ECT', 'KZN', 'WCT']
    $scope.nickname = $stateParams.username;
    $scope.status_message = "Welcome " + $stateParams.username;

    var COLORS = ['#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#009688'];
    $scope.room = Socket.openRoom($stateParams.room);
    console.log($scope.room);
    // Socket.on("connect", function(){
    //     $scope.socketId = this.id;
    //     var data = {
    //                   message: $scope.nickname + " has joined the conversation",
    //                   sender: $scope.nickname,
    //                   socketId: $scope.socketId,
    //                   isLog: true,
    //                   color : $scope.getUsernameColor($scope.nickname)
    //                 };


    //     Socket.emit("Message", data);

    // });

    $scope.$watchCollection('room.messages', function(newValue, oldValue) {
  		// _.each($scope.room.messages, function(data) {
  		// 	data.isRead = true;
  		// });
  		// $scope.room.unreadMessages = false;
  		var start = 0;
  		var end = 0;
  		if (_.isArray(oldValue)) start = oldValue.length;
  		if (_.isArray(newValue)) end = newValue.length;
  		for(var i = start; i < end; i++) {
  		  $scope.room.messages[i].message = fillWithEmoticons($scope.room.messages[i].message);
  		  $scope.room.messages[i].message = $sce.trustAsHtml($scope.room.messages[i].message);
  		  if (_.isUndefined($scope.room.messages[i].color)) {
  		    $scope.room.messages[i].color = $scope.getUsernameColor($scope.room.messages[i].sender);
  		  }
  		}
  		console.log('message received');
  	  $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
    });

    // Socket.on("Message", function(data){

    //   data.message = fillWithEmoticons(data.message);
    //   data.message = $sce.trustAsHtml(data.message);
    //   $scope.messages.push(data);

    //   // if($scope.socketId == data.socketId)
    //   //   playAudio("audio/outgoing.mp3");
    //   // else
    //   //   playAudio("audio/incoming.mp3");

    //   $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
    // })

    var typing = false;
    var TYPING_TIMER_LENGTH = 2000;

    $scope.updateTyping = function(){
      if(!typing){
        typing = true;
        Socket.clientSocket.emit("typing", {socketId: Socket.socketId, sender: $scope.nickname});
      }

      lastTypingTime = (new Date()).getTime();

      $timeout(function(){
        var timeDiff = (new Date()).getTime() - lastTypingTime;

        if(timeDiff >= TYPING_TIMER_LENGTH && typing){
          Socket.clientSocket.emit('stop typing', {socketId: Socket.socketId, sender: $scope.nickname});
          typing = false;
        }
      }, TYPING_TIMER_LENGTH)
    }

    Socket.clientSocket.on('stop typing', function(data){
      $scope.status_message = "Welcome to";
    })

    Socket.clientSocket.on('typing', function(data){
      $scope.status_message = data.sender + " is typing...";
    })

    // var playAudio = function(src)
    // {
    //   if(ionic.Platform.isAndroid() || ionic.Platform.isIOS())
    //   {
    //     var newUrl = '';
    //     if(ionic.Platform.isAndroid()){
    //       newUrl = "/android_asset/www/" + src;
    //     }
    //     else
    //       newUrl = src;

    //     var media = new Media(newUrl, null, null, null);
    //     media.play();
    //   }
    //   else
    //   {
    //     new Audio(src).play();
    //   }
    // }

    $scope.sendMessage = function(){
      if($scope.message.length == 0)
        return;
      $scope.room.sendMessage({
        username: $scope.nickname,
        color: $scope.getUsernameColor($scope.nickname),
        message: $scope.message,
        socketId: Socket.socketId
      });
      // var newMessage = {sender:'', message:'', socketId:'', isLog:false, color:'' };
      // newMessage.sender = $scope.nickname;
      // newMessage.message = $scope.message;
      // newMessage.socketId = $scope.socketId;
      // newMessage.isLog = false;
      // newMessage.displayPicture = $scope.displayPicture;
      // newMessage.color = $scope.getUsernameColor($scope.nickname);

      // Socket.emit("Message", newMessage);

      $scope.message='';
    }

    var fillWithEmoticons = function(message)
    { //(y)
      message = message.replace(/;\)/g, "<img src='img/emoticons/1_27.png' width='20px' height='20px' />");
      message = message.replace(/\(y\)/g, "<img src='img/emoticons/1_01.png' width='20px' height='20px' />");
      message = message.replace(/O:\)/g, "<img src='img/emoticons/1_02.png' width='20px' height='20px' />");
      message = message.replace(/:3/g, "<img src='img/emoticons/1_03.png' width='20px' height='20px' />");
      message = message.replace(/o.O/g, "<img src='img/emoticons/1_04.png' width='20px' height='20px' />");
      message = message.replace(/O.o/g, "<img src='img/emoticons/1_05.png' width='20px' height='20px' />");
      message = message.replace(/:\'\(/g, "<img src='img/emoticons/1_06.png' width='20px' height='20px' />");
      message = message.replace(/3:\)/g, "<img src='img/emoticons/1_07.png' width='20px' height='20px' />");
      message = message.replace(/:\(/g, "<img src='img/emoticons/1_08.png' width='20px' height='20px' />");
      message = message.replace(/:O/g, "<img src='img/emoticons/1_09.png' width='20px' height='20px' />");
      message = message.replace(/8-\)/g, "<img src='img/emoticons/1_10.png' width='20px' height='20px' />");
      message = message.replace(/:D/g, "<img src='img/emoticons/1_11.png' width='20px' height='20px' />");
      message = message.replace(/>:\(/g, "<img src='img/emoticons/1_22.png' width='20px' height='20px' />");
      message = message.replace(/\<3/g, "<img src='img/emoticons/1_13.png' width='20px' height='20px' />");
      message = message.replace(/\^_\^/g, "<img src='img/emoticons/1_14.png' width='20px' height='20px' />");
      message = message.replace(/\:\*/g, "<img src='img/emoticons/1_15.png' width='20px' height='20px' />");
      message = message.replace(/\:v/g, "<img src='img/emoticons/1_16.png' width='20px' height='20px' />");
      message = message.replace(/\<\(\"\)/g, "<img src='img/emoticons/1_17.png' width='20px' height='20px' />");
      message = message.replace(/\:poop\:/g, "<img src='img/emoticons/1_18.png' width='20px' height='20px' />");
      message = message.replace(/\:putnam\:/g, "<img src='img/emoticons/1_19.png' width='20px' height='20px' />");
      message = message.replace(/\(\^\^\^\)/g, "<img src='img/emoticons/1_20.png' width='20px' height='20px' />");
      message = message.replace(/\:\)/g, "<img src='img/emoticons/1_21.png' width='20px' height='20px' />");
      message = message.replace(/\-\_\-/g, "<img src='img/emoticons/1_22.png' width='20px' height='20px' />");
      message = message.replace(/8\|/g, "<img src='img/emoticons/1_23.png' width='20px' height='20px' />");
      message = message.replace(/\:P/g, "<img src='img/emoticons/1_24.png' width='20px' height='20px' />");
      message = message.replace(/\:\//g, "<img src='img/emoticons/1_25.png' width='20px' height='20px' />");
      message = message.replace(/\>\:O/g, "<img src='img/emoticons/1_26.png' width='20px' height='20px' />");
      message = message.replace(/\:\|\]/g, "<img src='img/emoticons/1_28.png' width='20px' height='20px' />");
      return message;
    }

    $scope.getUsernameColor = function(username){
      var hash = 7;

      for(var i=0; i<username.length;i++)
      {
        hash = username.charCodeAt(i)+ (hash<<5) - hash;
      }

      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }
});
