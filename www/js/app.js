var app = angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'elastichat', 'btford.socket-io']);

app.config(function($stateProvider, $urlRouterProvider) { //, $httpProvider) {
	/*$httpProvider.interceptors.push(function($rootScope) {
		return {
			request: function(config) {
				$rootScope.$broadcast('loading:show')
				return config
			},
			response: function(response) {
				$rootScope.$broadcast('loading:hide')
				return response
			}
		}
	});*/

    $stateProvider

    .state('app', {
        url: "/app",
        abstract: true,
           templateUrl: "templates/menu.html",
           controller: 'AppCtrl'
    })

    .state('app.chats', {
        url: "/chats",
        views: {
          'menuContent': {
              templateUrl: "templates/chats.html"
           }
        }
    })

    .state('app.chat', {
        url: "/chat",
        views: {
          'menuContent': {
              templateUrl: "templates/chat.html",
              controller: "UserMessagesCtrl"
           }
        }
    })

    .state('app.inchat', {
        url: '/inchat/:username',
        views: {
            'menuContent': {
                templateUrl: 'templates/inchat.html',
                controller: 'ChatCtrl'
            }
        }
    })

    .state('app.favourites', {
        url: "/favourites",
        resolve: {
            favourites: function (LoginService) {
                return LoginService.user.favourites
            }
        },
        views: {
            'menuContent': {
                templateUrl: "templates/favourites.html",
                controller: 'FavouritesCtrl'
            }
        }
    })

    .state('app.settings', {
        url: "/settings",
        views: {
            'menuContent': {
                templateUrl: "templates/settings.html",
                controller: 'SettingsCtrl'
            }
        }
    })

    .state('app.myprofile', {
        url: "/myprofile",
        views: {
            'menuContent': {
                templateUrl: "templates/myprofile.html",
                controller: 'SettingsCtrl'
            }
        }
    })

    .state('app.regions', {
		url: "/regions",
		resolve: {
			regions: function(SpotsService) {
				return SpotsService.getRegions()
			}
		},
        views: {
			'menuContent': {
				templateUrl: "templates/regions.html",
				controller: 'RegionsCtrl'
			}
        }
    })

	.state('app.region', {
		url: "/regions/:regionId",
		resolve: {
			region: function($stateParams, SpotsService) {
				return SpotsService.getRegion($stateParams.regionId)
			},
			spots: function($stateParams, SpotsService) {
				return SpotsService.getSpots($stateParams.regionId)
			}
		},
		views: {
			'menuContent': {
				templateUrl: "templates/region.html",
				controller: 'RegionCtrl'
			}
		}
	})

     .state('app.boardroom', {
         url: "/boardroom",
         views: {
             'menuContent': {
                 templateUrl: "templates/boardroom.html"
             }
         }
     })

	.state('app.spot', {
		url: "/spots/:spotId",
		resolve: {
			spot: function($stateParams, SpotsService) {
				return SpotsService.getSpot($stateParams.spotId)
			}
		},
		views: {
			'menuContent': {
				templateUrl: "templates/spot.html",
				controller: 'SpotCtrl'
			}
		}
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/regions');
});

app.run(function ($ionicPlatform, $ionicPopup) {

    $ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
		  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
		  // org.apache.cordova.statusbar required
		  StatusBar.styleDefault();
		}
	});
});

app.factory('Socket', function (socketFactory) {
    var myIoSocket = io.connect('http://37.139.16.48/');

    mySocket = socketFactory({
        ioSocket: myIoSocket
    });

    return mySocket;
});
