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

        var delDetails = function () {
            return $resource('/api/delDetails', null, {
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
        var updateNonRegDoc = function () {
            return $resource('/api/updateNonRegDoc', null, {
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

        var getNonDocById = function (id) {
            return $resource('/api/getNonDocById/:id', null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }
        var getMyRatingList = function (id) {
            return $resource('/api/getMyRatingList/:id', null, {
                get: {
                    method: 'GET',
                    id: '@id'
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
        var getDoctorsListUnAssociatedInsurance = function () {
            return $resource(webservices.getDoctorsListUnAssociatedInsurance, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var getDoctorsListAssociatedInsurance = function () {
            return $resource(webservices.getDoctorsListAssociatedInsurance, null, {
                save: {
                    method: 'POST'
                }
            });
        }        

        var getDoctorsExportList = function () {
            return $resource(webservices.getDoctorsExportList, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var getNonRegDoctorsExportList = function () {
            return $resource(webservices.getNonRegDoctorsExportList, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var getDoctorRatingList = function () {
            return $resource(webservices.getDoctorRatingList, null, {
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
        var getNonRegDocs = function () {
            
            return $resource('/api/getNonRegDocs', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var addNonRegDoc = function (inputJsonString, callback) {
            return $resource('/api/addNonRegDoc', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var addNonRegDocInsurance = function (inputJsonString, callback) {
            return $resource('/api/addNonRegDocInsurance', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var updateProviderNetwork = function () {
            return $resource('/api/updateProviderNetwork', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var updateProviderNetworkUnlisted = function () {
            return $resource('/api/updateProviderNetworkUnlisted', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var getLocationId = function (inputJsonString, callback) {
            return $resource('/api/getLocationId', null, {
                get: {
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
            getDoctorsListUnAssociatedInsurance: getDoctorsListUnAssociatedInsurance,
            getDoctorsListAssociatedInsurance: getDoctorsListAssociatedInsurance,
            getDoctorsExportList: getDoctorsExportList,
            getNonRegDoctorsExportList: getNonRegDoctorsExportList,
            getDoctorRatingList: getDoctorRatingList,
            resetPassword: resetPassword,
            GetServices: GetServices,
            sendMail: sendMail,
            getNonRegDocs: getNonRegDocs,
            addNonRegDoc: addNonRegDoc,
            addNonRegDocInsurance: addNonRegDocInsurance,
            delDetails: delDetails,
            getNonDocById: getNonDocById,
            getMyRatingList: getMyRatingList,
            updateNonRegDoc: updateNonRegDoc,
            updateProviderNetwork: updateProviderNetwork,
            updateProviderNetworkUnlisted:updateProviderNetworkUnlisted,
            getLocationId: getLocationId,
            getFrontDeskAdmin: function () {
                return $resource(webservices.getFrontDeskAdmin, null, {
                    get: {
                        method: 'GET'
                    }
                });
            }
        }

    }]);