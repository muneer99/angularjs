"use strict"

angular.module("speciality")

.factory('specialityService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getSpecialityList = function() {
        return $resource(webservices.getSpecialityList, null, {
            get: {
                method: 'GET'
            }
        });
    };

    var addSpeciality = function() {
        return $resource(webservices.addSpeciality, null, {
            save: {
                method: 'POST'
            }
        });
    }
    var deleteSpeciality = function() {
        return $resource(webservices.deleteSpeciality, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var updateSpeciality = function() {
        return $resource(webservices.updateSpeciality, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getSpecialityById = function(id) {
        return $resource(webservices.getSpecialityById, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }
    var updateSpecialityStatus = function() {
        return $resource(webservices.updateSpecialityStatus, null, {
            save: {
                method: 'POST'
            }
        });

    }
    var addSpecialityService = function() {
        return $resource(webservices.addSpecialityService, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getSpecialityServiceList = function() {
        return $resource('/api/getSpecialityServiceList', null, {
            save: {
                method: 'POST'
            }
        });
    }
    var specialityServiceDelete = function() {
        return $resource(webservices.specialityServiceDelete, null, {
            save: {
                method: 'POST'
            }
        });
    }
    var specialityServiceStatus = function() {
        return $resource(webservices.specialityServiceStatus, null, {
            save: {
                method: 'POST'
            }
        });

    }

    var updatePatientNotificationStatus = function () {
        return $resource(webservices.updatePatientNotificationStatus, null, {
            save: {
                method: 'POST'
            }
        });
    }

    return {
        getSpecialityList               : getSpecialityList,
        addSpeciality                   : addSpeciality,
        deleteSpeciality                : deleteSpeciality,
        updateSpeciality                : updateSpeciality,
        getSpecialityById               : getSpecialityById,
        updateSpecialityStatus          : updateSpecialityStatus,
        addSpecialityService            : addSpecialityService,
        getSpecialityServiceList        : getSpecialityServiceList,
        specialityServiceDelete         : specialityServiceDelete,
        specialityServiceStatus         : specialityServiceStatus,
        updatePatientNotificationStatus : updatePatientNotificationStatus
    }

}]);
