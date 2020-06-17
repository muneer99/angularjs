"use strict"

angular.module("Services")

.factory('servicesService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getServiceList = function() {
        return $resource(webservices.getServiceList, null, {
            get: {
                method: 'GET'
            }
        });
    }

    var getServiceById = function() {
        return $resource(webservices.getServiceById, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var addServices = function() {
        return $resource(webservices.addServices, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var updateServiceStatus = function() {
        return $resource(webservices.updateServiceStatus, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var updateServicesService = function() {
        return $resource(webservices.updateServicesService, null, {
            save: {
                method: 'POST',
            }
        });
    }

    var deleteService = function() {
        return $resource(webservices.deleteService, null, {
            save: {
                method: 'POST'
            }
        });
    }
    var getSpecialityNames = function() {
        return $resource(webservices.getSpecialityNames, null, {
            get: {
                method: 'GET'
            }
        });
    }

    return {
        getServiceList: getServiceList,
        addServices: addServices,
        updateServicesService: updateServicesService,
        getServiceById: getServiceById,
        deleteService: deleteService,
        updateServiceStatus: updateServiceStatus,
        getSpecialityNames: getSpecialityNames
    }

}]);
