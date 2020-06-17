"use strict";
angular.module("doctors", ['gm'])
nwdApp.controller("doctorController", [
    '$scope',
    '$window',
    '$rootScope',
    '$sessionStorage',
    '$location',
    'HomeService',
    'doctorService',
    'logger',
    'logProvider',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParamsServiceProviderSearch',
    'ngTableParams',
    '$filter',
    'insuranceService',
    'titleService',
    'getPhone',
    function ($scope, $window, $rootScope, $sessionStorage, $location, HomeService, doctorService, logger, logProvider, $state, $stateParams, ngTableParamsService, ngTableParamsServiceProviderSearch, ngTableParams, $filter, insuranceService, titleService, getPhone) {
        $scope.doctorPage = 'mainDoctorPage';
        $scope.counts = {};
        $scope.doctor = {};
        $scope.doctor.emailtype = 'all';
        $scope.data = {};
        $scope.nonRegData = {};
        $scope.baseUrl = baseUrl;
        $scope.currentPage = 1;
        $scope.itemPerPage = 10;
        $scope.disabled = false;
        $scope.loading = false;
        $scope.countryCodes = countryCodes;
        $scope.degreeArr = {};
        var localData = JSON.parse(sessionStorage.getItem('test'));
        $scope.officeId = localData._id;
        var pt = this;
        $scope.states = states1d;
        //$scope.degree           = degreeForExcel;
        $scope.usStates = stateList;
        $scope.selecnetwork = '';
        $scope.fileName = "Providers-list";

        var socket = io();
        socket.on('broadcast', function (data) {
            logger.logSuccess(data);
            $scope.$apply(function () {
                $scope.getNonRegDocs();
                $scope.loading = false;
            });
        });

        $scope.activationMessage = function () {
            $scope.parmas = $location.search();
            $scope.success = $scope.parmas.success;
        }

        $scope.getCounts = function () {
            HomeService.getCounts().get(function (response) {
                if (response.code == 200) {
                    $scope.counts = response.data;
                }
            });
        }
        $scope.resetSearch = function () {
            $scope.doctor = {};
            $scope.searchable('');
        }

        $scope.resetSearchPrefRating = function () {
            $scope.doctor = {};
            $scope.searchablePrefRating('');
        }


        /**
               * Advance search in non reg docs listing page
               * Created By Suman Chakraborty
               * Last modified on 26-10-2017
        */

        
        $scope.searchableNonReg = function (searchObj) {
            // console.log(" herer searchable", searchObj);
            $scope.doctor.searchTextField = searchObj.searchTextField;

            $scope.doctor.specialty = searchObj.specialty != undefined ? searchObj.specialty : undefined;
            // $scope.doctor.specialty.selected = {_id: searchObj.specialty};
            $scope.doctor.network = searchObj.network != undefined ? searchObj.network : undefined;
            ngTableParamsServiceProviderSearch.set('', '', $scope.doctor.searchTextField, $scope.doctor.specialty, $scope.doctor.network, '');


            //ngTableParamsService.set('', '', searchObj.searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                getData: function ($defer, params) {
                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), searchObj.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    //ngTableParamsServiceProviderSearch.set(params.page(), params.count(), searchObj.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.superAdminReq = true;
                    if (searchObj.searchTextField) {
                        $scope.paramUrl.searchText = searchObj.searchTextField;
                    }
                    if (typeof searchObj.service !== 'undefined' && searchObj.service.length > 0) {
                        $scope.paramUrl.service = searchObj.service;
                    }
                    if (typeof searchObj.specialty !== 'undefined' && searchObj.specialty.length > 0) {
                        $scope.paramUrl.specialty = searchObj.specialty;
                        //$scope.paramUrl.searchText2 = searchObj.searchTextField2;
                    }
                    if (typeof searchObj.network !== 'undefined' && searchObj.network.length > 0) {
                        $scope.paramUrl.network = searchObj.network;
                        //$scope.paramUrl.searchText3 = searchObj.searchTextField3;
                    }

                    $scope.paramUrl.emailtype = searchObj.emailtype;
                    $scope.tableLoader = true;
                    $scope.docList = [];
                    doctorService.getNonRegDocs().save($scope.paramUrl, function (response) {
                        $scope.tableLoader = false;
                        // show only one specialty as per new rule there will be one specialty for each doctor
                        if (response.code === 200) {

                            // response.data.forEach(function (item, index) {
                            //     var createdBy = '-';
                            //     if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0) {
                            //         createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                            //     }
                            //     response.data[index]['created_by'] = createdBy;
                            // })
                        }
                        $scope.docList = response.data;
                        var data = response.data;
                        $scope.totalCount = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                    setTimeout(function () {
                        $scope.excelNonRegProvExport($scope.paramUrl);
                    }, 1000);
                }
            });
        };

        /**
        * View non reg provider listing 
        * Created By Suman Chakraborty
        * Last modified on 28-11-2017
        */
        var getData = ngTableParamsServiceProviderSearch.get();
        $scope.doctor.searchTextField = getData.searchText;
        if (getData.searchText2 != undefined) {
            $scope.doctor.specialty = getData.searchText2;

        }
        if (getData.searchText3 != undefined) {
            $scope.doctor.network = getData.searchText3;

        }

        $scope.getNonRegDocs = function (searchTextField) { //searchTextField
            // $scope.getNonRegDocs = function (searchObj) { //searchTextField
            //console.log(" here getNonRegDocs ", searchTextField);
            //$scope.doctor.searchTextField = searchTextField.searchTextField;
            //ngTableParamsService.set('', 50, searchTextField, '');
            var actvLog = { userId: localData._id, type: 4, detail: 'View Outside provider list' };
            ngTableParamsServiceProviderSearch.set('', 50, undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                // counts: [], uncomment to hide pager
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.superAdminReq = true;

                    $scope.tableLoader = true;
                    //$scope.doctorList = [];
                    $scope.docList = [];

                    if ($scope.paramUrl.hasOwnProperty('sorting[_id]')) {
                        delete $scope.paramUrl['sorting[_id]'];
                        $scope.paramUrl['sorting[firstLogin]'] = -1;
                    }
                    if ($scope.doctor.searchTextField) {
                        $scope.paramUrl.searchText = $scope.doctor.searchTextField;
                    }
                    if (typeof $scope.doctor.specialty !== 'undefined' && $scope.doctor.specialty.length > 0) {
                        $scope.paramUrl.specialty = $scope.doctor.specialty;
                        //$scope.paramUrl.searchText2 = searchObj.searchTextField2;
                    }
                    if (typeof $scope.doctor.network !== 'undefined' && $scope.doctor.network.length > 0) {
                        $scope.paramUrl.network = $scope.doctor.network;
                        //$scope.paramUrl.searchText3 = searchObj.searchTextField3;
                    }
                   // console.log(" scope.paramUrl ", $scope.paramUrl);
                    doctorService.getNonRegDocs().save($scope.paramUrl, function (response, err) {
                       // console.log(" getNonRegDocs response ",response);
                        if (response.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            // show only one specialty as per new rule there will be one specialty for each doctor

                            // response.data.forEach(function (item, index) {
                            //     var createdBy = '-'; var fromSvpFname = ""; var fromSvpLname = ""; var fromSvpDegree = ""; var fromSvpCenter = "";
                            //     if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0 && item.created_by[0]['createdByInfo'][0]['userType'] === 'user') {
                            //         createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                            //         fromSvpFname = item.created_by[0]['createdByInfo'][0]['firstname'];
                            //         fromSvpLname = item.created_by[0]['createdByInfo'][0]['lastname'];
                            //         fromSvpDegree = item.created_by[0]['createdByInfo'][0]['degree'];
                            //         fromSvpCenter = item.created_by[0]['createdByInfo'][0]['centername'];
                            //     }
                            //     response.data[index]['created_by'] = createdBy;

                            //     response.data[index]['fromSvpFname'] = fromSvpFname;
                            //     response.data[index]['fromSvpLname'] = fromSvpLname;
                            //     response.data[index]['fromSvpDegree'] = fromSvpDegree;
                            //     response.data[index]['fromSvpCenter'] = fromSvpCenter;

                            // })
                            $scope.tableLoader = false;
                            // $scope.doctorList = response.data;
                            $scope.docList = response.data;
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                            //console.log(" params ",params);
                        } else {
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(response.message);
                        }
                    });
                    setTimeout(function () {
                        $scope.excelNonRegProvExport($scope.paramUrl);
                    }, 1000);

                }
            });

            // $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            //     getData: function ($defer, params) {
            //         ngTableParamsService.set(params.page(), params.count(), searchTextField, params.sorting());
            //         $scope.paramUrl = params.url();
            //         if (searchTextField) {
            //             $scope.paramUrl.searchText = searchTextField;
            //         } else {
            //             $scope.searchTextField = '';
            //         }
            //         $scope.tableLoader = true;
            //         $scope.docList = [];
            //         doctorService.getNonRegDocs().save($scope.paramUrl, function (response) {
            //             $scope.tableLoader = false;
            //             $scope.docList = response.data;
            //             var data = response.data;
            //             $scope.totalCount = response.totalCount;
            //             params.total(response.totalCount);
            //             $defer.resolve(data);
            //         });
            //         setTimeout(function () {
            //             $scope.excelNonRegProvExport($scope.paramUrl);
            //         }, 1000);
            //     }
            // });
        }

        $scope.getNonDocById = function () {

            $rootScope.loading = true;
            doctorService.getNonDocById().get({
                id: $state.params.id

            }, function (response) {
                if (response.code == 200) {
                    if (response.data.cell_phone) {
                        response.data.ccode = getPhone.ccode(response.data.cell_phone);
                        response.data.cell_phone = getPhone.phone(response.data.cell_phone);
                    }
                    if (response.data.fax) {
                        response.data.ccodeFax = getPhone.ccode(response.data.fax);
                        response.data.fax = getPhone.phone(response.data.fax);
                    }
                    $rootScope.loading = false;
                    $scope.doctor = response.data;

                } else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            })
        }
        $scope.updateNonRegDoc = function (user) {
            $rootScope.loading = true;
            doctorService.updateNonRegDoc().save(user, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    logger.logSuccess(response.message);
                    $state.go('nonRegDocs');
                } else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Advance search in listing page
        * Created By Suman Chakraborty
        * Last modified on 26-10-2017
        */
        $scope.searchable = function (searchObj) {
            //console.log(" herer searchable", searchObj);
            $scope.doctor.searchTextField = searchObj.searchTextField;

            $scope.doctor.specialty = searchObj.specialty != undefined ? searchObj.specialty : undefined;
            // $scope.doctor.specialty.selected = {_id: searchObj.specialty};
            $scope.doctor.network = searchObj.network != undefined ? searchObj.network : undefined;
            ngTableParamsServiceProviderSearch.set('', '', $scope.doctor.searchTextField, $scope.doctor.specialty, $scope.doctor.network, '');


            //ngTableParamsService.set('', '', searchObj.searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                getData: function ($defer, params) {
                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), searchObj.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    //ngTableParamsServiceProviderSearch.set(params.page(), params.count(), searchObj.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.superAdminReq = true;
                    if (searchObj.searchTextField) {
                        $scope.paramUrl.searchText = searchObj.searchTextField;
                    }
                    if (typeof searchObj.service !== 'undefined' && searchObj.service.length > 0) {
                        $scope.paramUrl.service = searchObj.service;
                    }
                    if (typeof searchObj.specialty !== 'undefined' && searchObj.specialty.length > 0) {
                        $scope.paramUrl.specialty = searchObj.specialty;
                        //$scope.paramUrl.searchText2 = searchObj.searchTextField2;
                    }
                    if (typeof searchObj.network !== 'undefined' && searchObj.network.length > 0) {
                        $scope.paramUrl.network = searchObj.network;
                        //$scope.paramUrl.searchText3 = searchObj.searchTextField3;
                    }
                    
                    $scope.paramUrl.isRegistered = true; //for only registered list Task#614

                    $scope.paramUrl.emailtype = searchObj.emailtype;
                    $scope.tableLoader = true;
                    $scope.doctorList = [];
                    doctorService.getDoctorsList().save($scope.paramUrl, function (response) {
                        $scope.tableLoader = false;
                        // show only one specialty as per new rule there will be one specialty for each doctor
                        if (response.code === 200) {

                            // response.data.forEach(function (item, index) {
                            //     var createdBy = '-';
                            //     if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0) {
                            //         createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                            //     }
                            //     response.data[index]['created_by'] = createdBy;
                            // })
                        }
                        $scope.doctorList = response.data;
                        var data = response.data;
                        $scope.totalCount = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                    setTimeout(function () {
                        $scope.excelExport($scope.paramUrl);
                    }, 1000);
                }
            });
        };

        $scope.searchablePrefRating = function (searchObj) {
            ngTableParamsService.set('', '', searchObj.searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchObj.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.superAdminReq = true;
                    if (searchObj.searchTextField) {
                        $scope.paramUrl.searchText = searchObj.searchTextField;
                    }

                    if (typeof searchObj.specialty !== 'undefined' && searchObj.specialty.length > 0) {
                        $scope.paramUrl.specialty = searchObj.specialty;
                    }
                    if (typeof searchObj.network !== 'undefined' && searchObj.network.length > 0) {
                        $scope.paramUrl.network = searchObj.network;
                    }

                    if (searchObj.location !== 'undefined' && typeof searchObj.user_loc !== 'undefined' && searchObj.user_loc.length > 0) {
                        $scope.paramUrl.user_loc = searchObj.user_loc;
                        $scope.paramUrl.range = 50;
                    }

                    $scope.paramUrl.emailtype = searchObj.emailtype;
                    $scope.tableLoader = true;
                    $scope.doctorList = [];
                    doctorService.getDoctorRatingList().save($scope.paramUrl, function (response) {
                        $scope.tableLoader = false;
                        // show only one specialty as per new rule there will be one specialty for each doctor
                        if (response.code === 200) {

                        }
                        $scope.doctorList = response.data;
                        var data = response.data;
                        $scope.totalCount = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                    setTimeout(function () {
                        $scope.excelExportRating($scope.paramUrl);
                    }, 1000);
                }
            });
        };


        /**
        * View provider listing 
        * Created By Suman Chakraborty
        * Last modified on 28-11-2017
        */
        var getData = ngTableParamsServiceProviderSearch.get();
        $scope.doctor.searchTextField = getData.searchText;
        if (getData.searchText2 != undefined) {
            $scope.doctor.specialty = getData.searchText2;

        }
        if (getData.searchText3 != undefined) {
            $scope.doctor.network = getData.searchText3;

        }

        /**
        * Get doctor's list for listing page
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        // $scope.getDoctorsList = function () {
        //     //console.log(" getDoctorsList ");
        //     var actvLog = { userId: localData._id, type: 4, detail: 'View provider list' };
        //     ngTableParamsServiceProviderSearch.set('', 50, undefined, '');
        //     $scope.tableParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
        //         // counts: [], uncomment to hide pager
        //         getData: function ($defer, params) {
        //             // send an ajax request to your server. in my case MyResource is a $resource.
        //             ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
        //             $scope.paramUrl = params.url();
        //             $scope.paramUrl.superAdminReq = true;

        //             $scope.tableLoader = true;
        //             $scope.doctorList = [];

        //             if ($scope.paramUrl.hasOwnProperty('sorting[_id]')) {
        //                 delete $scope.paramUrl['sorting[_id]'];
        //                 $scope.paramUrl['sorting[firstLogin]'] = -1;
        //             }
        //             if ($scope.doctor.searchTextField) {
        //                 $scope.paramUrl.searchText = $scope.doctor.searchTextField;
        //             }
        //             if (typeof $scope.doctor.specialty !== 'undefined' && $scope.doctor.specialty.length > 0) {
        //                 $scope.paramUrl.specialty = $scope.doctor.specialty;
        //                 //$scope.paramUrl.searchText2 = searchObj.searchTextField2;
        //             }
        //             if (typeof $scope.doctor.network !== 'undefined' && $scope.doctor.network.length > 0) {
        //                 $scope.paramUrl.network = $scope.doctor.network;
        //                 //$scope.paramUrl.searchText3 = searchObj.searchTextField3;
        //             }

        //             $scope.paramUrl.isRegistered = true; //for only registered list Task#614

        //             doctorService.getDoctorsList().save($scope.paramUrl, function (response, err) {
        //                 if (response.code == 200) {
        //                     actvLog.success = true;
        //                     logProvider.addUserActivity().save(actvLog, function (res) { });
        //                     // show only one specialty as per new rule there will be one specialty for each doctor

        //                     response.data.forEach(function (item, index) {
        //                         var createdBy = '-'; var fromSvpFname = ""; var fromSvpLname = ""; var fromSvpDegree = ""; var fromSvpCenter = "";
        //                         if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0 && item.created_by[0]['createdByInfo'][0]['userType'] === 'user') {
        //                             createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
        //                             fromSvpFname = item.created_by[0]['createdByInfo'][0]['firstname'];
        //                             fromSvpLname = item.created_by[0]['createdByInfo'][0]['lastname'];
        //                             fromSvpDegree = item.created_by[0]['createdByInfo'][0]['degree'];
        //                             fromSvpCenter = item.created_by[0]['createdByInfo'][0]['centername'];
        //                         }
        //                         response.data[index]['created_by'] = createdBy;

        //                         response.data[index]['fromSvpFname'] = fromSvpFname;
        //                         response.data[index]['fromSvpLname'] = fromSvpLname;
        //                         response.data[index]['fromSvpDegree'] = fromSvpDegree;
        //                         response.data[index]['fromSvpCenter'] = fromSvpCenter;

        //                     })
        //                     $scope.tableLoader = false;
        //                     $scope.doctorList = response.data;
        //                     var data = response.data;
        //                     $scope.totalCount = response.totalCount;
        //                     params.total(response.totalCount);
        //                     $defer.resolve(data);
        //                 } else {
        //                     logProvider.addUserActivity().save(actvLog, function (res) { });
        //                     logger.logError(response.message);
        //                 }
        //             });
        //             setTimeout(function () {
        //                 $scope.excelExport($scope.paramUrl);
        //             }, 1000);

        //         }
        //     });
        // }

        $scope.getDoctorsList = function () {
          //  console.log(" getDoctorsList ");
            var actvLog = { userId: localData._id, type: 4, detail: 'View provider list' };
            ngTableParamsServiceProviderSearch.set('', 50, undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                // counts: [], uncomment to hide pager
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.superAdminReq = true;

                    $scope.tableLoader = true;
                    $scope.doctorList = [];

                    if ($scope.paramUrl.hasOwnProperty('sorting[_id]')) {
                        delete $scope.paramUrl['sorting[_id]'];
                        $scope.paramUrl['sorting[firstLogin]'] = -1;
                    }
                    if ($scope.doctor.searchTextField) {
                        $scope.paramUrl.searchText = $scope.doctor.searchTextField;
                    }
                    if (typeof $scope.doctor.specialty !== 'undefined' && $scope.doctor.specialty.length > 0) {
                        $scope.paramUrl.specialty = $scope.doctor.specialty;
                        //$scope.paramUrl.searchText2 = searchObj.searchTextField2;
                    }
                    if (typeof $scope.doctor.network !== 'undefined' && $scope.doctor.network.length > 0) {
                        $scope.paramUrl.network = $scope.doctor.network;
                        //$scope.paramUrl.searchText3 = searchObj.searchTextField3;
                    }

                    $scope.paramUrl.isRegistered = true; //for only registered list Task#614

                    doctorService.getDoctorsList().save($scope.paramUrl, function (response, err) {



                        if (response.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            // show only one specialty as per new rule there will be one specialty for each doctor

                            response.data.forEach(function (item, index) {

                               // console.log("this is the response of data",response.data[index].firstname);

                                var createdBy = '-'; 
                                var fromSvpFname = ""; 
                                var fromSvpLname = ""; 
                                var fromSvpDegree = ""; 
                                var fromSvpCenter = "";

                                // if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0 && item.created_by[0]['createdByInfo'][0]['userType'] === 'user') {
                                //     createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                                //     fromSvpFname = item.created_by[0]['createdByInfo'][0]['firstname'];
                                //     fromSvpLname = item.created_by[0]['createdByInfo'][0]['lastname'];
                                //     fromSvpDegree = item.created_by[0]['createdByInfo'][0]['degree'];
                                //     fromSvpCenter = item.created_by[0]['createdByInfo'][0]['centername'];
                                // }
                                response.data[index]['created_by'] = createdBy;

                                response.data[index]['fromSvpFname'] = fromSvpFname;
                                response.data[index]['fromSvpLname'] = fromSvpLname;
                                response.data[index]['fromSvpDegree'] = fromSvpDegree;
                                response.data[index]['fromSvpCenter'] = fromSvpCenter;



                            })
                            $scope.tableLoader = false;
                            $scope.doctorList = response.data;
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(response.message);
                        }
                    });
                    setTimeout(function () {
                        $scope.excelExport($scope.paramUrl);
                    }, 1000);

                }
            });
        }

        $scope.getAvailableServices = function () {

            doctorService.GetServices().save({}, function (response) {
                if (response.code == 200) {
                    $scope.serviceData = response.data;
                } else { }
            })
            doctorService.GetSpecialty().get({}, function (response) {
                if (response.code == 200) {
                    $scope.specialityData = response.data;
                } else { }
            })
            titleService.getTitleList().save({}, function (response) {
                if (response.code == 200) {
                    $scope.degreeArr = response.data;
                    $scope.degreeExcelArr = new Array();
                    response.data.forEach(function (item) {
                        $scope.degreeExcelArr[item.name.toLowerCase().trim()] = item._id;
                    })
                } else { }
            })
            // get all insurance plans 
            insuranceService.getNetwork().get({
                id: '000'
            }, function (response) {
                if (response.code == 200) {
                    //console.log(response.data);
                    $scope.networkData = response.data;
                } else { }
            });
        }

        /**
         * Import doctors record from excel 
         * Created By Suman Chakraborty
         * Last modified on 08-08-2017
         */
        /*$scope.$watch('nonRegData', function () {
            if ($scope.nonRegData.hasOwnProperty('data')) {
                if ($scope.nonRegData.hasOwnProperty('ext') && ['xls', 'xlsx'].indexOf($scope.nonRegData.ext) > -1) {
                    $scope.loading = true;
                    // Check if the file is not empty or no data fetched from the file
                    if ($scope.nonRegData.data.length > 0) {
                        var dataArr = [];
                        $scope.nonRegData.data.forEach(function (item, index) {
                            var networks = [];
                            // Fetch insurance detail map with existing insurance and save corresponding ids
                            if (item.hasOwnProperty('insurance')) {
                                let itemArr = item.insurance.split(',');
                                itemArr.forEach(function (item) {
                                    if (typeof $scope.networkArr[item.toLowerCase()] !== 'undefined') {
                                        networks.push($scope.networkArr[item.toLowerCase()]);
                                    }
                                })
                            }
                            item.cellPhone  = (item.hasOwnProperty('cellPhone') && item.cellPhone.length>=9 ) ? getPhone.ccode(item.cellPhone)+getPhone.phone(item.cellPhone) : '';
                            item.fax        = (item.hasOwnProperty('fax') && item.fax.length>9) ? getPhone.ccode(item.fax)+getPhone.phone(item.fax): '';
                            item.degree     = (item.hasOwnProperty('degree')) ? ($scope.degree.indexOf(item.degree.split('.').join("").toUpperCase())>-1) ? $scope.degree.indexOf(item.degree.split('.').join("").toUpperCase()) : "0" : "0";
                            dataArr.push({
                                'doctorsNPI'    : (item.hasOwnProperty('npi')) ? item.npi : '',
                                'firstname'     : (item.hasOwnProperty('firstname')) ? item.firstname.toLowerCase() : '',
                                'lastname'      : (item.hasOwnProperty('lastname')) ? item.lastname.toLowerCase() : '',
                                'centername'    : (item.hasOwnProperty('centername')) ? item.centername.toLowerCase() : '',
                                'degree'        : item.degree,
                                'email'         : (item.hasOwnProperty('email')) ? item.email : '',
                                'phone_number'  : (item.hasOwnProperty('officephone') && item.officephone.length>9) ? item.officephone : '',
                                'fax'           : item.fax,
                                'cell_phone'    : item.cellPhone,
                                'location'      : (item.hasOwnProperty('address line 1')) ? item['address line 1'] : '',
                                'city'          : (item.hasOwnProperty('city')) ? item.city : '',
                                'state'         : (item.hasOwnProperty('state')) ? $scope.states.hasOwnProperty(item.state.toUpperCase()) ? item.state.toUpperCase() : '' : '',
                                'sute'          : (item.hasOwnProperty('address line 2')) ? item['address line 2'] : '',
                                'zipcode'       : (item.hasOwnProperty('zipcode')) ? item.zipcode : '',
                                'network'       : networks
                            });
                        });
                        doctorService.addNonRegDoc().save(dataArr, function (response) {
                            // error_success count is equal to total data count when all asynchronous execution are completed
                            logger.logSuccess(response.insertCount + ' record(s) imported successfully.');
                            $scope.loading = false;
                            $state.reload('nonRegDocs');
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
        });*/

        $scope.$watch('nonRegData', function () {
            //console.log(" nonRegData ",$scope.nonRegData)
            if ($scope.nonRegData.hasOwnProperty('data')) {
                if ($scope.nonRegData.hasOwnProperty('ext') && ['xls', 'xlsx'].indexOf($scope.nonRegData.ext) > -1) {
                    $scope.loading = true; $scope.uploadComplete = false;
                    // Check if the file is not empty or no data fetched from the file
                    insuranceService.getNetwork().get({
                        id: '000'
                    }, function (response) {
                        if (response.code == 200) {
                            $scope.networkArr = new Array();
                            response.data.forEach(function (item) {
                                $scope.networkArr[item.name.toLowerCase().trim()] = item._id;
                            })
                            $scope.networkData = response.data;
                            //} else { }
                            //});
                            //console.log(" networkArr ", $scope.networkArr);
                            doctorService.GetSpecialty().get(function (response) {
                                if (response.code == 200) {
                                    $scope.specialityArr = new Array();
                                    response.data.forEach(function (item) {
                                        $scope.specialityArr[item.specialityName.toLowerCase().trim()] = item._id;
                                    })

                                    $scope.specialtyData = response.data;
                                    $scope.datalength = response.data.length;
                                    //} else { }
                                    // });
                                    //console.log(" specialityArr ", $scope.specialityArr);

                                    if ($scope.nonRegData.data.length > 0) {
                                        var dataArr = [];

                                        $scope.nonRegData.data.forEach(function (item, index) {
                                            var nonRegDoc = {}; nonRegDoc.degree = ''; var networks = []; var speciality = []; var user_loc = []; var emailAvailable = 1;
                                            // Fetch insurance detail map with existing insurance and save corresponding ids

                                            if (item.hasOwnProperty('Insurance Networks')) {
                                                let itemArr = item['Insurance Networks'].split(',');
                                                itemArr.forEach(function (item) {
                                                    if (typeof $scope.networkArr[item.toLowerCase().trim()] !== 'undefined') {
                                                        networks.push($scope.networkArr[item.toLowerCase().trim()]);
                                                    }
                                                })
                                            }
                                            if (item.hasOwnProperty('Specialty')) {
                                                let itemArr = item['Specialty'].split(',');
                                                itemArr.forEach(function (item) {
                                                    if (typeof $scope.specialityArr[item.toLowerCase().trim()] !== 'undefined') {
                                                        speciality.push($scope.specialityArr[item.toLowerCase().trim()]);
                                                    }
                                                })
                                            }
                                            item['Mobile Number'] = (item.hasOwnProperty('Mobile Number') && item['Mobile Number'].length >= 9) ? getPhone.ccode(item['Mobile Number']) + getPhone.phone(item['Mobile Number']) : '';
                                            item['Fax Number'] = (item.hasOwnProperty('Fax Number') && item['Fax Number'].length > 9) ? getPhone.ccode(item['Fax Number']) + getPhone.phone(item['Fax Number']) : '';

                                            item.Title = (item.hasOwnProperty('Title')) ? (typeof $scope.degreeExcelArr[item.Title.toLowerCase().trim()] !== 'undefined') ? $scope.degreeExcelArr[item.Title.toLowerCase().trim()] : "" : "";

                                            if (item.email) {
                                                emailAvailable = 1;
                                            } else {
                                                item.email = Math.floor(10000 + Math.random() * 90000, new Date().getTime()) + '_temp@wd.com';
                                                emailAvailable = 0;
                                            }

                                            var location = (item.hasOwnProperty('Address Line 1')) ? item['Address Line 1'] : '';
                                            var city = (item.hasOwnProperty('City')) ? item.City : '';
                                            var state = (item.hasOwnProperty('State')) ? $scope.states.hasOwnProperty(item.State.toUpperCase()) ? item.State.toUpperCase() : '' : '';
                                            var zipcode = (item.hasOwnProperty('Zip Code')) ? item['Zip Code'] : '';

                                            nonRegDoc = {
                                                'doctorsNPI': (item.hasOwnProperty('Npi')) ? item.Npi : '',
                                                'firstname': (item.hasOwnProperty('Provider First Name')) ? item['Provider First Name'] : '',
                                                'lastname': (item.hasOwnProperty('Provider Last Name')) ? item['Provider Last Name'] : '',
                                                'centername': (item.hasOwnProperty('Site')) ? item.Site : '',
                                                //'degree'            : item.degree,
                                                'email': (item.hasOwnProperty('Email')) ? item.Email : '',
                                                'emailAvailable': emailAvailable,
                                                'phone_number': (item.hasOwnProperty('Office Phone') && item['Office Phone'].length > 9) ? item['Office Phone'] : '',
                                                'fax': item['Fax Number'],
                                                'cell_phone': item['Mobile Number'],
                                                'location': location,
                                                'city': city,
                                                'state': state,
                                                'sute': (item.hasOwnProperty('Address Line 2')) ? item['Address Line 2'] : '',
                                                'zipcode': zipcode,
                                                'network': networks,
                                                'speciality': speciality,
                                                'user_loc': user_loc
                                        
                                            };

                                            if (item.degree) {
                                                nonRegDoc.degree = item.degree;
                                            }

                                            if (item.Id) {
                                                nonRegDoc._id = item.Id;
                                            }

                                            dataArr.push(nonRegDoc);
                                            //});
                                            //});
                                        });
                                        //console.log(" dataArr -> ", dataArr);
                                        doctorService.addNonRegDoc().save(dataArr, function (response) {
                                            // error_success count is equal to total data count when all asynchronous execution are completed
                                            logger.logSuccess('Record(s) import in progress.');
                                            //$scope.loading = false;
                                            //$state.reload('nonRegDocs');
                                        })

                                    } else {
                                        $scope.loading = false;
                                        logger.logError('No records found. Please follow the sample file given and try again...');
                                    }
                                } //GetSpecialty 200 if end
                                else { logger.logError('No records found. Please follow the sample file given and try again...'); }
                            }); //GetSpecialty end 

                        } // networkarr 200 if end
                        else { logger.logError('No records found. Please follow the sample file given and try again...'); }
                    });// networkarr end

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


        /**
         * Import doctors record from excel 
         * Created By Suman Chakraborty
         * Last modified on 08-08-2017
         */
        /*$scope.$watch('data', function () {
            if ($scope.data.hasOwnProperty('data')) {
                $rootScope.loading = true;
                if ($scope.data.hasOwnProperty('ext') && ['xls', 'xlsx'].indexOf($scope.data.ext) > -1) {
                    $scope.loading = true;
                    // Check if the file is not empty or no data fetched from the file
                    if ($scope.data.data.length > 0) {
                        var re          = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        var saveCount   = 0;
                        var errorCount  = 0;
                        
                        $scope.data.data.forEach(function (item, index) {
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
                                item.cellPhone  = (item.hasOwnProperty('cellPhone') && item.cellPhone.length>9) ? getPhone.ccode(item.cellPhone)+getPhone.phone(item.cellPhone) : '';
                                item.fax        = (item.hasOwnProperty('fax') && item.fax.length>9) ? getPhone.ccode(item.fax)+getPhone.phone(item.fax): '';
                                item.degree     = (item.hasOwnProperty('degree')) ? ($scope.degree.indexOf(item.degree.split('.').join("").toUpperCase())>-1) ? $scope.degree.indexOf(item.degree.split('.').join("").toUpperCase()) : "0" : "0";
                                var docObj      = {
                                                    'doctorsNPI'    : (item.hasOwnProperty('npi')) ? item.npi : '',
                                                    'firstname'     : (item.hasOwnProperty('firstname')) ? item.firstname.toLowerCase() : '',
                                                    'lastname'      : (item.hasOwnProperty('lastname')) ? item.lastname.toLowerCase() : '',
                                                    'centername'    : (item.hasOwnProperty('centername')) ? item.centername.toLowerCase() : '',
                                                    'degree'        : item.degree,
                                                    'email'         : item.email,
                                                    'phone_number'  : (item.hasOwnProperty('officephone') && item.officephone.length>9) ? item.officephone : '',
                                                    'fax'           : item.fax,
                                                    'cell_phone'    : item.cellPhone,
                                                    'location'      : (item.hasOwnProperty('address line 1')) ? item['address line 1'] : '',
                                                    'city'          : (item.hasOwnProperty('city')) ? item.city : '',
                                                    'state'         : (item.hasOwnProperty('state')) ? $scope.states.hasOwnProperty(item.state.toUpperCase()) ? item.state.toUpperCase() : '' : '',
                                                    'sute'          : (item.hasOwnProperty('address line 2')) ? item['address line 2'] : '',
                                                    'zipcode'       : (item.hasOwnProperty('zipcode')) ? item.zipcode : '',
                                                    'network'       : networks
                                                }
                                //console.log(docObj)
                                
                                doctorService.addDoctor().save(docObj, function (response) {
                                    if (response.code == 200) {
                                        saveCount++;
                                    } else {
                                        errorCount++;
                                    }
                                    // error_success count is equal to total data count when all asynchronous execution are completed
                                    if ($scope.data.data.length === saveCount + errorCount) {
                                        $rootScope.loading = false;
                                        logger.logSuccess(saveCount + ' record(s) imported successfully.');
                                        $scope.loading = false;
                                        $rootScope.loading = false;
                                        $state.reload('doctors-list');
                                        
                                    }
                                })
                            } else {
                                errorCount++;
                            }
                        });
                    } else {
                        $rootScope.loading = false;
                        $scope.loading = false;
                        logger.logError('No records found. Please follow the sample file given and try again...');
                    }
                } else {
                    $rootScope.loading = false;
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file. ');
                }
            } else {
                $rootScope.loading = false;
                $scope.loading = false;
                if ($scope.loading) {
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file.');
                }
            }
        });*/

        $scope.$watch('data', function () {
            
            if ($scope.data.hasOwnProperty('data')) {
                $rootScope.loading = true;
                if ($scope.data.hasOwnProperty('ext') && ['xls', 'xlsx'].indexOf($scope.data.ext) > -1) {
                    //console.log(" data excel ");
                    $scope.loading = true;
                    // Check if the file is not empty or no data fetched from the file
                    if ($scope.data.data.length > 0) {
                        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        var saveCount = 0;
                        var errorCount = 0;

                        $scope.data.data.forEach(function (item, index) {
                            var networks = []; var docObj = {}; docObj.degree = ''; var user_loc = [];
                            // Check if email id is present , no other doctor exists with the same email id 
                            if (item.hasOwnProperty('Email') && re.test(item.Email)) {
                                // Fetch insurance detail map with existing insurance and save corresponding ids
                                if (item.hasOwnProperty('Insurance Networks')) {
                                    let itemArr = item['Insurance Networks'].split(',');
                                    itemArr.forEach(function (item) {
                                        if (typeof $scope.networkArr[item.toLowerCase().trim()] !== 'undefined') {
                                            networks.push($scope.networkArr[item.toLowerCase().trim()]);
                                        }
                                    })
                                }
                                item['Mobile Number'] = (item.hasOwnProperty('Mobile Number') && item['Mobile Number'].length > 9) ? getPhone.ccode(item['Mobile Number']) + getPhone.phone(item['Mobile Number']) : '';
                                item['Fax Number'] = (item.hasOwnProperty('Fax Number') && item['Fax Number'].length > 9) ? getPhone.ccode(item['Fax Number']) + getPhone.phone(item['Fax Number']) : '';
                                //item.degree = (item.hasOwnProperty('degree')) ? ($scope.degree.indexOf(item.degree.split('.').join("").toUpperCase()) > -1) ? $scope.degree.indexOf(item.degree.split('.').join("").toUpperCase()) : "0" : "0";
                                item['Title'] = (item.hasOwnProperty('Title')) ? (typeof $scope.degreeExcelArr[item['Title'].toLowerCase().trim()] !== 'undefined') ? $scope.degreeExcelArr[item['Title'].toLowerCase().trim()] : "" : "";

                                if (item.hasOwnProperty('Address Line 1') && item['Address Line 1']) {
                                    //google api stopped Task#611
                                   // doctorService.getLocationId().get({ location: item['Address Line 1'] }, function (response) {
                                        // if (response.code == 200) {
                                        //     var location = (response.data.location) ? response.data.location : (item.hasOwnProperty('Address Line 1')) ? item['Address Line 1'] : '';
                                        //     var city = (response.data.city) ? response.data.city : (item.hasOwnProperty('City')) ? item['City'] : '';
                                        //     var state = (response.data.state) ? response.data.state : (item.hasOwnProperty('State')) ? $scope.states.hasOwnProperty(item.State.toUpperCase()) ? item.State.toUpperCase() : '' : '';
                                        //     var zipcode = (response.data.zipcode) ? response.data.zipcode : (item.hasOwnProperty('Zip Code')) ? item['Zip Code'] : '';
                                        //     var user_loc = (response.data.user_loc) ? response.data.user_loc : []
                                        // } else {
                                            var location = (item.hasOwnProperty('Address Line 1')) ? item['Address Line 1'] : '';
                                            var city = (item.hasOwnProperty('City')) ? item.City : '';
                                            var state = (item.hasOwnProperty('State')) ? $scope.states.hasOwnProperty(item.State.toUpperCase()) ? item.State.toUpperCase() : '' : '';
                                            var zipcode = (item.hasOwnProperty('Zip Code')) ? item['Zip Code'] : '';
                                       // }

                                        var docObj = {
                                            'doctorsNPI': (item.hasOwnProperty('Npi')) ? item['Npi'] : '',
                                            'firstname': (item.hasOwnProperty('Provider First Name')) ? item['Provider First Name'] : '',
                                            'lastname': (item.hasOwnProperty('Provider Last Name')) ? item['Provider Last Name'] : '',
                                            'centername': (item.hasOwnProperty('Site')) ? item['Site'] : '',
                                            //'degree': item.degree,
                                            'email': item.Email,
                                            'phone_number': (item.hasOwnProperty('Office Phone') && item['Office Phone'].length > 9) ? item['Office Phone'] : '',
                                            'fax': item['Fax Number'],
                                            'cell_phone': item['Mobile Number'],
                                            'location': location,
                                            'city': city,
                                            'state': state,
                                            'sute': (item.hasOwnProperty('Address Line 2')) ? item['Address Line 2'] : '',
                                            'zipcode': zipcode,
                                            'network': networks,
                                            'user_loc': user_loc
                                        }

                                        if (item.Title)
                                            docObj.degree = item.Title;

                                        if (item.Id) {
                                            docObj._id = item.Id;
                                            doctorService.updateUser().save(docObj, function (response) {
                                                // error_success count is equal to total data count when all asynchronous execution are completed
                                                if ($scope.data.data.length == index + 1) {
                                                    logger.logSuccess('Record(s) imported successfully.');
                                                    $scope.loading = false;
                                                    $state.reload('doctors-list');
                                                }
                                            })
                                        } else {
                                            doctorService.addDoctor().save(docObj, function (response) {
                                                // error_success count is equal to total data count when all asynchronous execution are completed
                                                if ($scope.data.data.length == index + 1) {
                                                    logger.logSuccess('Record(s) imported successfully.');
                                                    $scope.loading = false;
                                                    $state.reload('doctors-list');
                                                }
                                            })
                                        }
                                   // }) //google api stopped
                                } else {
                                    var location = (item.hasOwnProperty('Address Line 1')) ? item['Address Line 1'] : '';
                                    var city = (item.hasOwnProperty('City')) ? item.City : '';
                                    var state = (item.hasOwnProperty('State')) ? $scope.states.hasOwnProperty(item['State'].toUpperCase()) ? item.State.toUpperCase() : '' : '';
                                    var zipcode = (item.hasOwnProperty('Zip Code')) ? item['Zip Code'] : '';

                                    var docObj = {
                                        'doctorsNPI': (item.hasOwnProperty('Npi')) ? item.Npi : '',
                                        'firstname': (item.hasOwnProperty('Provider First Name')) ? item['Provider First Name'] : '',
                                        'lastname': (item.hasOwnProperty('Provider Last Name')) ? item['Provider Last Name'] : '',
                                        'centername': (item.hasOwnProperty('Site')) ? item.Site : '',
                                        //'degree': item.degree,
                                        'email': item.Email,
                                        'phone_number': (item.hasOwnProperty('Office Phone') && item['Office Phone'].length > 9) ? item['Office Phone'] : '',
                                        'fax': item['Fax Number'],
                                        'cell_phone': item['Mobile Number'],
                                        'location': location,
                                        'city': city,
                                        'state': state,
                                        'sute': (item.hasOwnProperty('Address Line 2')) ? item['Address Line 2'] : '',
                                        'zipcode': (item.hasOwnProperty('Zip Code')) ? item['Zip Code'] : '',
                                        'network': networks,
                                        'user_loc': user_loc
                                    }

                                    if (item.Title)
                                        docObj.degree = item.Title;

                                    if (item.Id) {
                                        docObj._id = item.Id;
                                        doctorService.updateUser().save(docObj, function (response) {
                                            // error_success count is equal to total data count when all asynchronous execution are completed
                                            if ($scope.data.data.length == index + 1) {
                                                logger.logSuccess('Record(s) imported successfully.');
                                                $scope.loading = false;
                                                $state.reload('doctors-list');
                                            }
                                        })
                                    } else {
                                        doctorService.addDoctor().save(docObj, function (response) {
                                            // error_success count is equal to total data count when all asynchronous execution are completed
                                            if ($scope.data.data.length == index + 1) {
                                                logger.logSuccess('Record(s) imported successfully.');
                                                $scope.loading = false;
                                                $state.reload('doctors-list');
                                            }
                                        })
                                    }
                                }

                            } else {
                                errorCount++;
                            }
                        });
                    } else {
                        $rootScope.loading = false;
                        $scope.loading = false;
                        logger.logError('No records found. Please follow the sample file given and try again...');
                    }
                } else {
                    $rootScope.loading = false;
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file. ');
                }
            } else {
                $rootScope.loading = false;
                $scope.loading = false;
                if ($scope.loading) {
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file.');
                }
            }
        });

        /**
         * Add Doctor Manually
         * Created By Suman Chakraborty
         * last modified on 17-01-2018
         */
        $scope.addToNetwork = function (doctorsInfo) {
            $rootScope.loading = true;

            doctorsInfo.speciality = doctorsInfo.specialty;
            doctorsInfo.createdById = localData._id;
            doctorsInfo.cell_phone = doctorsInfo.ccode + doctorsInfo.cell_phone;
            doctorsInfo.fax = doctorsInfo.ccodeFax + doctorsInfo.fax;
            doctorsInfo.location = (typeof doctorsInfo.location != 'object') ? doctorsInfo.location : '';
            doctorsInfo.createdByAdmin = true;
            var provName = (doctorsInfo.firstname) ? " - " + doctorsInfo.firstname + ' ' + doctorsInfo.lastname : (doctorsInfo.centername) ? " - " + doctorsInfo.centername : '';
            var actvLog = { userId: localData._id, type: 5, detail: 'Add provider' + provName };

            doctorService.addDoctor().save(doctorsInfo, function (response) {
                if (response.code == 200) {
                    $scope.resendInvite(doctorsInfo);
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess('Provider has been added to network');
                    $state.go('doctors-list');
                } else {
                    $rootScope.loading = false;
                    $scope.done = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        // get all insurance plans 
        $scope.getAvailableNetwork = function () {
            // console.log("get network is calling here >>>>>>>>>");
            
            insuranceService.getNetwork().get({
                id: '000'
            }, function (response) {
                if (response.code == 200) {
                    $scope.networkArr = new Array();
                    response.data.forEach(function (item) {
                        $scope.networkArr[item.name.toLowerCase().trim()] = item._id;
                    })
                    $scope.networkData = response.data;
                } else { }
            });

            titleService.getTitleList().save({}, function (response) {
                if (response.code == 200) {
                    $scope.degreeExcelArr = new Array();
                    response.data.forEach(function (item) {
                        $scope.degreeExcelArr[item.name.toLowerCase().trim()] = item._id;
                    })
                } else { }
            })
        }

        $scope.getAvailableSpecialty = function () {
            doctorService.GetSpecialty().get(function (response) {
                if (response.code == 200) {
                    $scope.specialtyArr = new Array();
                    response.data.forEach(function (item) {
                        $scope.specialtyArr[item.specialityName.toLowerCase().trim()] = item._id;
                    })
                    $scope.specialtyData = response.data;
                    $scope.datalength = response.data.length;
                } else { }
            })

            titleService.getTitleList().save({}, function (response) {
                if (response.code == 200) {
                    $scope.degreeArr = response.data;
                    $scope.degreeExcelArr = new Array();
                    response.data.forEach(function (item) {
                        $scope.degreeExcelArr[item.name.toLowerCase().trim()] = item._id;
                    })
                } else { }
            })

            // get all insurance plans 
            insuranceService.getNetwork().get({
                id: '000'
            }, function (response) {
                if (response.code == 200) {
                    $scope.networkData = response.data;
                } else { }
            });
        }

        $scope.isDelete = function (index, email) {
            $scope.emailId = {}
            $scope.emailId.email = email;
            var actvLog = { userId: localData._id, type: 13, detail: 'Delete doctor - ' + email };
            swal({
                title: "Are you sure?",
                text: "It will remove provider from the network!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        $rootScope.loading = true;
                        doctorService.deleteUser().save($scope.emailId, function (response) {
                            if (response.code == 200) {
                                actvLog.success = true;
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                                $scope.doctorList.splice(index, 1)
                                $rootScope.loading = false;
                                $state.reload('doctors-list');
                                swal("Deleted!", "User has been deleted.", "success");
                            } else {
                                $rootScope.loading = false;
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        /**
        * Delete un-reg doc details
        * Created By Suman Chakraborty
        * Last Modified on 18-04-2018
        */
        $scope.delDetails = function (index, id) {
            swal({
                title: "Are you sure?",
                text: "It will remove provider from the network!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        $rootScope.loading = true;
                        doctorService.delDetails().save({ _id: id }, function (response) {
                            if (response.code == 200) {
                                $rootScope.loading = false;
                                $state.reload('nonRegDocs');
                                swal("Deleted!", "User has been deleted.", "success");
                            } else { $rootScope.loading = false; }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        /**
        * Reset provider's password
        * Created Suman Chakraborty
        * last modified on 01-12-2017
        */
        $scope.resetPass = function (userID) {
            var actvLog = { userId: localData._id, type: 10, detail: 'Reset password' };
            //console.log(" userID ", userID);
            swal({
                title: "",
                text: "Are you sure to reset password of this user?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                closeOnConfirm: false
            },
                function (isConfirm) {
                    // console.log(" isConfirm ", isConfirm);
                    if (isConfirm) {
                        $rootScope.loading = true;
                        doctorService.resetPassword().save({
                            userId: userID
                        }, function (response) {
                         //   console.log(" response ",response);
                            if (response.code == 200) {
                                $rootScope.loading = false;
                                actvLog.success = true;
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                                $state.reload('doctors-list');
                                swal("Success!", "Password reset successfully.", "success");
                            } else {
                                $rootScope.loading = false;
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        $scope.editDetails = function (doctor) {
            $state.go('editDoctor');

        }

        $scope.frontDeskArr = [];
        doctorService.getFrontDeskAdmin().get(function (res) {
            if (res.code === 200) {
                $scope.frontDeskArr = res.data.map(function (item) {
                    if (item.firstname || item.lastname) {
                        item.name = item.firstname + ' ' + item.lastname;
                    } else {
                        item.name = item.email
                    }
                    return item;
                });
            }
        });

        /**
        * Get doctor's detail by id for edit page
        * Created By Suman Chakraborty
        * last modified on 01-12-2017
        */
        $scope.getById = function () {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 4, detail: 'View provider details' };
            doctorService.getById().get({
                id: $state.params.id
            }, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    var provName = (response.data.firstname) ? " - " + response.data.firstname + ' ' + response.data.lastname : (response.data.centername) ? " - " + response.data.centername : '';
                    actvLog.detail = actvLog.detail + provName;

                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    // for showing only one specialty as per the new rule
                    response.data.speciality = (response.data.speciality.length > 0) ? response.data.speciality : [];
                    if (response.data.cell_phone) {
                        response.data.ccode = getPhone.ccode(response.data.cell_phone);
                        response.data.cell_phone = getPhone.phone(response.data.cell_phone);
                    }
                    if (response.data.fax) {
                        response.data.ccodeFax = getPhone.ccode(response.data.fax);
                        response.data.fax = getPhone.phone(response.data.fax);
                    }
                    $scope.doctor = response.data;
                } else {
                    $rootScope.loading = false;
                    actvLog.detail = actvLog.detail + " - " + $state.params.id;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Update doctor details
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.updatedoctor = function (editdoctor) {
            $rootScope.loading = true;
            editdoctor.speciality = editdoctor.speciality;
            editdoctor.service = editdoctor.service;
            editdoctor.cell_phone = editdoctor.ccode + editdoctor.cell_phone;
            editdoctor.fax = editdoctor.ccodeFax + editdoctor.fax;

            var provName = (editdoctor.firstname) ? " - " + editdoctor.firstname + ' ' + editdoctor.lastname : (editdoctor.centername) ? " - " + editdoctor.centername : '';
            var actvLog = { userId: localData._id, type: 6, detail: 'Update provider details' + provName };

            //console.log(" editdoctor ",editdoctor);
            doctorService.updateUser().save(editdoctor, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess(response.message);
                    $state.go('doctors-list');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Change provider status (active / inactive)
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.changeStatus = function (id, item) {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 6, detail: 'Update provider status' };

            var userArr = {
                'id': id,
                'status': item === '1' ? '0' : '1'
            };
            doctorService.updateStatus().save(userArr, function (response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    $rootScope.loading = false;
                    logger.logSuccess(item === '1' ? 'User deactivated successfully.' : 'User activated successfully.');
                    $rootScope.loading = false;
                    $state.reload('doctors-list');

                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Resend inviation to user who has not yet updated their profile
        * Created By Suman Chaktraborty
        * Last modified on 01-12-2017
        */
        $scope.resendInvite = function (inp) {

            $rootScope.loading = true;
            var localData = JSON.parse(sessionStorage.getItem('test'));
            var provName = (inp.firstname) ? " - " + inp.firstname + ' ' + inp.lastname : (inp.centername) ? " - " + inp.centername : '';
            var actvLog = { userId: localData._id, type: 11, detail: 'Resend inviation' + provName };
            var salutation = '';

            var mail = {
                salutation: salutation,
                //invitingDoc     : 'Which Docs',
                firstname: (inp.firstname) ? inp.firstname : '',
                lastname: (inp.lastname) ? inp.lastname : '',
                degree: (inp.degree) ? inp.degree : '',
                centername: (inp.centername) ? inp.centername : '',
                fromSvpFname: (inp.fromSvpFname) ? inp.fromSvpFname : 'Which Docs',
                fromSvpLname: (inp.fromSvpLname) ? inp.fromSvpLname : '',
                fromSvpDegree: (inp.fromSvpDegree) ? inp.fromSvpDegree : '',
                fromSvpCenter: (inp.fromSvpCenter) ? inp.fromSvpCenter : '',
                emailAvailable: inp.emailAvailable,
                to: inp.email,
                fax: inp.fax,
                hasTemplate: true
            };
            doctorService.sendMail().save(mail, function (res) {
                if (res.code === 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess('Invitation sent successfully.');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError('Unable to process your request. Please try again.');
                }
            })
        }

        $scope.excelExport = function (exportprms) {
            $scope.exportBtn = false;
            $scope.exportData = [];
            delete exportprms.count; delete exportprms.page;
           // console.log(" excelExport exportprms ",exportprms);
            //debugger
            doctorService.getDoctorsExportList().save(exportprms, function (response) {
              
                // show only one specialty as per new rule there will be one specialty for each doctor
                if (response.code === 200) {
                    // Headers:
                    $scope.exportData.push([
                        "Id",
                        "Npi",
                        "Provider First Name",
                        "Provider Last Name",
                        "Title",
                        "Site",
                        "Email",
                        "Fax Number",
                        "Address Line 1",
                        "Address Line 2",
                        "City",
                        "State",
                        "Zip Code",
                        "Office Phone",
                        "Mobile Number",
                        "Specialty",
                        "Insurance Networks",
                        "Front Desk Admins",
                        "Created By"]);

                    response.data.forEach(function (item, index) {
                        var createdBy = '-';
                        if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0) {
                            createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                        }

                        var userTitle = '';
                        if (item.title_data !== null && item.title_data[0]['titleInfo'].length > 0) {
                            userTitle = item.title_data[0]['titleInfo'][0]['name'];
                        }

                        var speciality = ''; var spArr = [];
                        if (item.specility_data !== null && item.specility_data.length > 0) {
                            item.specility_data.forEach(function (spitem, i) {
                                if (spitem.specialityInfo && spitem.specialityInfo.length > 0)
                                    spArr[i] = spitem.specialityInfo[0]['specialityName'];
                            })
                            speciality = spArr.join();
                        }

                        var network = ''; var netArr = [];
                        if (item.network_data !== null && item.network_data.length > 0) {
                            item.network_data.forEach(function (netitem, j) {
                                if (netitem.networkInfo && netitem.networkInfo.length > 0)
                                    netArr[j] = netitem.networkInfo[0]['name'];
                            })
                            network = netArr.join();
                        }

                        var frntDsk = ''; var frntDskArr = [];
                        if (item.frontdesk_data !== null && item.frontdesk_data.length > 0) {
                            item.frontdesk_data.forEach(function (fdskitem, k) {
                                if (fdskitem.frontDeskInfo && fdskitem.frontDeskInfo.length > 0)
                                    frntDskArr[k] = fdskitem.frontDeskInfo[0]['firstname'] + ' ' + fdskitem.frontDeskInfo[0]['lastname'];
                            })
                            frntDsk = frntDskArr.join();
                        }
                        var fax = '';
                        if (item.fax !== null && item.fax.indexOf("undefined") == -1 && item.fax.indexOf("undefined") == -1)
                            fax = item.fax;

                        var phno = '';
                        if (item.phone_number !== null && item.phone_number.indexOf("undefined") == -1 && item.phone_number.indexOf("undefined") == -1)
                            phno = item.phone_number;

                        var cellphno = '';
                        if (item.cell_phone !== null && item.cell_phone.indexOf("undefined") == -1 && item.cell_phone.indexOf("undefined") == -1)
                            cellphno = item.cell_phone;

                        // Data:                                
                        $scope.exportData.push([
                            item._id,
                            item.doctorsNPI,
                            item.firstname,
                            item.lastname,
                            userTitle,
                            item.centername,
                            item.email,
                            fax,
                            item.location,
                            item.sute,
                            item.city,
                            item.state,
                            item.zipcode,
                            phno,
                            cellphno,
                            speciality,
                            network,
                            frntDsk,
                            createdBy
                        ]);
                    })
                    $scope.exportBtn = true;
                }
            });
        }

        $scope.excelNonRegProvExport = function (exportprms) {
            //debugger
            $scope.exportBtn = false;
            $scope.exportData = [];
           // console.log(" excelNonRegProvExport exportprms prev ", exportprms);
            delete exportprms.count; delete exportprms.page;

            ///exportprms.isOutside = true;
            //delete exportprms.count; delete exportprms.page;
           // console.log(" excelNonRegProvExport exportprms after ", exportprms);
            doctorService.getNonRegDoctorsExportList().save(exportprms, function (response) {
                // console.log(" resp excel ",response.data);
                 //console.log(" scope val ",$scope.docList);
                // show only one specialty as per new rule there will be one specialty for each doctor
                if (response.code === 200) {
                    // Headers:
                    $scope.exportData.push([
                        "Id",
                        "Npi",
                        "Provider First Name",
                        "Provider Last Name",
                        "Title",
                        "Site",
                        "Email",
                        "Fax Number",
                        "Address Line 1",
                        "Address Line 2",
                        "City",
                        "State",
                        "Zip Code",
                        "Office Phone",
                        "Mobile Number",
                        "Specialty",
                        "Insurance Networks",
                        "Front Desk Admins",
                        "Created By"]);
                   
                    response.data.forEach(function (item, index) {
                   // $scope.docList.forEach(function (item, index) {
                        var createdBy = '-';
                        if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0) {
                            createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                        }

                        var userTitle = '';
                        if (item.title_data !== null && item.title_data[0]['titleInfo'].length > 0) {
                            userTitle = item.title_data[0]['titleInfo'][0]['name'];
                        }

                        var speciality = ''; var spArr = [];
                        if (item.specility_data !== null && item.specility_data.length > 0) {
                            item.specility_data.forEach(function (spitem, i) {
                                if (spitem.specialityInfo && spitem.specialityInfo.length > 0)
                                    spArr[i] = spitem.specialityInfo[0]['specialityName'];
                            })
                            speciality = spArr.join();
                        }

                        var network = ''; var netArr = [];
                        if (item.network_data !== null && item.network_data.length > 0) {
                            item.network_data.forEach(function (netitem, j) {
                                if (netitem.networkInfo && netitem.networkInfo.length > 0)
                                    netArr[j] = netitem.networkInfo[0]['name'];
                            })
                            network = netArr.join();
                        }

                        var frntDsk = ''; var frntDskArr = [];
                        if (item.frontdesk_data !== null && item.frontdesk_data.length > 0) {
                            item.frontdesk_data.forEach(function (fdskitem, k) {
                                if (fdskitem.frontDeskInfo && fdskitem.frontDeskInfo.length > 0)
                                    frntDskArr[k] = fdskitem.frontDeskInfo[0]['firstname'] + ' ' + fdskitem.frontDeskInfo[0]['lastname'];
                            })
                            frntDsk = frntDskArr.join();
                        }
                        var fax = '';
                        if (item.fax !== null && item.fax.indexOf("undefined") == -1 && item.fax.indexOf("undefined") == -1)
                            fax = item.fax;

                        var phno = '';
                        if (item.phone_number !== null && item.phone_number.indexOf("undefined") == -1 && item.phone_number.indexOf("undefined") == -1)
                            phno = item.phone_number;

                        var cellphno = '';
                        if (item.cell_phone !== null && item.cell_phone.indexOf("undefined") == -1 && item.cell_phone.indexOf("undefined") == -1)
                            cellphno = item.cell_phone;

                        // Data:                                
                        $scope.exportData.push([
                            item._id,
                            item.doctorsNPI,
                            item.firstname,
                            item.lastname,
                            userTitle,
                            item.centername,
                            item.email,
                            fax,
                            item.location,
                            item.sute,
                            item.city,
                            item.state,
                            item.zipcode,
                            phno,
                            cellphno,
                            speciality,
                            network,
                            frntDsk,
                            createdBy
                        ]);
                        
                    })
                    $scope.exportBtn = true;
                }
            });
        }

        $scope.excelExportRating = function (exportprms) {
            $scope.exportData = [];
            delete exportprms.count; delete exportprms.page;
            doctorService.getDoctorRatingList().save(exportprms, function (response) {

                // show only one specialty as per new rule there will be one specialty for each doctor
                if (response.code === 200) {
                    // Headers:
                    $scope.exportData.push(["Provider First Name", "Provider Last Name", "Site", "Email", "Phone Number", "Rating"]);

                    response.data.forEach(function (item, index) {
                        // Data:                                
                        $scope.exportData.push([item.firstname, item.lastname, item.centername, item.email, item.phone_number, item.preferenceRating]);
                    })
                }

            });
        }

        $scope.getDoctorRatingList = function () {

            var actvLog = { userId: localData._id, type: 4, detail: 'View provider rating' };
            ngTableParamsService.set('', 50, undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                // counts: [], uncomment to hide pager
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.superAdminReq = true;

                    $scope.tableLoader = true;
                    $scope.doctorList = [];
                    doctorService.getDoctorRatingList().save($scope.paramUrl, function (response, err) {
                        if (response.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            // show only one specialty as per new rule there will be one specialty for each doctor

                            $scope.tableLoader = false;
                            $scope.doctorList = response.data;
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(response.message);
                        }
                    });
                    setTimeout(function () {
                        $scope.excelExportRating($scope.paramUrl);
                    }, 1000);

                }
            });
        }

        $scope.excelExportMyRating = function (exportprms) {
            $scope.exportData = [];
            //delete exportprms.count; delete exportprms.page;
            doctorService.getMyRatingList().get({
                id: $state.params.id
            }, function (response) {

                // show only one specialty as per new rule there will be one specialty for each doctor
                if (response.code === 200) {
                    // Headers:
                    $scope.exportData.push(["Provider First Name", "Provider Last Name", "Site", "Email", "Phone Number", "Rating"]);

                    response.data.forEach(function (item, index) {
                        // Data:     
                        //console.log(response.data) ;                         
                        $scope.exportData.push([item.userId.firstname, item.userId.lastname, item.userId.centername, item.userId.email, item.userId.phone_number, item.preferenceRating]);
                    })
                }

            });
        }
        $scope.getMyRatingList = function () {

            $rootScope.loading = true;
            //var tt = $state.params.id;
            //console.log(" inside"+tt);
            //getNonDocById
            //getMyRatingList
            // $scope.paramUrl = params.url();
            doctorService.getMyRatingList().get({
                id: $state.params.id
            }, function (response) {
                //console.log(response.data);

                if (response.code == 200) {
                    //actvLog.success = true;
                    // logProvider.addUserActivity().save(actvLog, function (res) { });
                    // show only one specialty as per new rule there will be one specialty for each doctor

                    $scope.tableLoader = false;
                    $scope.doctorList = response.data;
                    var data = response.data;
                    $scope.totalCount = response.totalCount;
                    //params.total(response.totalCount);
                    //$defer.resolve(data);
                } else {
                    //logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
            setTimeout(function () {
                $scope.excelExportMyRating($scope.paramUrl);
            }, 1000);


        }

        $scope.getList = function () {

            $rootScope.loading = true;
            //var tt = $state.params.id;
            //console.log(" inside"+tt);
            //getNonDocById
            //getMyRatingList
            // $scope.paramUrl = params.url();
            doctorService.getMyRatingList().get({
                id: $state.params.id
            }, function (response) {
                //console.log(response.data);

                if (response.code == 200) {
                    //actvLog.success = true;
                    // logProvider.addUserActivity().save(actvLog, function (res) { });
                    // show only one specialty as per new rule there will be one specialty for each doctor

                    $scope.tableLoader = false;
                    $scope.doctorList = response.data;
                    var data = response.data;
                    $scope.totalCount = response.totalCount;
                    //params.total(response.totalCount);
                    //$defer.resolve(data);
                } else {
                    //logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
            setTimeout(function () {
                $scope.excelExportMyRating($scope.paramUrl);
            }, 1000);


        }

        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var componentForm = {
                //premise: 'long_name',
                street_number: 'short_name',
                route: 'long_name',
                sublocality_level_1: 'long_name',
                sublocality_level_2: 'long_name',
                locality: 'long_name',
                administrative_area_level_1: 'short_name',
                postal_code: 'short_name'
            };
            var mapping = {
                //premise: 'sute',
                street_number: 'location',
                route: 'location',
                sublocality_level_1: 'location',
                sublocality_level_2: 'location',
                locality: 'city',
                administrative_area_level_1: 'state',
                postal_code: 'zipcode'
                //Region, District, Level
            };



            var location = $scope.doctor.location.getPlace().geometry.location;
            // var location = $scope.doctor.location.getPlace().geometry;
            //console.log(" location ",location);
            var components = $scope.doctor.location.getPlace().address_components;  // from Google API place object   
            //console.log(" components ",components);
            // show this on map
            $scope.doctor.user_loc = [location.lng(),location.lat()];
           // $scope.doctor.user_loc = [location.lat(),location.lng()];

            //console.log(" scope lat long ", $scope.doctor.user_loc);

            // User address field text value update
            //$scope.doctor.location = $scope.doctor.location.getPlace().formatted_address;
            $scope.doctor.location = '';
            //$scope.doctor.sute = '';
            $scope.doctor.city = '';
            $scope.doctor.zipcode = '';

            for (var i = 0; i < components.length; i++) {
                var addressType = components[i].types[0];
                if (componentForm[addressType]) {
                    var val = components[i][componentForm[addressType]];
                    if (mapping[addressType] == 'location')
                        $scope.doctor[mapping[addressType]] = ($scope.doctor[mapping[addressType]]) ? $scope.doctor[mapping[addressType]] + " " + val : val;
                    else
                        $scope.doctor[mapping[addressType]] = val;

                }
            }

            $scope.$apply();
        });
    }
])

    .directive("fileRead", [function () {
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
                        //console.log('reader::', reader)
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
                        //logger.logError('File type not allowed.Please select .xls or .xlsx file only.');
                    }
                });
            }
        }
    }])
    .directive("filereadnew", [function () {
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
                        //console.log(" reader ", reader);
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
                    }
                });
            }
        }
    }]);

