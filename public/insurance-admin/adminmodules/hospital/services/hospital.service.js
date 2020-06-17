"use strict"

angular.module("hospital")

.factory('hospitalService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var addHospital = function() {
        return $resource(webservices.addHospital, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getHospitalList = function() {
        return $resource(webservices.getHospitalList, null, {
            get: {
                method: 'GET'
            }
        });
    }

     var getHospital = function() {
        return $resource(webservices.getHospital, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var deleteHospital = function() {
        return $resource(webservices.deleteHospital, null, {
            save: {
                method: 'POST'
            }
        });
    }



    return {
        addHospital: addHospital,
        getHospitalList: getHospitalList,
        getHospital:getHospital,
        deleteHospital: deleteHospital

    }

}]);