"use strict"

angular.module("Insurance")

.factory('insuranceService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var addNetwork = function() {
        return $resource(webservices.addNetwork, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getNetworkList = function() {
        return $resource(webservices.getNetworkList, null, {
            get: {
                method: 'GET'
            }
        });
    }

    var getNetwork = function() {
        return $resource(webservices.getNetwork, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var deleteNetwork = function() {
        return $resource(webservices.deleteNetwork, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getUserNetwork = function () {
        return $resource(webservices.getUserNetwork, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }
    var getSelectedNetwork = function () {
        return $resource(webservices.getSelectedNetwork, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    return {
        addNetwork: addNetwork,
        getNetworkList: getNetworkList,
        getNetwork: getNetwork,
        deleteNetwork: deleteNetwork,
        getUserNetwork:getUserNetwork,
        getSelectedNetwork:getSelectedNetwork
    }

}]);