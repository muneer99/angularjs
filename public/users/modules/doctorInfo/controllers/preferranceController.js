"use strict";
angular.module("accountPreference");
nwdApp.controller('preferranceController', ['$scope','$filter', '$window', '$state', '$rootScope', '$location', 'AuthenticationService', 'logger', 'logProvider', 'preferranseService', 'insuranceService',
    function($scope, $filter, $window, $state, $rootScope, $location, AuthenticationService, logger, logProvider, preferranseService, insuranceService) {
        $scope.userdata                 = $rootScope.user;
        $scope.isSelected               = 'false';
        $scope.selected                 = [];
        $scope.isSelect                 = false;
        $scope.userProfile              = {};
        $scope.firstName                = '';
        $scope.prevServices             = [];
        $scope.nexts                    = 'network';
        $scope.test                     = false;
        $scope.contactDetail            = {};
        $scope.countryCodes             = countryCodes;
        $scope.frontDeskAcc             = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;
        $scope.contactDetail.ccode      = '+1';
        $scope.contactDetail.ccodeFax   = '+1';
        
        $scope.frontDesk                = (sessionStorage.getItem('userType') === 'officeAdmin') ? false : true;
        $scope.updateEmailReq           = ($rootScope.user.emailAvailable === 0)? true:false;
        
        $scope.pageTitle = 'New Provider Registration- Insurances';
        
        $scope.updatePass   = [];
        $scope.usStates     = stateList;
        $scope.myStyle      = {
                                "margin-right": "14px"
                            }
        $scope.editContact = function() {

        }
        $scope.backToWelcome = function(prev) {
            $state.reload();
        }
        $scope.UpdateEmailID = function(inp){
            inp = inp.toLowerCase();
            var req = {userId: $rootScope.user._id, email: inp};
            preferranseService.updateUserEmail().save(req, function(res) {
                if (res.code === 200) {
                    logger.logSuccess('Email Id updated successfully.');
                    $rootScope.user.emailAvailable  = 1;
                    $rootScope.user.email           = inp;
                    $scope.updateEmailReq           = false;
                    var localData                   = JSON.parse($window.sessionStorage.getItem('test'));
                    localData.email                 = inp;
                    $window.sessionStorage.setItem('test', JSON.stringify(localData));
                } else {
                    logger.logError(res.message);
                }
            });

        }
        $scope.backToSpeciality = function(speciality) {
            $scope.nexts = 'speciality';
        }

        /**
         * pass the control back to component
         * @PrevItem:  destination name
         */
        $scope.back = function(PrevItem) {
            $scope.nexts = PrevItem;
        }

        /**
         * update network preference and go to specialty details
         * last modified on 18-08-2017
         */
        $scope.nexttoSpeciality = function() {
            var jsondataResource    = { userId: $scope.userdata._id, network: $scope.selected.networkSelected };
            // update specialitry in local storage
            var localData           = JSON.parse($window.sessionStorage.getItem('test'));
            localData.network       = $scope.selected.networkSelected;
            $window.sessionStorage.setItem('test', JSON.stringify(localData));
            preferranseService.updateNetwork().save(jsondataResource, function(res) {
                if (res.code === 200) {
                    logger.logSuccess('Network preference updated successfully.');
                    
                    $scope.nexts = 'speciality';
                    

                } else {}
            });
        }

        /**
         * update services and go to contact details
         * last modified on 15-07-2017
         */
        $scope.nexttoContact = function(contactDetails) {
            var ser                 = contactDetails;
            var jsondataResource    = { userId: $scope.userdata._id, specialityId: $scope.selected.specialitySelected };
            // update specialitry in local storage
            var localData           = JSON.parse($window.sessionStorage.getItem('test'));
            localData.speciality    = $scope.selected.specialitySelected;
            $window.sessionStorage.setItem('test', JSON.stringify(localData));
            preferranseService.updateSpeciality(jsondataResource, function(response) {
                if (response.code == 200) {
                    logger.logSuccess('Speciality confirmed.');
                    $scope.nexts = 'contactDetails';
                }
            })
        }

        /**
         * Fetch available networks from db and users existing networks if any
         * 
         */
        $scope.getAvailableNetworks = function() {
            // get all insurance plans 
            insuranceService.getNetwork().get({ id: '000' }, function(response) {
                if (response.code == 200) {
                    // Title case network names
                    response.data       = response.data.map(function(item){item.name = item.name; return item; })
                    $scope.networkData  = response.data;
                    var localData       = JSON.parse($window.sessionStorage.getItem("test"));
                    if (localData.network.length > 0) {
                        // allow next if some services are already selected
                        $scope.test = true;
                    }
                    if (Array.isArray(localData.network) && localData.network.length > 0) {
                        $scope.selected.networkSelected = localData.network;
                    }
                } else {}
            });
        }

        /**
         * Update contact details and go to services
         * Last modified on 13-07-2017
         */
        $scope.nexttoService = function() {
            if($scope.contactDetail.cell_phone && $scope.contactDetail.cell_phone.length === 10){
                $scope.contactDetail.cell_phone = $scope.contactDetail.ccode+$scope.contactDetail.cell_phone;
            }
            if($scope.contactDetail.fax && $scope.contactDetail.fax.length === 10){
                $scope.contactDetail.fax        = $scope.contactDetail.ccodeFax+$scope.contactDetail.fax;
            }
            preferranseService.UpdateContactDetails($scope.contactDetail, function(response) {
                if (response.code == 200) {
                    // update local storage
                    var localData           = JSON.parse($window.sessionStorage.getItem('test'));
                    localData.firstname     = $scope.contactDetail.firstname;
                    localData.lastname      = $scope.contactDetail.lastname;
                    localData.location      = $scope.contactDetail.location;
                    localData.phone_number  = $scope.contactDetail.phone_number;
                    localData.cell_phone    = $scope.contactDetail.cell_phone;
                    localData.sute          = $scope.contactDetail.sute;
                    localData.city          = $scope.contactDetail.city;
                    localData.state         = $scope.contactDetail.state;
                    localData.zipcode       = $scope.contactDetail.zipcode;
                    localData.fax           = $scope.contactDetail.fax;
                    $scope.nexts            = 'services';
                    $window.sessionStorage.setItem('test', JSON.stringify(localData));
                    logger.logSuccess('Contact details updated successfully.');
                }
            })
        }

        /**
         * Update services and go to confirm profile page
         * last modofied on 13-07-2017
         */
        $scope.nexttoProfile = function() {
            var jsondataResource = { userId: $scope.userdata._id, serviceId: $scope.selected.serviceSelected };
            preferranseService.updateService(jsondataResource, function(response) {
                if (response.code == 200) {
                    // update specialitry in local storage
                    var localData       = JSON.parse($window.sessionStorage.getItem('test'));
                    localData.service   = $scope.selected.serviceSelected;
                    $window.sessionStorage.setItem('test', JSON.stringify(localData));
                    logger.logSuccess('Services has been added.');
                    preferranseService.getUserProfile({ userId: $scope.userdata._id }, function(response) {
                        if (response.code == 200) {
                            var serviceName = '';
                            var speciality  = '';
                            var network     = '';
                            response.data.service.forEach(function(item) {
                                serviceName += (serviceName !== '') ? ', ' + item.serviceName : item.serviceName;
                            })
                            response.data.speciality.forEach(function(item) {
                                speciality += (speciality !== '') ? ', ' + item.specialityName : item.specialityName;
                            })
                            response.data.network.forEach(function(item) {
                                network += (network !== '') ? ', ' + item.name : item.name;
                            })
                            var UserInfo = {
                                'firstname': response.data.firstname,
                                'lastname': response.data.lastname,
                                'email': response.data.email,
                                'location': response.data.location,
                                'phone_number': $filter('phonenumber')(response.data.phone_number),
                                'cell_phone': $filter('phonenumber')(response.data.cell_phone),
                                'services': serviceName,
                                'speciality': speciality,
                                'network': network,
                                'sute': $filter('capitalize')(response.data.sute),
                                'city': $filter('capitalize')(response.data.city),
                                'state': response.data.state,
                                'zipcode': response.data.zipcode,
                                'fax': $filter('phonenumber')(response.data.fax),
                            }
                            $scope.userProfile  = UserInfo;
                            $scope.nexts        = 'profile';
                            $scope.firstName    = response.data.firstname;
                        }
                    })
                }
            });

        }

        /**
        * Update user details and take the user to change password page on success
        * Created By Suman Chakraborty
        * Last Modified on 22-09-2017
        */
        $scope.nexttoDashboard = function() {
            preferranseService.UpdateContactDetails({ userId: $scope.userdata._id}, function(response) {
                if (response.code == 200) {
                    logger.logSuccess('Profile updated successfully.');
                    $location.path('/change-password');
                }
            })
        }

        $scope.updateSelection = function(position, entities) {
            angular.forEach(entities, function(subscription, index) {
                if (position != index)
                    subscription.checked = false;
            });
        }


        $scope.resetPassword = function () {
            $location.path('/forgetPassword');
        }

        /**
        * Update password and update the first login flag for this user
        * Created By Suman Chakrboraty
        * Last Modified on 08-08-2017
        */
        $scope.updatePassword = function() {
            $rootScope.loading = true;
            var actvLog = { type:9, detail: 'Change password', userId: $scope.frontDeskAcc };
            if ($scope.updateUserPass.newpass === $scope.updateUserPass.confPass) {
                var dataObj = { email: $rootScope.user.email, oldPass: $scope.updateUserPass.oldpass, newPass: $scope.updateUserPass.newpass, firstLogin:false, isRegistered: true };
                preferranseService.updatePassword().save(dataObj, function(res) {
                    //console.log(" res ",res);
                    if (res.code === 200) {
                        actvLog.success = true;
                        var userType = res.data.userType;
                        logProvider.addUserActivity().save(actvLog, function(res){});
                        logger.logSuccess('Password changed successfully.');
                        $rootScope.user.firstLogin = false;                        
                        $window.sessionStorage.firstLogin = false; //Task #535
                        $window.sessionStorage.firstLoginTemp = 0; //Task #535 
                        $scope.firstLoginTemp = true;
                        //console.log(" firstLoginTemp aaaya kya ", $scope.firstLoginTemp);

                        // if(response.data.firstLogin){
                        //     console.log(" firstlogin22 -> ",response.data.firstLogin);
                        //     $window.sessionStorage.firstLoginTemp = 1; 
                        // }else{
                        //    console.log(" firstlogin222 -> ",response.data.firstLogin);
                        //    $window.sessionStorage.firstLoginTemp = 0;  
                        // }                       
                        if($window.sessionStorage.getItem('changePass') == 'true'){
                            $window.sessionStorage.setItem('changePass', false);
                            if(userType === 'officeAdmin'){
                                $rootScope.loading = false;
                                if(res.data.firstLogin)
                                    $location.path('/contact-details');
                                else
                                    $state.go('doctors-list');
                            } else if(userType === 'user'){
                                $rootScope.loading = false;
                                if(res.data.firstLogin && !res.data.hasfrntdesk){
                                    $location.path('/front-desk');
                                } else{
                                    //console.log(" dashboard ",res.data);
                                    $state.go('dashboard');
                                }
                            }
                            else{
                                $rootScope.loading = false;
                                $state.go('dashboard');    
                            }                            
                        }else{
                                                        
                            if(userType === 'officeAdmin'){
                                $rootScope.loading = false;
                                if(!res.data.hasuserloc)
                                    $location.path('/contact-details');
                                else
                                    $state.go('doctors-list');
                            }
                            else if(userType === 'user'){
                                $rootScope.loading = false;
                                if(!res.data.hasuserloc)
                                    $location.path('/contact-details');
                                else
                                    $state.go('dashboard');
                            }
                            else{
                                $rootScope.loading = false;
                                $state.go('dashboard');    
                            }
                        }
                    } else {
                        $rootScope.loading = false;
                        logProvider.addUserActivity().save(actvLog, function(res){});
                        logger.logError(res.message);
                    }
                });
            } else {
                $rootScope.loading = false;
                logProvider.addUserActivity().save(actvLog, function(res){});
                logger.logError('Unable to process your request. Please try again.');
            }
        }

        // $scope.dashboard = function() {
        //     $window.sessionStorage.setItem('changePass', false);
        //     $location.path('/contact-details');
        // }

        $scope.next = function() {}

        $scope.getAvailableSpeciality = function() {
            preferranseService.getSpeciality({}, function(response) {
                if (response.code == 200) {
                    $scope.selected.serviceSelected = [];
                    response.data           = response.data.map(function(item){item.specialityName = item.specialityName; return item; })
                    $scope.availableList    = response.data;
                    // get existing speciality 
                    var localData = JSON.parse($window.sessionStorage.getItem("test"));
                    if (localData.speciality.length > 0) {
                        // allow next if some services are already selected
                        $scope.test = true;
                    }
                    if (Array.isArray(localData.speciality) && localData.speciality.length > 0) {
                        $scope.selected.specialitySelected = localData.speciality;
                    }
                }
            })
        }

        $scope.getAvailableService = function() {
            var serviceArr  = [];
            var serviceIDs  = [];
            // get existing speciality 
            var localData   = JSON.parse($window.sessionStorage.getItem("test"));
            var finalData   = [];
            
            // fetch list of all services for ancillary users
            preferranseService.GetServices().save({}, function(response) {
                if (response.code == 200) {
                    response.data = response.data.map(function(item){item.serviceName = item.serviceName; return item; })
                    response.data.forEach(function(item) {
                        if (serviceIDs.indexOf(item._id) === -1) {
                            serviceIDs.push(item._id);
                            serviceArr.push(item);
                        }
                    })
                    $scope.serviceslist = serviceArr;
                    localData.service.forEach(function(item, index) {
                        if (serviceIDs.indexOf(item) !== -1) {
                            finalData.push(item);
                        }
                    })
                    if (finalData.length > 0) {
                        $scope.test = true;
                    } else {
                        $scope.test = false;
                    }
                    $scope.selected.serviceSelected = finalData;
                } else {}
            })
        }

        /**
         * Fetch doctor contact details
         * Created By Suman Chakraborty
         * last modified on 13-12-2017
         */
        $scope.getContactDetails = function() {
            var userDetail          = JSON.parse($window.sessionStorage.getItem("test"));
            if(userDetail.cell_phone && userDetail.cell_phone.length>10){
                var ccode               = userDetail.cell_phone.substr(0, userDetail.cell_phone.length - 10);
                userDetail.cell_phone   = userDetail.cell_phone.substr(userDetail.cell_phone.length - 10);

            }
            if(userDetail.fax && userDetail.fax.length>10){
                var ccodeFax            = userDetail.fax.substr(0, userDetail.fax.length - 10);
                userDetail.fax          = userDetail.fax.substr(userDetail.fax.length - 10);
            }
            
            $scope.contactDetail    = {
                                        'userId': userDetail._id,
                                        'firstname': userDetail.firstname,
                                        'lastname': userDetail.lastname,
                                        'email': userDetail.email,
                                        'location': userDetail.location,
                                        'phone_number': userDetail.phone_number,
                                        'cell_phone': userDetail.cell_phone,
                                        'ccode': ccode,
                                        'ccodeFax': ccodeFax,
                                        'sute': userDetail.sute,
                                        'city': userDetail.city,
                                        'state': userDetail.state,
                                        'zipcode': userDetail.zipcode,
                                        'fax': userDetail.fax,
                                    };
        }

        $scope.toggleExc = function(item, list) {
            $scope.specialitySelected = [];
            $scope.specialitySelected.push(item);
        };

        $scope.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }
            if (list.length > 0) {
                $scope.test = true;
            } else {
                $scope.test = false;
            }
        };
        $scope.exists = function(item, list) {
            return list.indexOf(item) > -1;
        };
    }
]);