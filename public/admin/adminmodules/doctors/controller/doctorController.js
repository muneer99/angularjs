"use strict";

angular.module("doctors")

nwdApp.controller("doctorController", ['$scope', '$rootScope', '$sessionStorage', '$location', 'HomeService', 'doctorService', 'logger', 'logProvider', '$state', '$stateParams', 'ngTableParamsService', 'ngTableParams', '$filter', 'insuranceService',
    function($scope, $rootScope, $sessionStorage, $location, HomeService, doctorService, logger, logProvider, $state, $stateParams, ngTableParamsService, ngTableParams, $filter, insuranceService) {
        $scope.doctorPage   = 'mainDoctorPage';
        $scope.counts       = {};
        $scope.doctor       = {};
        $scope.currentPage  = 1;
        $scope.itemPerPage  = 10;
        $scope.disabled     = false;
        $scope.countryCodes = countryCodes;
        var localData       = JSON.parse(sessionStorage.getItem('test'));
        $scope.usStates     = stateList;
        $scope.activationMessage = function() {
            $scope.parmas   = $location.search();
            $scope.success  = $scope.parmas.success;
        }
        /**
        * Get doctor count
        *
        */
        $scope.getCounts = function() {
            HomeService.getCounts().get(function(response) {
                if (response.code == 200) {
                    $scope.counts = response.data;
                }
            });
        }

        /*
        * search on listing page
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
                    doctorService.getDoctorsList().save($scope.paramUrl, function(response) {
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
        * Doctor listing page
        * 
        */
        $scope.getDoctorsList = function() {
            var actvLog = { type: 4, detail: 'View provider list', userId: localData._id };
            
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                // counts: [], uncomment to hide pager
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.doctorList   = [];
                    
                    doctorService.getDoctorsList().save($scope.paramUrl, function(response, err) {
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
        * Add new doctor
        */
        $scope.addToNetwork = function(doctorsInfo) {
            var actvLog = { type: 5, detail: 'Add provider', userId: localData._id };
            doctorsInfo.speciality  = doctorsInfo.specialty;
            doctorsInfo.createdById = localData._id;
            if(doctorsInfo.cell_phone){
                doctorsInfo.cell_phone  = doctorsInfo.ccode+doctorsInfo.cell_phone;
                doctorsInfo.fax         = doctorsInfo.ccodeFax+doctorsInfo.fax;
            }
            doctorService.addDoctor().save(doctorsInfo, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess('Provider has been added to network');
                    $state.go('doctors');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }        

        /*
        * Get all service, specialty and services list
        * Created By Suman Chakraborty
        * Last Modified 
        */
        $scope.getAvailableServices = function() {
            // Get all specialty
            doctorService.GetSpecialty().get(function(response) {
                if (response.code == 200) {
                    $scope.specialtyData    = response.data;
                    $scope.datalength       = response.data.length;
                } else {}
            })
            // Get all Services
            doctorService.GetServices().save({}, function(response) {
                if (response.code == 200) {
                    $scope.serviceData = response.data;
                } else {}
            })
            // get all insurance plans 
            insuranceService.getNetwork().get({ id: '000' }, function(response) {
                if (response.code == 200) {
                    $scope.networkData = response.data;
                } else {}
            });
        }
        /*
        * Get specialty list
        */
        $scope.getAvailableSpecialty = function() {
            doctorService.GetSpecialty().get(function(response) {
                if (response.code == 200) {
                    $scope.specialtyData    = response.data;
                    $scope.datalength       = response.data.length;
                } else {}
            })
            // get all insurance plans 
            insuranceService.getNetwork().get({ id: '000' }, function(response) {
                if (response.code == 200) {
                    $scope.networkData = response.data;
                } else {}
            });
        }

        /*
        * Get delete confirmation
        */
        $scope.isDelete = function(index, email) {
            $scope.emailId          = {}
            $scope.emailId.email    = email;
            swal({
                title: "Are you sure?",
                text: "It will remove provider from the network!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(isConfirm) {
                if (isConfirm) {
                    doctorService.deleteUser().save($scope.emailId, function(response) {
                        if (response.code == 200) {
                            $scope.doctorList.splice(index, 1)
                            $state.reload('doctors');
                            swal("Deleted!", "User has been deleted.", "success");
                        } else {}
                    })
                } else {
                    swal("Cancelled", "You cancelled :)", "error");
                }
            });
        }

        /*
        * Edi doctor 
        */
        $scope.editDetails = function(doctor) {
            $state.go('editDoctor');
        }

        /*
        * Get doctor details for edit,
        */
        $scope.getById = function() {
            var actvLog = { type: 4, detail: 'View provider details', userId: localData._id };
            doctorService.getById().get({ id: $state.params.id }, function(response) {
                if (response.code == 200) {
                    actvLog.success =true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    response.data.speciality = (response.data.speciality !== null && response.data.speciality.length > 0) ? response.data.speciality : [];
                    if(response.data.cell_phone){
                        response.data.ccode         = response.data.cell_phone.substr(0, response.data.cell_phone.length - 10);
                        response.data.cell_phone    = response.data.cell_phone.substr(response.data.cell_phone.length - 10);
                    }
                    if(response.data.fax){
                        response.data.ccodeFax  = response.data.fax.substr(0, response.data.fax.length - 10);
                        response.data.fax       = response.data.fax.substr(response.data.fax.length - 10);
                    }
                    $scope.editdoctor = response.data;
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }

        /*
        * Update doctor details
        */
        $scope.updatedoctor = function(editdoctor) {
            var actvLog             = { type: 6, detail: 'Update provider', userId: localData._id };
            editdoctor.speciality   = editdoctor.speciality;
            editdoctor.cell_phone   = editdoctor.ccode+editdoctor.cell_phone;
            editdoctor.fax          = editdoctor.ccodeFax+editdoctor.fax;
            doctorService.updateUser().save(editdoctor, function(response) {
            
                if (response.code == 200) {
                    actvLog.success =true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess(response.message);
                    $state.go('doctors');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /*
        * Update doctor status
        */
        $scope.changeStatus = function(id, item) {
            var actvLog = { type: 6, userId: localData._id };
            
            var userArr = { 'id': id, 'status': item === '1' ? '0' : '1' };
            doctorService.updateStatus().save(userArr, function(response) {
                if (response.code == 200) {
                    actvLog.success =true;
                    logger.logSuccess(item === '1' ? 'User deactivated successfully.' : 'User activated successfully.');
                    
                    actvLog.detail ='Change status of provider status';
                    $state.reload('doctors');
                    
                    logProvider.addUserActivity().save(actvLog, function(res){});
                } else {
                    logger.logError(response.message);
                }
            })
        }
    }
]);