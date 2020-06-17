"use strict";

angular.module("faq")

nwdApp.controller("faqController", [
    '$scope',
    '$rootScope',
    '$sessionStorage',
    '$location',
    'logger',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParams',
    '$filter',
    'faqService',
    function(
        $scope,
        $rootScope,
        $sessionStorage,
        $location,
        logger,
        $state,
        $stateParams,
        ngTableParamsService,
        ngTableParams,
        $filter,
        faqService
    ){
        $scope.currentPage          = 1;
        $scope.itemPerPage          = 10;
        $scope.btnTitle             = 'Add';
        $scope.pageTitle            = 'Add FAQ';
        $scope.loading              = false;  
        $scope.faqPages             = faqPages;      
        
        $scope.data;

        /**
         * searching on FAQ listing page
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
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
                    $scope.tableLoader  = true;
                    $scope.dataList     = [];
                    faqService.getFaqList().save($scope.paramUrl, function(response) {
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
         * Get all faq list
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.getfaqList = function() {
            $scope.pageTitle = 'Faq List';
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.dataList     = [];
                    faqService.getFaqList().save($scope.paramUrl, function(response, err) {
                        if (response.code == 200) {
                            $scope.tableLoader  = false;
                            $scope.dataList     = response.data;
                            var data            = response.data;
                            $scope.totalCount   = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }
            });
        }
        /**
         * Add Faq
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.addFaq = function(data) {
            $rootScope.loading = true;
            faqService.addFaq().save(data, function(response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    logger.logSuccess(response.message);
                    $state.go('faq', {}, {reload: true});
                } else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            })
        }

        /**
         * Get faq by Id
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.getFaq = function() {
            if ($state.params.id) {
                $rootScope.loading = true;
                $scope.btnTitle     = 'Update';
                $scope.pageTitle    = 'Update Faq';
                faqService.getFaq().get({ id: $state.params.id }, function(response) {
                    if (response.code == 200) {
                        $rootScope.loading = false;                        
                        $scope.faq = response.data;   
                    } else {
                        $rootScope.loading = false;
                        logger.logError(response.message);
                    }
                })
            }
        }
        /**
         * delete faq
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.deleteFaq = function(id) {
            swal({
                    title: "Are you sure?",
                    text: "Are you sure to remove this faq!",
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
                        faqService.deleteFaq().save(serviceData, function(response) {
                            if (response.code == 200) {
                                swal("Deleted!", "Faq has been deleted.", "success");
                                $scope.getfaqList();
                            } else {
                                swal("Deleted!", "Unable to delete faq. Please try again.", "error");
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        } 
         
    }
]);