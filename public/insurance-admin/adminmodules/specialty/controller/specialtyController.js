"use strict";
angular.module("speciality")
nwdApp.controller("specialityController", ['$scope', '$rootScope', '$sessionStorage', '$location', 'HomeService', 'specialityService', 'logger', 'logProvider', '$state', '$stateParams', 'ngTableParamsService', 'ngTableParams', '$filter',
    function($scope, $rootScope, $sessionStorage, $location, HomeService, specialityService, logger, logProvider, $state, $stateParams, ngTableParamsService, ngTableParams, $filter) {
        $scope.counts           = {};
        $scope.doctor           = {};
        $scope.currentPage      = 1;
        $scope.itemPerPage      = 10;
        $scope.disabled         = false;
        $scope.menuSpecialty    = ['specialty', 'addSpecialty', 'editSpecialty'];
        var localData           = JSON.parse(sessionStorage.getItem('test'));

        /**
        * Search for listing page
        */ 
        $scope.searchable = function(searchTextField) {
            ngTableParamsService.set('', '', searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    if (searchTextField) {
                        $scope.paramUrl.searchText = searchTextField;
                    }
                    $scope.tableLoader      = true;
                    $scope.specialityList   = [];
                    specialityService.getSpecialityList().save($scope.paramUrl, function(response) {
                        $scope.tableLoader      = false;
                        $scope.specialityList   = response.data;
                        var data                = response.data;
                        $scope.totalCount       = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                }
            });
        };

        /**
        * Get specialty list
        * Created  By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.getSpecialityList = function() {
            var actvLog = {userId:localData._id, type: 4, detail: 'View specialty list'};
            ngTableParamsService.set('', '', undefined, { specialityName: "asc" });
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                // counts: [], uncomment to hide pager
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl         = params.url();
                    $scope.tableLoader      = true;
                    $scope.specialityList   = [];
                    specialityService.getSpecialityList().save($scope.paramUrl, function(response, err) {
                        if (response.code == 200) {
                            actvLog.success         = true;
                            $scope.tableLoader      = false;
                            $scope.specialityList   = response.data;
                            var data                = response.data;
                            $scope.totalCount       = response.totalCount;
                            logProvider.addUserActivity().save(actvLog, function(res){});
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
        * Add specialty  
        */
        $scope.addSpeciality = function(speciality) {
            var actvLog = {userId:localData._id, type: 5, detail: 'Add specialty'};
            specialityService.addSpeciality().save(speciality, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess('Specialty has been added to network');
                    $state.go('speciality');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /**
        * Delete specialty
        */
        $scope.specialityDelete = function(id) {
            var actvLog = {userId:localData._id, type: 13, detail: 'Delete specialty'};
            swal({
                    title: "Are you sure?",
                    text: "It will remove specialty from the network!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        var patientData = {};
                        patientData.id = id;
                        specialityService.deleteSpeciality().save(patientData, function(response) {
                            if (response.code == 200) {
                                actvLog.success = true;
                                logProvider.addUserActivity().save(actvLog, function(res){});
                                swal("Deleted!", "Specialty has been deleted.", "success");
                                $scope.getSpecialityList();
                            } else {
                                logProvider.addUserActivity().save(actvLog, function(res){});
                                swal("Deleted!", "Unable to delete specialty. Please try again.", "error");
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }
        /**
        * Get specialty by id
        */
        $scope.getSpecialityById = function() {
            var actvLog = {userId:localData._id, type: 4, detail: 'View specialty detail'};
            specialityService.getSpecialityById().get({ id: $state.params.id }, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    $scope.editSpeciality = response.data;
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })

        }
        /** 
        * Update specialty
        * Created By Suman Chakraborty
        * last modified on 01-12-2017
        */
        $scope.updateSpeciality = function(editSpeciality) {
            var actvLog = {userId:localData._id, type: 6, detail: 'Update specialty detail'};
            specialityService.updateSpeciality().save(editSpeciality, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess(response.message);
                    $state.go('speciality');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /** 
        * Change status
        * Created By Suman Chakraborty
        * last modified on 09-09-2017
        */
        $scope.changeStatus = function(id, item) {
            var actvLog = {userId:localData._id, type: 6, detail: 'Update specialty status'};
            var userArr = { 'id': id, 'status': item === '1' ? '0' : '1' };
            specialityService.updateSpecialityStatus().save(userArr, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess(item === '1' ? 'Specialty deactivated successfully.' : 'Specialty activated successfully.');
                    $state.reload('speciality');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /** 
        * add service
        * Created By Suman Chakraborty
        * last modified on 09-09-2017
        */
        $scope.addService = function(addservices) {
            $scope.servicesData = {}
            $scope.servicesData.specialityId    = $state.params.id;
            $scope.servicesData.serviceName     = addservices.serviceName;
            $scope.servicesData.serviceCode     = addservices.serviceCode;
            $scope.servicesData.serviceDescrip  = addservices.serviceDescrip;
            specialityService.addSpecialityService().save($scope.servicesData, function(response) {
                if (response.code == 200) {
                    logger.logSuccess('Service has been added to Speciality');
                    $state.go('speciality');
                } else {
                    logger.logError(response.message);
                }
            })
        }

        $scope.routeToAddService = function(id) {
            $location.path('/speciality/addService/' + id);
        }

        /** 
        * Listing page search
        * Created By Suman Chakraborty
        * last modified on 09-09-2017
        */
        $scope.servicesearchable = function(searchTextField) {
            ngTableParamsService.set('', '', searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchTextField, params.sorting());
                    $scope.paramUrl                 = params.url();
                    $scope.paramUrl.id              = $state.params.id;
                    $scope.tableLoader              = true;
                    $scope.specialityserviceList    = [];
                    specialityService.getSpecialityServiceList().save($scope.paramUrl, function(response) {
                        $scope.tableLoader              = false;
                        $scope.specialityserviceList    = response.data;
                        var data                        = response.data;
                        $scope.totalCount               = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                }
            });
        };
        /** 
        * Specialty list
        * Created By Suman Chakraborty
        * last modified on 09-09-2017
        */
        $scope.getSpecialityServiceList = function() {
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                // counts: [], uncomment to hide pager
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl                 = params.url();
                    $scope.tableLoader              = true;
                    $scope.specialityserviceList    = [];
                    var paramUrl                    = $scope.paramUrl;
                    paramUrl.id                     = $state.params.id
                    specialityService.getSpecialityServiceList().save(paramUrl, function(response, err) {
                        if (response.code == 200) {
                            $scope.tableLoader              = false;
                            $scope.specialityserviceList    = response.data;
                            var data                        = response.data;
                            $scope.totalCount               = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }
            });
        }

        $scope.specialityServiceDelete = function(id) {
            swal({
                    title: "Are you sure?",
                    text: "It will remove service from the speciality!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        var serviceData = {};
                        serviceData.id  = id;
                        specialityService.specialityServiceDelete().save(serviceData, function(response) {
                            if (response.code == 200) {
                                swal("Deleted!", "Service has been deleted.", "success");
                                $scope.getSpecialityList();
                                $state.go('speciality');
                            } else {
                                swal("Deleted!", "Service not deleted try again.", "error");
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        $scope.specialityServiceStatus = function(id, item) {
            var userArr = { 'id': id, 'status': item === '1' ? '0' : '1' };
            specialityService.specialityServiceStatus().save(userArr, function(response) {
                if (response.code == 200) {
                    logger.logSuccess(item === '1' ? 'Service deactivated successfully.' : 'Service activated successfully.');
                    $state.reload('specialityServiceList');
                } else {
                    logger.logError(response.message);
                }
            })
        }

        $scope.changeStatus = function (id, item) {
            $rootScope.loading = true;
            var specialityArr = {
                'id': id,
                'sendPtRef': item === '1' ? '0' : '1'
            };
            specialityService.updatePatientNotificationStatus().save(specialityArr, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    logger.logSuccess(item === '1' ? 'Patient Notification deactivated successfully.' : 'Patient Notification activated successfully.');
                    $state.reload('speciality');
                } else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            })
        }

    }
]);