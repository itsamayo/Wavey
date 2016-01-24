var debug = false;

(function() {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    Date.prototype.getMonthName = function() {
        return months[ this.getMonth() ];
    };
    Date.prototype.getDayName = function() {
        return days[ this.getDay() ];
    };
})();

function getURL(path) {
    //return (debug ? "app/" : "http://wavey.co.za/app/") + path;
    return 'http://37.139.16.48:8080/app/' + path;
}

app.service('DebugService', function () {
    var service = {};
    service.log = function (_module, _function, _message) {
        console.log(_module + ': ' + _function + '->' + _message);
    };

    return service;
});

app.service('LoadingService', function($ionicLoading) {
	var service = {};
	service.show = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="ripple"></ion-spinner>'
		});
	};
	//setTimeout(function () { alert('Your internet connection is slow') }, 10000)
	//setTimeout(function () { alert('Really slow, maybe check your network') }, 20000)
	//setTimeout(function () { alert('You obviously have zero connectivity, please close the app and check your network') }, 30000)
	service.hide = function() {
		$ionicLoading.hide();
	};
	service.subscribe = function($scope, message) {
		$scope.$on(message, function(event, data) {service.hide();});
	};

	return service;
});

app.service('LoginService', function ($q, $http, $rootScope, $localStorage, DebugService, Socket, _) {
	var service = {
	    user: { id: undefined, username: '', email: '', favourites: [], isLoggedIn: false, rememberMe: true, profilepic: '' }
	};

	service.loginUser = function (_email, _password) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		service.user.q = _password;
		$http({
			url: getURL("login"),
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: $.param({email:_email, password:_password})
		}).success(function (data, status, headers, config) {
        console.log('LoginService->login->success: ', data);
		    if (!data.error) {
				service.user.id = data.id;
				service.user.email = data.email;
				service.user.favourites = data.favourites;
				service.user.username = data.username;
				service.user.profilepic = data.profilepic;
				deferred.resolve(data);
				service.toggleLogin(true);
				$localStorage.email = service.user.email;
        Socket.userLoggedIn(service.user);
			}
			else {
				deferred.reject(data.message);
				//if (data == null) data = {exit: false, message: '' };
			    //$rootScope.$broadcast('http:error', data.message);
			}
		}).error(function (data, status, headers, config) {
			if (data == null) data = { exit: false, message: 'Unable to log you in.' };
			else data.message = data;
			$rootScope.$broadcast('http:error', data);
		});

		promise.success = function (fn) {
			promise.then(fn);
			return promise;
		}
		promise.error = function (fn) {
			promise.then(null, fn);
			return promise;
		}
		return promise;
	};

	service.toggleLogin = function(isLoggedIn) {
		if (!isLoggedIn) {
			service.user.id = undefined;
			service.user.email = '';
			service.user.favourites = [];
      Socket.userLoggedOut(service.user);
		}
		service.user.isLoggedIn = isLoggedIn;
		$rootScope.$broadcast('user:login', service.user);
		//service.updateHeaders();
	}

	service.updateEmail = function (_email) {
	    var deferred = $q.defer();
	    var promise = deferred.promise;
	    service.user.qq = _email;
	    //var _data = { email: service.user.email, newEmail: _email };
	    var _data = { id: service.user.id, oldEmail: service.user.email, newEmail: _email };

	    $http({
	        url: getURL("updateEmail"),
	        method: "POST",
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	        data: $.param(_data)
	    }).success(function (data, status, headers, config) {
	        if (!data.error) {
	            deferred.resolve(data.message);
	            service.user.email = service.user.qq;
	            $localStorage.email = service.user.email;
	        }
	        else {
	            deferred.reject(data.message);
	            //if (data == null) data = {exit: false, message: '' };
                //$rootScope.$broadcast('http:error', data.message);
	        }
	        service.user.qq = '';
	    }).error(function (data, status, headers, config) {
	        if (data == null) data = { exit: false, message: 'Unable to update your email address' };
	        else data.message = data;
	        service.user.favourites = data.favourites;

	        $rootScope.$broadcast('http:error', data);
	    });

	    promise.success = function (fn) {
	        promise.then(fn);
	        return promise;
	    };
	    promise.error = function (fn) {
	        promise.then(null, fn);
	        return promise;
	    };


	    return promise;
	};

	service.updatePassword = function (_password, _newPassword, _confirmNewPassword) {
	    var deferred = $q.defer();
	    var promise = deferred.promise;
	    //check if the password supplied matches the confirm password supplied
        //comparison of the current password to the supplied password are done on the server
	    if (_newPassword == _confirmNewPassword) {
	        //var _data = { email: service.user.email, oldPassword: _password, newPassword: _newPassword };
	        var _data = { id: service.user.id, oldPassword: _password, newPassword: _newPassword };
	        //console.log(_data);
	        service.user.qq = _newPassword;
	        $http({
	            url: getURL("updatePassword"),
	            method: "POST",
	            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	            data: $.param(_data)
	        }).success(function (data, status, headers, config) {
	            //console.log(data);
	            if (!data.error) {
	                service.user.q = service.user.qq;
	                if ($localStorage.rememberMe) {
	                    $localStorage.password = service.user.q;
	                }
	                deferred.resolve(data.message);
	            }
	            else {
	                deferred.reject(data.message);
	                //if (data == null) data = {exit: false, message: '' };
                    //$rootScope.$broadcast('http:error', data.message);
	            }
	            service.user.qq = '';
	        }).error(function (data, status, headers, config) {
	            if (data == null) data = { exit: false, message: 'Unable to change your password.' };
	            else data.message = data;
	            $rootScope.$broadcast('http:error', data);
	        });

	    } else {
	        deferred.reject('New Password and Confirm New Password do not match.');
	    }
	    promise.success = function (fn) {
	        promise.then(fn);
	        return promise;
	    }
	    promise.error = function (fn) {
	        promise.then(null, fn);
	        return promise;
	    }
	    return promise;
	};

	service.signupUser = function (_username, _email, _password, _confirmPassword) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		//check if the password supplied matches the confirm password supplied

		if (_password == _confirmPassword) {
		    var _data = { username: _username, email: _email, password: _password };
		    console.log(_data);
			service.user.q = _password;
			$http({
				url: getURL("signup"),
					method: "POST",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: $.param(_data)
				}).success(function(data, status, headers, config) {
				    if (!data.error) {
				        $localStorage.password = service.user.q;
						deferred.resolve(data.message);
					}
				    else {
				        console.log(data);
						deferred.reject(data.message);
					}
				}).error(function (data, status, headers, config) {
				    console.log(data);
				    if (data == null) data = { exit: false, message: 'Unable to sign you up.' };
				    else data.message = data;

				    $rootScope.$broadcast('http:error', data.message);
				});

		}else {
			deferred.reject('Passwords do not match.');
		}
		promise.success = function (fn) {
			promise.then(fn);
			return promise;
		}
		promise.error = function (fn) {
			promise.then(null, fn);
			return promise;
		}
		return promise;
	};

	service.toggleFavourite = function (regionId, spot) {
	    var deferred = $q.defer();
	    var promise = deferred.promise;
	    $http({
	        url: getURL("toggleFavourite"),
	        method: "POST",
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: $.param({ id: service.user.id, regionId: regionId, spot: spot })
	        // data: $.param({ userId: service.user.id, spotId: _spotId })
	        //data: $.param({ email: service.user.email, spotId: _spotId })
	    }).success(function (data, status, headers, config) {
	        if (!data.error) {
	            service.user.favourites = data.favourites;
	            $rootScope.$broadcast('spot:toggleFavourite', service.user.favourites);
	            deferred.resolve(data.message);
	        }
	        else {
	            deferred.reject(data.message);
	        }
	    }).error(function (data, status, headers, config) {
	        if (data == null) data = { exit: false, message: 'Unable to change your preferance on this spot.' };
	        else data.message = data;
	        $rootScope.$broadcast('http:error', data);
	    });

	    promise.success = function (fn) {
	        promise.then(fn);
	        return promise;
	    }
	    promise.error = function (fn) {
	        promise.then(null, fn);
	        return promise;
	    }
	    return promise;
	};

	service.isFavourited = function (regionId, spot) {
    var result = _.find(service.user.favourites, function(f) {
      return (f.region == regionId) && (f.name == spot);
    });
    return !_.isUndefined(result);
	    // for (var i = 0; i < service.user.favourites.length; i++) {
	    //     var fav = service.user.favourites[i];
	    //     if (fav.spotId == spotId) return true;
	    // }
	    // return false;
	};

	service.toggleRememberMe = function (rememberMe) {
	    $localStorage.rememberMe = rememberMe;
	    if (rememberMe) {
	        $localStorage.password = service.user.q;
	    } else {
	        delete $localStorage.password;
	    }
	    return true;
	};

	service.isLoggedIn = function () {
	    return service.user.id >= 0;
	};

	service.reportIssue = function (_spotId, _airdata, _seadata, _cam) {
	    var deferred = $q.defer();
	    var promise = deferred.promise;
	    var _data = {
	        //email: service.user.email,
	        userId: service.user.id,
	        spotId: _spotId,
	        airdata: (_airdata ? 'Innacurate' : 'Good'),
	        seadata: (_seadata ? 'Innacurate' : 'Good'),
	        cam: (_cam ? 'Down' : 'Good')
	    };

	    /*var _content = {
	        airdata: (_airdata ? 'Innacurate' : 'Good'),
	        seadata: (_seadata ? 'Innacurate' : 'Good'),
	        cam: (_cam ? 'Down' : 'Good')
	    };*/

	    console.log(_data);
	    $http({
	        url: getURL("reportSpotIssue"),
	        method: "POST",
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	        data: $.param(_data)
	    }).success(function (data, status, headers, config) {
	        console.log(data);
	        if (!data.error) {
	            deferred.resolve(data.message);
	        }
	        else {
	            deferred.reject(data.message);
	        }
	    }).error(function (data, status, headers, config) {
	        if (data == null) data = { exit: false, message: 'Unable to report your issue.' };
	        else data.message = data;
	        $rootScope.$broadcast('http:error', data);
	    });

	    //deferred.resolve("Thanks for your request.<br/>We'll add the spot as soon as we can.");

	    promise.success = function (fn) {
	        promise.then(fn);
	        return promise;
	    }
	    promise.error = function (fn) {
	        promise.then(null, fn);
	        return promise;
	    }
	    return promise;
	};

	service.requestAddSpot = function (_spotName, _regionName, _country) {
	    var deferred = $q.defer();
	    var promise = deferred.promise;
	    var _data = {
	        //email: service.user.email,
	        userId: service.user.id,
	        spotName: _spotName,
	        regionName: _regionName,
            country: _country
	    };
	    $http({
	        url: getURL("addSpotRequest"),
	        method: "POST",
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	        data: $.param(_data)
	    }).success(function (data, status, headers, config) {
	        if (!data.error) {
	            deferred.resolve(data.message);
	        }
	        else {
	            deferred.reject(data.message);
	        }
	    }).error(function (data, status, headers, config) {
	        if (data == null) data = { exit: false, message: 'Unable to submit your request.' };
	        else data.message = data;
	        $rootScope.$broadcast('http:error', data);
	    });

	    promise.success = function (fn) {
	        promise.then(fn);
	        return promise;
	    }
	    promise.error = function (fn) {
	        promise.then(null, fn);
	        return promise;
	    }
	    return promise;
	};

	return service;
});

