"use strict"

angular.module("Insurance")

    .factory('insuranceService', ['$http', 'communicationService', '$resource', function ($http, communicationService, $resource) {

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

        // var getNetwork = function () {

        //      return $resource('/api/getNetwork/', null, {
        //         get: {
        //             method: 'GET',
        //             id: '@id'
        //         }
        //     });
        // }

        /*yemjala on 25-09-19 */
        var getNetwork = function () {

            return $resource(webservices.getNetwork, null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }
        /*yemjala on 25-09-19 end.........*/


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

        var deleteNetwork = function () {
            return $resource(webservices.deleteNetwork, null, {
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
        var sendEmailInsurance = function () {
            return $resource('/api/sendEmailInsurance', null, {
                save: {
                    method: 'POST'
                }
            })
        }

        var updateNetworkProviderStatus = function () {
            return $resource(webservices.updateNetworkProviderStatus, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var sendLoginDetailsInsurance = function () {
            return $resource('/api/sendLoginDetailsInsurance', null, {
                save: {
                    method: 'POST'
                }
            })
        }

        // var insertOrUpdateUsernetworks = function(inputJsonString, callback) {
        //     return $resource(webservices.insertOrUpdateUsernetworks, null, {
        //         save: {
        //             method: 'POST'
        //         }
        //     });
        // };

        return {
            addNetwork: addNetwork,
            getNetworkList: getNetworkList,
            getNetwork: getNetwork,
            getUserNetwork: getUserNetwork,
            getSelectedNetwork:getSelectedNetwork,
            deleteNetwork: deleteNetwork,
            updateNetworkProviderStatus: updateNetworkProviderStatus,
            sendEmailInsurance: sendEmailInsurance,
            sendLoginDetailsInsurance: sendLoginDetailsInsurance,
            // insertOrUpdateUsernetworks: insertOrUpdateUsernetworks
        }

    }]);