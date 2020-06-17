"use strict";

angular.module("Authentication", []);
angular.module("Home", []);
angular.module("communicationModule", []);
angular.module("doctors", []);
angular.module("patients", []);

var nwdApp = angular.module('nwdApp', ['ui.router', 'ui.mask', 'ui.select', 'ngSanitize', 'ngRoute', 'ngStorage', 'ngTable', 'ngResource',
        'Authentication', 'Home', 'communicationModule', 'doctors', 'ui.bootstrap',
        'angularFileUpload', 'ngMessages', 'angularUtils.directives.dirPagination', 'patients',
    ])
    // for formatting phone no in listing pages
    .filter('phonenumber', function() {
        return function(inp) {
            if(inp){
                inp = inp.substr(inp.length - 10);
                var inp = inp || '';
                var finalInp = inp.replace(/\D[^\.]/g, "");
                inp = finalInp.slice(0, 3) + "-" + finalInp.slice(3, 6) + "-" + finalInp.slice(6);
                return inp;
            }else{
                return inp;
            }
        };
    })
    .factory("CommonService", ["$http", "$resource", "$rootScope", function($http, $resource, $rootScope) {

        var user = {};
        var getUser = function() {
            return user;
        };
        var setUser = function(userData) {
            user = '';
            user = userData;
        };
        return {
            getUser: getUser,
            setUser: setUser
        }
    }])
    .config(['$routeProvider', '$httpProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider', function(
        $routeProvider, $httpProvider, $locationProvider, $stateProvider, $urlRouterProvider) {

        $httpProvider.interceptors.push(function($q, $location, $window) {

            return {
                request: function(config) {
                    if ($window.sessionStorage.userType == 'user') {
                        $window.location = 'http://localhost:8003/#/dashboard'
                    } else {
                        config.headers = config.headers || {};
                        config.headers['authorization'] = $window.sessionStorage.token1;
                        config.headers['client-type'] = 'browser'; // this is used to detect the request is from the browser
                        return config;
                    }
                },
                response: function(response) {
                    if (response.data.code == 402 || response.data.code == 401) {
                        delete $window.sessionStorage.token1;
                        $window.location = mainUrl;

                    }
                    return response || $q.when(response);
                }
            };
        });

        if (!$httpProvider.defaults.headers.get) { 
           $httpProvider.defaults.headers.common = {};    
        }    
        $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
        $httpProvider.defaults.headers.common.Pragma = "no-cache";    
        $httpProvider.defaults.headers.common["If-Modified-Since"] = "0";
        var checkLoggedin = function() {
            return ['$q', '$timeout', '$http', '$location', '$rootScope', '$state', '$window',
                function($q, $timeout, $http, $location, $rootScope, $state, $window) {
                    // Initialize a new promise
                    var deferred = $q.defer();
                    // Make an AJAX call to check if the user is logged in
                    if ($window.sessionStorage.token1) {
                        $http.get('/api/loggedin').success(function(response) {
                            if (response.code === 200) {
                                $rootScope.userLoggedIn = true;
                                // this will set the user in the session to the application model
                                $state.go('admindashboard');
                            }
                            else {
                                $rootScope.userLoggedIn = false;
                                $window.location = mainUrl;
                                //$state.go('super-admin');
                                $timeout(function() {
                                    deferred.resolve();
                                }, 0);
                            }
                        }).error(function(error) {
                            $rootScope.userLoggedIn = false;
                            $window.location = mainUrl;
                            $timeout(function() {
                                deferred.resolve();
                            }, 0);
                        });
                    } else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                }
            ]
        };


        var checkLoggedout = function() {
            return ['$q', '$timeout', '$http', '$location', '$rootScope', '$state', 'CommonService', '$window',
                function($q, $timeout, $http, $location, $rootScope, $state, CommonService, $window) {
                    // Initialize a new promise 

                    var deferred = $q.defer();
                    // Make an AJAX call to check if the user is logged in
                    $http.get('/api/loggedin').success(function(response) {
                        if (response.status == 'OK') {
                            $rootScope.userLoggedIn = true;
                            var user = response.user;
                            CommonService.setUser(user);
                            $timeout(deferred.resolve, 0);
                        }
                        // Not Authenticated
                        else {
                            $rootScope.userLoggedIn = false;
                            $timeout(function() {
                                deferred.resolve();
                            }, 0);
                            $window.location = mainUrl;
                        }
                    }).error(function(error) {
                        $rootScope.userLoggedIn = false;
                        $timeout(function() {
                            deferred.resolve();
                        }, 0);
                        $window.location = mainUrl;
                    });
                    return deferred.promise;
                }
            ];
        };


        $urlRouterProvider.otherwise('/');

        $stateProvider
        // // HOME STATES AND NESTED VIEWS ========================================
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
            .state('admin', {
                url: '/',
                data: {
                    isAuthenticate: false
                },
                resolve: {
                    loggedin: checkLoggedin(),
                }
            })
            .state('verifying_link', {
                url: '/verifying-link',
                views: {
                    'content': {
                        templateUrl: '/adminmodules/home/views/verifying_link.html',
                        controller: "homeController"
                    }
                },
                data: {},
                resolve: {}
            })
            .state('forgot_password', {
                url: '/forgot-password',
                views: {
                    'content': {
                        templateUrl: '/adminmodules/authentication/views/forgot-password.html',
                        controller: "adminloginController"
                    }
                },
                data: {},
                resolve: {
                    loggedin: checkLoggedin,
                }
            })
            .state('admindashboard', {
                url: '/admindashboard',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/home/views/home.html',
                        controller: "homeController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }

            })
            .state('doctors', {
                url: '/doctors',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/doctors/views/doctor_list.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

        .state('addDoctor', {
            url: '/doctors/addDoctors',
            views: {
                'header': {
                    templateUrl: '/adminmodules/home/views/header.html'
                },
                'leftBar': {
                    templateUrl: '/adminmodules/home/views/leftBar.html'
                },
                'content': {
                    templateUrl: '/adminmodules/doctors/views/addDoctor.html',
                    controller: "doctorController"
                },
                'footer': {
                    templateUrl: '/adminmodules/home/views/footer.html'
                }
            },
            data: {
                isAuthenticate: true
            },
            resolve: {
                loggedin: checkLoggedout()
            }
        })

        .state('editDoctor', {
                url: '/doctors/editDoctor/:id',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/doctors/views/editDoctor.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('ancillary', {
                url: '/ancillary',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/doctors/views/ancillary_list.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addAncillary', {
                url: '/ancillary/add',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/doctors/views/addAncillary.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editAncillary', {
                url: '/ancillary/edit/:id',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/doctors/views/editAncillary.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('patients', {
                url: '/patients',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/patients/views/patient_list.html',
                        controller: "patientController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addPatients', {
                url: '/patients/addPatients',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/patients/views/addPatient.html',
                        controller: "patientController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editPatient', {
                url: '/patients/editPatient/:id',
                views: {
                    'header': {
                        templateUrl: '/adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/adminmodules/patients/views/editPatient.html',
                        controller: "patientController"
                    },
                    'footer': {
                        templateUrl: '/adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
        
    }])

.run(['$rootScope', '$location', '$http', '$sessionStorage', '$state', 'ngTableParamsService',
        function($rootScope, $location, $http, $sessionStorage, $state, ngTableParamsService) {

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
                $rootScope.currentState = toState.name;
            });

        }
    ])
    .filter('capitalize', function() {
        return function(input) {
            if (input !== null && (typeof input !== 'undefined') && input.split(' ').length > 1) {
                return input.split(" ").map(function(input) { return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '' }).join(" ");
            } else if (input !== null && (typeof input !== 'undefined') && input.split('-').length > 1) {
                return input.split("-").map(function(input) { return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '' }).join("-");
            } else {
                return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
            }

        }
    })
    .directive("owlCarousel", function() {
        return {
            restrict: 'E',
            transclude: false,
            link: function(scope) {
                scope.initCarousel = function(element) {
                    // provide any default options you want
                    var defaultOptions = {};
                    var customOptions = scope.$eval($(element).attr('data-options'));
                    // combine the two options objects
                    for (var key in customOptions) {
                        defaultOptions[key] = customOptions[key];
                    }
                    // init carousel
                    var curOwl = $(element).data('owlCarousel');
                    if (!angular.isDefined(curOwl)) {
                        $(element).owlCarousel(defaultOptions);
                    }
                    scope.cnt++;
                };
            }
        };
    })
    .directive('owlCarouselItem', [function() {
        return {
            restrict: 'A',
            transclude: false,
            link: function(scope, element) {
                // wait for the last item in the ng-repeat then call init
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }])
    .filter('trustAsResourceUrl', ['$sce', function($sce) {
        return function(val) {
            return $sce.trustAsResourceUrl(val);
        };
    }]);