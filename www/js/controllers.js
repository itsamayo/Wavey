angular.module('starter.controllers', ['ngStorage', 'ngCordova'])

.controller('AppCtrl', function ($scope, $state, $ionicPlatform, $ionicPopup, $ionicModal, LoginService, SpotsService, LoadingService, $localStorage, $rootScope, $http) {
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

    $scope.gochat = function (name) {
        //var username = $scope.service.user.username;
        //console.log('gochat, username: ', name);
        //console.log('gochat, profilePic: ', pic);
        $state.go('app.inchat', { 'username': name });
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

.controller('LoginCtrl', function ($scope, LoginService, $ionicPopup, $state, $ionicModal, LoadingService) {
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
        //$scope.data.addfor = '';
        $scope.modal.show();
    };
    $scope.doAddSpot = function () {
        LoadingService.show();
        LoginService.requestAddSpot($scope.data.spotName, $scope.data.region, $scope.data.country)//, $scope.data.addfor)
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

.controller('SpotCtrl', function ($scope, $http, $ionicPopup, spot, SpotsService, LoginService, LoadingService) {
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

    SpotsService.getMarineWeather($scope.spot).success(function (marineWeather) {
        $scope.sunRise = marineWeather.data.weather[0].astronomy[0].sunrise;
        $scope.sunSet = marineWeather.data.weather[0].astronomy[0].sunset;
        $scope.airTemp = marineWeather.data.weather[0].hourly[0].tempC;
        $scope.weatherCondition = marineWeather.data.weather[0].hourly[0].weatherDesc[0].value;
        $scope.windSpeed = marineWeather.data.weather[0].hourly[0].windspeedKmph;
        $scope.windDirection = marineWeather.data.weather[0].hourly[0].winddir16Point;

        $scope.swellDirection = marineWeather.data.weather[0].hourly[0].swellDir16Point;
        $scope.waterTemp = marineWeather.data.weather[0].hourly[0].waterTemp_C;
        $scope.swellPeriod = marineWeather.data.weather[0].hourly[0].swellPeriod_secs;
        $scope.swellHeight = marineWeather.data.weather[0].hourly[0].swellHeight_m;

        //check if there is tide data
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

.controller('ChatCtrl', function ($scope, $stateParams, Socket, $ionicScrollDelegate, $sce) {
    console.log('$stateParams: ', $stateParams);
    console.log('UserMessagesCtrl, username: ', $stateParams.username);

    $scope.messages = [];
    $scope.nickname = $stateParams.username;

    // Log messages from socket.io server
    Socket.on("connect", function () {
        $scope.socketId = this.id;
        var data = {
            message: $scope.nickname + " has joined!",
            sender: $scope.nickname,
            socketId: $scope.socketId,
            isLog: true
        };

        Socket.emit("Message", data);

    });

    Socket.on("Message", function (data) {

        data.message = fillWithEmoticons(data.message);
        data.message = $sce.trustAsHtml(data.message);
        $scope.messages.push(data);

        //if ($scope.socketId == data.socketId)
        //    playAudio("audio/incoming.mp3");
        //else
        //    playAudio("audio/outgoing.mp3");

        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
    })

    // SEND AND RECEIVE MESSAGE SOUNDS
    //var playAudio = function (src) {
    //    if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
    //        var newUrl = '';
    //        if (ionic.Platform.isAndroid()) {
    //            newUrl = "/android_asset/www/" + src;
    //        }
    //        else
    //            newUrl = src;

    //        var media = new Media(newUrl, null, null, null);
    //        media.play();
    //    }
    //    else {
    //        new Audio(src).play();
    //    }
    //}

    //Chat messaging functionality
    $scope.sendMessage = function () {
        if ($scope.message.length == 0)
            return;
        var newMessage = { sender: '', message: '', socketId: '', isLog: false };
        newMessage.sender = $scope.nickname;
        newMessage.message = $scope.message;
        newMessage.socketId = $scope.socketId;
        newMessage.isLog = false;

        Socket.emit("Message", newMessage);

        $scope.message = '';
    }

    var fillWithEmoticons = function (message) {
        message = message.replace(/\(y\)/g, "<img src='img/emoticons/grin.png' width='20px' height='20px'/>")
        return message;
    }

});
