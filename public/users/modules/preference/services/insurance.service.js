"use strict"

angular.module("welcome")

    .factory('insuranceService', ['$resource', function ($resource) {

        var addNetwork = function () {
            return $resource(webservices.addNetwork, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var getNetworkList = function () {
            return $resource(webservices.getNetworkList, null, {
                get: {
                    method: 'GET'
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
        
        var getNetwork = function () {
            return $resource(webservices.getNetwork, null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }


        // var getNetwork = function() {
        //     return $resource(webservices.getNetwork, null, {
        //         save: {
        //             method: 'POST',
        //         }
        //     });
        // }


        var deleteNetwork = function () {
            return $resource(webservices.deleteNetwork, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        return {
            addNetwork: addNetwork,
            getNetworkList: getNetworkList,
            getNetwork: getNetwork,
            getUserNetwork: getUserNetwork,
            getSelectedNetwork:getSelectedNetwork,
            deleteNetwork: deleteNetwork
        }

    }]);