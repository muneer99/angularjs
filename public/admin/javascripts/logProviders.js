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

	return factObj;
}]);