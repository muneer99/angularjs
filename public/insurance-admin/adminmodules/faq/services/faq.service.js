"use strict"

angular.module("faq")

.factory('faqService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var addFaq = function() {
        return $resource(webservices.addFaq, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getFaqList = function() {
        return $resource(webservices.getFaqList, null, {
            get: {
                method: 'GET'
            }
        });
    }

     var getFaq = function() {
        return $resource(webservices.getFaq, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var deleteFaq = function() {
        return $resource(webservices.deleteFaq, null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getPageName = function(){    
        return faqPages;
    };



    return {
        addFaq: addFaq,
        getFaqList: getFaqList,
        getFaq:getFaq,
        deleteFaq: deleteFaq,
        getPageName: getPageName

    }

}]);