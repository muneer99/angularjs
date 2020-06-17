nwdApp.factory('logProvider', ['$resource', function($resource) {
	var factObj = {};
	
	/**
	* Save Patient info access log
	* Created By Suman Chakraorty
	* Last modified on 28-11-2017
	*/
	factObj.PhiAccLog = function(req){
		return $resource('/api/addPhiAccess', null, {
            save: {
                method: 'POST'
            }
        });
	}
	/**
	* Save user activity
	* Created By Suman Chakraorty
	* Last modified on 28-11-2017
	*/
	factObj.addUserActivity = function(req){
		return $resource('/api/addUserActivity', null, {
            save: {
                method: 'POST'
            }
        });
	}
	/**
	* Save user activity
	* Created By Suman Chakraorty
	* Last modified on 28-11-2017
	*/
	factObj.addInvitationLog = function(req){
		return $resource('/api/addInvitationLog', null, {
            save: {
                method: 'POST'
            }
        });
	}
		/**
	* get invitation log by id
	* Created By Suman Chakraorty
	* Last modified on 28-11-2017
	*/

	factObj.getInvitationListById = function (id) {
            return $resource('/api/getInvitationListById/:id', null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
	} 
		
	factObj.getSuperAdminId = function (id) {
            return $resource('/api/getSuperAdminId/:id', null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
    } 	

	return factObj;
}]);