"use strict";

angular.module("Insurance")

nwdApp.controller("insuranceController", [
    '$scope',
    '$rootScope',
    '$sessionStorage',
    '$location',
    'logger',
    'logProvider',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParams',
    '$filter',
    'insuranceService',
    function(
        $scope,
        $rootScope,
        $sessionStorage,
        $location,
        logger,
        logProvider,
        $state,
        $stateParams,
        ngTableParamsService,
        ngTableParams,
        $filter,
        insuranceService
    ) {
        $scope.currentPage  = 1;
        $scope.itemPerPage  = 10;
        $scope.btnTitle     = 'Add';
        $scope.pageTitle    = 'Add Insurance Network';
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;

        /**
        searching on listing page
        Created By Suman Chakraborty
        Last modified on 11-09-2017
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
                    $scope.dataList = [];
                    insuranceService.getNetworkList().save($scope.paramUrl, function(response) {
                        $scope.tableLoader  = false;
                        $scope.dataList     = response.data;
                        var data            = response.data;
                        $scope.totalCount   = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                }
            });
        };
        /**
        Get all insurance list
        Created By Suman Chakraborty
        Last modified on 28-11-2017
        */
        $scope.getNetworkList = function() {
            var actvLog = { type: 4, detail: 'View insurance network list', userId: $scope.frontDeskAcc };
            $scope.pageTitle = 'Insurance List';
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.tableLoader = true;
                    $scope.dataList = [];
                    insuranceService.getNetworkList().save($scope.paramUrl, function(response, err) {
                        if (response.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function(res){});
                            $scope.tableLoader  = false;
                            $scope.dataList     = response.data;
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
        Add Insurance provider
        Created By Suman Chakraborty
        Last modified on 28-11-2017
        */
        $scope.addNetwork = function(data) {
            var actvLog = { type: 5, detail: 'Add insurance network list', userId: $scope.frontDeskAcc };
            data.verified = false;
            insuranceService.addNetwork().save(data, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess(response.message);
                    $state.go('insurance', {}, {reload: true});
                } else {
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logError(response.message);
                }
            })
        }
        /**
        delete record by ID
        Created By Suman Chakraborty
        Last modified on 13-09-2017
        */
        $scope.deleteNetwork = function(id) {
            swal({
                    title: "Are you sure?",
                    text: "Are you sure to remove this network!",
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
                        insuranceService.deleteNetwork().save(serviceData, function(response) {
                            if (response.code == 200) {
                                swal("Deleted!", "Service has been deleted.", "success");
                                $scope.getNetworkList();
                            } else {
                                swal("Deleted!", "Unable to delete service. Please try again.", "error");
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }
        /**
        Get data by ID
        Created By Suman Chakraborty
        Last modified on 12-09-2017
        */
        $scope.getNetwork = function() {
            if ($state.params.id) {
                $scope.btnTitle = 'Update';
                $scope.pageTitle = 'Update Insurance Network';
                insuranceService.getNetwork().get({ id: $state.params.id }, function(response) {
                    if (response.code == 200) {
                        $scope.network = response.data[0];
                    } else {
                        logger.logError(response.message);
                    }
                })
            }
        }
    }
]);