"use strict";

angular.module("Authentication", []);
angular.module("Home", []);
angular.module("communicationModule", []);
angular.module("Users", []);
angular.module("Services", []);
angular.module("Units", []);
angular.module("Roles", []);
angular.module("doctors", []);
angular.module("speciality", []);
angular.module("Insurance", []);
angular.module("Title", []);
angular.module("Frontdesktitle", []);
angular.module("Report", []);
angular.module("officeAdmin", []);
angular.module("faxtemplate", []);
angular.module("emailtemplate", []);
angular.module("smstemplate", []);
angular.module("hospital", []);
angular.module("faq", []);
angular.module("Log", []);
angular.module("Actv", []);
angular.module("referral", []);
angular.module("notification", []);
angular.module("Invitation", []);
var nwdApp = angular.module('nwdApp', [
    'ui.router',
    'ui.mask',
    'ui.select',
    'ui.bootstrap.dropdownToggle',
    'ngSanitize',
    'textAngular',
    'ngRoute',
    'ngStorage',
    'ngTable',
    'ngResource',
    'ngMaterial',
    'daterangepicker',
    'Authentication',
    'Home',
    'communicationModule',
    'Users',
    'doctors',
    'Services',
    'Units',
    'ui.bootstrap',
    'angularFileUpload',
    'ngMessages',
    'angularUtils.directives.dirPagination',
    'speciality',
    'Insurance',
    'Title',
    'Frontdesktitle',
    'Report',
    'officeAdmin',
    'faxtemplate',
    'emailtemplate',
    'smstemplate',
    'hospital',
    'faq',
    'Log',
    'referral',
    'notification',
    'Invitation'
])
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

    // .service('getPhone', function() {
    //     this.phone = function (inp) {
    //         var res = (inp.length === 10)? inp : (inp.length > 10)? inp.substr(inp.length - 10):'';
    //         return res;
    //     };
    //     this.ccode = function (inp) {
    //         var res = (inp.length ===10)? '': inp.substr(0, inp.length - 10);
    //         return res;
    //     }
    // })

    .factory('getPhone', function () {
        return {
            phone: function (inp) {
                var res = (inp.length === 10) ? inp : (inp.length > 10) ? inp.substr(inp.length - 10) : '';
                return res;
            },
            ccode: function (inp) {
                var res = (inp.length === 10) ? '+1' : inp.substr(0, inp.length - 10);
                return res;
            }
        }
    })

    .factory("CommonService", ["$http", "$resource", "$rootScope", function ($http, $resource, $rootScope) {

        var user = {};
        var getUser = function () {
            return user;
        };
        var setUser = function (userData) {
            user = '';
            user = userData;
        };
        return {
            getUser: getUser,
            setUser: setUser
        }
    }])
    .factory('IdleTimeout', function ($timeout, $document, $rootScope) {

        return function (delay, onIdle, playOnce) {

            var idleTimeout = function (delay, onIdle) {

                //var $this = this;
                var idleTime = delay;
                var timerTime = delay;
                var st = '';
                var goneIdle = function () {
                    onIdle();
                    $timeout.cancel($timeout);
                };

                var showTimer = function () {
                    timerTime -= 1000;
                    var minutes = Math.floor((timerTime % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((timerTime % (1000 * 60)) / 1000);
                    var autologoutMsg = "Application will auto logout in " + minutes + "m " + seconds + "s";
                    if (timerTime < (1000 * 60 * 5))
                        angular.element(document.querySelector('#showCounter')).html(autologoutMsg).show();
                    else
                        angular.element(document.querySelector('#showCounter')).hide();

                }

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
                    //$scope.timer = new IdleTimeout(60000, $scope.cancel); //15 secs of inactivaty
                    $scope.timer.start();
                    //$scope.msg = 'Timer is running';
                    //$scope.active = true;
                };
                $scope.cancel = function () {
                    //console.log('app has gone idle');
                    $scope.timer.cancel();
                    //$scope.msg = 'Timer has stopped.';
                    //$scope.active = false;
                    delete $window.sessionStorage.token;
                    delete $window.sessionStorage.loggedInUser;
                    delete $window.sessionStorage.userType;
                    $rootScope.userLoggedIn = false;
                    $window.sessionStorage.clear();
                    $location.path('/home');
                };
            },
            link: function ($scope, $el, $attrs) {
                $scope.start();
            }
        };
    }])
    .directive('excelExport', function () {
        return {
            restrict: 'A',
            scope: {
                fileName: "@",
                data: "&exportData"
            },
            replace: true,
            template: '<button class="btn btn-primary btn-ef btn-ef-3 btn-ef-3c mb-10" ng-click="download()">Export to Excel <i class="fa fa-download"></i></button>',
            link: function (scope, element) {
                scope.download = function () {
                    function datenum(v, date1904) {
                        if (date1904) v += 1462;
                        var epoch = Date.parse(v);
                        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
                    };
                    function getSheet(data, opts) {
                        //console.log("here is data:::>",data,opts)
                        var ws = {};
                        var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
                        for (var R = 0; R != data.length; ++R) {
                            for (var C = 0; C != data[R].length; ++C) {
                                if (range.s.r > R) range.s.r = R;
                                if (range.s.c > C) range.s.c = C;
                                if (range.e.r < R) range.e.r = R;
                                if (range.e.c < C) range.e.c = C;
                                var cell = { v: data[R][C] };
                                if (cell.v == null) continue;
                                var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                                if (typeof cell.v === 'number') cell.t = 'n';
                                else if (typeof cell.v === 'boolean') cell.t = 'b';
                                else if (cell.v instanceof Date) {
                                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                                    cell.v = datenum(cell.v);
                                }
                                else cell.t = 's';
                                ws[cell_ref] = cell;
                            }
                        }
                        if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                        return ws;
                    };

                    function Workbook() {
                        if (!(this instanceof Workbook)) return new Workbook();
                        this.SheetNames = [];
                        this.Sheets = {};
                    }

                    var wb = new Workbook(), ws = getSheet(scope.data());
                    /* add worksheet to workbook */
                    wb.SheetNames.push(scope.fileName);
                    wb.Sheets[scope.fileName] = ws;
                    var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

                    function s2ab(s) {
                        var buf = new ArrayBuffer(s.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                        return buf;
                    }
                    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), scope.fileName + '.xlsx');
                };
            }
        };
    })

    .config(['$routeProvider', '$httpProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider', function (
        $routeProvider, $httpProvider, $locationProvider, $stateProvider, $urlRouterProvider) {

        $httpProvider.interceptors.push(function ($q, $location, $window) {

            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    config.headers['authorization'] = $window.sessionStorage.token;
                    config.headers['client-type'] = 'browser'; // this is used to detect the request is from the browser
                    return config;
                },
                response: function (response) {
                    if (response.data.code == 402 || response.data.code == 401) {
                        delete $window.sessionStorage.token;
                        $location.path('/login');
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
                    var deferred = $q.defer();
                    if ($window.sessionStorage.token) {
                        $http.get('/api/loggedin').success(function (response) {
                            if (response.code === 200) {
                                $rootScope.userLoggedIn = true;
                                // this will set the user in the session to the application model
                                $state.go('admindashboard');
                            }
                            else {
                                $rootScope.userLoggedIn = false;
                                $state.go('super-admin');
                                $timeout(function () {
                                    deferred.resolve();
                                }, 0);
                            }
                        }).error(function (error) {
                            $rootScope.userLoggedIn = false;
                            $state.go('super-admin');
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
            return ['$q', '$timeout', '$http', '$location', '$rootScope', '$state', 'CommonService', '$window',
                function ($q, $timeout, $http, $location, $rootScope, $state, CommonService, $window) {
                    // Initialize a new promise 
                    var deferred = $q.defer();
                    // Make an AJAX call to check if the user is logged in
                    $http.get('/api/loggedin').success(function (response) {
                        // Authenticated
                        if (response.status == 'OK') {
                            $rootScope.userLoggedIn = true;
                            var user = response.user;
                            CommonService.setUser(user);
                            // $state.go('admindashboard');
                            $timeout(deferred.resolve, 0);
                        }
                        // Not Authenticated
                        else {
                            $rootScope.userLoggedIn = false;
                            $timeout(function () {
                                deferred.resolve();
                            }, 0);
                            $state.go('super-admin');
                        }
                    }).error(function (error) {
                        $rootScope.userLoggedIn = false;
                        $timeout(function () {
                            deferred.resolve();
                        }, 0);
                        $state.go('super-admin');
                    });
                    return deferred.promise;
                }
            ];
        };

        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state('super-admin', {
                url: '/login',
                views: {
                    'content': {
                        templateUrl: 'adminmodules/authentication/views/login.html',
                        controller: "adminloginController"
                    }
                },
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
                        templateUrl: 'adminmodules/home/views/verifying_link.html',
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
                        templateUrl: 'adminmodules/authentication/views/forgot-password.html',
                        controller: "adminloginController"
                    }
                },
                data: {},
                resolve: {
                    loggedin: checkLoggedin,
                }
            })
            .state('getContactDetailsSuperAdmin', {
                url: '/profile-update',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/home/views/contactSuperAdmin.html',
                        controller: "homeController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }

                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('admindashboard', {
                url: '/admindashboard',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/home/views/home.html',
                        controller: "homeController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('notificationListsuperadmin', {
                url: '/notification-list-superadmin',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/home/views/notificationList.html',
                        controller: "homeController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }

                },
            })
            .state('doctors-list', {
                url: '/doctors/list',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/doctor_list.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('doctorsList', {
                url: '/doctorsList',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/doctors.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('nonRegDocs', {
                url: '/doctors/nonRegDocs',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/nonRegDoctors.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('regDocsRating', {
                url: '/doctors/regDocsRating',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/doctor_rating_list.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('import-doctor', {
                url: '/doctors/import',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/addDoctor.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('add-doctor', {
                url: '/doctors/add',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/addManually.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
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
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/editDoctor.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editNonRegDoctor', {
                url: '/doctors/editNonRegDoctor/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/editNonRegDoctor.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('officeAdmin-list', {
                url: '/officeAdmin/list',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/officeAdmin/views/officeAdmin_list.html',
                        controller: "officeAdminController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('add-officeAdmin', {
                url: '/officeAdmin/add',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/officeAdmin/views/addManually.html',
                        controller: "officeAdminController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editofficeAdmin', {
                url: '/officeAdmin/editofficeAdmin/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/officeAdmin/views/editOfficeAdmin.html',
                        controller: "officeAdminController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('speciality', {
                url: '/speciality',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/specialty/views/specialty_list.html',
                        controller: "specialityController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addSpeciality', {
                url: '/speciality/addSpeciality',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/specialty/views/addSpecialty.html',
                        controller: "specialityController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            // .state('addService', {
            //     url: '/speciality/addService/:id',
            //     views: {
            //         'header': {
            //             templateUrl: 'adminmodules/home/views/header.html'
            //         },
            //         'leftBar': {
            //             templateUrl: 'adminmodules/home/views/leftBar.html'
            //         },
            //         'content': {
            //             templateUrl: 'adminmodules/specialty/views/addService.html',
            //             controller: "specialityController"
            //         },
            //         'footer': {
            //             templateUrl: 'adminmodules/home/views/footer.html'
            //         }
            //     },
            //     data: {
            //         isAuthenticate: true
            //     },
            //     resolve: {
            //         loggedin: checkLoggedout()
            //     }
            // })
            // .state('specialityServiceList', {
            //     url: '/specialityServiceList/:id',
            //     views: {
            //         'header': {
            //             templateUrl: 'adminmodules/home/views/header.html'
            //         },
            //         'leftBar': {
            //             templateUrl: 'adminmodules/home/views/leftBar.html'
            //         },
            //         'content': {
            //             templateUrl: 'adminmodules/specialty/views/specialityServiceList.html',
            //             controller: "specialityController"
            //         },
            //         'footer': {
            //             templateUrl: 'adminmodules/home/views/footer.html'
            //         }
            //     },
            //     data: {
            //         isAuthenticate: true
            //     },
            //     resolve: {
            //         loggedin: checkLoggedout()
            //     }
            // })
            .state('editSpeciality', {
                url: '/speciality/editSpeciality/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/specialty/views/editSpecialty.html',
                        controller: "specialityController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            // .state('services', {
            //     url: '/services',
            //     views: {
            //         'header': {
            //             templateUrl: 'adminmodules/home/views/header.html'
            //         },
            //         'leftBar': {
            //             templateUrl: 'adminmodules/home/views/leftBar.html'
            //         },
            //         'content': {
            //             templateUrl: 'adminmodules/service/views/service_list.html',
            //             controller: "serviceController"
            //         },
            //         'footer': {
            //             templateUrl: 'adminmodules/home/views/footer.html'
            //         }
            //     },
            //     data: {
            //         isAuthenticate: true
            //     },
            //     resolve: {
            //         loggedin: checkLoggedout()
            //     }
            // })
            // .state('addServices', {
            //     url: '/service/add',
            //     views: {
            //         'header': {
            //             templateUrl: 'adminmodules/home/views/header.html'
            //         },
            //         'leftBar': {
            //             templateUrl: 'adminmodules/home/views/leftBar.html'
            //         },
            //         'content': {
            //             templateUrl: 'adminmodules/service/views/addService.html',
            //             controller: "serviceController"
            //         },
            //         'footer': {
            //             templateUrl: 'adminmodules/home/views/footer.html'
            //         }
            //     },
            //     data: {
            //         isAuthenticate: true
            //     },
            //     resolve: {
            //         loggedin: checkLoggedout()
            //     }
            // })
            // .state('editServices', {
            //     url: '/service/edit/:id',
            //     views: {
            //         'header': {
            //             templateUrl: 'adminmodules/home/views/header.html'
            //         },
            //         'leftBar': {
            //             templateUrl: 'adminmodules/home/views/leftBar.html'
            //         },
            //         'content': {
            //             templateUrl: 'adminmodules/service/views/editService.html',
            //             controller: "serviceController"
            //         },
            //         'footer': {
            //             templateUrl: 'adminmodules/home/views/footer.html'
            //         }
            //     },
            //     data: {
            //         isAuthenticate: true
            //     },
            //     resolve: {
            //         loggedin: checkLoggedout()
            //     }
            // })
            .state('insurance', {
                url: '/insurance',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/insurance/views/list.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addInsurance', {
                url: '/insurance/add',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/insurance/views/add.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editInsurance', {
                url: '/insurance/edit/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/insurance/views/add.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('viewInsProvider', {
                url: '/insurance/viewinsprovider/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/insurance/views/view_providers.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('viewInsProviderAll', {
                url: '/insurance/viewinsproviderAll/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/insurance/views/view_providers_all.html',
                        controller: "insuranceController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('title', {
                url: '/title',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/title/views/list.html',
                        controller: "titleController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addTitle', {
                url: '/title/add',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/title/views/add.html',
                        controller: "titleController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editTitle', {
                url: '/title/edit/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/title/views/add.html',
                        controller: "titleController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('frontdesktitle', {
                url: '/frontdesktitle',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/frontdesktitle/views/list.html',
                        controller: "frontdesktitleController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addFrontdeskTitle', {
                url: '/frontdesktitle/add',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/frontdesktitle/views/add.html',
                        controller: "frontdesktitleController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('editFrontdeskTitle', {
                url: '/frontdesktitle/edit/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/frontdesktitle/views/add.html',
                        controller: "frontdesktitleController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('reports', {
                url: '/reports',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/reports/view/referral.html',
                        controller: "reportController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('fax', {
                url: '/fax/edit/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/faxtemplates/views/edit.html',
                        controller: "faxtemplateController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('fax-list', {
                url: '/fax/list',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/faxtemplates/views/list.html',
                        controller: "faxtemplateController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('email-list', {
                url: '/email/list',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/emailtemplates/views/list.html',
                        controller: 'emailtemplateController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            }).state('email', {
                url: '/email/edit/:id',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html',
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/emailtemplates/views/edit.html',
                        controller: 'emailtemplateController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            }).
            state('sms-list', {
                url: '/sms/list',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/smstemplates/views/list.html',
                        controller: 'smstemplateController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            }).state('sms', {
                url: '/sms/edit/:id',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html',
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/smstemplates/views/edit.html',
                        controller: 'smstemplateController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('phiLog', {
                url: '/phi-log',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/logs/views/phiList.html',
                        controller: 'LogController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('referral-list', {
                url: '/referral-list',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/referrals/views/referralsList.html',
                        controller: 'referralsController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('userActvLog', {
                url: '/activity-log',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/logs/views/userActvList.html',
                        controller: 'ActvController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('invitationLog', {
                url: '/invitation-log',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/logs/views/invitationLogList.html',
                        controller: 'InvitationController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('viewInvitationSenderList', {
                url: '/invitation-sender-list/:id',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/logs/views/viewInvitationSenderList.html',
                        controller: 'InvitationLogViewController' //InvitationController
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('hospital', {
                url: '/hospital',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/hospital/views/list-hospital.html',
                        controller: "hospitalController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addHospital', {
                url: '/hospital/add',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/hospital/views/add-hospital.html',
                        controller: "hospitalController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('editHospital', {
                url: '/hospital/edit/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/hospital/views/add-hospital.html',
                        controller: "hospitalController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('faq', {
                url: '/faq',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/faq/views/list-faq.html',
                        controller: "faqController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addFaq', {
                url: '/faq/add',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/faq/views/add-faq.html',
                        controller: "faqController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('editFaq', {
                url: '/faq/edit/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/faq/views/add-faq.html',
                        controller: "faqController"

                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('notification', {
                url: '/notification/edit',
                views: {
                    header: {
                        templateUrl: 'adminmodules/home/views/header.html',
                    },
                    leftBar: {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    content: {
                        templateUrl: 'adminmodules/notification/views/edit.html',
                        controller: 'notificationController'
                    },
                    footer: {
                        templateUrl: 'adminmodules/home/views/footer.html'
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('viewProvider', {
                url: '/doctors/viewProvider/:id',
                views: {
                    'header': {
                        templateUrl: 'adminmodules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: 'adminmodules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: 'adminmodules/doctors/views/viewProvider.html',
                        controller: "doctorController"
                    },
                    'footer': {
                        templateUrl: 'adminmodules/home/views/footer.html'
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
        function ($rootScope, $location, $http, $sessionStorage, $state, ngTableParamsService) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
                $rootScope.currentState = toState.name;
            });

        }
    ])
    .filter('capitalize', function () {
        return function (input) {
            if (input !== null && (typeof input !== 'undefined') && input.split(' ').length > 1) {
                return input.split(" ").map(function (input) {
                    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : ''
                }).join(" ");

            } else if (input !== null && (typeof input !== 'undefined') && input.split('-').length > 1) {
                return input.split("-").map(function (input) { return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '' }).join("-");
            } else {
                return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
            }
        }
    })
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
                    var curOwl = $(element).data('owlCarousel');
                    if (!angular.isDefined(curOwl)) {
                        $(element).owlCarousel(defaultOptions);
                    }
                    scope.cnt++;
                };
            }
        };
    })
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
                    //console.log(" val1 ",val1);
                    //console.log(" val2 ",val2);


                    // set validity
                    ngModel.$setValidity('passwordVerify', val1 === val2);
                };
            }
        }
    }])    
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
    .filter('trustAsResourceUrl', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsResourceUrl(val);
        };
    }])
    .config(function ($provide) {
        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {
            // $delegate is the taOptions we are decorating
            // register the tool with textAngular

            /*taRegisterTool('backgroundColor', {
                display: "<div spectrum-colorpicker ng-model='color' on-change='!!color && action(color)' format='\"hex\"' options='options'></div>",
                action: function (color) {
                    var me = this;
                    if (!this.$editor().wrapSelection) {
                        setTimeout(function () {
                            me.action(color);
                        }, 100)
                    } else {
                        return this.$editor().wrapSelection('backColor', color);
                    }
                },
                options: {
                    replacerClassName: 'fa fa-paint-brush', showButtons: false
                },
                color: "#fff"
            });
            taRegisterTool('fontColor', {
                display:"<spectrum-colorpicker trigger-id='{{trigger}}' ng-model='color' on-change='!!color && action(color)' format='\"hex\"' options='options'></spectrum-colorpicker>",
                action: function (color) {
                    var me = this;
                    if (!this.$editor().wrapSelection) {
                        setTimeout(function () {
                            me.action(color);
                        }, 100)
                    } else {
                        return this.$editor().wrapSelection('foreColor', color);
                    }
                },
                options: {
                    replacerClassName: 'fa fa-font', showButtons: false
                },
                color: "#000"
            });*/
            taRegisterTool('fontName', {
                display: "<span class='bar-btn-dropdown dropdown'>" +
                "<button class='btn btn-blue dropdown-toggle' type='button' ng-disabled='showHtml()' style='padding-top: 4px'><i class='fa fa-font'></i><i class='fa fa-caret-down'></i></button>" +
                "<ul class='dropdown-menu'><li ng-repeat='o in options'><button class='btn btn-blue checked-dropdown' style='font-family: {{o.css}}; width: 100%' type='button' ng-click='action($event, o.css)'><i ng-if='o.active' class='fa fa-check'></i>{{o.name}}</button></li></ul></span>",
                action: function (event, font) {
                    //Ask if event is really an event.
                    if (!!event.stopPropagation) {
                        //With this, you stop the event of textAngular.
                        event.stopPropagation();
                        //Then click in the body to close the dropdown.
                        $("body").trigger("click");
                    }
                    return this.$editor().wrapSelection('fontName', font);
                },
                options: [
                    { name: 'Sans-Serif', css: 'Arial, Helvetica, sans-serif' },
                    { name: 'Serif', css: "'times new roman', serif" },
                    { name: 'Wide', css: "'arial black', sans-serif" },
                    { name: 'Narrow', css: "'arial narrow', sans-serif" },
                    { name: 'Comic Sans MS', css: "'comic sans ms', sans-serif" },
                    { name: 'Courier New', css: "'courier new', monospace" },
                    { name: 'Georgia', css: 'georgia, serif' },
                    { name: 'Tahoma', css: 'tahoma, sans-serif' },
                    { name: 'Trebuchet MS', css: "'trebuchet ms', sans-serif" },
                    { name: "Helvetica", css: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
                    { name: 'Verdana', css: 'verdana, sans-serif' },
                    { name: 'Proxima Nova', css: 'proxima_nova_rgregular' }
                ]
            });
            taRegisterTool('fontSize', {
                display: "<span class='bar-btn-dropdown dropdown'>" +
                "<button class='btn btn-blue dropdown-toggle' type='button' ng-disabled='showHtml()' style='padding-top: 4px'><i class='fa fa-text-height'></i><i class='fa fa-caret-down'></i></button>" +
                "<ul class='dropdown-menu'><li ng-repeat='o in options'><button class='btn btn-blue checked-dropdown' style='font-size: {{o.css}}; width: 100%' type='button' ng-click='action($event, o.value)'><i ng-if='o.active' class='fa fa-check'></i> {{o.name}}</button></li></ul>" +
                "</span>",
                action: function (event, size) {
                    //Ask if event is really an event.
                    if (!!event.stopPropagation) {
                        //With this, you stop the event of textAngular.
                        event.stopPropagation();
                        //Then click in the body to close the dropdown.
                        $("body").trigger("click");
                    }
                    return this.$editor().wrapSelection('fontSize', parseInt(size));
                },
                options: [
                    { name: 'xx-small', css: 'xx-small', value: 1 },
                    { name: 'x-small', css: 'x-small', value: 2 },
                    { name: 'small', css: 'small', value: 3 },
                    { name: 'medium', css: 'medium', value: 4 },
                    { name: 'large', css: 'large', value: 5 },
                    { name: 'x-large', css: 'x-large', value: 6 },
                    { name: 'xx-large', css: 'xx-large', value: 7 }

                ]
            });

            // add the button to the default toolbar definition
            //taOptions.toolbar[1].push('backgroundColor','fontColor','fontName','fontSize');
            taOptions.toolbar[1].push('fontName', 'fontSize');
            return taOptions;
        }]);
    });