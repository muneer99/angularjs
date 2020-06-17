"use strict";

angular.module("Home")

nwdApp.controller("homeController", ['$scope', '$rootScope', '$sessionStorage', '$location', 'HomeService',
    function($scope, $rootScope, $sessionStorage, $location, HomeService) {

        // Just put the states in all the array,Check on run function the state change,
        // InHTML check the current state and use the class 
        $scope.menuDoctors      = ['doctors', 'addDoctor', 'editDoctor'];
        $scope.menuPatients     = ['patients', 'addPatients', 'editPatient'];
        $scope.menuAncillary    = ['ancillary', 'addAncillary', 'editAncillary'];
        $scope.menuSpeciality   = ['speciality', 'addSpeciality', 'editSpeciality'];
        $scope.menuServices     = ['services', 'addServices', 'editServices'];
        $scope.counts           = {};

        $scope.activationMessage = function() {
            $scope.parmas = $location.search();
            $scope.success = $scope.parmas.success;
        }
        /**
        * Get users and service conunt for dashboard panel
        * Created By Suman Chakraobrty
        * Last modified on 11-08-2017
        */
        $scope.getCounts = function() {
            HomeService.getCounts().get(function(response) {
                if (response.code == 200) {
                    $scope.counts = response.data;
                }
            });
        }

        $scope.getdoctors = function(req, res) {
            HomeService.GetUserList({}, function(response) {
                if (response.code == 200) {
                    $scope.doctorList = response.data;
                    $scope.datalength = response.data.length;
                } else {}
            })
        }

    }
]);