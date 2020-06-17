"use strict";

angular.module("officeAdmin")

nwdApp.controller("officeAdminController", [
    '$scope',
    '$rootScope',
    '$sessionStorage',
    '$location',
    'HomeService',
    'officeAdminService',
    'frontdesktitleService',
    '$state',
    'logger',
    'logProvider',
    '$filter',
    'ngTableParamsService',
    'ngTableParams',
    '$filter',

    function (
        $scope,
        $rootScope,
        $sessionStorage,
        $location,
        HomeService,
        officeAdminService,
        frontdesktitleService,
        $state,
        logger,
        logProvider,
        $filter,
        ngTableParamsService,
        ngTableParams
    ) {
        $scope.doctorPage = 'mainDoctorPage';
        $scope.counts = {};
        $scope.doctor = {};
        $scope.data = {};
        $scope.currentPage = 1;
        $scope.itemPerPage = 10;
        $scope.disabled = false;
        $scope.loading = false;
        $scope.baseUrl = baseUrl;
        $scope.officeadminTitleArr = {};
        var localData = JSON.parse(sessionStorage.getItem('test'));
        $scope.officeId = localData._id;
        $scope.fileName = "Front Desk User-list";
        // Just put the states in all the array,Check on run function the state change,
        // InHTML check the current state and use the class 
        $scope.usStates = stateList;

        /**
        Add Office Admin
        Created By Suman Chakraborty
        Last modified on 01-12-2017
        */
        $scope.addOfficeAdmin = function (dataArr) {
            $rootScope.loading = true;
            dataArr.userType = 'officeAdmin';
            dataArr.createdById = localData._id;
            var actvLog = { userId: localData._id, type: 5, detail: 'Add Front Desk User' };
            officeAdminService.addOfficeAdmin().save(dataArr, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess('Front Desk User added to network');
                    $state.go('officeAdmin-list');
                } else {
                    $rootScope.loading = false;
                    $scope.done = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        Get office admin list
        Created By Suman Chakraborty
        Last modified on 01-12-2017
        */
        $scope.getOfficeAdminList = function (anc) {
            anc = (anc == undefined) ? false : anc;
            var actvLog = { userId: localData._id, type: 4, detail: 'View Front Desk User list' };
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    if (anc) {
                        $scope.paramUrl.userType = 'ancillary';
                    }
                    $scope.tableLoader = true;
                    $scope.doctorList = []; 
                    officeAdminService.getOfficeAdminList().save($scope.paramUrl, function (response, err) {
                        if (response.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            
                            // show only one specialty as per new rule there will be one specialty for each doctor
                            response.data.forEach(function (item, index) {
                                var createdBy = '-';
                                response.data[index]['created_by'] = createdBy;                                
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

        /**
        delete front desk admin
        Created By Suman Chakraborty
        Last modified on 01-12-2017
        */
        $scope.isDelete = function (index, email) {
            var actvLog = { userId: localData._id, type: 13, detail: 'Delete Front Desk User' };
            $scope.emailId = {};
            $scope.emailId.email = email;
            swal({
                title: "Are you sure?",
                text: "It will remove the front desk user.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        officeAdminService.deleteOfficeAdmin().save($scope.emailId, function (response) {
                            if (response.code == 200) {
                                actvLog.success = true;
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                                $scope.doctorList.splice(index, 1)
                                $state.reload('officeAdmin-list');
                                swal("Deleted!", "User has been deleted.", "success");
                            } else {
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                            }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        /**
        change status of front desk amdin
        Created By Suman Chakraborty
        Last modified on 01-12-2017
        */
        $scope.changeStatus = function (id, item, anc) {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 6, detail: 'Update front desk user status' };
            anc = (anc == undefined) ? false : anc;
            var userArr = {
                'id': id,
                'status': item === '1' ? '0' : '1'
            };
            officeAdminService.updateStatus().save(userArr, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess(item === '1' ? 'User deactivated successfully.' : 'User activated successfully.');
                    if (anc) {
                        $state.reload('ancillary');
                    } else {
                        $state.reload('officeAdmin-list');
                    }

                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        reset password
        Created By Suman Chakraborty
        Last modified on 26-09-2017
        */
        $scope.resetPass = function (userID) {
            var actvLog = { userId: localData._id, type: 10, detail: 'Reset front desk user password' };
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
                    if (isConfirm) {
                        officeAdminService.resetPassword().save({
                            userId: userID
                        }, function (response) {
                            if (response.code == 200) {
                                actvLog.success = true;
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                                $state.reload('officeAdmin-list');
                                swal("Success!", "Password reset successfully.", "success");
                            } else {
                                logProvider.addUserActivity().save(actvLog, function (res) { });
                            }
                        })

                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        /**
        Resend invitation
        Created By Suman Chakraborty
        Last modified on 26-09-2017
        */
        $scope.resendInvite = function (inp) {
            $rootScope.loading = true;
            var localData = JSON.parse(sessionStorage.getItem('test'));
            var salutation = '';

            var msg2 = '<table border="0" cellpadding="0" cellspacing="0" width="100%">\n\
                                <tbody><tr><td>\n\
                            <table align="center" border="0" cellpadding="5" cellspacing="0" style="width:640px;background-color:rgb(57,65,81);">\n\
                            <tbody><tr>\n\
                            <td></td>\n\
                            </tr></tbody></table>\n\
                            <table align="center" border="0" cellpadding="10" cellspacing="0" style="width:640px;background-color:#fff">\n\
                            <tbody><tr><td>\n\
                            <p>Hello '+ inp.firstname + ' ' + inp.lastname + ',</p>\n\
                            <p><br />You are invited to join Which Docs. Please login to update your contact info and start using your account.' + '</p>\n\
                            <p>Site address is ' + 'http://52.39.212.226:5068' + '</p>\n\
                            <p>The email ID your are registered with is ' + ' ' + inp.email + '. Please use the password shared at the time of registration or you can reset password by clicking on forgot password in login page.' + '</p>\n\
                            <div style="border-bottom: 2px solid rgb(57,65,81); height: 0px;">&nbsp;</div>\n\
                            <p>Copyright &copy; ' + new Date().getFullYear() + ' ' + 'Which Docs LLC.</p>\n\
                            </td></tr></tbody></table></td></tr>\n\
                            </tbody></table>'
            var mail = {
                to: inp.email,
                subject: 'Invitation to Which Docs',
                content: msg2
            };
            officeAdminService.sendMail().save(mail, function (res) {
                if (res.code === 200) {
                    $rootScope.loading = false;
                    logger.logSuccess('Invitation sent successfully.');
                } else {
                    $rootScope.loading = false;
                    logger.logError('Unable to process your request. Please try again.');
                }
            })
        }

        /**
        Get data by ID
        Created By Suman Chakraborty
        Last modified on 01-12-2017
        */
        $scope.getById = function () {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 4, detail: 'View front desk user detail' };
            officeAdminService.getById().get({
                id: $state.params.id
            }, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    if (response.data.phone_number) {
                        response.data.phone_number = (response.data.phone_number.length === 10) ? response.data.phone_number : response.data.phone_number.substr(0, response.data.phone_number.length - 10);
                    }
                    if (response.data.cell_phone) {
                        response.data.cell_phone = (response.data.cell_phone.length === 10) ? response.data.cell_phone : response.data.cell_phone.substr(0, response.data.cell_phone.length - 10);
                    }
                    if (response.data.fax) {
                        response.data.fax = (response.data.fax.length === 10) ? response.data.fax : response.data.fax.substr(0, response.data.fax.length - 10);
                    }
                    $scope.doctor = response.data;
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        Update office admin details
        Created By Suman Chakraborty
        Last modified on 01-12-2017
        */
        $scope.updateOfficeAdmin = function (editdoctor) {
            $rootScope.loading = true;
            var actvLog = { userId: localData._id, type: 6, detail: 'Update front desk user detail' };
            officeAdminService.updateUser().save(editdoctor, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess(response.message);
                    // if this is requested from edit page then take to listing page. If requirest is from listing page then reload the page
                    if ($state.current.name === 'editofficeAdmin') {
                        $state.go('officeAdmin-list');
                    } else {
                        $state.reload('officeAdmin-list');
                    }
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        Search in listing page
        Created By Suman Chakraborty
        Last modified on 26-09-2017
        */
        $scope.searchable = function (searchObj, anc) {
            anc = (anc == undefined) ? false : anc;
            ngTableParamsService.set('', '', searchObj.searchTextField, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchObj.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    if (searchObj.searchTextField) {
                        $scope.paramUrl.searchText = searchObj.searchTextField;
                    }
                    if (typeof searchObj.service !== 'undefined' && searchObj.service.length > 0) {
                        $scope.paramUrl.service = searchObj.service;
                    }
                    if (typeof searchObj.specialty !== 'undefined' && searchObj.specialty.length > 0) {
                        $scope.paramUrl.specialty = searchObj.specialty;
                    }
                    if (typeof searchObj.network !== 'undefined' && searchObj.network.length > 0) {
                        $scope.paramUrl.network = searchObj.network;
                    }
                    if (anc) {
                        $scope.paramUrl.userType = 'officeAdmin';
                    }
                    $scope.tableLoader = true;
                    $scope.doctorList = []; 
                    officeAdminService.getOfficeAdminList().save($scope.paramUrl, function (response) {
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

        $scope.resetSearch = function (anc) {
            $scope.doctor = {};
            $scope.searchable('', anc);
        }

        $scope.getFrontdeskTitles = function () {

            frontdesktitleService.getTitleList().save({}, function (response) {
                if (response.code == 200) {
                    $scope.officeadminTitleArr = response.data;
                } else { }
            })
        }

        $scope.excelExport = function (exportprms) {
            
            delete exportprms.count; delete exportprms.page;
            officeAdminService.getOfficeAdminList().save(exportprms, function (response) {
                $scope.exportData = [];
                // Headers:
                $scope.exportData.push(["First Name", "Last Name", "Email", "Office Phone"]);

                // show only one specialty as per new rule there will be one specialty for each doctor
                if (response.code === 200) {
                    response.data.forEach(function (item, index) {                                          
                        // Data:                                
                        $scope.exportData.push([item.firstname, item.lastname, item.email, item.phone_number]);
                    })
                }                
            });
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
            var components = $scope.doctor.location.getPlace().address_components;  // from Google API place object   

            // show this on map
           // $scope.doctor.user_loc = [location.lat(), location.lng()];
            $scope.doctor.user_loc = [location.lng(), location.lat()];

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
]);