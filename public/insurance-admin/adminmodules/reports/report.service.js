"use strict"

angular.module("Report")

.factory('reportService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getReferralList = function() {
        return $resource('/api/getReferralList', null, {
            save: {
                method: 'POST'
            }
        });
    }
    var loadUsers = function() {
        return $resource('/api/providerList', null, {
            get: {
                method: 'GET'
            }
        })
    }
    return {
        getReferralList: getReferralList,
        loadUsers: loadUsers
    }

}]);