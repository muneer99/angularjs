"use strict";
angular.module('Preference', ['ngMap', 'gm', 'ngMaterial'])
nwdApp.controller('PreferenceController', [
    '$scope',
    '$filter',
    '$window',
    '$rootScope',
    '$routeParams',
    '$route',
    '$location',
    '$state',
    '$stateParams',
    '$http',
    'logger',
    'logProvider',
    '$anchorScroll',
    'PreferenceServices',
    'insuranceService',
    'ReferService',
    'CommonService',

    function ($scope, $filter, $window, $rootScope, $routeParams, $route, $location, $state, $stateParams, $http, logger, logProvider, $anchorScroll, PreferenceServices, insuranceService, ReferService, CommonService) {
        $scope.testdata = [];
        $scope.contactDetail = {};
        $scope.ccode = '+1';
        $scope.ccodeFax = '+1';
        $scope.contactDetail.range = 50;
        $scope.serviceslist = [];
        $scope.networkData = [];
        $scope.selectednetworkData = [];
        $scope.selectedInsuranceData = [];
        $scope.specList = [];
        $scope.contactDetailNetwork = [];
        $scope.contactDetailNetworkData = [];
        $scope.checkItems = [];
        $scope.choiceSet = new Array();

        $scope.frontDesk = (sessionStorage.getItem('userType') === 'officeAdmin') ? false : true;
        $scope.initialSet = [];
        $scope.tab = 2;
        $scope.countryCodes = countryCodes;
        $scope.isDuplicate = '';

        //$scope.degreeArr            = degree;
        //$scope.officeadminTitleArr = officeadminTitle;
        $scope.selectedTab = '';
        $scope.allowAdd = false;
        $scope.userPref = [];
        $scope.disabl = false;
        $scope.usStates = stateList;
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;
        $scope.centerlatlng = defaultLocation; // default center for map US 
        $scope.depth = 4; // default zoom leve for MAP
        $scope.defaultLocation = defaultLocation;
        $scope.serviceIdArr = [];
        $scope.netIdArr = [];
        $scope.netArrname = [];


        // $scope.addedInsData = [];
        $scope.contactDetail.network = [];
        $scope.unverifiedUser = [];
        $scope.accRange = 0;
        $scope.distanceSliderSelected = false;
        $scope.arrayOfRefferedRankingTitle = [{ id: 1, title: 'Your Most Refered to' }, { id: 1, title: 'Most Refered by others' }]
        $rootScope.previousSpecialityId = '';
        // $rootScope.contactDetail.networkAssociated=[];
        // $rootScope.item.selected = {};
        CommonService.getDegreeList();
        CommonService.getStateList();
        CommonService.getFrontdeskDegreeList();

        /**
        * Change place from map
        * Created By Suman Chakraborty
        * Last Modified on 09-05-2018
        */
        $scope.getpos = function (event) {
            $scope.contactDetail.user_loc = [event.latLng.lat(), event.latLng.lng()];
        };

        

        /**
        * Google auto complete address
        * Created By Suman Chakraborty
        * Last Modified on 09-05-2018
        */
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





            var location = $scope.contactDetail.location.getPlace().geometry.location;
            var components = $scope.contactDetail.location.getPlace().address_components;  // from Google API place object   


            // show this on map
            $scope.contactDetail.user_loc = [location.lat(), location.lng()];
            // Change MAP center
            $scope.centerlatlng = [location.lat(), location.lng()];
            $scope.depth = 17;
            // User address field text value update
            //$scope.contactDetail.location = $scope.contactDetail.location.getPlace().formatted_address;
            $scope.contactDetail.location = '';
            //$scope.contactDetail.sute = '';
            $scope.contactDetail.city = '';
            $scope.contactDetail.zipcode = '';

            for (var i = 0; i < components.length; i++) {
                var addressType = components[i].types[0];
                if (componentForm[addressType]) {
                    var val = components[i][componentForm[addressType]];
                    if (mapping[addressType] == 'location')
                        $scope.contactDetail[mapping[addressType]] = ($scope.contactDetail[mapping[addressType]]) ? $scope.contactDetail[mapping[addressType]] + " " + val : val;
                    else
                        $scope.contactDetail[mapping[addressType]] = val;

                }
            }

            $scope.$apply();
        });

        /**
         * Reset contactDetail form
         */
        $scope.resetForm = function () {
            $scope.contactDetail = {}
        }
        $scope.demo = {
            showTooltip: false,
            tipDirection: 'bottom'
        };

        $scope.demo.delayTooltip = 10;
        $scope.$watch('demo.delayTooltip', function (val) {
            $scope.demo.delayTooltip = parseInt(val, 10) || 0;
        });

        /**
         * Get services based on the selected specialties
         * Last modified on 01-08-2017
         */
        $scope.getServices = function () {
            var serviceArr = [];
            var serviceIDs = [];
            var specArr = [];
            PreferenceServices.GetServices().save({}, function (response) {
                response.data = response.data.map(function (item) { item.serviceName = item.serviceName; return item; })
                if (response.code == 200) {
                    //$scope.contactDetail.service = [];
                    $scope.serviceslist = response.data;
                    response.data.forEach(function (item) {
                        serviceIDs.push(item._id);
                    })
                    $scope.serviceIdArr = serviceIDs;
                } else { }
            })
        }

        /**
         * Fetch available networks from db 
         * 
         */

        $scope.getAvailableNetworks = function (searchTextField) {
           
            // get all insurance plans 
            // var localUser = JSON.parse($window.sessionStorage.getItem("test"));
            // console.log("UserId >>", localUser._id);
            // debugger;
            // setTimeout(function () {
            var netIDs = [];
            insuranceService.getNetwork().get({ id: '000',searchText: searchTextField }, function (response) {
                if (response.code == 200) {
                    //response.data       = response.data.map(function (item) { item.name = item.name; return item; })
                    // sort actual data alphabetically
                    response.data.sort(function (a, b) {
                        var textA = a.name.toUpperCase();
                        var textB = b.name.toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                    $scope.networkData = response.data;





                    // if (response.data.length > 0) {
                    //     console.log("Data before ", response.data);

                    //  $scope.verifiedUser.forEach(function(item){

                    //     response.data.forEach(function(item1){
                    //         console.log("verified network id", item.network, " Response Data Id ", item1._id)
                    // if (item.network == item1._id ) {
                    // delete item1
                    // response.data.forEach(function (item2) {
                    // if(item1._id != item2._id){
                    // netIDs.push(item1);
                    // }
                    // });
                    // $scope.netIdArr = netIDs;

                    // break;
                    // }
                    // })


                    // }) 

                    // $scope.netIdArr = netIDs;

                    // }
                    // else if (response.data.length == 0) {
                    //     $scope.networkData = response.data;
                    response.data.forEach(function (item) {
                        netIDs.push(item._id);
                        
                    });
                    // $scope.netIdArr = [];
                    $scope.netIdArr = netIDs;
                    
                    // }

                    // console.log("Network Data>>", $scope.networkData);
                    // response.data.forEach(function (item) {
                    //     netIDs.push(item._id);
                    // });
                    // $scope.netIdArr = netIDs;
                }
                // else { }
            });
            // }, 1000);
        }
        /**
         * Upload files from referral section
         * Last modified on 28-07-2017
         */
        $scope.uploadFile = function (files) {
            if (files[0]) {
                if (['png', 'jpg', 'jpeg'].indexOf(files[0]['type'].split('/')[1].toLowerCase()) > -1) {
                    $rootScope.profilePic = files;
                    $rootScope.fd = new FormData();
                    // Take the first at 0th position. For multiple files you have to iterate over this files key.
                    $rootScope.fd.append("file", files[0]);
                } else {
                    logger.logError('Please select a valid image.');
                }

            }

        };

        /**
         * update contact details
         * Last modified on 09-04-2018
         */
        $scope.updateContactnew = function () {
            PreferenceServices.migrateData().save({ verified: false }, function (res) {
            })
        }

        $scope.updateContact = function () {
            // debugger;
            $rootScope.loading = true;
            var selectedNetArr = [];
            // arrange selected network in alphabetic order
            // $scope.networkData.forEach(function (item) {
            //     if ($scope.contactDetail.network.indexOf(item._id) !== -1) {
            //         selectedNetArr.push(item._id);
            //     }
            // })
            //get Network by global variable

            $scope.networkData.forEach(function (item1) {
                angular.forEach($scope.selectednetworkData, function (item2, index) {
                    if (item1 == item2) {
                        selectedNetArr.push(item2._id);
                    }
                });


                // if ($scope.selectednetworkData.indexOf(item._id) !== -1) {
                //     selectedNetArr.push(item._id);
                // }
            });



            var str = $scope.contactDetail.email;
            var emailFlag = str.indexOf("temp@wd.com");
            if (emailFlag > -1) {
                //console.log(" 11 ");
                $scope.contactDetail.emailAvailable = 0;
                $scope.contactDetail.isRegistered = false;
            } else {
                //console.log(" 22 ");
                $scope.contactDetail.emailAvailable = 1;
                $scope.contactDetail.isRegistered = true;
            }
            //Task #535 end  
            // $scope.contactDetail.network = selectedNetArr;
            $scope.contactDetail.network = $scope.contactDetailNetworkData;


            var officeAdmin = {
                fromSvpFname: ($rootScope.user.firstname) ? $rootScope.user.firstname : '',
                fromSvpLname: ($rootScope.user.lastname) ? $rootScope.user.lastname : '',
                fromSvpDegree: ($rootScope.user.degree) ? $rootScope.user.degree : ''
            };
            if ($scope.contactDetail.newAdmin) {
                officeAdmin.email = $scope.contactDetail.newAdmin;
                officeAdmin.userType = 'officeAdmin';
            }
            var actvLog = { type: 6, detail: 'update profile', userId: $scope.frontDeskAcc };
            $scope.contactDetail.speciality = ($scope.contactDetail.speciality !== null && $scope.contactDetail.speciality !== '') ? $scope.contactDetail.speciality : [];
            $scope.contactDetail.frontdesk = ($scope.contactDetail.frontdesk !== null && $scope.contactDetail.frontdesk !== '') ? $scope.contactDetail.frontdesk : [];
            $scope.contactDetail.userId = $rootScope.user._id;

            // add new insurance
            if ($scope.contactDetail.newInsurance && $scope.contactDetail.newInsurance != '') {
                $scope.contactDetail.newInsurance = $scope.contactDetail.newInsurance
                insuranceService.addNetwork().save({ name: $scope.contactDetail.newInsurance, verified: false, added_by: $rootScope.user._id, user_first_name: $rootScope.user.firstname, user_last_name: $rootScope.user.lastname }, function (res) {
                    logProvider.addUserActivity().save({ userId: $rootScope.user._id, type: 5, detail: 'Add new insurance network', success: true }, function (res) { });
                })
            }

            if ($scope.contactDetail.cell_phone_temp) {
                var loc_code = ($scope.contactDetail.ccode) ? $scope.contactDetail.ccode : '+1';
                $scope.contactDetail.cell_phone = loc_code + $scope.contactDetail.cell_phone_temp;
            }
            // set lat lon
            if ($scope.contactDetail.fax_temp) {
                var loc_codefax = ($scope.contactDetail.ccodeFax) ? $scope.contactDetail.ccodeFax : '+1';
                $scope.contactDetail.fax = loc_codefax + $scope.contactDetail.fax_temp;
            }
            $scope.contactDetail.city = ($scope.contactDetail.city) ? $scope.contactDetail.city : '';
            $scope.contactDetail.state = ($scope.contactDetail.city) ? $scope.contactDetail.state : '';

            if ($rootScope.hasOwnProperty('profilePic') && $rootScope.profilePic.length > 0) {

                var formData = new FormData();
                formData.append('attachmentFile', $rootScope.profilePic[0]);
                ReferService.uploadAttachments().save(formData, function (resp) {
                    if (resp.code === 200) {
                        if (officeAdmin.hasOwnProperty('email')) {
                            PreferenceServices.addOfficeAdmin().save(officeAdmin, function (res) {
                                if (res) {
                                    // If there exists an array front desk admin and it does not contain current user
                                    if ($scope.contactDetail.frontdesk.length) {
                                        if ($scope.contactDetail.frontdesk.indexOf(res.data.userId) === -1) {
                                            $scope.contactDetail.frontdesk.push(res.data.userId);
                                        }
                                    } else {
                                        $scope.contactDetail.frontdesk = [res.data.userId];
                                    }
                                }
                                var fileName = resp.message;
                                $scope.contactDetail.image = resp.message;
                                //console.log(" contactdetail -> ", $scope.contactDetail); die;
                                PreferenceServices.UpdateContactDetails().save($scope.contactDetail, function (res) {
                                    //console.log(" res11 ",res);
                                    if (res.code == 200) {
                                        actvLog.success = true;
                                        logProvider.addUserActivity().save(actvLog, function (res) { });
                                        $rootScope.user.image = $scope.contactDetail.image;
                                        if (typeof $scope.contactDetail.speciality !== 'undefined' && $scope.contactDetail.speciality.length > 0) {
                                            $scope.contactDetail.speciality = $scope.contactDetail.speciality;
                                        }
                                        var localData = JSON.parse($window.sessionStorage.getItem('test'));

                                        // Clear user preference for the removed specialties
                                        localData.speciality.forEach(function (item) {
                                            if ($scope.contactDetail.speciality.indexOf(item) === -1) {
                                                var reqObj = { userId: $rootScope.user._id, speciality: item, preference: [] };
                                                PreferenceServices.addPreference().save(reqObj, function (res) { });
                                            }
                                        })
                                        // update local storage
                                        localData.firstname = $scope.contactDetail.firstname;
                                        localData.lastname = $scope.contactDetail.lastname;
                                        localData.location = $scope.contactDetail.location;
                                        localData.phone_number = $scope.contactDetail.phone_number;
                                        localData.cell_phone = $scope.contactDetail.cell_phone;
                                        localData.fax = $scope.contactDetail.fax;
                                        localData.sute = $scope.contactDetail.sute;
                                        localData.city = $scope.contactDetail.city;
                                        localData.state = $scope.contactDetail.state;
                                        localData.state = $scope.contactDetail.state;
                                        localData.degree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                                        localData.officeadminTitle = ($scope.contactDetail.officeadminTitle) ? $scope.contactDetail.officeadminTitle : '';
                                        localData.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                                        localData.service = $scope.contactDetail.service;
                                        localData.network = $scope.contactDetail.network;
                                        localData.range = $scope.contactDetail.range;
                                        $rootScope.user.firstname = $scope.contactDetail.firstname;
                                        $rootScope.user.lastname = $scope.contactDetail.lastname;
                                        $rootScope.user.location = $scope.contactDetail.location;
                                        $rootScope.user.phone_number = $scope.contactDetail.phone_number;
                                        $rootScope.user.cell_phone = $scope.contactDetail.cell_phone;
                                        $rootScope.user.fax = $scope.contactDetail.fax;
                                        $rootScope.user.sute = $scope.contactDetail.sute;
                                        $rootScope.user.city = $scope.contactDetail.city;
                                        $rootScope.user.state = $scope.contactDetail.state;
                                        $rootScope.user.zipcode = $scope.contactDetail.zipcode;
                                        $rootScope.user.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                                        $rootScope.user.service = $scope.contactDetail.service;
                                        $rootScope.user.network = $scope.contactDetail.network;
                                        $rootScope.user.range = $scope.contactDetail.range;
                                        $rootScope.user.user_loc = $scope.contactDetail.user_loc.reverse();
                                        $window.sessionStorage.setItem('test', JSON.stringify(localData));
                                        $window.sessionStorage.emailAvailable = res.responseData.emailAvailable; //Task #535
                                        $window.sessionStorage.firstLogin = res.responseData.firstLogin;
                                        logger.logSuccess('Contact details updated successfully.');

                                        // if front desk admin then redirect to doctor list otherwise if this is firstlogin then redirect to change password else to dashboard.                                       
                                        $scope.contactDetail.flag = "user";
                                        PreferenceServices.insertOrUpdateUsernetworks().save($scope.contactDetail, function (result) {
                                            /*  if (result.code == 200) {
 
                                                 if ($scope.frontDesk && !res.data) {
                                                     $rootScope.loading = false;
                                                     $state.go('dashboard');
                                                 } else if ($scope.frontDesk && res.data) {
                                                     $rootScope.loading = false;
                                                     $state.go('changePassword');
                                                 } else {
                                                     if (res.data) {
                                                         $rootScope.loading = false;
                                                         $state.go('changePassword');
                                                     } else {
                                                         $rootScope.loading = false;
                                                         $state.go('doctors-list');
                                                     }
                                                 }
 
 
                                             } */

                                        })

                                        if ($scope.frontDesk && !res.data) {
                                            $rootScope.loading = false;
                                            $state.go('dashboard');
                                        } else if ($scope.frontDesk && res.data) {
                                            $rootScope.loading = false;
                                            $state.go('changePassword');
                                        } else {
                                            if (res.data) {
                                                $rootScope.loading = false;
                                                $state.go('changePassword');
                                            } else {
                                                $rootScope.loading = false;
                                                $state.go('doctors-list');
                                            }
                                        }
                                    } else {
                                        $rootScope.loading = false;
                                        logProvider.addUserActivity().save(actvLog, function (res) { });
                                        logger.logError(res.message);
                                    }
                                });
                            });
                        } else {
                            var fileName = resp.message;
                            $scope.contactDetail.image = resp.message;
                            PreferenceServices.UpdateContactDetails().save($scope.contactDetail, function (res) {
                                //console.log(" res22 ",res);
                                if (res.code == 200) {
                                    actvLog.success = true;
                                    logProvider.addUserActivity().save(actvLog, function (res) { });
                                    $rootScope.user.image = $scope.contactDetail.image;
                                    if (typeof $scope.contactDetail.speciality !== 'undefined' && $scope.contactDetail.speciality.length > 0) {
                                        $scope.contactDetail.speciality = $scope.contactDetail.speciality;
                                    }
                                    var localData = JSON.parse($window.sessionStorage.getItem('test'));
                                    // Clear user preference for the removed specialties
                                    localData.speciality.forEach(function (item) {
                                        if ($scope.contactDetail.speciality.indexOf(item) === -1) {
                                            var reqObj = { userId: $rootScope.user._id, speciality: item, preference: [] };
                                            PreferenceServices.addPreference().save(reqObj, function (res) { });
                                        }
                                    })
                                    // update local storage
                                    localData.firstname = $scope.contactDetail.firstname;
                                    localData.lastname = $scope.contactDetail.lastname;
                                    localData.location = $scope.contactDetail.location;
                                    localData.phone_number = $scope.contactDetail.phone_number;
                                    localData.cell_phone = $scope.contactDetail.cell_phone;
                                    localData.fax = $scope.contactDetail.fax;
                                    localData.sute = $scope.contactDetail.sute;
                                    localData.city = $scope.contactDetail.city;
                                    localData.state = $scope.contactDetail.state;
                                    localData.degree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                                    localData.officeadminTitle = ($scope.contactDetail.officeadminTitle) ? $scope.contactDetail.officeadminTitle : '';
                                    localData.zipcode = $scope.contactDetail.zipcode;
                                    localData.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                                    localData.service = $scope.contactDetail.service;
                                    localData.network = $scope.contactDetail.network;
                                    localData.range = $scope.contactDetail.range;
                                    $rootScope.user.firstname = $scope.contactDetail.firstname;
                                    $rootScope.user.lastname = $scope.contactDetail.lastname;
                                    $rootScope.user.location = $scope.contactDetail.location;
                                    $rootScope.user.phone_number = $scope.contactDetail.phone_number;
                                    $rootScope.user.cell_phone = $scope.contactDetail.cell_phone;
                                    $rootScope.user.fax = $scope.contactDetail.fax;
                                    $rootScope.user.sute = $scope.contactDetail.sute;
                                    $rootScope.user.city = $scope.contactDetail.city;
                                    $rootScope.user.state = $scope.contactDetail.state;
                                    $rootScope.user.zipcode = $scope.contactDetail.zipcode;
                                    $rootScope.user.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                                    $rootScope.user.service = $scope.contactDetail.service;
                                    $rootScope.user.network = $scope.contactDetail.network;
                                    $rootScope.user.range = $scope.contactDetail.range;
                                    $rootScope.user.user_loc = $scope.contactDetail.user_loc.reverse();
                                    $window.sessionStorage.setItem('test', JSON.stringify(localData));
                                    //console.log(" res33 ",res);
                                    $window.sessionStorage.emailAvailable = res.responseData.emailAvailable; //Task #535                                    
                                    $window.sessionStorage.firstLogin = res.responseData.firstLogin;
                                    logger.logSuccess('Contact details updated successfully.');
                                    // if front desk admin then redirect to doctor list otherwise to dashboard.

                                    $scope.contactDetail.flag = "user";
                                    PreferenceServices.insertOrUpdateUsernetworks().save($scope.contactDetail, function (result) {
                                        /*  if (result.code == 200) {
 
                                             if ($scope.frontDesk && !res.data) {
                                                 $rootScope.loading = false;
                                                 $state.go('dashboard');
                                             } else if ($scope.frontDesk && res.data) {
                                                 $rootScope.loading = false;
                                                 $state.go('changePassword');
                                             } else {
                                                 if (res.data) {
                                                     $rootScope.loading = false;
                                                     $state.go('changePassword');
                                                 } else {
                                                     $rootScope.loading = false;
                                                     $state.go('doctors-list');
                                                 }
                                             }
 
 
                                         } */

                                    })

                                    if ($scope.frontDesk && !res.data) {
                                        $rootScope.loading = false;
                                        $state.go('dashboard');
                                    } else if ($scope.frontDesk && res.data) {
                                        $rootScope.loading = false;
                                        $state.go('changePassword');
                                    } else {
                                        if (res.data) {
                                            $rootScope.loading = false;
                                            $state.go('changePassword');
                                        } else {
                                            $rootScope.loading = false;
                                            $state.go('doctors-list');
                                        }
                                    }
                                } else {
                                    logProvider.addUserActivity().save(actvLog, function (res) { });
                                    logger.logError(res.message);
                                }
                            });
                        }
                    } else {
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        logger.logError(resp.message);
                    }
                });
            } else {
                //console.log(" contctdetail33 -> ", $scope.contactDetail);
                if (officeAdmin.hasOwnProperty('email')) {
                    //console.log(" contctdetail44 -> ", $scope.contactDetail);
                    PreferenceServices.addOfficeAdmin().save(officeAdmin, function (res) {
                        if (res) {
                            if ($scope.contactDetail.frontdesk.length) {
                                if ($scope.contactDetail.frontdesk.indexOf(res.data.userId) === -1) {
                                    $scope.contactDetail.frontdesk.push(res.data.userId);
                                }
                            } else {
                                $scope.contactDetail.frontdesk = [res.data.userId];
                            }
                            //console.log(" scope.contactDetail ", $scope.contactDetail);
                            PreferenceServices.UpdateContactDetails().save($scope.contactDetail, function (res) {
                                //console.log(" res44 ",res);
                                if (res.code == 200) {
                                    actvLog.success = true;
                                    logProvider.addUserActivity().save(actvLog, function (res) { });
                                    if (typeof $scope.contactDetail.speciality !== 'undefined' && $scope.contactDetail.speciality.length > 0) {
                                        $scope.contactDetail.speciality = $scope.contactDetail.speciality;
                                    }
                                    var localData = JSON.parse($window.sessionStorage.getItem('test'));
                                    // Clear user preference for the removed specialties
                                    localData.speciality.forEach(function (item) {
                                        if ($scope.contactDetail.speciality.indexOf(item) === -1) {
                                            var reqObj = { userId: $rootScope.user._id, speciality: item, preference: [] };
                                            PreferenceServices.addPreference().save(reqObj, function (res) { });
                                        }
                                    })
                                    // update local storage
                                    localData.firstname = $scope.contactDetail.firstname;
                                    localData.lastname = $scope.contactDetail.lastname;
                                    localData.location = $scope.contactDetail.location;
                                    localData.phone_number = $scope.contactDetail.phone_number;
                                    localData.cell_phone = $scope.contactDetail.cell_phone;
                                    localData.fax = $scope.contactDetail.fax;
                                    localData.sute = $scope.contactDetail.sute;
                                    localData.city = $scope.contactDetail.city;
                                    localData.state = $scope.contactDetail.state;
                                    localData.degree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                                    localData.officeadminTitle = ($scope.contactDetail.officeadminTitle) ? $scope.contactDetail.officeadminTitle : '';
                                    localData.zipcode = $scope.contactDetail.zipcode;
                                    localData.speciality = $scope.contactDetail.speciality;
                                    localData.service = $scope.contactDetail.service;
                                    localData.network = $scope.contactDetail.network;
                                    localData.range = $scope.contactDetail.range;
                                    $rootScope.user.firstname = $scope.contactDetail.firstname;
                                    $rootScope.user.lastname = $scope.contactDetail.lastname;
                                    $rootScope.user.location = $scope.contactDetail.location;
                                    $rootScope.user.phone_number = $scope.contactDetail.phone_number;
                                    $rootScope.user.cell_phone = $scope.contactDetail.cell_phone;
                                    $rootScope.user.fax = $scope.contactDetail.fax;
                                    $rootScope.user.sute = $scope.contactDetail.sute;
                                    $rootScope.user.city = $scope.contactDetail.city;
                                    $rootScope.user.state = $scope.contactDetail.state;
                                    $rootScope.user.zipcode = $scope.contactDetail.zipcode;
                                    $rootScope.user.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                                    $rootScope.user.service = $scope.contactDetail.service;
                                    $rootScope.user.network = $scope.contactDetail.network;
                                    $rootScope.user.range = $scope.contactDetail.range;
                                    $rootScope.user.user_loc = $scope.contactDetail.user_loc.reverse();
                                    $window.sessionStorage.setItem('test', JSON.stringify(localData));
                                    $window.sessionStorage.emailAvailable = res.responseData.emailAvailable; //Task #535
                                    $window.sessionStorage.firstLogin = res.responseData.firstLogin;
                                    // console.log(" window.sessionStorage ", $window.sessionStorage);
                                    logger.logSuccess('Contact details updated successfully.');
                                    // if front desk admin then redirect to doctor list otherwise to dashboard.
                                    $scope.contactDetail.flag = "user";
                                    PreferenceServices.insertOrUpdateUsernetworks().save($scope.contactDetail, function (result) {

                                        /* if (result.code == 200) {
                                            if ($scope.frontDesk && !res.data) {
                                                $rootScope.loading = false;
                                                $state.go('dashboard');
                                            } else if ($scope.frontDesk && res.data) {
                                                $rootScope.loading = false;
                                                $state.go('changePassword');
                                            } else {
                                                if (res.data) {
                                                    $rootScope.loading = false;
                                                    $state.go('changePassword');
                                                } else {
                                                    $rootScope.loading = false;
                                                    $state.go('doctors-list');
                                                }
                                            }

                                        } */

                                    })


                                    if ($scope.frontDesk && !res.data) {
                                        $rootScope.loading = false;
                                        $state.go('dashboard');
                                    } else if ($scope.frontDesk && res.data) {
                                        $rootScope.loading = false;
                                        $state.go('changePassword');
                                    } else {
                                        if (res.data) {
                                            $rootScope.loading = false;
                                            $state.go('changePassword');
                                        } else {
                                            $rootScope.loading = false;
                                            $state.go('doctors-list');
                                        }
                                    }
                                } else {
                                    $rootScope.loading = false;
                                    logProvider.addUserActivity().save(actvLog, function (res) { });
                                    logger.logError(res.message);
                                }
                            });
                        }
                    });
                } else {
                    //console.log(" contctdetail55 -> ", $scope.contactDetail);
                    //console.log(" scope.contactDetail ", $scope.contactDetail);
                    PreferenceServices.UpdateContactDetails().save($scope.contactDetail, function (res) {
                        //console.log(" res-> ", res);
                        //console.log(" res55 ",res);
                        if (res.code == 200) {
                            actvLog.success = true;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            if (typeof $scope.contactDetail.speciality !== 'undefined' && $scope.contactDetail.speciality.length > 0) {
                                $scope.contactDetail.speciality = $scope.contactDetail.speciality;
                            }
                            var localData = JSON.parse($window.sessionStorage.getItem('test'));
                            // Clear user preference for the removed specialties
                            localData.speciality.forEach(function (item) {
                                if ($scope.contactDetail.speciality.indexOf(item) === -1) {
                                    var reqObj = { userId: $rootScope.user._id, speciality: item, preference: [] };
                                    PreferenceServices.addPreference().save(reqObj, function (res) { });
                                }
                            })
                            // update local storage
                            localData.firstname = $scope.contactDetail.firstname;
                            localData.lastname = $scope.contactDetail.lastname;
                            localData.location = $scope.contactDetail.location;
                            localData.phone_number = $scope.contactDetail.phone_number;
                            localData.cell_phone = $scope.contactDetail.cell_phone;
                            localData.fax = $scope.contactDetail.fax;
                            localData.sute = $scope.contactDetail.sute;
                            localData.city = $scope.contactDetail.city;
                            localData.state = $scope.contactDetail.state;
                            localData.degree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                            localData.zipcode = $scope.contactDetail.zipcode;
                            localData.speciality = $scope.contactDetail.speciality;
                            localData.service = $scope.contactDetail.service;
                            localData.network = $scope.contactDetail.network;
                            localData.range = $scope.contactDetail.range;
                            $rootScope.user.firstname = $scope.contactDetail.firstname;
                            $rootScope.user.lastname = $scope.contactDetail.lastname;
                            $rootScope.user.location = $scope.contactDetail.location;
                            $rootScope.user.phone_number = $scope.contactDetail.phone_number;
                            $rootScope.user.cell_phone = $scope.contactDetail.cell_phone;
                            $rootScope.user.fax = $scope.contactDetail.fax;
                            $rootScope.user.sute = $scope.contactDetail.sute;
                            $rootScope.user.city = $scope.contactDetail.city;
                            $rootScope.user.state = $scope.contactDetail.state;
                            $rootScope.user.zipcode = $scope.contactDetail.zipcode;
                            $rootScope.user.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                            $rootScope.user.service = $scope.contactDetail.service;
                            $rootScope.user.network = $scope.contactDetail.network;
                            $rootScope.user.range = $scope.contactDetail.range;
                            $rootScope.user.user_loc = $scope.contactDetail.user_loc.reverse();
                            $window.sessionStorage.setItem('test', JSON.stringify(localData));
                            $window.sessionStorage.emailAvailable = res.responseData.emailAvailable; //Task #535
                            $window.sessionStorage.firstLogin = res.responseData.firstLogin;
                            // console.log(" window.sessionStorage ", $window.sessionStorage);
                            logger.logSuccess('Contact details updated successfully.');
                            // if front desk admin then redirect to doctor list otherwise to dashboard.
                            $scope.contactDetail.flag = "user";
                            PreferenceServices.insertOrUpdateUsernetworks().save($scope.contactDetail, function (result) {

                                /* if (result.code == 200) {
                                    if ($scope.frontDesk && !res.data) {
                                        $rootScope.loading = false;
                                        $state.go('dashboard');
                                    } else if ($scope.frontDesk && res.data) {
                                        $rootScope.loading = false;
                                        $state.go('changePassword');
                                    } else {
                                        if (res.data) {
                                            $rootScope.loading = false;
                                            $state.go('changePassword');
                                        } else {
                                            $rootScope.loading = false;
                                            $state.go('doctors-list');
                                        }
                                    }
                                } */

                            })

                            if ($scope.frontDesk && !res.data) {
                                $rootScope.loading = false;
                                $state.go('dashboard');
                            } else if ($scope.frontDesk && res.data) {
                                $rootScope.loading = false;
                                $state.go('changePassword');
                            } else {
                                if (res.data) {
                                    $rootScope.loading = false;
                                    $state.go('changePassword');
                                } else {
                                    $rootScope.loading = false;
                                    $state.go('doctors-list');
                                }
                            }
                        } else {
                            $rootScope.loading = false;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(res.message);
                        }
                    });
                }
            }
        }

        $scope.refreshPreference = function (inp) {
            var localUser = JSON.parse($window.sessionStorage.getItem("test"));
            var userDetail = [];
            PreferenceServices.getUserDetails().save({ userId: localUser._id }, function (resp) {
                if (resp.code === 200) {
                    userDetail = resp.data;
                } else {
                    userDetail = localUser;
                }
                $scope.contactDetail = {
                    'userId': userDetail._id,
                    'firstname': userDetail.firstname,
                    'lastname': userDetail.lastname,
                    'email': userDetail.email,
                    'location': userDetail.location,
                    'phone_number': userDetail.phone_number,
                    'cell_phone': userDetail.cell_phone,
                    'fax': userDetail.fax,
                    'sute': userDetail.sute,
                    'city': userDetail.city,
                    'state': userDetail.state,
                    'zipcode': userDetail.zipcode,
                    'speciality': (userDetail.speciality.length > 0) ? userDetail.speciality : '',
                    'service': userDetail.service,
                    'network': userDetail.network,
                };
            })
            var userSpecName = [];
            PreferenceServices.getSpecialities().get(function (response) {
                console.log(" specialities ", response.data);
                if (response.code == 200) {
                    response.data = response.data.map(function (item) { item.specialityName = item.specialityName; return item; })
                    $scope.specialityData = {};
                    $scope.specialityData.data = response.data;
                    $scope.getServices();
                    $scope.getAvailableNetworks();
                    $scope.contactDetail.service = userDetail.service;
                    var specArr = [];
                    // set speciality array for view page tabs  
                    response.data.forEach(function (item) {
                        // all speciality to be shown while updating preference
                        specArr.push({ id: item._id, name: item.specialityName });
                    })
                    $scope.specList = specArr;
                    // Select first speciality on switch tab
                    $scope.selectedTab = $scope.specList[0]['id'];


                    // Fetch user's existing preference and populate data in specialist tab accordingly 
                    PreferenceServices.getPreference().save({ userId: $rootScope.user._id }, function (res) {
                        if (res.code === 200) {
                            res.data.forEach(function (item) {
                                $scope.choiceSet[item.speciality] = item.preference;
                            })
                        }
                    });
                    //console.log(" $scope.choiceSet ",$scope.choiceSet);
                    // Get the doctor list of the first tab
                    $scope.getDoctorBySpeciality($scope.specList[0]['id']);

                } else {
                    logger.logError(response.message);
                }
            });
        }


       

        $scope.searchable = function (searchTextField) {
            //console.log(" inside searchable ", searchTextField);
            PreferenceServices.getSpecialities().get({ searchText: searchTextField }, function (response) {
                if (response.code == 200) {
                    response.data = response.data.map(function (item) { item.specialityName = item.specialityName; return item; })
                    $scope.specialityData = {};
                    $scope.specialityData.data = response.data;
                    $scope.getServices();
                    $scope.getAvailableNetworks();

                    var specArr = [];
                    // set speciality array for view page tabs  
                    response.data.forEach(function (item) {
                        // all speciality to be shown while updating preference
                        specArr.push({ id: item._id, name: item.specialityName });
                    })
                    $scope.specList = specArr;
                    // Select first speciality on switch tab
                    $scope.selectedTab = $scope.specList[0]['id'];
                    // Get the doctor list of the first tab
                    $scope.getDoctorBySpeciality($scope.specList[0]['id']);
                    //console.log(" getDoctorBySpeciality ");
                    // Fetch user's existing preference and populate data in specialist tab accordingly 
                    PreferenceServices.getPreference().save({ userId: $rootScope.user._id }, function (res) {
                        if (res.code === 200) {
                            res.data.forEach(function (item) {
                                $scope.choiceSet[item.speciality] = item.preference;
                            })
                        }
                    });
                } else {
                    logger.logError(response.message);
                }
            });
        };


        /**
         * Get contact details of the logged in user to show on login screen
         * Last modified on 02-02-2018
         */
        $scope.getServices();
        $scope.getAvailableNetworks();

        $scope.getContactDetails = function () {

            $rootScope.loading = true;
            $scope.tab = 1;
            var ccode = '+1';
            var ccodeFax = '+1';
            var localUser = JSON.parse($window.sessionStorage.getItem("test"));
            var userDetail = [];
            var userSpecName = [];
            var officeAdminArr = [];
            var allOfficeAdmin = [];
            var actvLog = { type: 4, detail: 'View profile', userId: $scope.frontDeskAcc };
            $scope.selectedOfficeAdminArr = [];


            // setTimeout(function () {
            PreferenceServices.getSpecialities().get(function (response) {
                if (response.code == 200) {
                    response.data = response.data.map(function (item) { item.specialityName = item.specialityName; return item; })
                    PreferenceServices.getFrontDeskAdmin().get(function (res) {
                        if (res.code === 200) {
                            $scope.frontDeskArr = res.data.map(function (item) {
                                allOfficeAdmin.push(item._id);
                                if (item.firstname || item.lastname) {
                                    item.name = item.firstname + ' ' + item.lastname;
                                } else {
                                    item.name = item.email
                                }
                                return item;
                            });
                            $scope.specialityData = response.data;
                            // console.log("  $scope.networkData ", $scope.networkData);
                            setTimeout(function () {

                                // PreferenceServices.getUserSpecificNetworkData().get({
                                //     id: localUser._id, userType: 'user'
                                // }, function (resp) {
                                //     if (resp.code == 200) {
                                //         $scope.verifiedUser = resp.data;
                                //         console.log(resp.data, 'resp.data');
                                //         $scope.verifiedUser.forEach(function (item) {
                                //             console.log(item);
                                //             $scope.networkData.forEach(function (item1) {
                                //                 if (item1._id == item.network) {
                                //                     $scope.contactDetail.network.push(item1);
                                //                 }
                                //             })

                                //         })

                                //     }

                                // })
                                PreferenceServices.getUserSpecificNetworkData().get({
                                    id: localUser._id, userType: 'user'
                                }, function (resp) {
                                    if (resp.code == 200) {
                                        $scope.verifiedUser = resp.data;
                                        // console.log($scope.verifiedUser);
                                        $scope.verifiedUser.forEach(function (item) {
                                            $scope.networkData.forEach(function (item1) {
                                                if (item1._id == item.network) {
                                                    $scope.contactDetail.network.push(item1);
                                                }
                                            })

                                        })

                                    }

                                })
                            }, 5000);

                            PreferenceServices.getUserDetails().save({ userId: localUser._id }, function (resp) {
                                if (resp.code === 200) {
                                    userDetail = resp.data;
                                } else {
                                    userDetail = localUser;
                                }
                                userDetail.frontdesk.forEach(function (item, index) {
                                    if (allOfficeAdmin.indexOf(item) !== -1) {
                                        officeAdminArr.push(item)
                                        $scope.selectedOfficeAdminArr.push($scope.frontDeskArr[allOfficeAdmin.indexOf(item)])
                                    }
                                })
                                var serviceArr = [];
                                var netArr = [];
                                var netArrname = [];

                                userDetail.service.forEach(function (item) {
                                    if ($scope.serviceIdArr.indexOf(item) > -1) {
                                        serviceArr.push(item);
                                    }
                                })
                                // debugger;

                                // userDetail.network.forEach(function (item) {
                                //     if ($scope.netIdArr.indexOf(item) > -1) {
                                //         netArr.push(item);
                                //     }
                                // })

                                //get usernetwork data
                               
                                insuranceService.getUserNetwork().get({ id: localUser._id }, function (response) {
                                    
                                    if (response.code == 200) {
                                        response.data.forEach(function (item) {
                                            
                                            if (item.status == 1) {
                                                netArr.push(item.network);
                                            }
                                        });
                                        $scope.selectedNetwork = netArr;
                                           
                                         $scope.CheckSelectedValue();

                                    }

                                });



                                //get usernetwork names data 
                                // insuranceService.getSelectedNetwork().get({ id: localUser._id }, function (response) {
                                //     if (response.code == 200) {
                                //         response.data.forEach(function (item) {

                                //              if (item.status == 1) {
                                //                 netArrname.push(item.network);


                                //             }
                                //            });
                                //         $scope.action_distance = netArrname;

                                //     }

                                // });



                                //get selectnetworkData in  Textarea
                                // $scope.getSelectedItems = function (item) {
                                //     return item.selected;

                                // }


                                // $scope.action_distance = [
                                //     {
                                //         $$hashKey: "object:421",
                                //         desc: "",
                                //         name: "ACO Feb 13",
                                //         searchKey: "acofeb13",
                                //         selected: true,
                                //         verified: true,
                                //         _id: "5c6438e6ee5ee64761551fcc",
                                //     }, {
                                //         $$hashKey: "object:420",
                                //         desc: "",
                                //         name: "simply healthcare",
                                //         searchKey: "simplyhealthcare",
                                //         selected: true,
                                //         verified: true,
                                //         _id: "59f52c42da65ea533b5b02ac",
                                //     },
                                //     {
                                //         _id: "5c6f56ad360cd4147e6aaed1",
                                //         name: "ACO Feb 21",
                                //         searchKey: "acofeb21",
                                //         verified: true,
                                //         desc: "",
                                //         email: "jefeqrv@mail.com",
                                //         password: "119fd6823b246e57117c",
                                //         passExpDate: "2019-06-27T15:08:41.771Z",
                                //         isLoggedIn: false,
                                //     }
                                // ];


                                // netArrname.forEach(function (val) {
                                //     console.log(val);
                                //  });

                                // if ($scope.action_distance.length > 0) {

                                //     $scope.testdata = $scope.testdata.concat($scope.action_distance);

                                // }

                                //get selected value onclick of checkbox
                                $scope.test = [];
                                // $scope.getSelectednetworkName = function () {
                                //     if ($scope.action_distance.length > 0) {

                                //         $scope.testdata = $scope.testdata.concat($scope.action_distance);

                                //     }
                                // }
                                $scope.GetValue = function (a, b) {
                                        
                                    var array = [];
                                    var Arrays = [];
                                    // $scope.contactDetailNetworkData = $filter('filter')($scope.networkData,{ selected: true }, true);
                                       

                                    if (b == true) {
                                        $scope.contactDetailNetworkData.push(a);
                                         //for check checkbox
                                         
                                        $scope.checkItems.push(a._id);

                                    }
                                    
                                    if (b == undefined) {
                                       
                                        array.push(a);
                                        Arrays.push(a._id);
                                        
                                        //  original function
                                        // $scope.contactDetailNetworkData = $scope.contactDetailNetworkData.filter(function (o) {
                                        //    return array.indexOf(o) == -1;
                                        // });
                                        $scope.contactDetailNetworkData = $scope.contactDetailNetworkData.filter(function (o) {
                                           
                                            return o._id !== a._id;
                                            // return array.indexOf(o) == -1;
                                         });
                                        //for check checkbox
                                        $scope.checkItems = $scope.checkItems.filter(function (o) {
                                            return Arrays.indexOf(o) == -1;
                                        });

                                        
                                        
                                        
                                    }
                                    if (b == false) {
                                       
                                        array.push(a);
                                        Arrays.push(a._id);

                                        $scope.contactDetailNetworkData = $scope.contactDetailNetworkData.filter(function (o) {
                                           return array.indexOf(o) == -1;
                                        });
                                        
                                       
                                        
                                        //for check checkbox
                                        $scope.checkItems = $scope.checkItems.filter(function (o) {
                                            return Arrays.indexOf(o) == -1;
                                        });
                                        var index = $scope.contactDetailNetworkData.indexOf(a);

                                    }
                                    
                                    $scope.selectednetworkData = $scope.contactDetailNetworkData;
                                    
                                     
                                    
                                };


                                if (userDetail.cell_phone && userDetail.cell_phone.length > 10 && userDetail.cell_phone.substr(0, userDetail.cell_phone.length - 10).length > 1) {
                                    ccode = userDetail.cell_phone.substr(0, userDetail.cell_phone.length - 10);
                                    userDetail.cell_phone = userDetail.cell_phone.substr(userDetail.cell_phone.length - 10);
                                } else {
                                    userDetail.cell_phone = '';
                                }
                                if (userDetail.fax && userDetail.fax.length > 10 && userDetail.fax.substr(0, userDetail.fax.length - 10).length > 1) {
                                    ccodeFax = userDetail.fax.substr(0, userDetail.fax.length - 10);
                                    userDetail.fax = userDetail.fax.substr(userDetail.fax.length - 10);
                                } else {
                                    userDetail.fax = '';
                                }
                                if (userDetail.user_loc && userDetail.user_loc[0] !== 0) {
                                    userDetail.user_loc = userDetail.user_loc;
                                    $scope.depth = 17;
                                } else {
                                    userDetail.user_loc = defaultLocation
                                }
                                $scope.contactDetail = {
                                    'userId': userDetail._id,
                                    'firstname': userDetail.firstname,
                                    'lastname': userDetail.lastname,
                                    'email': userDetail.email,
                                    'location': userDetail.location,
                                    'centername': userDetail.centername,
                                    'degree': (userDetail.degree) ? userDetail.degree : '',
                                    'officeadminTitle': (userDetail.officeadminTitle) ? userDetail.officeadminTitle : '',
                                    'phone_number': userDetail.phone_number,
                                    'ccode': ccode,
                                    'ccodeFax': ccodeFax,
                                    'cell_phone': userDetail.cell_phone,
                                    'cell_phone_temp': userDetail.cell_phone,
                                    'fax': userDetail.fax,
                                    'fax_temp': userDetail.fax,
                                    'sute': userDetail.sute,
                                    'city': userDetail.city,
                                    'state': userDetail.state,
                                    'zipcode': userDetail.zipcode,
                                    'speciality': (userDetail.speciality.length > 0) ? userDetail.speciality : '',
                                    'poc_name': (userDetail.poc_name) ? userDetail.poc_name : '',
                                    'poc_phone': (userDetail.poc_phone) ? userDetail.poc_phone : '',
                                    'service': serviceArr,
                                    'frontdesk': officeAdminArr,
                                    'network': netArr,
                                    'range': (userDetail.range) ? userDetail.range : 0,
                                    'user_loc': userDetail.user_loc,
                                    'emailnotificationPref': userDetail.emailnotificationPref,
                                    'txtnotificationPref': userDetail.txtnotificationPref,
                                    'showMobile': userDetail.showMobile
                                };



                                // $scope.addedInsData = $scope.contactDetail.network;
                                // console.log("addedInsData Data", $scope.addedInsData);



                                /*  PreferenceServices.getUserSpecificNetworkData().get({
                                     id: localUser._id, userType:'user'
                                 }, function (resp) {
                                     if (resp.code == 200) {
                                         console.log("Verified User Data", resp)
                                         $scope.verifiedUser = resp.data;
             
             
                                     }
             
                                 }) */


                                /*   $scope.unverifiedUser.forEach(function(item){
            
                              //         response.data.forEach(function(item1){
                              //             console.log("unverified network id", item.network, " Response Data Id ", $scope.addedInsData)
                                          if (item.network == $scope.contactDetail.network && item.status == "1" && item.userId == localUser._id) {
                              //                 // delete item1
                              //                 response.data.forEach(function (item2) {
                                                  // if(item1._id != item2._id){
                                                      delete item;
                                                  // }
                              //                 });
                              //                 // $scope.netIdArr = netIDs;
            
                              //                 // break;
                                          }
                                      })
            
            
                              //     })
            
                              //     $scope.netIdArr = netIDs;
            
                              // }
                              // else if (response.data.length == 0) {
                              //     $scope.networkData = response.data;
                              //     response.data.forEach(function (item) {
                              //         netIDs.push(item._id);
                              //     });
                              //     // $scope.netIdArr = [];
                              //     $scope.netIdArr = netIDs;
                              // }
            
            
            
                              console.log("Net Array Data After", $scope.contactDetail.network);  */
                                $scope.centerlatlng = userDetail.user_loc;
                                $rootScope.loading = false;
                            })


                            ////


                        }
                    })
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                } else {
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            });
            // }, 1000);
        }

        $scope.CheckSelectedValue = function (data) {
          
            $scope.networkData.forEach(function (data) {
                if ($scope.selectedNetwork.includes(String(data._id))) {
                   
                    if (!$scope.contactDetailNetworkData.includes(data._id)) {
                        $scope.contactDetailNetworkData.push(data);
                        
                    }
                };
            });
        }
       

        $scope.CheckSelectedValue2 = function (data, b) {
           var arrayss = $scope.selectedNetwork.concat($scope.checkItems);
            if ($scope.selectedNetwork.includes(String(data))) {
                return $scope.selectedNetwork.includes(String(data));
            };
            if ($scope.checkItems.includes(String(data))) {
                return $scope.checkItems.includes(String(data));
            };
           
        }
        
        /**
         *  Get doctors list by speciality for the choosing preference
         */
        $scope.getDoctorBySpeciality = function (entity) {
            // Add an empty row to choice on switching tab if there is no selection for that particular type
            /*if (typeof $scope.choiceSet[entity] == 'object') {
                if ($scope.choiceSet[entity].length === 0) {
                    $scope.addNewChoice(entity);
                }
            } else {
                $scope.addNewChoice(entity);
            }*/
            // $scope.loading = true;
            // Added by saurabh 19-June-2019
            if (entity == '') {
                $scope.selectedTab = $rootScope.previousSpecialityId
                $scope.distanceSliderSelected = true;
            }
            else {
                $scope.selectedTab = entity;
                $rootScope.previousSpecialityId = entity;
            }

            $scope.docs = [];

            var param = { userId: $rootScope.user._id, userLoc: $rootScope.user.user_loc, range: 50, speciality: [$scope.selectedTab] };
            if ($rootScope.user.state) {
                if ($rootScope.user.state == 'ALL') {
                    param.state = '';
                } else {
                    param.state = $rootScope.user.state;
                }

            }
            
            $scope.docList = PreferenceServices.getDoctorBySpeciality().save(param, function (res) {
                if (res.code === 200) {
                    var docArr = [];
                    if (res.hasOwnProperty('data') && res.data.length > 0) {
                        res.data.forEach(function (ite) {
                            //if($scope.choiceSet[entity].indexOf(ite._id) == -1)
                            if (ite.firstname && ite.lastname)
                                var provider_name = ite.firstname + ' ' + ite.lastname;
                            else if (ite.centername)
                                var provider_name = ite.centername;
                            docArr.push({ id: ite._id, name: provider_name });
                        })
                    } else {
                        docArr.push({ id: 0, name: "No provider available" });
                    }
                    $scope.docs = docArr;
                    // console.log(" docs ", $scope.docs);
                    $scope.allowAdd = true;

                    // Code added by Saurabh 20-June-2019
                    if ($scope.distanceSliderSelected) {
                        PreferenceServices.getPreference().save({ userId: $rootScope.user._id, userLoc: $rootScope.user.user_loc, range: $scope.accRange }, function (res) {
                            if (res.code === 200) {
                                res.data.forEach(function (item) {
                                    $scope.choiceSet[item.speciality] = item.preference;
                                })
                                $scope.distanceSliderSelected = false;
                            }
                        });
                        // Get the doctor list of the first tab
                        // $scope.getDoctorBySpeciality($scope.specList[0]['id']);
                    }
                    // $scope.loading = false;
                } else {
                    logger.logError(res.message);
                }
            })
        }

        /**
         * Add new choices from preference section in temp array to update in future.
         * last modified on 01-08-2017
         */
        $scope.addNewChoice = function (item) {
            if (!$scope.choiceSet.hasOwnProperty(item)) {
                $scope.choiceSet[item] = [];
            }
            if ($scope.choiceSet[item].length < 10) {

                $scope.choiceSet[item].push('');
            } else {
                alert('Maximum 10 preference allowed.');
                $scope.disabl = true;
            }
        };

        /**
         * Remove choices from preference section temp array'
         * Last modified on 01-08-2017
         */
        $scope.removeChoice = function (item) {
            var lastItem = $scope.choiceSet[item].length - 1;
            $scope.choiceSet[item].splice(lastItem);
            if ($scope.choiceSet[item].length < 10) {
                $scope.disabl = false;
            }
        };

        /**
         * Return title for priority position (for eg. 1st, 2nd ,3rd etc...)
         * last modified on 01-08-2017
         */
        $scope.getName = function (i) {
            var preferenceArr = ['st', 'nd', 'rd'];
            return typeof (preferenceArr[i]) !== 'undefined' ? preferenceArr[i] : 'th';
        }

        /**
         * Reset all preference
         * last modified on 01-08-2017
         */
        $scope.resetPreference = function () {
            for (var prop in $scope.choiceSet) {
                $scope.choiceSet[prop] = [];
            }
        }

        /**
         * Save preference 
         * Last modified on 31-07-2017
         */
        $scope.updatePreference = function () {
            var specialityArr = [];
            //console.log(" scope prop ", prop);
            for (var prop in $scope.choiceSet) {
                if (prop !== '') {
                    var dataObj = {
                        userId: $rootScope.user._id,
                        speciality: prop,
                        preference: $scope.choiceSet[prop]
                    }
                    //console.log(" dataObj ",dataObj);
                    PreferenceServices.addPreference().save(dataObj, function (res) {
                        if (res.code === 200) { }
                    });
                }
            }
            //end of update
            logger.logSuccess('Preferences updated successfully.');
        }

        $scope.showFaq = function (pageid) {
            CommonService.showFaq(pageid);
        }

        $scope.onStatusChange = function (eventVal) {
            // console.log("result of checkbox",eventVal);
            $scope.toggleCheckVal;
            if (eventVal.target.checked == true) {
                $scope.toggleCheckVal = eventVal.target.checked
            }
            else {
                $scope.toggleCheckVal = eventVal.target.checked
            }
        }
    }
]);