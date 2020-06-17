"use strict";

angular.module("hospital")

nwdApp.controller("hospitalController", [
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
    'hospitalService',
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
        hospitalService
    ){
        $scope.currentPage          = 1;
        $scope.itemPerPage          = 10;
        $scope.btnTitle             = 'Add';
        $scope.pageTitle            = 'Add Hospital';
        $scope.loading              = false;
        $scope.countryCodes         = countryCodes;
        $scope.hospital             = {};
        $scope.hospital.ccodeFax    = '+1';
        $scope.hospital.ccode       = '+1';
        $scope.states               = states1d;
        $scope.usStates             = stateList;
        $scope.data;

        /**
         * searching on Hospital listing page
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
                    hospitalService.getHospitalList().save($scope.paramUrl, function(response) {
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
         * Get all hospital list
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.gethospitalList = function() {
            $scope.pageTitle = 'Hospital List';
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.dataList     = [];
                    hospitalService.getHospitalList().save($scope.paramUrl, function(response, err) {
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
         * Add Hospital
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.addHospital = function(data) {
            $rootScope.loading = true;
            hospitalService.addHospital().save(data, function(response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    logger.logSuccess(response.message);
                    $state.go('hospital', {}, {reload: true});
                } else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            })
        }

        /**
         * Get hospital by Id
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.getHospital = function() {
            if ($state.params.id) {
                $rootScope.loading = true;
                $scope.btnTitle     = 'Update';
                $scope.pageTitle    = 'Update Hospital';
                hospitalService.getHospital().get({ id: $state.params.id }, function(response) {
                    if (response.code == 200) {
                        $rootScope.loading = false;
                        response.data.ccode = '+1';
                        if(response.data.phone_no){
                            response.data.ccode    = response.data.phone_no.substr(0, response.data.phone_no.length - 10);
                            response.data.phone_no = response.data.phone_no.substr(response.data.phone_no.length - 10);
                        }
                     $scope.hospital = response.data;   
                    } else {
                        $rootScope.loading = false;
                        logger.logError(response.message);
                    }
                })
            }
        }
        /**
         * delete hospital
         * Created By Suman Chakraborty
         * @smartData Enterprises (I) Ltd
         * Created Date 18-12-2017
        */
        $scope.deleteHospital = function(id) {
            swal({
                    title: "Are you sure?",
                    text: "Are you sure to remove this hospital!",
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
                        hospitalService.deleteHospital().save(serviceData, function(response) {
                            if (response.code == 200) {
                                swal("Deleted!", "Hospital has been deleted.", "success");
                                $scope.gethospitalList();
                            } else {
                                swal("Deleted!", "Unable to delete hospital. Please try again.", "error");
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        } 
         /**
         * Import hospital record from excel 
         *  Created By Suman Chakraborty
         *  @smartData Enterprises (I) Ltd
         *  Created Date 19-12-2017
         */
        $scope.$watch('data', function () {
            if ($scope.data && $scope.data.hasOwnProperty('data')) {
                if ($scope.data.hasOwnProperty('ext') && ['xls', 'xlsx'].indexOf($scope.data.ext) > -1) {
                    $scope.loading = true;
                    // Check if the file is not empty or no data fetched from the file
                    if ($scope.data.data.length > 0) {
                        var re          = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        var saveCount   = 0;
                        var errorCount  = 0;
                        hospitalService.addHospital().save($scope.data.data, function (response) {
                            $scope.loading = false;
                            if(response.code === 200){
                                logger.logSuccess(response.count + ' record(s) imported successfully.');
                                $state.reload('hospital');
                            }else{
                                logger.logError(response.message);
                            }
                        })
                    } else {
                        $scope.loading = false;
                        logger.logError('No records found. Please follow the sample file given and try again...');
                    }
                } else {
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file. ');
                }
            } else {
                $scope.loading = false;
                if ($scope.loading) {
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file.');
                }
            }
        });
    }
])

.directive("fileread", [function () {
    return {
        scope: {
            opts: '='
        },
        link: function (scope, $elm, $attrs) {
            $elm.on('change', function (changeEvent) {
                var fileType = $elm[0].value.split('.');
                var ext = fileType[fileType.length - 1].toLowerCase();
                if (['xlsx', 'xls'].indexOf(ext) > -1) {
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        scope.$apply(function () {
                            var data = evt.target.result;
                            var workbook = XLSX.read(data, {
                                type: 'binary'
                            });
                            var headerNames = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                                header: 1
                            })[0];
                            var data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                            scope.opts = {
                                data: data,
                                ext: ext
                            };
                        });
                    };
                    reader.readAsBinaryString(changeEvent.target.files[0]);
                } else {
                }
            });
        }
    }
}]);