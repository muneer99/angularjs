"use strict";

angular.module("patients")

nwdApp.controller("patientController", ['$scope', '$rootScope', '$sessionStorage', '$location', 'HomeService', 'patientService', 'logger', 'logProvider', '$state', '$stateParams', 'ngTableParamsService', 'ngTableParams', '$filter', 'insuranceService',
    function($scope, $rootScope, $sessionStorage, $location, HomeService, patientService, logger, logProvider, $state, $stateParams, ngTableParamsService, ngTableParams, $filter, insuranceService) {
        $scope.counts           = {};
        $scope.doctor           = {};
        $scope.networkData      = [];
        $scope.patientNetwork   = [''];
        $scope.currentPage      = 1;
        $scope.itemPerPage      = 10;
        $scope.disabled         = false;
        $scope.allowAdd         = true;
        $scope.countryCodes     = countryCodes;
        var localData           = JSON.parse(sessionStorage.getItem('test'));
        $scope.usStates         = stateList;
        $scope.getName = function(index) {
            var progression = ['Primary', 'Secondary', 'Tertiary', 'Quaternary', 'Quinary'];
            return typeof(progression[index]) !== 'undefined' ? progression[index] : '';
        }

        $scope.addNewChoice = function() {
            if ($scope.patientNetwork.length < 5) {
                $scope.patientNetwork.push('');
            } else {
                alert('Maximum 5 insurance allowed.');
                $scope.disabl = true;
            }
        }

        $scope.removeChoice = function() {
            var lastItem = $scope.patientNetwork.length - 1;
            $scope.patientNetwork.splice(lastItem);
            if ($scope.patientNetwork.length < 5) {
                $scope.disabl = false;
            }
        };


        $scope.menuPatients = ['patients', 'addPatient', 'editPatient'];
        /**
        * Search patinet from listing page
        * Created by Suman Chakraborty
        * Last modified on 19-08-2017
        */
        $scope.searchable = function(searchTextField) {
            ngTableParamsService.set('', '', searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    if(searchTextField){
                        $scope.paramUrl.searchText = searchTextField;
                    }
                    $scope.tableLoader  = true;
                    $scope.doctorList   = [];
                    patientService.getPatientList().save($scope.paramUrl, function(response) {
                        $scope.tableLoader  = false;
                        $scope.doctorList   = response.data;
                        var data            = response.data;
                        $scope.totalCount   = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                }
            });
        };

        /**
         * Fetch available networks from db 
         * 
         */
        $scope.getAvailableNetworks = function() {
            insuranceService.getNetwork().get({ id: '000' }, function(response) {
                if (response.code == 200) {
                    $scope.networkData = response.data;
                } else {}
            });
        }
        /**
        * Get patient list 
        * Created By Suman Chakraborty
        * Last Modified on 30-08-2017
        */
        $scope.getPatientList = function() {
            var actvLog = { type: 4, detail: 'View patient list', userId: localData._id };
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.doctorList   = [];
                    patientService.getPatientList().save($scope.paramUrl, function(response, err) {
                        if (response.code == 200) {
                            actvLog.success     = true;
                            logProvider.addUserActivity().save(actvLog, function(res){});
                            $scope.tableLoader  = false;
                            $scope.doctorList   = response.data;
                            var data            = response.data;
                            $scope.totalCount   = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logProvider.addUserActivity().save(actvLog, function(res){});
                            logger.logError(response.message);
                        }
                    });
                }
            });
        }

        /*
        * Add new patient
        * Created By Suman Chakraborty
        * Last Modified on 30-11-2017
        */
        $scope.addPatient = function(patients) {
            var actvLog         = { type: 5, detail: 'Add patient', userId: localData._id };
            var logObj          = {accessBy: localData._id, activityDetail: 'Add Patient', activityType: 3};
            patients.network    = $scope.patientNetwork;
            patients.createdBy  = localData._id;
            if(patients.contact_no){
                patients.contact_no = patients.ccode+patients.contact_no;
            }
            patientService.addPatient().save(patients, function(response) {
                if (response.code == 200) {
                    actvLog.success     = true;
                    logObj.patientId    = response.id;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    logger.logSuccess('Patient added succesfully');
                    $state.go('patients');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }

        $scope.patientDelete = function(id) {
            swal({
                    title: "Are you sure?",
                    text: "It will remove patient from the network!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        var patientData = {};
                        patientData.id  = id;
                        patientService.deletePatient().save(patientData, function(response) {
                            if (response.code == 200) {
                                swal("Deleted!", "Patient has been deleted.", "success");
                                $scope.getPatientList();
                            } else {
                                swal("Deleted!", "Patient not deleted try again.", "error");
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        /**
        * Get patinet detils by ID for edit page
        * Created By Suman Chakraborty
        * Last modified on 30-11-2017
        */
        $scope.getPatientById = function() {
            var actvLog = { type: 4, detail: 'View patient details', userId: localData._id };
            var logObj  = {accessBy: localData._id, activityDetail: 'View patient details', patientId: $state.params.id};
            patientService.getPatientById().get({ id: $state.params.id }, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    if(response.data.contact_no){
                        var ccode                   = response.data.contact_no.substr(0, response.data.contact_no.length - 10);
                        response.data.contact_no    = response.data.contact_no.substr(response.data.contact_no.length - 10);
                        response.data.ccode         = ccode;
                    }
                    $scope.editPatient      = response.data;
                    $scope.patientNetwork   = response.data.hasOwnProperty('network') ? response.data.network : [''];
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }

        /*
        * Update patient details
        * Created By Suman Chakraborty
        * Last modified on 30-11-2017
        */
        $scope.updatePatient = function(editPatient) {
            var actvLog = { type: 6, detail: 'Update patient details', userId: localData._id };
            var logObj  = {accessBy: localData._id, activityDetail: 'Update patient details',activityType: 2, patientId: editPatient._id};
            editPatient.network = $scope.patientNetwork;
            if( editPatient.contact_no ){
                editPatient.contact_no = editPatient.ccode+editPatient.contact_no;
            }
            patientService.updatePatient().save(editPatient, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    logger.logSuccess(response.message);
                    $state.go('patients');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }

        /*
        * Update patient status
        * Created By Suman Chakraborty
        * Last modified on 30-11-2017
        */
        $scope.changeStatus = function(id, item) {
            var actvLog = { type: 6, detail: 'Update patient status', userId: localData._id };
            var logObj = {accessBy: localData._id, activityDetail: 'Update patient status',activityType: 2, patientId: id};
            var userArr = { 'id': id, 'status': item === '1' ? '0' : '1' };
            patientService.updatePatientStatus().save(userArr, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    logger.logSuccess(item === '1' ? 'Patient deactivated successfully.' : 'Patient activated successfully.');
                    $state.reload('patients');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
    }
]);