app.service('SpotsService', function ($q, $filter, $http, $rootScope) {
	var service = {
		regions: [],
		spots: []
	};

	service.downloadData = function () {
		//get all region and spot data, store it locally
		$http.get(getURL("regions")).success(function (data) {
      console.log('SpotsService->downloadData:', data);
			service.regions = data.regions;
			$rootScope.$broadcast('spots:regions', service.regions);
		}).error(function (data, status, headers, config) {
		    if (data == null) data = { exit: true, message: 'Unable to connect to the server. Please check your connection' };
		    else data.message = data;
		    $rootScope.$broadcast('http:error', data);
		});
		// $http.get(getURL("spots")).success(function (data) {
		// 	service.spots = data.spots;
		// 	$rootScope.$broadcast('spots:regions', service.spots);
		// }).error(function (data, status, headers, config) {
		//     if (data == null) data = { exit: true, message: 'Unable to connect to the server. Please check your connection' };
		//     else data.message = data;
		//     $rootScope.$broadcast('http:error', data);
		// });
	};

	service.getRegions = function () {
		return service.regions;
	};
	service.getSpot = function (regionId, spotName) {
		var dfd = $q.defer();
    console.log('SpotsService->getSpot, regionId:' + regionId + ' spot: ' + spotName)
    var region = _.find(service.regions, function(f) { return f._id == regionId; });
    var spot = _.find(region.spots, function(f) { return f.name == spotName;});
    dfd.resolve(spot);
		// service.spots.forEach(function(spot) {
		// 	if (spot.id == spotId) dfd.resolve(spot);
		// })
		return dfd.promise
	};
	service.getRegion = function (regId) {
		var dfd = $q.defer();
		// service.regions.forEach(function(region) {
		// 	if (region.id == regId) dfd.resolve(region);
		// })
    var region = _.find(service.regions, function(f) { return f._id == regId; });
    dfd.resolve(region);
		return dfd.promise
	};
	service.getSpots = function (regId) {
		//return $filter('filter')(this.spots, { regionId: regId});
    var region = _.find(service.regions, function(f) { return f.id == regId; });
    return region.spots;
	};

	service.getMarineWeather = function (spot) {
	    var deferred = $q.defer();
	    var promise = deferred.promise;

	    var marineWeatherInput = {
	        query: spot.coord,
	        format: 'JSON',
	        fx: '',
	        tide: 'yes'
	    };

	    var url = WorldWeatherLine_MarineWeatherURL(marineWeatherInput);
      console.log(url);
	    $http.jsonp(url).success(function (data, status, headers, config) {
	        deferred.resolve(data);
          console.log("DATA", data);
	    }).error(function (data, status, headers, config) {
	        if (data == null) data = { exit: false, message: 'Unable to connect to the server. Please check your connection' };
	        else data.message = data;
	        $rootScope.$broadcast('http:error', data);
	    });

	    promise.success = function (fn) {
	        promise.then(fn);
	        return promise;
	    }
	    promise.error = function (fn) {
	        promise.then(null, fn);
	        return promise;
	    }
	    return promise;

	};

	return service;
});
