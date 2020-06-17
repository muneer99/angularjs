"use strict";

angular.module("Services")

nwdApp.controller("serviceController", ['$scope', '$rootScope', '$sessionStorage', '$location', 'HomeService', 'servicesService', 'specialityService', 'logger', 'logProvider', '$state', '$stateParams', 'ngTableParamsService', 'ngTableParams', '$filter',
    function($scope, $rootScope, $sessionStorage, $location, HomeService, servicesService, specialityService, logger, logProvider, $state, $stateParams, ngTableParamsService, ngTableParams, $filter) {
        $scope.counts                   = {};
        $scope.doctor                   = {};
        $scope.currentPage              = 1;
        $scope.itemPerPage              = 10;
        $scope.disabled                 = false;
        $scope.ServicesData             = {};
        $scope.ServicesData.speciality  = {};
        $scope.menuServices             = ['services', 'addServices', 'editServices'];
        var localData                   = JSON.parse(sessionStorage.getItem('test'));
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
                    $scope.tableLoader = true;
                    $scope.serviceList = [];
                    servicesService.getServiceList().save($scope.paramUrl, function(response) {
                        $scope.tableLoader  = false;
                        $scope.serviceList  = response.data;
                        var data            = response.data;
                        $scope.totalCount   = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                }
            });
        };

        /**
        * Service list
        */
        $scope.getServiceList = function() {
            var actvLog = {userId:localData._id, type: 4, detail: 'View service list'};
            ngTableParamsService.set('', '', '', '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.serviceList  = [];
                    servicesService.getServiceList().save($scope.paramUrl, function(response, err) {
                        if (response.code == 200) {
                            actvLog.success     = true;
                            logProvider.addUserActivity().save(actvLog, function(res){});
                            $scope.tableLoader  = false;
                            $scope.serviceList  = response.data;
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
        * add services
        */
        $scope.addServices = function(serviceData) {
            var actvLog = {userId:localData._id, type: 5, detail: 'Add new service'};
            servicesService.addServices().save(serviceData, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess('Service has been added to network');
                    $state.go('services');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /**
        * Delete service
        */
        $scope.deleteService = function(id) {
            var actvLog = {userId:localData._id, type: 13, detail: 'Delete service'};
            swal({
                    title: "Are you sure?",
                    text: "It will remove Service from the network!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        var serviceData = {};
                        serviceData.id = id;
                        servicesService.deleteService().save(serviceData, function(response) {
                            if (response.code == 200) {
                                actvLog.success=true;
                                logProvider.addUserActivity().save(actvLog, function(res){});
                                swal("Deleted!", "Service has been deleted.", "success");
                                $scope.getServiceList();
                            } else {
                                logProvider.addUserActivity().save(actvLog, function(res){});
                                swal("Deleted!", "Unable to delete service. Please try again.", "error");
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }
        /**
        * Get service details by ID
        */
        $scope.getServiceById = function() {
            var actvLog = {userId:localData._id, type: 4, detail: 'View service detail'};
            servicesService.getServiceById().get({ id: $state.params.id }, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    $scope.editService = response.data;
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /**
        * Update service details
        */
        $scope.updateService = function(updateService) {
            var actvLog = {userId:localData._id, type: 6, detail: 'Update service detail'};
            servicesService.updateServicesService().save(updateService, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess(response.message);
                    // $state.go('services');
                    $state.go('services', {}, {reload: true});
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /**
        * Change service status
        */
        $scope.changeStatus = function(id, item) {
            var actvLog = {userId:localData._id, type: 6, detail: 'Update service status'};
            var userArr = { 'id': id, 'status': item === '1' ? '0' : '1' };
            servicesService.updateServiceStatus().save(userArr, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess(item === '1' ? 'Service deactivated successfully.' : 'Service activated successfully.');
                    $state.reload('services');
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }

        $scope.routeToAddService = function(id) {
            $location.path('/speciality/addService/' + id);
        }

        /**
        * Get specialty names 
        * last modified on 3-09-2017
        */
        $scope.getSpecialityNames = function() {
            $scope.specialityNames = []
            servicesService.getSpecialityNames().get({}, function(response) {
                if (response.code == 200) {
                    $scope.specialityNames = response.data;
                } else {
                    logger.logError('Internal error');

                }
            })
        }
    }
]);