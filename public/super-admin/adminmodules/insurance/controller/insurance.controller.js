"use strict";

angular.module("Insurance")

nwdApp.controller("insuranceController", [
    '$scope',
    '$rootScope',
    '$window',
    '$sessionStorage',
    '$location',
    'logger',
    'logProvider',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParamsServiceProviderSearch',
    'ngTableParams',
    '$filter',
    'insuranceService',
    'doctorService',
    'getPhone',
    'titleService',
    function (
        $scope,
        $rootScope,
        $window,
        $sessionStorage,
        $location,
        logger,
        logProvider,
        $state,
        $stateParams,
        ngTableParamsService,
        ngTableParamsServiceProviderSearch,
        ngTableParams,
        $filter,
        insuranceService,
        doctorService,
        getPhone,
        titleService
    ) {
        $scope.currentPage = 1;
        $scope.itemPerPage = 10;
        $scope.btnTitle = 'Add';
        $scope.pageTitle = 'Add Insurance Network';
        $scope.doctor = {};
        $scope.doctor.emailtype = 'all';
        $scope.dataList = {};
        $scope.data = {};
        $scope.nonRegData = {};
        $scope.myFile = {};
        $rootScope.vartemp = "";
        $scope.network = {};
        $scope.network.insprovider = [];
        $scope.states = states1d;
        $scope.doctor = {};
        var localData = JSON.parse(sessionStorage.getItem('test'));
        $scope.networkTe = {};
        $scope.networkTe.selectesList = [];
        $scope.sendEmail = {};
        $scope.IdArray = [];
        $scope.sendEmailNetwork = {};
        $scope.IdArrayNetwork = [];
        $scope.fileName = "Insurance-list";
        $scope.unverifiedUser = [];


        /**
        searching on listing page
        Created By Suman Chakraborty
        Last modified on 11-09-2017
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
                    $scope.tableLoader = true;
                    $scope.dataList = [];
                    insuranceService.getNetworkList().save($scope.paramUrl, function (response) {
                        $scope.tableLoader = false;
                        $scope.dataList = response.data;
                        var data = response.data;
                        $scope.totalCount = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                    setTimeout(function () {
                        $scope.excelExportInsurance($scope.paramUrl);
                    }, 1000);
                }
            });
        }

        //  $scope.fileUpload = function(id){
        //     console.log("id",id);
        //     let x = document.getElementById('dataList');
        //     console.log("here is xxx",x);
        //     x.click();
        //     console.log("here is xxx",x.files);
        //     //this.selectedFiles = x.target.files;
        //     //this.fileName = this.selectedFiles[0].name;
        //    // console.log('selectedFiles: ' + this.fileName );
        //     //console.log("here is xxx",x);
        // }



        $scope.getNetworkList = function () {
            // console.log(" here ");
            var actvLog = { userId: localData._id, type: 4, detail: 'View insurance network list' };
            $scope.pageTitle = 'Insurance List';
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.tableLoader = true;
                    $scope.dataList = [];
                    insuranceService.getNetworkList().save($scope.paramUrl, function (response, err) {
                        if (response.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            $scope.tableLoader = false;
                            $scope.dataList = response.data;
                            // console.log(" res ", response.data);
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            $scope.isAllSelectedNetwork = false;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(response.message);
                        }
                    });
                    setTimeout(function () {
                        $scope.excelExportInsurance($scope.paramUrl);
                    }, 1000);
                }
            });
        }

        $scope.selectAllNetwork = function () {
            var toggleStatus = $scope.isAllSelectedNetwork;
            // console.log(" toggleStatus ", toggleStatus);
            angular.forEach($scope.dataList, function (itm) { itm.selected = toggleStatus; });

        }

        $scope.excelExportInsurance = function (exportprms) {
            $scope.exportData = [];
            delete exportprms.count; delete exportprms.page;
            insuranceService.getNetworkList().save(exportprms, function (response) {
                // console.log(" res excel ", response.data);
                // show only one specialty as per new rule there will be one specialty for each doctor
                if (response.code === 200) {
                    // Headers:
                    $scope.exportData.push(["Network_ID", "Insurance Name", "Email", "Description", "Verified"]);

                    response.data.forEach(function (item, index) {
                        // Data:   
                        if (item.verified && item.verified == 1) {
                            var verified = 'Yes';
                        } else {
                            var verified = 'No';
                        }
                        $scope.exportData.push([item._id, item.name, item.email, item.desc, verified]);
                    })
                }

            });
        }


        $scope.optionToggledNetwork = function () {
            // console.log(" scope.dataList ", $scope.dataList);
            $scope.isAllSelectedNetwork = $scope.dataList.every(function (itm) { return itm.selected; });
            // console.log(" isAllSelectedNetwork ", $scope.isAllSelectedNetwork);
        }


        /* email password send feature for Insurance admin */

        $scope.sendEmailNetwork = function (user) {
            $scope.IdArrayNetwork = [];
            //console.log(" user ", user);
            //console.log(" paramid  ", $state.params.id)
            if ($scope.dataList.length > 0) {
                angular.forEach($scope.dataList, function (itm) {
                    //console.log(" itm ", itm);
                    if (itm.selected) {
                        $scope.IdArrayNetwork.push(itm._id);
                        $rootScope.loading = true;
                        //console.log(" $scope.IdArray ", $scope.IdArray);
                    }
                    // else {
                    //     logger.logError("Please select providers to send emails.");
                    //     //console.log(' please select providers to send emails. ');
                    // }
                    // console.log("array", $scope.IdArray)
                })

                if ($scope.IdArrayNetwork.length > 0) {
                    // console.log(" IdArrayNetwork ", $scope.IdArrayNetwork)
                    if (user) {
                        // console.log(" user ",user);
                        // if ((user.fromName) && (user.fromEmail)) {
                        // if (user.fromName.length > 0 && user.fromEmail.length > 0) {                             
                        insuranceService.sendLoginDetailsInsurance().save({ provider: $scope.IdArrayNetwork, insuranceProvider: $state.params.id }, function (resp) {
                            //console.log(" resp ",resp);
                            // logger.logSuccess('Email Sending process inprogress...');
                            logger.logSuccess('Email Sent successfully');

                        })

                        $rootScope.loading = false;
                        // logger.logSuccess('Email Sending process inprogress...');
                        logger.logSuccess('Email Sent successfully');
                        // } else {                                
                        //     $rootScope.loading = false;
                        //     logger.logError("Please enter Sender Name and Sender Email.");
                        // }
                        // } else {                           
                        //     $rootScope.loading = false;
                        //     logger.logError("Please enter Sender Name and Sender Email.");
                        // }
                    } else {
                        $rootScope.loading = false;
                        logger.logError("Please select Insurance providers to send emails.");
                    }
                } else {
                    $rootScope.loading = false;
                    logger.logError("Please select Insurance providers to send emails.");
                    //     //console.log(' please select providers to send emails. ');
                }
            } else {
                $rootScope.loading = false;
                logger.logError("Please select Insurance providers to send emails.");
            }
            // $rootScope.loading = false;
        };

        /**
        Add Insurance provider
        Created By Suman Chakraborty
        Last modified on 01-12-2017
        */
        $scope.addNetwork = function (data) {
            var actvLog = { userId: localData._id, type: 5, detail: 'Add insurance network' };
            if (data.hasOwnProperty('_id') && data._id != '') {
                actvLog.detail = 'Update insurance network';
                actvLog.type = 6;
            }
            insuranceService.addNetwork().save(data, function (response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess(response.message);
                    $state.go('insurance', {}, { reload: true });
                } else {
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        delete record by ID
        Created By Suman Chakraborty
        Last modified on 13-09-2017
        */
        $scope.deleteNetwork = function (id) {
            swal({
                title: "Are you sure?",
                text: "Are you sure to remove this network!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        var serviceData = {};
                        serviceData.id = id;
                        insuranceService.deleteNetwork().save(serviceData, function (response) {
                            if (response.code == 200) {
                                logProvider.addUserActivity().save({ userId: localData._id, type: 13, success: true, detail: 'Delete insurance network' }, function (res) { });
                                swal("Deleted!", "Service has been deleted.", "success");
                                $scope.getNetworkList();
                            } else {
                                logProvider.addUserActivity().save({ userId: localData._id, type: 13, detail: 'Delete insurance network' }, function (res) { });
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
        Last modified on 01-12-2017
        */
        $scope.getNetwork = function () {

            var actvLog = { userId: localData._id, type: 4, detail: 'View insurance network detail' };
            if ($state.params.id) {
                $scope.btnTitle = 'Update';
                $scope.pageTitle = 'Update Insurance Network';
                insuranceService.getNetwork().get({ id: $state.params.id }, function (response) {
                    // console.log(" get newtwork ",response);
                    if (response.code == 200) {
                        actvLog.success = true;
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        $scope.network = response.data[0];

                    } else {
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        logger.logError(response.message);
                    }
                })
            }
        }

        $scope.getInsProviders = function () {

            var actvLog = { userId: localData._id, type: 4, detail: 'View insurance network detail' };
            if ($state.params.id) {
                $scope.btnTitle = 'Update';
                $scope.pageTitle = 'Update Insurance Providers';
                //console.log(" here getInsProviders ");

                doctorService.getDoctorsList().save({ network: [$state.params.id] }, function (response) {
                    if (response.code == 200) {
                        actvLog.success = true;
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        var insprov = [];
                        if (response.data.length > 0) {
                            response.data.forEach(function (item, index) {
                                insprov.push(item._id);
                            });
                        }
                        $scope.network.insprovider = insprov;
                        $scope.network.insId = $state.params.id;
                    } else {
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        logger.logError(response.message);
                    }
                })
            }
        }


        $scope.getAvailableProviders = function () {
            //console.log("hello");
            $rootScope.loading = true;
            // get all providers 
            doctorService.getDoctorsList().save({}, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    $scope.providerData = response.data;
                } else { }
            });
        }


        $scope.getAvailableProvidersUnAssociatedInsuranceRepeat = function (searchText, selected) {
            $scope.pageTitle = 'Add Insurance Providers';
            $rootScope.loading = true;
            if (searchText.length > 0) {
                $scope.paramUrl = {};
                $scope.paramUrl.superAdminReq = true;
                // get all providers 
                $scope.template = {};
                var insprov = [];
                $scope.network = {};
                // get all unassociated providers 
                $scope.paramUrl.network = [$state.params.id];
                $scope.paramUrl.searchText = searchText;
                if (selected) {
                    $scope.paramUrl.selectedIDsLength = selected.length;
                    $scope.paramUrl.selectedIDs = selected;
                } else {
                    $scope.paramUrl.selectedIDsLength = 0;
                    $scope.paramUrl.selectedIDs = [];
                }

                if ($state.params.id) {
                    doctorService.getDoctorsListUnAssociatedInsurance().save($scope.paramUrl, function (response) {
                        if (response.code == 200) {

                            response.data.map(function (item, index) {
                                if (item.email.length > 0) {
                                    item['fullname'] = item.firstname + ' ' + item.lastname + ' (' + item.email + ')';
                                } else {
                                    item['fullname'] = item.firstname + ' ' + item.lastname;
                                }
                                insprov.push(item._id);

                                return item;
                            })

                            $rootScope.loading = false;
                            $scope.providerData = response.data;

                            if (selected) {
                                $scope.networkTe.selectesList.push(selected);
                                $scope.networkTe.insproviderr.push(selected)
                            } else {
                                $scope.networkTe.insproviderr = $scope.networkTe.selectesList;
                            }

                            $scope.networkTe.insId = $state.params.id;


                        } else {
                            $rootScope.loading = false;
                        }
                    });
                }

            } else {
                $rootScope.loading = false;
            }
        }


        $scope.getAvailableProvidersUnAssociatedInsurance = function () {

            $scope.pageTitle = 'Add Providers to an Insurance'//'Add Insurance Providers';
            $scope.paramUrl = {};
            $scope.paramUrl.superAdminReq = true;
            $rootScope.loading = true;
            // get all providers 
            $scope.template = {};
            var insprov = [];
            $scope.network = {};
            // $scope.networkTe.selectesList = [];

            $scope.paramUrl.network = [$state.params.id];

            if ($state.params.id) {
                doctorService.getDoctorsListUnAssociatedInsurance().save($scope.paramUrl, function (response) {
                    //console.log(" response ", response);
                    if (response.code == 200) {


                        response.data.map(function (item, index) {
                            if (item.email && item.email.length > 0) {
                                item['fullname'] = item.firstname + ' ' + item.lastname + ' (' + item.email + ')';
                            } else {
                                item['fullname'] = item.firstname + ' ' + item.lastname;
                            }
                            insprov.push(item._id);

                            return item;
                        })



                        $rootScope.loading = false;
                        $scope.providerData = response.data;

                        $scope.network.selected = insprov;
                        $scope.networkTe.selected = insprov;

                        $scope.network.insId = $state.params.id;
                        $scope.networkTe.insId = $state.params.id;



                    } else {
                        $rootScope.loading = false;
                    }
                });
            } 

/*             var localUser = 0;
            localUser = JSON.parse($window.sessionStorage.getItem("test"));
            console.log("User Id", localUser._id);
            insuranceService.getUserNetwork().get({
                id: 'localUser._id'
            }, function (resp) {
                if (resp.code == 200) {
                    console.log("Populated Unverified User Data", resp)
                    $scope.unverifiedUser = resp.data;
                }

            }) */

        }




        // $scope.enableSaveFun = function (data1) {
        //     //alert(" here ");
        //     return data1.length > 0;
        // };

        /**
        * Get doctor's list for listing page
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.getAssociatedAllProviders = function () {
            //console.log(" getAssociatedAllProviders ");
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

                    $scope.paramUrl.insurance = $state.params.id;
                    $scope.paramUrl.network = [$state.params.id];
                    $rootScope.loading = true;

/*                     var localUser = 0;
                    localUser = JSON.parse($window.sessionStorage.getItem("test"));
                    console.log("User Id", localUser._id);
                    insuranceService.getUserNetwork().get({
                        id: 'localUser._id'
                    }, function (resp) {
                        if (resp.code == 200) {
                            console.log("Populated Unverified User Data", resp)
                            // $scope.unverifiedUser = resp.data;
                            $scope.doctorList = resp.data;
                            $scope.tableLoader = false;
                            $scope.isAllSelected = false;
                            var data = resp.data;
                            $scope.totalCount = resp.totalCount;
                            params.total(resp.totalCount);
                            $defer.resolve(data);
                        }
        
                    }) */



                     doctorService.getDoctorsListAssociatedInsurance().save($scope.paramUrl, function (response, err) {

                        if (response.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            // show only one specialty as per new rule there will be one specialty for each doctor
                            $rootScope.loading = false;
                            
                            // response.data.forEach(function (item, index) {
                            //     var createdBy = '-'; var fromSvpFname = ""; var fromSvpLname = ""; var fromSvpDegree = ""; var fromSvpCenter = "";
                            //     if ((item.createdById !== null) && (item.created_by[0]['createdByInfo']) && (item.created_by[0]['createdByInfo'].length > 0) && (item.created_by[0]['createdByInfo'][0]['userType'] === 'user')) {
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
                            //     response.data[index]['selected'] = false;

                            // })

                            // console.log(" response  ", response);
                            $scope.tableLoader = false;
                            //console.log(" doctorList before ", response.data);
                            // debugger;

                            // setTimeout(function () {
                            $scope.doctorList = response.data;
                            // $scope.doctorList = result;
                            // }, 1000);
                            //console.log(" doctorList after ", $scope.doctorList);


                            $scope.isAllSelected = false;
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
                        //$scope.excelExport($scope.paramUrl);
                    }, 1000); 

                }
            });
        }



        /**
        * Change provider status (active / inactive)
        * Created By Suman Chakraborty
        * Last modified on 01-12-2017
        */
        $scope.changeNetworkProviderStatus = function (id, item) {
            //console.log(" $state.params.id; ", $state.params.id);
            //console.log(" id ", id);
            // debugger;
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 6, detail: 'Update insurance provider status' };
            if(item == '1'){
                item  = '0';
            }
            else {
                item = '1';
            }
            var userArr = {
                'userId': id,
                'network': $state.params.id,
                'status': item,
                // 'status': item.toString() == '1' ? '0' : '1',
                'createdById': localData._id
            };

            insuranceService.updateNetworkProviderStatus().save(userArr, function (response) {
                //console.log(" response ", response);
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    $rootScope.loading = false;
                    if (item == '1') {

                        logger.logSuccess('Provider Un-verified successfully.');
                    }
                    else {
                        logger.logSuccess('Provider verified successfully.' );

                    }
                    // logger.logSuccess(item === '1' ? 'Provider verified successfully.' : 'Provider Un-verified successfully.');
                    $rootScope.loading = false;
                    $state.go('viewInsProviderAll', { id: $state.params.id }, { reload: true });
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })

        }

        $scope.resetSearch = function () {
            $scope.doctor = {};
            $scope.searchableInsurance('');
        }


        $scope.selectAll = function () {
            var toggleStatus = $scope.isAllSelected;
            //console.log("toggleStatus", toggleStatus);
            angular.forEach($scope.doctorList, function (itm) { itm.selected = toggleStatus; });

        }


        $scope.optionToggled = function () {

            $scope.isAllSelected = $scope.doctorList.every(function (itm) { return itm.selected; });
            //console.log("isAllSelected", $scope.isAllSelected);

        }


        /* bulk email send feature for Insurance admin */

        $scope.sendEmail = function (user) {
            $scope.IdArray = [];
            //console.log(" user ", user);
            //console.log(" paramid  ", $state.params.id)
            if ($scope.doctorList.length > 0) {
                angular.forEach($scope.doctorList, function (itm) {
                    //console.log(" itm ", itm);
                    if (itm.selected) {
                        $scope.IdArray.push(itm._id);
                        $rootScope.loading = true;
                        //console.log(" $scope.IdArray ", $scope.IdArray);
                    }
                    // else {
                    //     logger.logError("Please select providers to send emails.");
                    //     //console.log(' please select providers to send emails. ');
                    // }
                    // console.log("array", $scope.IdArray)
                })

                if ($scope.IdArray.length > 0) {
                    //console.log("array", $scope.IdArray)
                    if (user) {
                        if ((user.fromName) && (user.fromEmail)) {
                            if (user.fromName.length > 0 && user.fromEmail.length > 0) {
                                insuranceService.sendEmailInsurance().save({ provider: $scope.IdArray, insuranceProvider: $state.params.id, senderName: user.fromName, senderEmail: user.fromEmail }, function (resp) {
                                    //console.log(" resp ",resp);
                                    // logger.logSuccess('Email Sending process inprogress...');
                                    logger.logSuccess('Email Sent sucessfully');

                                })

                                $rootScope.loading = false;
                                // logger.logSuccess('Email Sending process inprogress');
                                logger.logSuccess('Email Sent sucessfully');
                            } else {
                                $rootScope.loading = false;
                                logger.logError("Please enter Sender Name and Sender Email.");
                            }
                        } else {
                            $rootScope.loading = false;
                            logger.logError("Please enter Sender Name and Sender Email.");
                        }
                    } else {
                        $rootScope.loading = false;
                        logger.logError("Please enter Sender Name and Sender Email.");
                    }
                } else {
                    $rootScope.loading = false;
                    logger.logError("Please select providers to send emails.");
                    //     //console.log(' please select providers to send emails. ');
                }
            } else {
                $rootScope.loading = false;
                logger.logError("Please enter Sender Name and Sender Email.");
            }
            // $rootScope.loading = false;
        };





        /**
                * View provider listing 
                * Created By Suman Chakraborty
                * Last modified on 28-11-2017
                */
        var getData = ngTableParamsServiceProviderSearch.get();
        //console.log(getData);
        if (getData.searchText != undefined) {
            $scope.doctor.searchTextField = getData.searchText;
        }
        if (getData.searchText2 != undefined) {
            $scope.doctor.specialty = getData.searchText2;

        }
        if (getData.searchText3 != undefined) {
            $scope.doctor.network = getData.searchText3;

        }


        /**
        * Advance search in listing page
        * Created By Suman Chakraborty
        * Last modified on 26-10-2017
        */
        $scope.searchableInsurance = function (searchObj) {
            //console.log(" herer searchable", searchObj);
            $scope.doctor.searchTextField = searchObj.searchTextField;
            // debugger;
            if ($scope.doctor.searchTextField == "") {
                // $scope.getAvailableProvidersUnAssociatedInsurance();
                $state.go('viewInsProviderAll', { id: $state.params.id }, { reload: true });

            }
            else {
                $scope.doctor.specialty = searchObj.specialty != undefined ? searchObj.specialty : undefined;
                // $scope.doctor.specialty.selected = {_id: searchObj.specialty};
                $scope.doctor.network = searchObj.network != undefined ? searchObj.network : undefined;
                ngTableParamsServiceProviderSearch.set('', '', $scope.doctor.searchTextField, $scope.doctor.specialty, $scope.doctor.network, '');

                ngTableParamsService.set('', '', searchObj.searchTextField, '');
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
                        $scope.paramUrl.insurance = $state.params.id;
                        $scope.paramUrl.network = [$state.params.id];
                        $scope.paramUrl.emailtype = searchObj.emailtype;
                        $scope.tableLoader = true;
                        $scope.doctorList = [];
                        doctorService.getDoctorsListAssociatedInsurance().save($scope.paramUrl, function (response) {
                            $scope.tableLoader = false;
                            // show only one specialty as per new rule there will be one specialty for each doctor
                            if (response.code === 200) {

                                response.data.forEach(function (item, index) {
                                    var createdBy = '-';
                                    if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0) {
                                        createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                                    }
                                    response.data[index]['created_by'] = createdBy;
                                })
                            }
                            $scope.doctorList = response.data;

                            // debugger;
                            // console.log("Unverified user Data", $scope.unverifiedUser)
                            // console.log("Proiders Data", response.data);
                            // if (response.data.length > 0) {
                            //     console.log("Data before ", response.data);
                            //     for (var i = 0; i < response.data.length; i++) {
                            //         for (var j = 0; j < $scope.unverifiedUser.length; j++) {
                            //             if (response.data[i]._id == $scope.unverifiedUser[j].userId && $scope.unverifiedUser[j].status == "1") {
                            //                 delete response.data[i];
                            //                 delete response.data[i].user_network;
                            //                 $scope.doctorList = response.data;
                            //                 var data = response.data;
                            //                 $scope.totalCount = response.totalCount;
                            //                 params.total(response.totalCount);
                            //                 $defer.resolve(data);
                            //                 break;
                            //             }

                            //         }
                            //     }
                            //     $scope.doctorList = response.data;

                            //     console.log("Data After", response.data);
                            // }
                            // else if (response.data.length == 0) {
                            //     $scope.doctorList = response.data;

                            // }
                            // setTimeout(function () {
                            //     var data = response.data;
                            //     $scope.totalCount = response.totalCount;
                            //     params.total(response.totalCount);
                            //     $defer.resolve(data);
                            // }, 1000);
                            $scope.doctorList = response.data;
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        });
                        // setTimeout(function () {
                        //     //$scope.excelExport($scope.paramUrl);
                        // }, 1000);
                    }
                });
            }

        };


        $scope.updateProviders = function (data) {
            //console.log(" updateProviders data ", data);

            doctorService.updateProviderNetwork().save({ networkId: data.insId, netProvs: data.insprovider }, function (response) {
                //doctorService.updateProviderNetwork().save({ networkId: data.insId, netProvs: data.insproviderr }, function (response) {
                if (response.code == 200) {
                    swal("Updated!", "Providers within the network updated.", "success");
                    $state.go('insurance', {}, { reload: true });
                } else {
                    swal("Updated!", "Unable to update providers within the network. Please try again.", "error");
                }
            });
        }

        $scope.updateProvidersUnlisted = function (data) {
            if (data.selectesList.length > 0) {
                   doctorService.updateProviderNetworkUnlisted().save({ networkId: data.insId, netProvs: data.selectesList, flag:'superadmin' }, function (response) {
                    // console.log(" response ", response);
                    if (response.code == 200) {
                        swal("Updated!", "Providers within the network updated.", "success");
                        $state.go('insurance', {}, { reload: true });
                    } else {
                        swal("Updated!", "Unable to update providers within the network. Please try again.", "error");
                    }
                });   



/*                 doctorService.updateProviderNetworkUnlisted().save({ networkId: data.insId, netProvs: data.selectesList }, function (response) {
                    // console.log(" response ", response);
                    if (response.code == 200) {
                        swal("Updated!", "Providers within the network updated.", "success");
                        $state.go('insurance', {}, { reload: true });
                    } else {
                        swal("Updated!", "Unable to update providers within the network. Please try again.", "error");
                    }
                });  */

            }
            else {
                swal("Updated!", "Please select providers to add in the network list.", "error");
            } 
        }

        titleService.getTitleList().save({}, function (response) {
            if (response.code == 200) {
                $scope.degreeArr = response.data;
                $scope.degreeExcelArr = new Array();
                response.data.forEach(function (item) {
                    $scope.degreeExcelArr[item.name.toLowerCase().trim()] = item._id;
                })
            } else { }
        })

        $scope.onclickFunction = function (insuranceName) {
            angular.element(document).ready(function () {
                document.getElementById('docfilexlx').click();
                // $scope.$apply(); 
                $rootScope.vartemp = insuranceName;
            });


        }
        // to get all services 
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
                    // console.log("getNetwork Response",response.data);
                    $scope.networkData = response.data;
                } else { }
            });
        }

        // get all insurance plans 
        $scope.getAvailableNetwork = function () {
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


        $scope.$watch('nonRegData', function () {
console.log("\n\n nonRegData ",$scope.nonRegData);

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
                            // console.log(" networkArr ", $scope.networkArr);
                            doctorService.GetSpecialty().get(function (response) {
                                if (response.code == 200) {
                                    $scope.specialityArr = new Array();
                                    response.data.forEach(function (item) {
                                        $scope.specialityArr[item.specialityName.toLowerCase().trim()] = item._id;
                                    })

                                    $scope.specialtyData = response.data;
                                    
                                    $scope.datalength = response.data.length;

                                    //console.log(" specialityArr ", $scope.specialityArr);

                                    if ($scope.nonRegData.data.length > 0) {
                                        var dataArr = [];

                                        $scope.nonRegData.data.forEach(function (item, index) {
                                            var nonRegDoc = {}; nonRegDoc.degree = ''; var networks = []; var speciality = []; var user_loc = []; var emailAvailable = 1;
                                            // Fetch insurance detail map with existing insurance and save corresponding ids


                                            //console.log(" rootScope.vartemp inside  ", $rootScope.vartemp);
                                            let itemArr = $rootScope.vartemp.split(',');
                                            itemArr.forEach(function (item) {
                                                //console.log(" item ", item);
                                                if (typeof $scope.networkArr[item.toLowerCase().trim()] !== 'undefined') {
                                                    networks.push($scope.networkArr[item.toLowerCase().trim()]);
                                                }
                                            })

                                            //console.log(" networks" , networks)
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
                                                'user_loc': user_loc,
                                                'emailAvailable': emailAvailable
                                            };

                                            if (item.degree) {
                                                nonRegDoc.degree = item.degree;
                                            }

                                            if (item.Id) {
                                                nonRegDoc._id = item.Id;
                                            }

                                            dataArr.push(nonRegDoc);

                                        });
                                        //console.log(" dataArr -> ", dataArr);
                                        doctorService.addNonRegDocInsurance().save(dataArr, function (response) {
                                            // error_success count is equal to total data count when all asynchronous execution are completed
                                            logger.logSuccess('Record(s) import in progress.');
                                            $rootScope.vartemp = '';
                                            //$scope.loading = false;
                                            //$state.reload('nonRegDocs');
                                        })

                                    } else {
                                        $rootScope.vartemp = '';
                                        $scope.loading = false;
                                        logger.logError('No records found. Please follow the sample file given and try again...');
                                    }
                                } //GetSpecialty 200 if end
                                else {
                                    $rootScope.vartemp = '';
                                    logger.logError('No records found. Please follow the sample file given and try again...');
                                }
                            }); //GetSpecialty end 

                        } // networkarr 200 if end
                        else {
                            $rootScope.vartemp = '';
                            logger.logError('No records found. Please follow the sample file given and try again...');
                        }
                    });// networkarr end

                } else {
                    $rootScope.vartemp = '';
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file. ');
                }
            } else {
                $rootScope.vartemp = '';
                $scope.loading = false;
                if ($scope.loading) {
                    logger.logError('File type not allowed. Please upload a .xls or .xlsx file.');
                }
            }
            // $rootScope.vartemp = '';
        });

    }])

    .directive("fileInsurence", [function () {
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
                            scope.$parent.$apply(function () {
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

