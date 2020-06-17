"use strict"

angular.module("Title")

.factory('titleService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var addTitle = function() {
        return $resource(webservices.addTitle, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getTitleList = function() {
        return $resource(webservices.getTitleList, null, {
            get: {
                method: 'GET'
            }
        });
    }

    var getTitle = function() {
        return $resource(webservices.getTitle, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var deleteTitle = function() {
        return $resource(webservices.deleteTitle, null, {
            save: {
                method: 'POST'
            }
        });
    }

    return {
        addTitle    : addTitle,
        getTitleList: getTitleList,
        getTitle    : getTitle,
        deleteTitle : deleteTitle
    }

}]);