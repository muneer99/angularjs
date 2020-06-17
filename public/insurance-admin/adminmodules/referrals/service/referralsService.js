"use strict"

angular.module('referral')
.factory('referralsService', ['$http', '$resource', function($http, $resource) {
	var getReferralsList = function() {
        return $resource('/api/getReferralsList', null, {
            save: {
                method: 'POST'
            }
        });
    }

    var exportReferralsList = function(){
        return $resource('/api/exportReferralsList',null,{
            save:{
                method: 'POST'
            }
        });
    }
    return {
        getReferralsList: getReferralsList,
        exportReferralsList:exportReferralsList
    }
}])