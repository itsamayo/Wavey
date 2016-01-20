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

// app.constant('SERVER_URL', 'http://37.139.16.48:8080/');

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
        console.log('app->regionId:', $stateParams.regionId);
				return SpotsService.getRegion($stateParams.regionId)
			}//,
			// spots: function($stateParams, SpotsService) {
			// 	return SpotsService.getSpots($stateParams.regionId)
			// }
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
		url: "/regions/:regionId/:spot",
		resolve: {
      region: function($stateParams, SpotsService) {
        console.log('app->spot->regionId', $stateParams.regionId);
				return SpotsService.getRegion($stateParams.regionId)
			},
      spot: function($stateParams, SpotsService) {
        console.log('app->spot->spot', $stateParams.spot);
				return SpotsService.getSpot($stateParams.regionId, $stateParams.spot)
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

    // DEV PUSH - FOR USE IN SERVE - RUN ionic config set dev_push true
    // Ionic.io();

    // var user = Ionic.User.current();

    // if (!user.id) {
    //  user.id = Ionic.User.anonymousId();
    // }

    // user.save();

    // var push = new Ionic.Push({
    //   "debug": true
    // });

    // push.register(function(token) {
    //   console.log("Device token:",token.token);
    // });

    // NATIVE PUSH - FOR USE ON DEVICE - RUN ionic config set dev_push false
    var io = Ionic.io();
    var push = new Ionic.Push({
      "onNotification": function(notification) {
        alert('Received push notification!');
      },
      "pluginConfig": {
        "android": {
          "iconColor": "#0000FF"
        }
      }
    });
    var user = Ionic.User.current();

    if (!user.id) {
      user.id = Ionic.User.anonymousId();
    }

    // Just adding some dummy data so I know this is the device test..
    // user.set('name', 'ashketchum');
    // user.set('bio', 'something has to give');
    // user.save();

    var callback = function(data) {
      push.addTokenToUser(user);
      user.save();
    };
    push.register(callback);

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
      socket.serverSocket = io.connect('http://37.139.16.48:8080/');//'http://37.139.16.48:8080/');
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
