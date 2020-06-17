"use strict"

angular.module("officeAdmin")

    .factory('officeAdminService', ['$http', 'communicationService', '$resource', function ($http, communicationService, $resource) {
        var addOfficeAdmin = function (inputJsonString, callback) {
            return $resource(webservices.addOfficeAdmin, null, {
                save: {
                    method: 'POST'
                }
            });
        }


        var getOfficeAdminList = function () {
            return $resource(webservices.getOfficeAdminList, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var deleteOfficeAdmin = function () {
            return $resource(webservices.deleteOfficeAdmin, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var updateStatus = function () {
            return $resource(webservices.updateStatus, null, {
                save: {
                    method: 'POST'
                }
            });
        }


        var resetPassword = function () {
            return $resource(webservices.resetPassword, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var sendMail = function (inputJsonString, callback) {
            return $resource('/api/sendMail', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var getById = function (id) {
            return $resource(webservices.getById, null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }

        var updateUser = function () {
            return $resource(webservices.updateUser, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        return {
            addOfficeAdmin: addOfficeAdmin,
            getOfficeAdminList: getOfficeAdminList,
            deleteOfficeAdmin: deleteOfficeAdmin,
            updateStatus: updateStatus,
            resetPassword: resetPassword,
            sendMail: sendMail,
            getById: getById,
            updateUser: updateUser,
        }

    }]);