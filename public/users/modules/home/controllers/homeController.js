"use strict";
angular.module('home', ['ngVideo'])
nwdApp.controller("homeController", ['$scope', '$rootScope', '$sessionStorage', 'dashboardService', '$routeParams', '$route', '$location', '$state', '$stateParams', '$http', 'logger', '$anchorScroll', 'AuthenticationService', '$window', 'logProvider', 'video', 'doctorService',
    function ($scope, $rootScope, $sessionStorage, dashboardService, $routeParams, $route, $location, $state, $stateParams, $http, logger, $anchorScroll, AuthenticationService, $window, logProvider, video, doctorService) {
        var inputJSON = "";
        $scope.user = {};
        $scope.user.userType = 'Doctor';
        $scope.forgotPass = {};
        $scope.isChecks = false;
        $scope.isPasswordSent = false;
        $scope.disabled = false;
        $scope.loader = false;
        $scope.isContinues = 'welcome';
        $scope.resetPass = false;
        $scope.choices = ['Doctor'];

        $scope.userdata = $rootScope.user;
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : ($rootScope.user) ? $rootScope.user._id : '';
        $scope.currentYear = new Date().getFullYear();

        var source = video.multiSource();
        source.addSource('mp4', homePageVideoMP4Link);
        // source.addSource('ogg', homePageVideoOGGLink);
        source.save();

        $scope.resetPassword = function () {
            $location.path('/forgetPassword');
        }

        /**
        * Allow front desk admin to login on behalf of doctors
        * Created By Suman Chakraborty
        * Last Modified on 14-11-2017
        */
        $scope.loginAs = function () {
            var data;
            if ($window.sessionStorage.test) {
                data = JSON.parse($window.sessionStorage.test);
            }
            // match request and session id
            if (data && data._id === $state.params.req) {
                AuthenticationService.validateFrontDeskAccess().save({ docId: $state.params.id, reqUser: $state.params.req }, function (response) {
                    if (response.code == 200 && response.data.userType == 'user') {
                        $window.sessionStorage;
                        $rootScope.userLoggedIn = true;
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.changePass = response.data.changePass;
                        $window.sessionStorage.token1 = response.data.token;
                        $window.sessionStorage.userType = 'user';
                        $window.sessionStorage.frontDeskAccess = true;
                        $window.sessionStorage.frontDeskAdmin = $state.params.req;
                        $scope.imageUrl = response.data.image;
                        $window.sessionStorage.test = JSON.stringify(response.data);
                        $window.sessionStorage.userStatus = response.data.doctorStatus;
                        $rootScope.user = JSON.parse($window.sessionStorage.test);
                        logger.logSuccess(response.message);
                        if (response.data.firstLogin) {
                            $location.path('/welcome');
                        } else {
                            $location.path('/dashboard');
                        }
                    } else {
                        logger.logError('Unable to access user data.');
                    }
                })
            } else {
                logger.logError('Unauthorized request. Please close this tab and try again.');
            }
        }

        $scope.forgotPassword = function (req) {
            //console.log(" inside fun ");
        }
        // $scope.existMember = function (req) {
        // }

        /**
        * Login functionality for Doctor, front desk admin, network admin
        * Created By Suman Chakraborty
        * Last Modified on 29-11-2017
        */
        $scope.loginUser = function () {
            //console.log(" loginUser ",$scope.user);
         
            var formData = $scope.user;
            var actvLog = { type: 2, detail: 'User login' };
            AuthenticationService.Login(formData, function (response) {
                var errorMessage = '';
                if (response.code == 200) {
                    actvLog.userId = response.data._id;
                    actvLog.success = true;
                    $scope.timer.start();
                    if (response.data.userType == 'admin') {
                        $window.sessionStorage;
                        $window.sessionStorage.test = JSON.stringify(response.data);
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.token1 = response.data.token;
                        $window.sessionStorage.loggedInUser = response.data.email;
                        $window.sessionStorage.userType = 'admin';
                        $window.sessionStorage.emailAvailable = response.data.emailAvailable;
                        $window.sessionStorage.firstLogin = response.data.firstLogin;
                        if (response.data.firstLogin) {
                            //console.log(" firstlogin11 -> ",response.data.firstLogin);
                            $window.sessionStorage.firstLoginTemp = 1;
                        } else {
                            $window.sessionStorage.firstLoginTemp = 0;
                        }
                        $rootScope.loginAsReq = false;
                        // $window.location = "http://localhost:8003/admin";
                        $window.location = mainUrl + '/admin/#/dashboard';
                    } else if (response.code == 200 && response.data.userType == 'user') {
                        $window.sessionStorage;
                        $rootScope.userLoggedIn = true;
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.token1 = response.data.token;
                        $window.sessionStorage.changePass = response.data.changePass;
                        $window.sessionStorage.userType = 'user';
                        $rootScope.profileZip = response.data.zipcode;
                        $window.sessionStorage.emailAvailable = response.data.emailAvailable;
                        $window.sessionStorage.firstLogin = response.data.firstLogin;
                        if (response.data.firstLogin) {
                            //console.log(" firstlogin22 -> ",response.data.firstLogin);
                            $window.sessionStorage.firstLoginTemp = 1;
                        } else {
                            //console.log(" firstlogin222 -> ",response.data.firstLogin);
                            $window.sessionStorage.firstLoginTemp = 0;
                        }
                        $scope.imageUrl = response.data.image;
                        $window.sessionStorage.test = JSON.stringify(response.data);
                        $window.sessionStorage.userStatus = response.data.doctorStatus;
                        $rootScope.user = JSON.parse($window.sessionStorage.test);
                        $rootScope.loginAsReq = false;
                        if (formData.rememberme) {
                            $window.localStorage.setItem('token1', response.data.token);
                        }
                        var a = response.data.service.length;
                        var b = response.data.speciality.length;
                        logger.logSuccess(response.message);

                        if (response.data.firstLogin) {
                            $location.path('/welcome');
                        } else if (!response.data.hasfrntdesk) {
                            $location.path('/front-desk');
                        } else {

                            $location.path('/dashboard');
                        }
                    } else if (response.data.userType == 'officeAdmin') {
                        $window.sessionStorage;
                        $rootScope.userLoggedIn = true;
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.userType = 'officeAdmin';
                        $scope.imageUrl = response.data.image;
                        $window.sessionStorage.emailAvailable = response.data.emailAvailable;
                        $window.sessionStorage.firstLogin = response.data.firstLogin;
                        if (response.data.firstLogin) {
                            //console.log(" firstlogin33 -> ",response.data.firstLogin);
                            $window.sessionStorage.firstLoginTemp = 1;
                        } else {
                            $window.sessionStorage.firstLoginTemp = 0;
                        }
                        $window.sessionStorage.token1 = response.data.token;
                        $window.sessionStorage.changePass = response.data.changePass;
                        $window.sessionStorage.test = JSON.stringify(response.data);
                        $window.sessionStorage.userStatus = response.data.doctorStatus;
                        $rootScope.user = JSON.parse($window.sessionStorage.test);
                        var a = response.data.service.length;
                        var b = response.data.speciality.length;
                        $rootScope.loginAsReq = false;
                        $scope.timer.cancel();
                        logger.logSuccess(response.message);
                        if (formData.rememberme) {
                            $window.localStorage.setItem('token1', response.data.token);
                        }
                        if (response.data.firstLogin) {
                            $location.path('/welcome');
                            //task #550 start
                        } else if (response.data.firstLogin == false && response.data.firstname == '') {
                            $location.path('/contact-details');
                            //task #550 end
                        } else {
                            $location.path('/doctor/list');
                        }
                    } else {
                        logger.logError(response.message);
                    }
                } else {
                    logger.logError(response.message);
                }
                // Log login record 
                logProvider.addUserActivity().save(actvLog, function (res) { });
            });
        }

        $scope.register = function (user) {
            $scope.user = user;
            var actvLog = { type: 1, detail: 'New registration' };
            AuthenticationService.Register($scope.user, function (response) {
                var errorMessage = '';
                if (response.code == 200) {
                    actvLog.success = true;
                    actvLog.userId = response.data._id;
                    logger.logSuccess(response.message);
                    $location.path('/');
                } else {
                    logger.logError(response.message);
                }
                logProvider.addUserActivity().save(actvLog, function (res) { });
            });
        }

        /*$scope.continue = function (name) {
            if(name=='profile'){
                $location.path('/contact-details');
            }
            $scope.isContinues = name;
        }*/

        /**
        * Logout user
        */
        $scope.logout = function () {
            var userid = $scope.frontDeskAcc;
            var actvLog = { userId: userid, type: 3, detail: 'Logged out from application', success: true };
            logProvider.addUserActivity().save(actvLog, function (res) { });
            $rootScope.userLoggedIn = false;
            delete sessionStorage.test;

            sessionStorage.removeItem('test');
            sessionStorage.removeItem('userStatus');

            sessionStorage.setItem('userLoggedIn', false);
            $window.sessionStorage.clear();
            $window.localStorage.clear();
            $scope.timer.cancel();
            logger.logSuccess('You have been logged out successfully');
            $location.path('/');
        }

        /**
        * existMember user task #552
        */
        $scope.existMember = function (req) {
            var paramValue = $state.params.id;
            $scope.loader = true;
            var actvLog = { type: 15, detail: 'Request for resend password' };
            var userDetail = { id: paramValue };
            AuthenticationService.existMember(userDetail, function (res) {
                if (res.data.code == 200) {
                    actvLog.success = true;
                    actvLog.userId = $state.params.id;
                    logger.logSuccess('Your credentials has been sent to your registered email.');
                    $scope.loader = false;
                    $location.path('/');
                } else {
                    $scope.loader = false;
                    logger.logError(res.message);
                    logger.logError('Request could not be processed. Please try again.');
                    $location.path('/');
                }
                logProvider.addUserActivity().save(actvLog, function (res) { });
            });
        }

        //forgot password
        $scope.forgotPassword = function (req) {
            //console.log(" inside fun ");
            var actvLog = { type: 8, detail: 'Request for forget password' };
            if (req.email !== undefined) {
                $scope.loader = true;
                AuthenticationService.resendPassword().save(req, function (res) {
                    if (res.code == 200) {
                        actvLog.success = true;
                        actvLog.userId = res.data.id;
                        logger.logSuccess('A link to reset password has been sent to your registered email.');
                        $scope.resetPass = false;
                        $location.path('/');
                    } else {
                        logger.logError(res.message);
                        $scope.loader = false;
                        $location.path('/');
                    }
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                })
            } else {
                logProvider.addUserActivity().save(actvLog, function (res) { });
            }
        }

        $scope.updatePassword = function (req) {
            var actvLog = { type: 9, detail: 'Change password' };
            if ($scope.updateUserPass.hasOwnProperty('confPass')) {
                var reqArr = { token: $state.params.id, pass: $scope.updateUserPass.confPass }
                AuthenticationService.updatePassword().save(reqArr, function (res) {
                    if (res.code == 200) {
                        actvLog.userId = res.data.id;
                        actvLog.success = true;
                        //$window.sessionStorage.firstLogin = false;
                        logger.logSuccess('Password reset successfully.');
                        $location.path('/');
                    } else {
                        logger.logError(res.message);
                    }
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                })
            } else {
                logger.logError('Please enter password and confirm password.');
                logProvider.addUserActivity().save(actvLog, function (res) { });
            }
        }

        //$scope.getPermit = false;
        $scope.gotoBottom = function () {
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('aboutus');

            // call $anchorScroll()
            $anchorScroll();
        };
        $scope.gotocontacts = function () {
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('contacts');

            // call $anchorScroll()
            $anchorScroll();
        };
        $scope.contactUs = function (contact) {
            if (contact.hasOwnProperty('gRecaptchaResponse') && contact.gRecaptchaResponse != '') {
                AuthenticationService.contactUs().save(contact, function (res) {
                    if (res.code === 200) {
                        $scope.contact = {};
                        logger.logSuccess(res.message);
                    } else {
                        $scope.getPermit = false;
                        logger.logError(res.message);
                    }
                })
            } else { }
        }

        $scope.setResponse = function (res) {
            if (res) {
                $scope.getPermit = true;
            }
        }

        $scope.timmerReset = function () {
            $scope.timer.cancel();
        }

        $scope.capExp = function () {
            $scope.getPermit = false;
        }
    }
]);