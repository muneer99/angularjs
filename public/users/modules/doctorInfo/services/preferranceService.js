'use strict'
angular.module("accountPreference");
nwdApp.factory('preferranseService', ['communicationService', '$rootScope', '$resource',
    function(communicationService, $rootScope, $resource) {
        var service = {};

        service.getSpeciality = function(inputJsonString, callback) {
            communicationService.resultViaGet(webservices.getSpeciality, appConstants.authorizationKey, headerConstants.json, function(response) {
                callback(response.data);
            });
        };
        service.getUserProfile = function(inputJsonString, callback) {
            communicationService.resultViaPost(webservices.getUserProfile, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        };
        service.updateSpeciality = function(inputJsonString, callback) {
            communicationService.resultViaPost(webservices.updateSpeciality, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        };
        service.updateService = function(inputJsonString, callback) {
            communicationService.resultViaPost(webservices.updateService, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        };
        service.UpdateContactDetails = function(inputJsonString, callback) {
            communicationService.resultViaPost(webservices.UpdateContactDetails, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        };

        service.updatePassword = function() {
            return $resource(webservices.updatePassword, null, {
                save: {
                    method: 'POST'
                }
            });
        };
        service.updateNetwork = function() {
            return $resource(webservices.updateNetwork, null, {
                save: {
                    method: 'POST'
                }
            });
        };

        service.GetServices = function(inputJsonString, callback) {
            return $resource(webservices.getServices, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        service.updateUserEmail = function(inputJsonString, callback) {
            return $resource('/api/updateUserEmail', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        return service;
    }
])