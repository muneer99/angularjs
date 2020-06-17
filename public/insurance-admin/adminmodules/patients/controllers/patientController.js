"use strict";

angular.module("patients")

nwdApp.controller("patientController", ['$scope', '$rootScope', '$sessionStorage', '$location', 'HomeService', 'patientService', 'logger', 'logProvider', '$state', '$stateParams', 'ngTableParamsService', 'ngTableParams', '$filter', 'insuranceService',
    function ($scope, $rootScope, $sessionStorage, $location, HomeService, patientService, logger, logProvider, $state, $stateParams, ngTableParamsService, ngTableParams, $filter, insuranceService) {
        $scope.counts           = {};
        $scope.doctor           = {};
        $scope.networkData      = [];
        $scope.patientNetwork   = [''];
        $scope.currentPage      = 1;
        $scope.itemPerPage      = 10;
        $scope.disabled         = false;
        $scope.patientData      = {};
        $scope.loading          = false;
        var localData           = JSON.parse(sessionStorage.getItem('test'));
        $scope.states           = states1d;
        $scope.usStates         = stateList;
        $scope.countryCodes     = countryCodes;
        $scope.menuPatients     = ['patients', 'addPatient', 'editPatient'];

        $scope.getName = function (index) {
            var progression = ['Primary', 'Secondary', 'Tertiary', 'Quaternary', 'Quinary'];
            return typeof (progression[index]) !== 'undefined' ? progression[index] : '';
        }

        /**
        * Add Preference
        * Created By Suman Chakraborty
        * Last modified on 20-08-2017
        */
        $scope.addNewChoice = function () {
            if ($scope.patientNetwork.length < 5) {
                $scope.patientNetwork.push('');
            } else {
                alert('Maximum 5 insurance allowed.');
                $scope.disabl = true;
            }
        }

        /**
        * Remove Preference
        * Created By Suman Chakraborty
        * Last modified on 20-08-2017
        */
        $scope.removeChoice = function () {
            var lastItem = $scope.patientNetwork.length - 1;
            $scope.patientNetwork.splice(lastItem);
            if ($scope.patientNetwork.length < 5) {
                $scope.disabl = false;
            }
        };

        /**
        * Fetch available networks from db 
        * Created By Suman Chakraborty
        * Last modified on 19-08-2017
        */
        $scope.getAvailableNetworks = function () {
            // get all insurance plans 
            insuranceService.getNetwork().get({
                id: '000'
            }, function (response) {
                if (response.code == 200) {
                    $scope.networkArr = new Array();
                    response.data.forEach(function (item) {
                        $scope.networkArr[item.name.toLowerCase()] = item._id;
                    })
                    $scope.networkData = response.data;
                } else { }
            });
        } 

        /**
        * Search in listing page
        * Created By Suman Chakraborty
        * Last modified on 19-08-2017
        */
        $scope.searchable = function (searchTextField) {
            ngTableParamsService.set('', '', searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    if (searchTextField) {
                        $scope.paramUrl.searchText = searchTextField;
                    }
                    $scope.tableLoader  = true;
                    $scope.doctorList   = [];
                    patientService.getPatientList().save($scope.paramUrl, function (response) {
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
        * Get add data for listing page
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.getPatientList = function () {
            var actvLog = {userId:localData._id, type: 4, detail: 'View patient list'};
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                // counts: [], uncomment to hide pager
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.doctorList   = [];
                    patientService.getPatientList().save($scope.paramUrl, function (response, err) {
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

        /**
        * Add new patient
        * Created By Suman Chakraborty
        * Last modified on 11-12-2017
        */
        $scope.addPatient = function (patients) {
            $rootScope.loading = true;
            var actvLog = {userId:localData._id, type: 5, detail: 'Add patient'};
            var logObj  = {accessBy: localData._id, activityDetail: 'Add patient', activityType: 3};
            if($scope.patientNetwork && $scope.patientNetwork.length>0 && $scope.patientNetwork[0]!==''){
                patients.network = $scope.patientNetwork;    
            }else{
                patients.network =[];
            }
            patients.createdBy  = localData._id;
            if(patients.contact_no){
                patients.contact_no = patients.ccode+patients.contact_no;
            }
            patientService.addPatient().save(patients, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success     = true;
                    logObj.patientId    = response.id;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    logger.logSuccess('Patient added succesfully');
                    $state.go('patient-list');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Delete data by ID
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.patientDelete = function (id) {
            var actvLog = {userId:localData._id, type: 5, detail: 'Delete patient'};
            swal({
                title: "Are you sure?",
                text: "It will remove patient from the network!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var patientData = {};
                    patientData.id  = id;
                    patientService.deletePatient().save(patientData, function (response) {
                        if (response.code == 200) {
                            logProvider.success = true;
                            logProvider.addUserActivity().save(actvLog, function(res){});
                            swal("Deleted!", "Patient has been deleted.", "success");
                            $scope.getPatientList();
                        } else {
                            logProvider.addUserActivity().save(actvLog, function(res){});
                            swal("Deleted!", "Patient not deleted try again.", "error");
                        }
                    })
                } else {
                    swal("Cancelled", "You cancelled :)", "error");
                }
            });
        }

        /**
        * Get data by ID
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.getPatientById = function () {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 4, detail: 'View patient details' };
            var logObj  = { accessBy: localData._id, activityDetail: 'View patient detail', patientId:$state.params.id };
            patientService.getPatientById().get({
                id: $state.params.id
            }, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    if(response.data.contact_no){
                        var ccode                   = response.data.contact_no.substr(0, response.data.contact_no.length - 10);
                        response.data.contact_no    = response.data.contact_no.substr(response.data.contact_no.length - 10);
                        response.data.ccode         = ccode;
                    }
                    $scope.editPatient      = response.data;
                    $scope.patientNetwork   = response.data.hasOwnProperty('network') ? response.data.network.length > 0 ? response.data.network : [''] : [''];
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })

        }

        /**
        * Update patient data by ID
        * Created By Suman Chakraborty
        * Last modified on 11-12-2017
        */
        $scope.updatePatient = function (editPatient) {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 6, detail: 'Update patient details' };
            var logObj  = {accessBy: localData._id, activityDetail: 'Update patient detail', activityType: 2, patientId:editPatient._id };

            if($scope.patientNetwork && $scope.patientNetwork.length>0 && $scope.patientNetwork[0]!==''){
                editPatient.network = $scope.patientNetwork;    
            }else{
                editPatient.network = [];
            }
            if(editPatient.contact_no){
                editPatient.contact_no = editPatient.ccode+editPatient.contact_no;
            }
            patientService.updatePatient().save(editPatient, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    logger.logSuccess(response.message);
                    $state.go('patient-list');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /**
        * Change patient status
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.changeStatus = function (id, item) {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 6, detail: 'Update patient status' };
            var logObj  = {accessBy: localData._id, activityDetail: 'Update patient status', activityType: 2, patientId:id };
            var userArr = {
                'id': id,
                'status': item === '1' ? '0' : '1'
            };
            patientService.updatePatientStatus().save(userArr, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logProvider.PhiAccLog().save(logObj, function(res){});
                    logger.logSuccess(item === '1' ? 'Patient deactivated successfully.' : 'Patient activated successfully.');
                    $state.reload('patient-list');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /**
        * Excel update on selecting file from listing page
        * Created By Suman Chakraborty
        * Last modified on 21-08-2017
        */
        $scope.$watch('patientData', function () {
            if ($scope.patientData.hasOwnProperty('data')) {
                // Check if this is a valid file only .xls and .xlsx files are allowed
                if ($scope.patientData.hasOwnProperty('ext') && ['xls', 'xlsx'].indexOf($scope.patientData.ext) > -1) {
                    $scope.loading = true;
                    // Check if the file is not empty or no data fetched from the file
                    if ($scope.patientData.data.length > 0) {
                        var successCount = 0;
                        var errorCount = 0;
                        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        $scope.patientData.data.forEach(function (item) {
                            var networks = [];
                            // Check if email id is present , no other doctor exists with the same email id 
                            if (item.hasOwnProperty('email') && re.test(item.email)) {
                                // Fetch insurance detail map with existing insurance and save corresponding ids
                                if (item.hasOwnProperty('insurance')) {
                                    let itemArr = item.insurance.split(',');
                                    itemArr.forEach(function (item) {
                                        if (typeof $scope.networkArr[item.toLowerCase()] !== 'undefined') {
                                            networks.push($scope.networkArr[item.toLowerCase()]);
                                        }
                                    })
                                }
                                var docObj = {
                                    'firstName' : (item.hasOwnProperty('firstname')) ? item.firstname : '',
                                    'lastName'  : (item.hasOwnProperty('lastname')) ? item.lastname : '',
                                    'email'     : item.email,
                                    'contact_no': (item.hasOwnProperty('phone')) ? item.phone : '',
                                    'location'  : (item.hasOwnProperty('address')) ? item.address : '',
                                    'city'      : (item.hasOwnProperty('city')) ? item.city : '',
                                    'state'     : (item.hasOwnProperty('state')) ? $scope.states.hasOwnProperty(item.state.toUpperCase()) ? item.state.toUpperCase() : '' : '',
                                    'sute'      : (item.hasOwnProperty('sute')) ? item.sute : '',
                                    'zipcode'   : (item.hasOwnProperty('zipcode')) ? item.zipcode : '',
                                    'createdBy' : localData._id,
                                    'network'   : networks
                                }
                                patientService.addPatient().save(docObj, function (response) {
                                    if (response.code == 200) {
                                        successCount++;
                                    } else {
                                        errorCount++;
                                    }
                                    // error + success count and total data length is equal when all asynchronous execution are completed
                                    if ($scope.patientData.data.length === successCount + errorCount) {
                                        logger.logSuccess(successCount + ' record(s) imported successfully.');
                                        $scope.loading = false;
                                    }
                                })
                            } else {
                                errorCount++;
                            }
                        });
                    } else {
                        $scope.loading = false;
                        logger.logError('No records found. Please follow the sample file given and try again...');
                    }
                } else {
                    $scope.loading = false;
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file. ');
                }
            } else {}
        })
    }
])
/**
* Read excel data
* Created By Suman Chakraborty
* Last modified on 21-08-2017
*/
.directive("patientread", [function () {
return {
    scope: {
        opts: '='
    },
    link: function ($scope, $elm, $attrs) {
        $elm.on('change', function (changeEvent) {
            var fileType = $elm[0].value.split('.');
            var ext = fileType[fileType.length - 1].toLowerCase();
            if (['xlsx', 'xls'].indexOf(ext) > -1) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    $scope.$apply(function () {
                        var data = evt.target.result;
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        var headerNames = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                            header: 1
                        })[0];
                        var data    = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                        $scope.opts = {
                            data: data,
                            ext: ext
                        };
                    });
                };
                reader.readAsBinaryString(changeEvent.target.files[0]);
            } else {}
        });
    }
}
}]);