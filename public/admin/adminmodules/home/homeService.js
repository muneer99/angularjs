"use strict"

angular.module("Home")

.factory('HomeService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getCounts = function() {
        return $resource('/api/getCounts', null, {
            get: {
                method: 'GET'
            }
        });
    }
    var GetUserList = function(inputJsonString, callback) {
        communicationService.resultViaGet(webservices.getUserList, appConstants.authorizationKey, headerConstants.json, function(response) {
            callback(response.data);
        });
    };

    return {
        getCounts: getCounts,
        GetUserList: GetUserList,
    }

}]);