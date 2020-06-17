"use strict";

angular.module("communicationModule", []);
angular.module("Dashboard", []);
angular.module("login", []);
angular.module("home", []);
angular.module("speciality", []);
angular.module("welcome", []);
angular.module("Authentication", []);
angular.module("Header", []);
angular.module("accountPreference", []);
angular.module("Preference", []);
angular.module("doctors", []);
angular.module("Insurance", []);


// angular.module("")

var nwdApp = angular.module('nwdApp', ['ui.router', 'ui.mask', 'ui.select', 'ngSanitize',
    'ngRoute', 'ngStorage', 'ngTable', 'ngResource', 'ngMessages', 'ngMaterial','ui.bootstrap', 'ngYoutubeEmbed', 'ngVideo', 'vcRecaptcha',
    'communicationModule', 'welcome', 'Dashboard', 'home', 'login', 'speciality',
    'Authentication', 'Header', 'accountPreference', 'Preference', 'doctors', 'Insurance'
])
    .controller("FaqController", FaqController)
    // for formatting phone no in listing pages
    .filter('phonenumber', function () {
        return function (inp) {
            if (inp) {
                inp = inp.substr(inp.length - 10);
                var inp = inp || '';
                var finalInp = inp.replace(/\D[^\.]/g, "");
                inp = finalInp.slice(0, 3) + "-" + finalInp.slice(3, 6) + "-" + finalInp.slice(6);
                return inp;
            } else {
                return inp;
            }
        };
    })
    .factory('$remember', function () {
        return function (name, values) {
            var cookie = name + '=';

            cookie += values + ';';

            var date = new Date();
            date.setDate(date.getDate() + 7);

            cookie += 'expires=' + date.toString() + ';';

            document.cookie = cookie;
        }
    })
    .factory("CommonService", ["$http", "$resource", "$rootScope", "$mdDialog", function ($http, $resource, $rootScope, $mdDialog) {

        var showFaq = function (pageid) {
            $http.get('/api/getHelpContent?page=' + pageid).success(function (resp) {
                if (resp.code === 200) {
                    $rootScope.helpTitle = resp.data.title;
                    $rootScope.helpDescription = resp.data.description;
                    $rootScope.youtubeLink = resp.data.youtube_link;

                    $mdDialog.show({
                        controller: FaqController,
                        //template: "<md-dialog aria-label='patient'><md-toolbar><div class='md-toolbar-tools'><h2 class='ng-binding'>"+resp.data.title+"</h2><span flex></span><md-button class='md-icon-button' ng-click='cancel()'><md-icon aria-label='Close dialog'><i class='fa fa-times' aria-hidden='true'></i></md-icon></md-button></div></md-toolbar><md-dialog-content style='width: 450px; height:300px' layout-padding ><div><p class='ng-binding' style='font-family: serif;padding: 15px;font-size: larger;'>"+resp.data.description+"</p></div></md-dialog-content><md-dialog-actions></md-dialog-actions></md-dialog>",
                        templateUrl: "/../modules/views/faq.html",
                        // parent: angular.element(document.body),
                        // targetEvent: ev,
                        clickOutsideToClose: false,
                        preserveScope: true,
                        scope: $rootScope,
                        fullscreen: $rootScope.customFullscreen // Only for -xs, -sm breakpoints.
                    })
                }
            });
        };

        var getDegreeList = function () {
            $rootScope.degree = {};
            $http.get('api/getTitles').success(function (resp) {
                if (resp.code === 200) {
                    resp.data.forEach(function (item) {
                        $rootScope.degree[item._id] = item.name;
                    });

                }
            });
        };

        var getStateList = function () {
            $rootScope.stateList = {};
            $http.get('api/getStates').success(function (resp) {
                if (resp.code === 200) {
                    resp.data.forEach(function (item) {
                        $rootScope.stateList[item._id] = item.state;
                    });
                }
            });
        };

        var getFrontdeskDegreeList = function () {
            $rootScope.officeadminTitleArr = {};
            $http.get('api/getFrontdeskTitles').success(function (resp) {
                if (resp.code === 200) {
                    resp.data.forEach(function (item) {
                        $rootScope.officeadminTitleArr[item._id] = item.name;
                    });

                }
            });
        };

        return {
            showFaq: showFaq,
            getDegreeList: getDegreeList,
            getStateList: getStateList,
            getFrontdeskDegreeList: getFrontdeskDegreeList
        }
    }])

    .factory('IdleTimeout', function ($timeout, $document) {

        return function (delay, onIdle, playOnce) {

            var idleTimeout = function (delay, onIdle) {

                //var $this = this;
                var idleTime = delay;
                var timerTime = delay;
                var st = '';
                var goneIdle = function () {
                    //console.log('Gone Idle');
                    onIdle();
                    $timeout.cancel($timeout);
                };

                var showTimer = function () {
                    timerTime -= 1000;
                    var minutes = Math.floor((timerTime % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((timerTime % (1000 * 60)) / 1000);
                    var autologoutMsg = "Auto logout:" + minutes + "m " + seconds + "s";

                    if (timerTime < (1000 * 60 * 5))
                        angular.element(document.querySelector('#showCounter')).html(autologoutMsg).css("display", "block");
                    else
                        angular.element(document.querySelector('#showCounter')).css("display", "none");

                };

                return {
                    cancel: function () {
                        //console.log('cancelTimeout');
                        clearInterval(st);
                        return $timeout.cancel(this.timeout);
                    },
                    start: function (event) {
                        //console.log('startTimeout', idleTime);
                        timerTime = idleTime;
                        clearInterval(st);
                        st = setInterval(showTimer, 1000);
                        this.timeout = $timeout(function () {
                            goneIdle();
                        }, idleTime);
                    }
                };
            };

            var events = ['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'];
            var $body = angular.element($document);
            var reset = function (event) {
                idleTimer.cancel();
                idleTimer.start();
            };
            var idleTimer = idleTimeout(delay, onIdle);

            return {
                active: true,
                cancel: function () {
                    idleTimer.cancel();
                    events.forEach(function (event) {
                        $body.off(event, reset);
                    });
                },
                start: function () {
                    idleTimer.start();
                    events.forEach(function (event) {
                        $body.on(event, reset);
                    });
                }
            };
        };

    })
    .directive('timeoutInactive', ['IdleTimeout', "$rootScope", "$location", "$sessionStorage", "$window", function (IdleTimeout, $rootScope, $location, $sessionStorage, $window) {
        return {
            restrict: 'AC',
            controller: function ($scope) {
                $scope.msg = '';
                $scope.timer = null;
                $scope.active = false;
                $scope.start = function (timer) {
                    $scope.timer = new IdleTimeout(600000, $scope.cancel); //10 mins of inactivaty
                    $scope.timer.start();
                    //$scope.msg = 'Timer is running';
                    //$scope.active = true;
                };
                $scope.cancel = function () {
                    //console.log('app has gone idle');
                    $scope.timer.cancel();
                    //$scope.msg = 'Timer has stopped.';
                    //$scope.active = false;
                    var frontDeskAccess = sessionStorage.getItem('frontDeskAccess');
                    var token = sessionStorage.getItem('token1');
                    $rootScope.userLoggedIn = false;
                    delete $sessionStorage.test;
                    sessionStorage.removeItem('test');
                    sessionStorage.removeItem('userStatus');
                    sessionStorage.clear();
                    sessionStorage.setItem('userLoggedIn', false);
                    sessionStorage.setItem('token1', '');

                    if (frontDeskAccess) {
                        $window.close();
                        $location.path('/');
                    } else {
                        $location.path('/');
                    }
                };
            },
            link: function ($scope, $el, $attrs) {
                $scope.start();
            }
        };
    }])


    .config(['$routeProvider', '$httpProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider', function (
        $routeProvider, $httpProvider, $locationProvider, $stateProvider, $urlRouterProvider) {

        $httpProvider.interceptors.push(function ($q, $location, $window) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    var authToekn = ($window.sessionStorage.token1) ? $window.sessionStorage.token1 : ($window.localStorage.getItem('token1')) ? $window.localStorage.getItem('token1') : '';
                    config.headers['authorization'] = authToekn;
                    config.headers['client-type'] = 'browser'; // this is used to detect the request is from the browser
                    return config;
                },
                response: function (response) {
                    if (response.data.code == 402) {
                        delete $window.sessionStorage.token1;
                        delete $window.localStorage.token1;
                        // handle the case where the user is not authenticated
                        $location.path('/');
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


        var checkLoggedin = function () {
            return ['$q', '$timeout', '$http', '$location', '$rootScope', '$state', '$window',
                function ($q, $timeout, $http, $location, $rootScope, $state, $window) {
                    // Initialize a new promise
                    var deferred = $q.defer();
                    // Make an AJAX call to check if the user is logged in
                    if ($window.sessionStorage.token1 || $window.localStorage.getItem('token1')) {
                        $http.get('/api/loggedin').success(function (response) {
                            // Authenticated
                            if (response.code === 200) {
                                $rootScope.userLoggedIn = true;

                                if (response.user.userType == 'user') {
                                    $window.sessionStorage;
                                    $rootScope.userLoggedIn = true;
                                    $window.sessionStorage.userLoggedIn = true;
                                    $window.sessionStorage.token1 = 'admin_bearer ' + response.user.token;
                                    $window.sessionStorage.userType = 'user';
                                    $window.sessionStorage.test = JSON.stringify(response.user);
                                    $window.sessionStorage.userStatus = response.user.doctorStatus;
                                    $rootScope.user = JSON.parse($window.sessionStorage.test);
                                    var a = response.user.service.length;
                                    var b = response.user.speciality.length;
                                    if (response.user.firstLogin) {
                                        $rootScope.userFirstLogin = true;
                                        $location.path('/welcome');
                                    } else if (response.data && response.data.changePass) {
                                        $location.path('/change-password');
                                    } else {
                                        $location.path('/dashboard');
                                    }
                                }

                               
                            }
                            // Not Authenticated
                            else {
                                $rootScope.userLoggedIn = false;
                                $window.location = mainUrl;
                                $timeout(function () {
                                    deferred.resolve();
                                }, 0);
                            }
                        }).error(function (error) {
                            $rootScope.userLoggedIn = false;
                            $window.location = mainUrl;
                            $timeout(function () {
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


        var checkLoggedout = function () {
            return ['$q', '$timeout', '$http', '$location', '$rootScope', '$state', '$window',
                function ($q, $timeout, $http, $location, $rootScope, $state, $window) {
                    // Initialize a new promise 
                    var deferred = $q.defer();
                    // Make an AJAX call to check if the user is logged in
                    $http.get('/api/loggedin').success(function (response) {
                        // Authenticated
                        if (response.status == 'OK') {
                            $rootScope.userLoggedIn = true;
                            var user = response.user;
                            $timeout(deferred.resolve, 0);
                            if (response.changePass && !$rootScope.loginAsReq) {
                                $state.go('changePassword');
                            }
                        }
                        // Not Authenticated
                        else {
                            $rootScope.userLoggedIn = false;
                            $timeout(function () {
                                deferred.resolve();
                            }, 0);
                            $state.go('/');
                        }
                    }).error(function (error) {
                        $rootScope.userLoggedIn = false;
                        $timeout(function () {
                            deferred.resolve();
                        }, 0);
                        $state.go('/');
                    });
                    return deferred.promise;
                }
            ];
        };

        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    'content': {
                        templateUrl: '/modules/home/views/home.html',
                        controller: "homeController"
                    }
                },
                resolve: {
                    loggedin: checkLoggedin()
                }
            })
            .state('contactus', {
                url: '/contact-us',
                views: {
                    'content': {
                        templateUrl: '/modules/contactus/views/contact.html',
                        controller: "homeController"
                    }
                },
                resolve: {
                    loggedin: checkLoggedin()
                }
            })
            .state('aboutus', {
                url: '/about-us',
                views: {
                    'content': {
                        templateUrl: '/modules/aboutus/views/about.html',
                        controller: "homeController"
                    }
                },
                resolve: {
                    loggedin: checkLoggedin()
                }
            })
            .state('loginAs', {
                url: '/loginAs/:id/:req',
                views: {
                    'content': {
                        templateUrl: '/modules/login/views/loginAs.html',
                        controller: "userLoginController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/loginFooter.html'
                    }
                }
            })
            .state('loginAsUser', {
                url: '/loginAsUser/:id/:req',
                views: {
                    'content': {
                        templateUrl: '/modules/login/views/loginAsUser.html',
                        controller: "userLoginController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/loginFooter.html'
                    }
                }
            })            
            .state('login', {
                url: '/login',
                views: {
                    'content': {
                        templateUrl: '/modules/login/views/login.html',
                        controller: "userLoginController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/loginFooter.html'
                    }
                }
            })
            .state('forgetPassword', {
                url: '/forgetPassword',
                views: {
                    'content': {
                        templateUrl: '/modules/home/views/forgetPassword.html',
                        controller: "homeController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/loginFooter.html'
                    }
                }
            })
            .state('existMember', {
                url: '/existMember/:id',
                views: {
                    'content': {
                        templateUrl: '/modules/home/views/existMember.html',
                        controller: "homeController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/loginFooter.html'
                    }
                }
            })
            .state('resetPassword', {
                url: '/resetPassword/:id',
                views: {
                    'content': {
                        templateUrl: '/modules/home/views/resetPassword.html',
                        controller: "homeController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
            })
            .state('register', {
                url: '/register',
                views: {
                    'content': {
                        templateUrl: '/modules/login/views/register.html',
                        controller: "userLoginController"
                    }
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/dashboard/views/dashboard.html',
                        controller: "dashboardController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('changePassword', {
                url: '/change-password',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/doctorInfo/views/updatePassword.html',
                        controller: "preferranceController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                // resolve: {
                //     loggedin: checkLoggedout()
                // }
            })

            .state('welcome', {
                url: '/welcome',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html',
                    },
                    'content': {
                        templateUrl: '/modules/login/views/welcome.html',
                        controller: "userLoginController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('frontdesk', {
                url: '/front-desk',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html',
                    },
                    'content': {
                        templateUrl: '/modules/login/views/frontdesk.html',
                        controller: "userLoginController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('preference', {
                url: '/preference',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/preference/views/home.html',
                        controller: "PreferenceController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('insurance', {
                url: '/insurance/list',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/insurance/views/list.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addInsurance', {
                url: '/insurance/add',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/insurance/views/add.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editInsurance', {
                url: '/insurance/edit/:id',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/insurance/views/add.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('contact', {
                url: '/contact-details',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/preference/views/contact.html',
                        controller: "PreferenceController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })



            .state('confirmContactDetails', {
                url: '/contactDetails',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                        // controller: "dashboardController"
                    },
                    'content': {
                        templateUrl: '/modules/doctorInfo/views/confirmContactDetails.html',
                        controller: "preferranceController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('makeReferral', {
                url: '/makeReferral',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/makeReferral.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('referPatient', {
                url: '/referPatient',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/referPatient.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('confirmSpec', {
                url: '/confirmSpec',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/confirmSpec.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('searchProvider', {
                url: '/searchProvider',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/searchProvider.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('invoice', {
                url: '/invoice',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/invoice.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('confirmSpeciality', {
                url: '/speciality',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/confirmSpeciality.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('confirmServices', {
                url: '/services',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/confirmServices.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('doctors', {
                url: '/doctors',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/confirmDoctor.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('view-provider', {
                url: '/view-providers/:id',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/viewProvider.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('lookup', {
                url: '/lookup',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/lookup.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addDoc', {
                url: '/add-doctor',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/addDoc.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })


            .state('confirmation', {
                url: '/confirmation',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/confirmation.html',
                        controller: "referralController"

                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()

                }


            })
            .state('notificationList', {
                url: '/notification-list',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/doctorInfo/views/notificationList.html',
                        controller: "dashboardController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
            })
            .state('success', {
                url: '/success',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/success.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('doctorslist', {
                url: '/doctorslist',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                        // controller: "dashboardController"
                    },
                    'content': {
                        templateUrl: '/modules/referral/views/doctorlist.html',
                        controller: "referralController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('doctors-list', {
                url: '/doctor/list',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },

                    'content': {
                        templateUrl: '/modules/doctors/views/doctor_list.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addDoctor', {
                url: '/doctor/add',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },

                    'content': {
                        templateUrl: '/modules/doctors/views/addDoctor.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editDoctor', {
                url: '/doctor/edit/:id',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },

                    'content': {
                        templateUrl: '/modules/doctors/views/editDoctor.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('inviteStaff', {
                url: '/inviteStaff',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/invite/views/inviteStaff.html',
                        controller: "inviteController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('view-invite-provider', {
                url: '/view-invite-provider/:id',
                views: {
                    'header': {
                        templateUrl: '/modules/dashboard/views/header.html'
                    },
                    'content': {
                        templateUrl: '/modules/invite/views/viewProvider.html',
                        controller: "inviteController"
                    },
                    'footer': {
                        templateUrl: '/modules/dashboard/views/footer.html'
                    }
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
    }])

    .run(['$rootScope', '$location', '$http', '$sessionStorage', '$state', '$document',
        function ($rootScope, $location, $http, $sessionStorage, $state, $document) {
            var abc = sessionStorage.getItem('test');

            $rootScope.UserStatus = sessionStorage.getItem('userStatus');
            $rootScope.user = JSON.parse(abc);
            if ($rootScope.user) {
                var userLoggedIn = true;
                sessionStorage.getItem('userLoggedIn');
                $rootScope.userLoggedIn = true;
            } else {
                var userLoggedIn = false;
                sessionStorage.getItem('userLoggedIn');
                $rootScope.userLoggedIn = false;
            }
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) { });
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
                $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
                setTimeout(function () {
                    navBarSlide();
                }, 1000);
            });
        }
    ])

    .directive("owlCarousel", function () {
        return {
            restrict: 'E',
            transclude: false,
            link: function (scope) {
                scope.initCarousel = function (element) {
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

    .directive('owlCarouselItem', [function () {
        return {
            restrict: 'A',
            transclude: false,
            link: function (scope, element) {
                // wait for the last item in the ng-repeat then call init
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }])

    .directive('passwordVerify', [function () {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, elem, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                // watch own value and re-validate on change
                scope.$watch(attrs.ngModel, function () {
                    validate();
                });

                // observe the other value and re-validate on change
                attrs.$observe('passwordVerify', function (val) {
                    validate();
                });

                var validate = function () {
                    // values
                    var val1 = ngModel.$viewValue;
                    var val2 = attrs.passwordVerify;

                    // set validity
                    ngModel.$setValidity('passwordVerify', val1 === val2);
                };
            }
        }
    }])
    .filter('capitalize', function () {
        return function (input) {
            if (input !== null && (typeof input !== 'undefined') && input.split(' ').length > 1) {
                return input.split(" ").map(function (input) { return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '' }).join(" ");

            } else if (input !== null && (typeof input !== 'undefined') && input.split('-').length > 1) {
                return input.split("-").map(function (input) { return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '' }).join("-");
            } else {
                return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
            }

        }
    })
    .filter('trustAsResourceUrl', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsResourceUrl(val);
        };
    }])

    .filter('titleLineBreaker', function () {
        return function (str) {
            if (!str) {
                return str;
            }

            return str.replace(/\n/g, '&lt;br /&gt;');
        };
    });

var isSessionExist = function () {
    return ["$q", "$rootScope", "$location", '$http', '$sessionStorage', function ($q, $rootScope, $location, $http, $sessionStorage) {
        var deferred = $q.defer();
        var userLoggedIn = sessionStorage.getItem('userLoggedIn');
        var userType = sessionStorage.getItem('userType');
        if (userLoggedIn === 'true' && ['user'].indexOf(userType) !== -1) {
            deferred.resolve(true);
        } else if (userType == 'admin') {
            $window.location = mainUrl + '/admin';
        } else {
            $window.location = mainUrl;

        }
        return deferred.promise;
    }];
};

function FaqController($scope, $mdDialog) {

    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {

        $mdDialog.cancel();
    };
    $scope.answer = function (answer) {
        $mdDialog.hide(answer);
    };
}