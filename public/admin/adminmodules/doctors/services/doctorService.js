"use strict"

angular.module("doctors")

    .factory('doctorService', ['$http', 'communicationService', '$resource', function ($http, communicationService, $resource) {

        var getCounts = function () {
            return $resource('/api/dashboardCount', null, {
                get: {
                    method: 'GET'
                }
            });
        }
        var GetUserList = function () {
            return $resource(webservices.getUserList, null, {
                get: {
                    method: 'GET'
                }
            });
        };

        var addDoctor = function (inputJsonString, callback) {
            return $resource(webservices.addDoctor, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var GetSpecialty = function (inputJsonString, callback) {
            return $resource(webservices.getSpecialty, null, {
                get: {
                    method: 'GET'
                }
            });
        }

        var GetServices = function (inputJsonString, callback) {
            return $resource(webservices.getServiceList, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var deleteUser = function () {
            return $resource(webservices.deleteDoctor, null, {
                save: {
                    method: 'POST'
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
        var updateStatus = function () {
            return $resource(webservices.updateStatus, null, {
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

        var getDoctorsList = function () {
            return $resource(webservices.getDoctorsList, null, {
                save: {
                    method: 'POST'
                }
            });
        }


        return {
            getCounts: getCounts,
            GetUserList: GetUserList,
            addDoctor: addDoctor,
            GetSpecialty: GetSpecialty,
            deleteUser: deleteUser,
            updateUser: updateUser,
            getById: getById,
            updateStatus: updateStatus,
            getDoctorsList: getDoctorsList,
            GetServices: GetServices
        }

    }]);