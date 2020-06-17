"use strict"

angular.module("Frontdesktitle")

.factory('frontdesktitleService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var addTitle = function() {
        return $resource(webservices.addFrontdeskTitle, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getTitleList = function() {
       
        return $resource(webservices.getFrontdeskTitleList, null, {
            get: {
                method: 'GET'
            }
        });
    }

    var getTitle = function() {
        return $resource(webservices.getFrontdeskTitle, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var deleteTitle = function() {
        return $resource(webservices.deleteFrontdeskTitle, null, {
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
