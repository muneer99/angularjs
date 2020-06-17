"use strict";
nwdApp.factory('PreferenceServices', ['$rootScope', '$resource', function($rootScope, $resource) {
    var services = {};

    services.UpdateContactDetails = function(inputJsonString, callback) {
        return $resource(webservices.UpdateContactDetails, null, {
            save: {
                method: 'POST'
            }
        });
    };



    services.insertOrUpdateUsernetworks = function(inputJsonString, callback) {
        return $resource(webservices.insertOrUpdateUsernetworks, null, {
            save: {
                method: 'POST'
            }
        });
    };



    services.getSpecialities = function() {
        return $resource(webservices.getSpeciality, null, {
            get: {
                method: 'GET'
            }
        });
    };

    services.getDoctorBySpeciality = function() {
        return $resource(webservices.getDoctorBySpeciality, null, {
            save: {
                method: 'POST'
            }
        });
    };

    services.addPreference = function() {
        return $resource(webservices.addPreference, null, {
            save: {
                method: 'POST'
            }
        })
    }

    services.GetServices = function(inputJsonString, callback) {
        return $resource(webservices.getServices, null, {
            save: {
                method: 'POST'
            }
        });
    }

    services.getPreference = function() {
        return $resource(webservices.getPreference, null, {
            save: {
                method: 'POST'
            }
        });
    };

    services.getPreferenceBySpecialty = function() {
        return $resource(webservices.getPreferenceBySpecialty, null, {
            save: {
                method: 'POST'
            }
        });
    };

    services.getUserDetails = function() {
        return $resource('api/getUserDetails', null, {
            save: {
                method: 'POST'
            }
        });
    };

    services.getFrontDeskAdmin = function() {
        return $resource('api/getFrontDeskAdmin', null, {
            get: {
                method: 'GET'
            }
        });
    };

    services.addOfficeAdmin = function() {
        return $resource(webservices.addDoctor, null, {
            save: {
                method: 'POST'
            }
        });
    };

    services.getUserSpecificNetworkData = function() {
        return $resource(webservices.getUserSpecificNetworkData, null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }


    services.migrateData = function() {
        return $resource(webservices.migrateData, null, {
            save: {
                method: 'POST'
            }
        });
    };

    return services;
}])