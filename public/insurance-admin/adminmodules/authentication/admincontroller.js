"use strict";
angular.module("Authentication");
nwdApp.controller('adminloginController', ['$scope', '$sessionStorage', '$rootScope', '$location', 'AuthenticationService', 'logger', 'logProvider', '$window',
    function($scope, $rootScope, $sessionStorage, $location, AuthenticationService, logger, logProvider, $window) {
        var inputJSON           = "";
        $scope.user             = {};
        $scope.forgotPass       = {};
        $scope.isPasswordSent   = false;
        $scope.disabled         = false;
        $scope.loader           = false;
        
        /**
        * Super admin login
        * Created By Suman Chakraborty
        * Last Modified on 01-12-2017
        */
        // $scope.adminlogin = function(form) {
        //     var localData   = JSON.parse(sessionStorage.getItem('test'));
        //     var actvLog     = {type: 2, detail: 'user login'};
        //     $scope.disabled = true;
        //     $scope.loader   = true;
        //     AuthenticationService.Login($scope.user, function(response) {
        //         var errorMessage    = '';
        //         $scope.disabled     = false;
        //         $scope.loader = false;
        //         if (response.code == 200) {
        //             actvLog.userId                      = response.data._id;
        //             actvLog.success                     = true;
        //             $sessionStorage.userLoggedIn        = true;
        //             $rootScope.userLoggedIn             = true;
        //             $sessionStorage.token               = response.data.token;
        //             $rootScope.token                    = response.data.token;
        //             $sessionStorage.loggedInUser        = response.data.email;
        //             $window.sessionStorage.userLoggedIn = true;
        //             $window.sessionStorage.token        = response.data.token;
        //             $window.sessionStorage.loggedInUser = response.data.email;
        //             $window.sessionStorage.userType     = 'superAdmin';
        //             $window.sessionStorage.test         = JSON.stringify(response.data);
        //             $scope.timer.start();
        //             logProvider.addUserActivity().save(actvLog, function(res){});
        //             logger.logSuccess('Login successfully');
        //             $location.path('/admindashboard');
        //         } else {
        //             actvLog.userId                      = '0';
        //             logProvider.addUserActivity().save(actvLog, function(res){});
        //             logger.logError(response.message);
        //         }
        //     });
        // };



        /**
        * Super admin login
        * Created By Suman Chakraborty
        * Last Modified on 01-12-2017
        */
        $scope.adminlogin = function(form) {
            var localData   = JSON.parse(sessionStorage.getItem('test'));
            var actvLog     = {type: 2, detail: 'user login'};
            $scope.disabled = true;
            $scope.loader   = true;
            AuthenticationService.insuranceLogin($scope.user, function(response) {
                //console.log(" insuranceLogin response ",response);
                var errorMessage    = '';
                $scope.disabled     = false;
                $scope.loader = false;
                if (response.code == 200) {
                    actvLog.userId                      = response.data._id;
                    actvLog.success                     = true;
                    $sessionStorage.userLoggedIn        = true;
                    $rootScope.userLoggedIn             = true;
                    $sessionStorage.token               = response.data.token;
                    $rootScope.token                    = response.data.token;
                    $sessionStorage.loggedInUser        = response.data.email;
                    $window.sessionStorage.userLoggedIn = true;
                    $window.sessionStorage.token        = response.data.token;
                    $window.sessionStorage.loggedInUser = response.data.email;
                    $window.sessionStorage.userType     = 'insuranceAdmin';
                    $window.sessionStorage.test         = JSON.stringify(response.data);
                    $scope.timer.start();
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess('Login successfully');
                    $location.path('/insurancedashboard');
                } else {
                    actvLog.userId                      = '0';
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            });
        };


        /**
        * Super admin logout
        * Created By Suman Chakraborty
        * Last Modified on 01-12-2017
        */
        $scope.logout = function() {
            var localData = JSON.parse(sessionStorage.getItem('test'));
            AuthenticationService.logout().save({userId:localData._id, token:sessionStorage.getItem('token')}, function(res){
                if(res.code === 200){
                    logProvider.addUserActivity().save({userId:localData._id, type: 3, detail: 'user logout', success: true }, function(res){});
                    delete $window.sessionStorage.token;
                    delete $window.sessionStorage.loggedInUser;
                    delete $window.sessionStorage.userType;
                    $rootScope.userLoggedIn = false;
                    $window.sessionStorage.clear();
                    $scope.timmerReset();
                    logger.logSuccess('Logout successfully');
                    $location.path('/home');
                }
            });
        }

        //forgot password
        $scope.resendPassword = function(form) {
            if (form.$valid) {
                $scope.disabled             = true;
                $scope.loader               = true;
                $scope.forgotPass.isAdmin   = true;
                AuthenticationService.resendPassword($scope.forgotPass, function(response) {
                    $scope.disabled = false;
                    $scope.loader   = false;
                    if (response.code == 200) {
                        $scope.isPasswordSent = true;
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
        }

        $scope.timmerReset = function(){
            $scope.timer.cancel();
        }
    }
]);