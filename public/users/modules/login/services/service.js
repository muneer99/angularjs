'use strict'
angular.module("Authentication");
nwdApp.factory('AuthenticationService', ['communicationService', '$rootScope', '$resource', '$http',
    function (communicationService, $rootScope, $resource, $http) {
        var service = {};

        service.Login = function (inputJsonString, callback) {
            communicationService.resultViaPost(webservices.authenticates, appConstants.authorizationKey, headerConstants.json, inputJsonString, function (response) {
                callback(response.data);
            });
        };
        service.LogOut = function (inputJsonString, callback) {
            communicationService.resultViaPost(webservices.logout, appConstants.authorizationKey, headerConstants.json, inputJsonString, function (response) {
                callback(response.data);
            });
        };
        service.Register = function (inputJsonString, callback) {
            communicationService.resultViaPost(webservices.register, appConstants.authorizationKey, headerConstants.json, inputJsonString, function (response) {
                callback(response.data);
            });
        }
        service.existMember = function (inputJsonString, callback) {
            communicationService.resultViaPost(webservices.existMember, appConstants.authorizationKey, headerConstants.json, inputJsonString, function (response) {
                callback(response);
            });

        }
        service.UpdateAudit = function (inputJsonString, callback) {
            communicationService.resultViaPost(webservices.updatedaudit, appConstants.authorizationKey, headerConstants.json, inputJsonString, function (response) {
                callback(response.data);
            });

        }

        service.resendPassword = function (inputJsonString, callback) {
            return $resource('/api/forgotPassword', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        service.updatePassword = function (inputJsonString, callback) {
            return $resource('/api/changePass', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        service.validateFrontDeskAccess = function (inputJsonString, callback) {
            return $resource('/api/validateFrontDeskAccess', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        service.validateTokenAccess = function (inputJsonString, callback) {            
            return $resource('/api/validateTokenAccess', null, {
                save: {
                    method: 'POST'
                }
            });
        }        
        service.contactUs = function (inputJsonString, callback) {
            return $resource('/api/contactUs', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        service.addOfficeAdmin = function () {
            return $resource(webservices.addDoctor, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        service.UpdateContactDetails = function (inputJsonString, callback) {
            return $resource(webservices.UpdateContactDetails, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        return service;
    }
])

