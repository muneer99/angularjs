"use strict";

angular.module("Header")

nwdApp.controller("headerController", ['$scope', '$rootScope', '$sessionStorage', '$routeParams', '$route', '$location', '$state', '$stateParams', '$http', 'logger',
    function($scope, $rootScope, $sessionStorage, $routeParams, $route, $location, $state, $stateParams, $http, logger) {
        $scope.logout = function() {
            delete $sessionStorage.token;
            delete $sessionStorage.userLoggedIn;
            $rootScope.userLoggedIn = false;
            $location.path('/login');
            logger.logSuccess('You have been logged out successfully');
        }


        $scope.getDashboardList = function() {
            $scope.serviceList = dashboardService.getDashboardList().get({}, function(response, err) {
                if (response.code == 200) {
                    $scope.serviceList = response.data;
                } else {
                    $scope.serviceList = {};
                }
            });
        }





        //empty the $scope.message so the field gets reset once the message is displayed.
        if ($stateParams.id) {
            dashboardService.getServiceById().get({ id: $stateParams.id }, function(response) {
                if (response.code == 200) {
                    $scope.imageBase64 = true
                    $scope.service = response.data;
                    $scope.Images = $scope.service.media.image;
                }
            });
        }


    }

]);