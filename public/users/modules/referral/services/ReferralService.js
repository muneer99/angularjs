'use strict'
angular.module('speciality');
nwdApp.factory('ReferService', ['communicationService', '$rootScope', '$resource',
    function(communicationService, $rootScope, $resource) {
        var service = {};

        service.GetDoctorsList = function(inputJsonString, callback) {
            /*To send a query value in a get function*/
            var status = webservices.listAvailableDoctor + '/?status=' + inputJsonString;
            communicationService.resultViaGet(status, appConstants.authorizationKey, headerConstants.json, function(response) {

                callback(response.data);
            });
        };

        service.GetUserList = function(inputJsonString, callback) {
            communicationService.resultViaPost(webservices.getUserList, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        };

        service.GetPatient = function(inputJsonString, callback) {

            communicationService.resultViaPost(webservices.getpatient, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
                callback(response.data);
            });
        }

        // Get doctors list
        service.GetDoctors = function(inputJsonString, callback) {
            return $resource(webservices.getDoctors, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // Get reg doctors list
        service.GetDoctorsReg = function(inputJsonString, callback) {
            return $resource(webservices.getDoctorsReg, null, {
                save: {
                    method: 'POST'
                }
            });
        }
        
        // Get non reg doctors list
        service.GetDoctorsNonReg = function(inputJsonString, callback) {
            return $resource(webservices.getDoctorsNonReg, null, {
                save: {
                    method: 'POST'
                }
            });
        }        

        // Get patient 
        service.searchPatients = function(inputJsonString, callback) {
            return $resource('api/searchPatients', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // upload attachments
        service.uploadAttachments = function(inputJsonString, callback) {
            return $resource('/api/uploadAttachments', null, {
                save: {
                    method: 'POST',
                    headers: { 'Content-Type': undefined }
                }
            });
        }

        // upload attachments
        service.deleteAttachment = function(inputJsonString, callback) {
            return $resource('/api/deleteAttachment', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // addPatient
        service.addPatient = function(inputJsonString, callback) {
            return $resource('/api/addPatient', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // refer
        service.referPatients = function(inputJsonString, callback) {
            return $resource('/api/referPatients', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // refer counts
        service.getReferredCounts = function(inputJsonString, callback) {
            return $resource('/api/getReferredCounts', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        service.GetServices = function(inputJsonString, callback) {
            return $resource(webservices.getServices, null, {
                save: {
                    method: 'POST'
                }
            });
        }

        service.getHospitals = function(inputJsonString, callback) {
            return $resource('/api/getHospitals', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // Update referral
        service.updateReferral = function(inputJsonString, callback) {
            return $resource('/api/updateReferral', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // Update referral
        service.updateReferralDetail = function(inputJsonString, callback) {
            return $resource('/api/updateReferralDetail', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        // get user detail
        service.getUserDetails = function(inputJsonString, callback) {
            return $resource('/api/getUserProfile', null, {
                save: {
                    method: 'POST'
                }
            });
        }
         // get user status
        service.getUserRegStatus = function(inputJsonString, callback) {
            return $resource('/api/getUserRegStatus', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        
        // Send email on success
        service.sendMail = function(inputJsonString, callback) {
            return $resource('/api/sendMail', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        service.sendSms = function(inputJsonString, callback) {
            return $resource('/api/sendSms', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        service.addService = function() {
        return $resource('/api/addService', null, {
            save: {
                method: 'POST'
            }
        });
    }

        return service;
    }
]);