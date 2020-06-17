'use strict'

angular.module('Authentication')

.factory('AuthenticationService', ['communicationService', '$rootScope','$resource','$http',
    function(communicationService, $rootScope, $resource,$http) {
        var service = {};
        service.Login = function(inputJsonString, callback) {

            communicationService.resultViaPost(webservices.authenticate, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        };
        service.resendPassword = function(inputJsonString, callback) {
            communicationService.resultViaPost(webservices.forgotPassword, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        }
        service.logout = function(inputJsonString, callback) {
            return $resource('/api/userLogOut', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        return service;
    }
])