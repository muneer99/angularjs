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
        var GetServices = function (inputJsonString, callback) {
            return $resource(webservices.getServiceList, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var addDoctor = function (inputJsonString, callback) {
            return $resource(webservices.addDoctor, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var registerDoctor = function (inputJsonStriupdateUserng, callback) {
            return $resource(webservices.registerDoctor, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var setStatus = function () {
            return $resource('/api/setStatus', null, {
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
        var updateNonRegDoc = function () {
            return $resource('api/updateNonRegDoc', null, {
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

        var getNonDocById = function (id) {
            return $resource(webservices.getNonDocById, null, {
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
        var getUnregisteredDoctorsList = function () {
            return $resource(webservices.getUnregisteredDoctorsList, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        // Send email on success
        var sendMail = function (inputJsonString, callback) {
            return $resource('/api/sendMail', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        /**
            Update template body by id
            Created By Nagarjuna
            Last modified on 06-03-2018
            */
        var sendnotificationSuperAdmin = function () {
            return $resource('/api/sendnotificationSuperAdmin', null, {
                save: {
                    method: 'POST'
                }
            })
        }

        /**
         Get email template by ID
         Created By Suman Chakraborty
         Last modified on 26-10-2017
         */
            var getEmailTemplateByKey = function () {
                    return $resource('/api/getEmailTemplateByKey', null, {
                            save: {
                                    method: 'POST'
                            }
                    })
            }


        var getUserNetwork = function (id) {
            return $resource(webservices.getUserNetwork, null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }


        return {
            getCounts: getCounts,
            GetUserList: GetUserList,
            addDoctor: addDoctor,
            registerDoctor: registerDoctor,
            GetSpecialty: GetSpecialty,
            deleteUser: deleteUser,
            updateUser: updateUser,
            getById: getById,
            getNonDocById: getNonDocById,
            updateStatus: updateStatus,
            getDoctorsList: getDoctorsList,
            getUnregisteredDoctorsList: getUnregisteredDoctorsList,
            GetServices: GetServices,
            sendMail: sendMail,
            setStatus: setStatus,
            updateNonRegDoc: updateNonRegDoc,
            getEmailTemplateByKey:getEmailTemplateByKey,
            sendnotificationSuperAdmin: sendnotificationSuperAdmin,
            getUserNetwork: getUserNetwork,
        }

    }]);