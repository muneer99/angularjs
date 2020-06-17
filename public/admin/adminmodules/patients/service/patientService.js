"use strict"

angular.module("patients")

.factory('patientService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getPatientList = function() {
        return $resource(webservices.getPatientList, null, {
            get: {
                method: 'GET'
            }
        });
    };

    var addPatient = function(inputJsonString, callback) {
        return $resource(webservices.addPatient, null, {
            save: {
                method: 'POST'
            }
        });
    }
    var deletePatient = function() {
        return $resource(webservices.deletePatient, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var updatePatient = function() {
        return $resource(webservices.updatePatient, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getPatientById = function(id) {
        return $resource(webservices.getPatientById, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }
    var updatePatientStatus = function() {
        return $resource(webservices.updatePatientStatus, null, {
            save: {
                method: 'POST'
            }
        });
    }

    return {
        getPatientList: getPatientList,
        addPatient: addPatient,
        deletePatient: deletePatient,
        updatePatient: updatePatient,
        getPatientById: getPatientById,
        updatePatientStatus: updatePatientStatus
    }

}]);