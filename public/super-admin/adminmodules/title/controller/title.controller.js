"use strict";

angular.module("Title")

nwdApp.controller("titleController", [
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
    'titleService',
    'doctorService',
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
        titleService,
        doctorService
    ) {
        $scope.currentPage  = 1;
        $scope.itemPerPage  = 10;
        $scope.btnTitle     = 'Add';
        $scope.pageTitle    = 'Add Title / Degree';
        $scope.title        = {}; 
        var localData       = JSON.parse(sessionStorage.getItem('test'));

        /**
        searching on listing page
        Created By Suman Chakraborty
        Last modified on 11-09-2017
        */
        $scope.searchable = function(searchTextField) {
            ngTableParamsService.set('', '10', searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    if (searchTextField) {
                        $scope.paramUrl.searchText = searchTextField;
                    }
                    $scope.tableLoader  = true;
                    $scope.dataList     = [];
                    titleService.getTitleList().save($scope.paramUrl, function(response) {
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
        Last modified on 01-12-2017
        */
        $scope.getTitleList = function() {
            var actvLog         = {userId:localData._id, type: 4, detail: 'View title / degree list'};
            $scope.pageTitle    = 'Title / Degree List';
            ngTableParamsService.set('', '10', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.dataList     = [];
                    titleService.getTitleList().save($scope.paramUrl, function(response, err) {
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
        Last modified on 01-12-2017
        */
        $scope.addTitle = function(data) {
            var actvLog = {userId:localData._id, type: 5, detail: 'Add title / degree'};
            if(data.hasOwnProperty('_id') && data._id!=''){
                actvLog.detail  = 'Update title / degree';
                actvLog.type    = 6;
            }
            titleService.addTitle().save(data, function(response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function(res){});
                    logger.logSuccess(response.message);
                    $state.go('title', {}, {reload: true});
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
        $scope.deleteTitle = function(id) {
            swal({
                    title               : "Are you sure?",
                    text                : "Are you sure to remove this title / degree!",
                    type                : "warning",
                    showCancelButton    : true,
                    confirmButtonColor  : "#DD6B55",
                    confirmButtonText   : "Yes, delete it!",
                    closeOnConfirm      : false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        var serviceData = {};
                        serviceData.id  = id;
                        titleService.deleteTitle().save(serviceData, function(response) {
                            if (response.code == 200) {
                                logProvider.addUserActivity().save({userId:localData._id, type: 13, success: true, detail: 'Delete title/degree'}, function(res){});
                                swal("Deleted!", "Title / Degree has been deleted.", "success");
                                $scope.getNetworkList();
                            } else {
                                logProvider.addUserActivity().save({userId:localData._id, type: 13, detail: 'Delete insurance network'}, function(res){});
                                swal("Deleted!", "Unable to delete title / degree. Please try again.", "error");
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
        Last modified on 01-12-2017
        */
        $scope.getTitle = function() {
            var actvLog = {userId:localData._id, type: 4, detail: 'View title / degree detail'};
            if ($state.params.id) {
                $scope.btnTitle     = 'Update';
                $scope.pageTitle    = 'Update Title / Degree';
                titleService.getTitle().get({ id: $state.params.id }, function(response) {
                    if (response.code == 200) {
                        actvLog.success = true;
                        logProvider.addUserActivity().save(actvLog, function(res){});
                        $scope.title = response.data[0];
                    } else {
                        logProvider.addUserActivity().save(actvLog, function(res){});
                        logger.logError(response.message);
                    }
                })
            }
        }

    

    }
]);