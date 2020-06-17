"use strict";


angular.module("Authentication");

nwdApp.controller('adminloginController', ['$scope', '$rootScope', '$location', 'AuthenticationService', 'logger', 'logProvider', '$window',
    function($scope, $rootScope, $location, AuthenticationService, logger, logProvider, $window) {
        var inputJSON           = "";
        $scope.user             = {};
        $scope.forgotPass       = {};
        $scope.isPasswordSent   = false;
        $scope.disabled         = false;
        $scope.loader           = false;
        //logout
        $scope.logout = function() {
            var localData   = JSON.parse(sessionStorage.getItem('test'));
            var actvLog     = { type: 3, detail: 'Log out of application', userId: localData._id };
            //destroy user token
            AuthenticationService.logout().save({userId:localData._id, token:sessionStorage.getItem('token1')}, function(res){
                if(res.code){
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    delete $window.sessionStorage.token1;
                    delete $window.sessionStorage.loggedInUser;
                    delete $window.sessionStorage.userType;
                    $rootScope.userLoggedIn = false;
                    $window.sessionStorage.clear();
                    logger.logSuccess('Logout successfully');
                    $window.location = mainUrl;
                }
            })
           
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
    }
]);