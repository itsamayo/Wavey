angular.module('App.filters', []).filter('dayFilter', [function(){
  return function(dayString) {
    return new Date(dayString).getDayName().substring(0,3);
  };
}]).filter('hourFilter', [function(){
  return function(time) {
    return ((time < 1000 ? '0' : '') + time).substring(0,2) + 'h';
  }
}]);

var app = angular.module('starter', ['ionic','ionic.service.core', 'ngCordova', 'starter.controllers', 'btford.socket-io', 'App.filters']);

app.constant('_',
    window._
);

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
        url: '/inchat/:username?room',
        resolve: {
          username: function($stateParams) {
            return $stateParams.username;
          },
          room: function($stateParams) {
            return $stateParams.room;
          }
        },
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
    
    // kick off the platform web client
    Ionic.io();

    // this will give you a fresh user or the previously saved 'current user'
    var user = Ionic.User.current();

    // if the user doesn't have an id, you'll need to give it one.
    if (!user.id) {
     user.id = Ionic.User.anonymousId();
    // user.id = 'your-custom-user-id';
    }

    //persist the user
    user.save();


		if (window.cordova && window.cordova.plugins.Keyboard) {
		  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
		  // org.apache.cordova.statusbar required
		  StatusBar.styleDefault();
		}
	});
});

app.factory('Socket', function (socketFactory, _) {
    var socket = { rooms: [], serverSocket: undefined, socketId: undefined, clientSocket: undefined};

    socket.init = function() {
      socket.serverSocket = io.connect('http://37.139.16.48:8080/');
      socket.clientSocket = socketFactory({ ioSocket: socket.serverSocket });
      socket.clientSocket.on('connect', function() {
        socket.socketId = this.id;
      });

      socket.clientSocket.on("Message", function (data) {
        console.log('incoming message data', data);
  			var room = _.find(socket.rooms, function(r) { return r.name == data.room; });
  			if (!_.isUndefined(room)) {
  				room.messages.push(data);
  				//room.unreadMessages = true;
  			}
  		});

      socket.clientSocket.on('Rooms', function(rooms) {
        console.log('rooms', rooms);
        socket.rooms = [];
        _.each(rooms, function(r) {
          var room = new Room({name: r, clientSocket: socket.clientSocket});
          socket.rooms.push(room);
        });
      });
    };

    socket.openRoom = function(name) {
      console.log(socket.rooms);
      var room = _.find(socket.rooms, function(r) { return r.name == name; });
      if (!_.isUndefined(room)) {
        socket.clientSocket.emit('Join', room.name);
        return room;
      }
    };

    socket.userLoggedIn = function(user) {
      console.log('login->username', {username: user.username} );
      socket.clientSocket.emit('Connect', {username: user.username} );
    };

    socket.userLoggedOut = function(user) {
      console.log('logout->username', user.username);
      socket.clientSocket.emit('Leave', user.username);
    };

    return socket;
});
