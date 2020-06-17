"use strict"

angular.module("Home")

    .factory('HomeService', ['$http', 'communicationService', '$resource', function ($http, communicationService, $resource) {

        var getCounts = function () {
            return $resource('/api/getCounts', null, {
                get: {
                    method: 'GET'
                }
            });
        }
        var getCountSuperAdmin = function () {
            return $resource('/api/getCountSuperAdmin', null, {
                get: {
                    method: 'GET'
                }
            });
        }
        var getContactDetailsSuperAdmin = function () {
            return $resource('/api/getUserDetails', null, {
                get: {
                    method: 'POST'
                }
            });
        }
        var UpdateContactDetailsSuperAdmin = function () {
            return $resource('/api/UpdateContactDetails', null, {
                get: {
                    method: 'POST'
                }
            });
        }        
        var notificationDeletedBySuperAdmin = function () {
            return $resource('/api/notificationDeletedBySuperAdmin', null, {
                get: {
                    method: 'GET'
                }
            });
        }
        // upload attachments
        var uploadAttachments = function () {
            return $resource('/api/uploadAttachments', null, {
                get: {
                    method: 'POST',
                    headers: { 'Content-Type': undefined }
                }
            });
        }          
        var updatePassword = function () {
            return $resource('/api/changePassAdmin', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var notificationReadBySuperAdmin = function () {
            return $resource('/api/notificationReadBySuperAdmin', null, {
                get: {
                    method: 'GET'
                }
            });
        }        
        var GetUserList = function (inputJsonString, callback) {
            communicationService.resultViaGet(webservices.getUserList, appConstants.authorizationKey, headerConstants.json, function (response) {
                callback(response.data);
            });
        };

        return {
            getCounts: getCounts,
            getCountSuperAdmin: getCountSuperAdmin,
            notificationDeletedBySuperAdmin:notificationDeletedBySuperAdmin,
            notificationReadBySuperAdmin:notificationReadBySuperAdmin,
            GetUserList: GetUserList,
            getContactDetailsSuperAdmin:getContactDetailsSuperAdmin,
            UpdateContactDetailsSuperAdmin:UpdateContactDetailsSuperAdmin,
            uploadAttachments:uploadAttachments,
            updatePassword:updatePassword
        }

    }]);