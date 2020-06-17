"use strict";
angular.module("doctors")


nwdApp.controller("doctorController", ['$scope', '$rootScope', '$sessionStorage', '$location', 'doctorService', 'logger', 'logProvider', '$state', '$stateParams', 'ngTableParamsService', 'ngTableParamsServiceProviderSearch', 'ngTableParams', '$filter', 'insuranceService', 'ReferService', 'CommonService', '$window',
    function ($scope, $rootScope, $sessionStorage, $location, doctorService, logger, logProvider, $state, $stateParams, ngTableParamsService, ngTableParamsServiceProviderSearch, ngTableParams, $filter, insuranceService, ReferService, CommonService, $window) {
        $scope.doctorPage = 'mainDoctorPage';
        $scope.counts = {};
        $scope.doctor = {};
        $scope.doctor.ccode = '+1';
        $scope.doctor.ccodeFax = '+1';
        $scope.editdoctor = {};
        $scope.editdoctor.ccode = '+1';
        $scope.editdoctor.ccodeFax = '+1';
        $scope.done = false;
        $scope.currentPage = 1;
        $scope.itemPerPage = 5;
        $scope.disabled = false;
        $scope.officeId = $rootScope.user._id;
        $scope.countryCodes = countryCodes;
        $scope.usStates = stateList;

        
       
        // $rootScope.searchable = {};
        //$scope.degreeArr            = degree;
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;
        $scope.frontDesk = (sessionStorage.getItem('userType') === 'officeAdmin') ? false : true;
        $scope.statusObj = [{ 'key': 'available', 'value': 'Available' }, { 'key': 'waiting', 'value': 'By Appointment' }];
        //console.log(" statesprev ",$scope.degree);

        CommonService.getDegreeList();

        CommonService.getStateList();
        //console.log(" rootstatesafter ",$rootScope.state);

        $scope.activationMessage = function () {
            $scope.parmas = $location.search();
            $scope.success = $scope.parmas.success;
        }
        //utility = require('../lib/utility.js'),
        /**
        * Change procider status
        * Creted By Suman Chakraborty
        * last modified on 28-11-2017
        */
        $scope.setstatus = function (id, status) {
            $rootScope.loading = true;
            var actvLog = { type: 12, detail: 'Change provider availability', userId: $scope.frontDeskAcc };
            var statusArr = {
                id: id,
                doctorStatus: status
            }
            doctorService.setStatus().save(statusArr, function (response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    $scope.UserStatus = statusArr.doctorStatus;
                    var userStatus = statusArr.doctorStatus;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    sessionStorage.setItem('userStatus', userStatus);
                    logger.logSuccess(response.message);
                    $rootScope.loading = false;
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }



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


        //$scope.doctor.speciality = getData.speciality;
        // $scope.doctor.specialty = getData.specialty;
        // $scope.doctor.network = getData.network;

        $scope.getDoctorsList = function () {
            //console.log(" inside getDoctorsList ", $scope.doctor.specialty);
            var actvLog = { type: 4, detail: 'View doctor list', userId: $scope.frontDeskAcc };
            // ngTableParamsServiceProviderSearch.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                // counts: [], uncomment to hide pager
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    //console.log(" scope.searchTextField registred ",$scope.searchTextField);

                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.doctor.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    //ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.doctor.searchTextField,$scope.doctor.searchTextField2,$scope.doctor.searchTextField3, params.sorting());

                    $scope.paramUrl = params.url();

                    if (sessionStorage.getItem('userType') === 'officeAdmin') {
                        $scope.paramUrl.frontDeskReq = true;
                    } else {
                        $scope.paramUrl.frontDeskReq = false;
                    }

                    $scope.paramUrl.isRegistered = true;

                    $scope.tableLoader = true;
                    $scope.doctorList = [];
                    $scope.paramUrl.requestingUser = $rootScope.user._id;
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
                    doctorService.getDoctorsList().save($scope.paramUrl, function (response, err) {
                        // let unique_Array = _.uniq(response.data,'userId._id');
                        // console.log("Unique Array",unique_Array);
                        // const Results = _.groupBy(response.data, 'userId');
                        //   console.log("Results",Results);
                        // $scope.groupData(response.data);

                        if ($scope.paramUrl.network != '' || $scope.paramUrl.specialty != '') {

                        }
                        if (response.code == 200) {
                            actvLog.success = true;
                            $scope.tableLoader = false;
                            $scope.doctorList = response.data;
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(response.message);
                        }
                    });
                }
            });
        }

        // $scope.groupData = function(data){
        //     console.log("In group Data function",data);
        //     let grouped_data = [];
        //     for(let i = 0 ; i < data.length;i++){
        //         for(let j = 0 ; j < data.length;j++)
        //         if(data[i].userId !=null && data[j].userId != null && data[i].userId._id != data[j].userId._id){
        //             grouped_data.push(data[i]);

        //         }
        //     }
        // }



        $scope.getOutsideDoctorsList = function () {
            //console.log(" inside getOutsideDoctorsList ", $scope.doctor.searchTextField);
            //console.log(" inside getOutsideDoctorsList ", $scope.doctor.specialty);
            //console.log(" inside getOutsideDoctorsList ", $scope.doctor.network);





            var actvLog = { type: 4, detail: 'View non registered doctor list', userId: $scope.frontDeskAcc };
            // ngTableParamsServiceProviderSearch.set('', '', undefined, '');
            $scope.tableOutsideDoctorParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                // counts: [], uncomment to hide pager
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    //console.log(" scope.searchTextField ",$scope.searchTextField);

                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.doctor.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    //ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.doctor.searchTextField,$scope.doctor.searchTextField2,$scope.doctor.searchTextField3, params.sorting());

                    $scope.paramUrl = params.url();
                    //console.log('$scope.paramUrl::;', $scope.paramUrl)
                    if (sessionStorage.getItem('userType') === 'officeAdmin') {
                        $scope.paramUrl.frontDeskReq = true;
                    } else {
                        $scope.paramUrl.frontDeskReq = false;
                    }

                    $scope.paramUrl.isRegistered = false;

                    $scope.tableNonRegDocLoader = true;
                    $scope.nonRegDocsList = [];
                    $scope.paramUrl.requestingUser = $rootScope.user._id;
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
                    doctorService.getUnregisteredDoctorsList().save($scope.paramUrl, function (response, err) {
                        if (response.code == 200) {
                            actvLog.success = true;
                            $scope.tableNonRegDocLoader = false;
                            $scope.nonRegDocsList = response.data;
                            var data = response.data;
                            $scope.totalCount = data.length;
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(response.message);
                        }


                    });
                }
            });
        }


        /**
                * Used for advanced search on doctor listing page
                * Created By Suman Chakraborty
                * Last Modified on 09-04-2018
                */
        $scope.searchable = function (searchObj) {
            $scope.doctor.searchTextField = searchObj.searchTextField;
            // $scope.doctor.searchTextField2 = searchObj.searchTextField2;
            // $scope.doctor.searchTextField3 = searchObj.searchTextField3;

            $scope.doctor.specialty = searchObj.specialty != undefined ? searchObj.specialty : undefined;
            // $scope.doctor.specialty.selected = {_id: searchObj.specialty};
            $scope.doctor.network = searchObj.network != undefined ? searchObj.network : undefined;
            ngTableParamsServiceProviderSearch.set('', '', $scope.doctor.searchTextField, $scope.doctor.specialty, $scope.doctor.network, '');

            $scope.tableParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                getData: function ($defer, params) {

                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), searchObj.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    //ngTableParamsServiceProviderSearch.set(params.page(), params.count(), searchObj.searchTextField, searchObj.searchTextField2, searchObj.searchTextField3, params.sorting());

                    $scope.paramUrl = params.url();
                    if (sessionStorage.getItem('userType') === 'officeAdmin') {
                        $scope.paramUrl.frontDeskReq = true;
                    } else {
                        $scope.paramUrl.frontDeskReq = false;
                    }

                    $scope.paramUrl.isRegistered = true;

                    $scope.paramUrl.requestingUser = $rootScope.user._id;
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
                    $scope.doctorList = [];
                    // debugger;


                    doctorService.getDoctorsList().save($scope.paramUrl, function (response) {
                        $scope.tableLoader = false;
                        // show only one specialty as per new rule there will be one specialty for each doctor
                        if (response.code === 200) {
                            /* response.data.forEach(function (item, index) {
                                var createdBy = '-';
                                if (item.createdById !== null && item.created_by[0]['createdByInfo'].length > 0) {
                                    createdBy = item.created_by[0]['createdByInfo'][0]['firstname'] + ' ' + item.created_by[0]['createdByInfo'][0]['lastname'];
                                }
                                response.data[index]['created_by'] = createdBy;
                            }) */
                            // debugger;

                        }

                        $scope.doctorList = response.data;
                        var data = response.data;
                        $scope.totalCount = response.totalCount;
                        params.total(response.totalCount);
                        $defer.resolve(data);
                    });
                    // }

                }
            });

            $scope.tableOutsideDoctorParams = new ngTableParams(ngTableParamsServiceProviderSearch.get(), {
                // counts: [], uncomment to hide pager
                getData: function ($defer, params) {
                    console.log($defer, params, '$defer, params');
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.doctor.searchTextField, $scope.doctor.specialty, $scope.doctor.network, params.sorting());
                    //ngTableParamsServiceProviderSearch.set(params.page(), params.count(), $scope.doctor.searchTextField,$scope.doctor.searchTextField2,$scope.doctor.searchTextField3, params.sorting());
                    $scope.paramUrl = params.url();

                    console.log($scope.paramUrl, ' $scope.paramUrl');

                    if (sessionStorage.getItem('userType') === 'officeAdmin') {
                        $scope.paramUrl.frontDeskReq = true;
                    } else {
                        $scope.paramUrl.frontDeskReq = false;
                    }

                    $scope.paramUrl.isRegistered = false;
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

                    $scope.tableNonRegDocLoader = true;
                    $scope.nonRegDocsList = [];
                    $scope.paramUrl.requestingUser = $rootScope.user._id;
                    if ($scope.paramUrl.hasOwnProperty('sorting[_id]')) {
                        delete $scope.paramUrl['sorting[_id]'];
                        $scope.paramUrl['sorting[firstLogin]'] = -1;
                    }
                    console.log($scope.paramUrl, ' $scope.paramUrl2');

                    doctorService.getUnregisteredDoctorsList().save($scope.paramUrl, function (response, err) {
                        $scope.tableNonRegDocLoader = false;
                        if (response.code == 200) {
                            $scope.nonRegDocsList = response.data;
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                            console.log($defer, params, '$defer, params');
                        }
                    });
                }
            });
        }

        $scope.resetSearch = function () {
            $scope.doctor = {};
            $scope.searchable('');
        }

        /**
        * Resend invitation
        * Created By Suman Chakraborty
        * Last modified on 28-11-2017
        */
        $scope.resendInvite = function (inp) {
            //console.log(" resend email inp ", inp._id);
            //console.log(" resend email rootScope.user ", $rootScope.user._id);
            $rootScope.loading = true;
            var actvLog = { type: 11, detail: 'Resend invitation to provider', userId: $scope.frontDeskAcc };
            var invitationLog = { sentBy: $rootScope.user._id, sentTo: inp._id };
            var localData = JSON.parse(sessionStorage.getItem('test'));
            var salutation = '';
            var invSal = '';

            var invDoc = invSal + $rootScope.user.lastname;
            var mail = {
                firstname: inp.firstname,
                lastname: inp.lastname,
                degree: (inp.degree) ? inp.degree : 0,
                centername: inp.centername,
                fromSvpFname: ($rootScope.user.firstname) ? $rootScope.user.firstname : '',
                fromSvpLname: ($rootScope.user.lastname) ? $rootScope.user.lastname : '',
                fromSvpDegree: ($rootScope.user.degree) ? $rootScope.user.degree : 0,
                fromSvpCenter: ($rootScope.user.centername) ? $rootScope.user.centername : '',
                emailAvailable: inp.emailAvailable,
                to: inp.email,
                fax: inp.fax,
                hasTemplate: true
            };
            doctorService.sendMail().save(mail, function (res) {
                if (res.code === 200) {

                    //console.log(" invitationLogReferral called 333 this one ******==> ", invitationLog);
                    //start by arv for invitation log @invitationLogReferral 
                    logProvider.addInvitationLog().save(invitationLog, function (res) { });
                    logProvider.getInvitationListById().get({ id: inp._id }, function (response) {
                        var notificationCount = response.data.length;
                        if (notificationCount >= 5) {
                            var SuperAdmin = 'SuperAdmin';
                            logProvider.getSuperAdminId().get({ id: SuperAdmin }, function (response2) {
                                //console.log(" getSuperAdminId called inside 333  ******==> ", response2.data._id);
                                //console.log(" getInvitationList called inside 333  ******==> ", response.data[0].sentTo.email);

                                //code to fetch template for notification tosuper admin start
                                var notification_superadmin = 'notification_superadmin';
                                doctorService.getEmailTemplateByKey().save({ key: notification_superadmin }, function (response3) {
                                    //console.log(" notification_superadmin==> ", response3); //die; exit;
                                    // var replaceObj = {
                                    //     "{{fromSvpEmail}}": response.data[0].sentTo.email,
                                    //     "{{fromSvpFname}}": response.data[0].sentTo.firstname,
                                    //     "{{fromSvpLname}}": response.data[0].sentTo.lastname
                                    // };
                                    var mailOptions = {};
                                    mailOptions.subject = response3.data.subject;
                                    mailOptions.body = response3.data.body;
                                    //mailOptions.subject = utility.replaceString(response3.data.subject, replaceObj);
                                    //mailOptions.body = utility.replaceString(response3.data.body, replaceObj);
                                    mailOptions.subject = mailOptions.subject.replace('{{fromSvpFname}}', response.data[0].sentTo.firstname);
                                    mailOptions.subject = mailOptions.subject.replace('{{fromSvpLname}}', response.data[0].sentTo.lastname);
                                    mailOptions.subject = mailOptions.subject.replace('{{notificationCount}}', notificationCount);

                                    mailOptions.body = mailOptions.body.replace('{{fromSvpFname}}', response.data[0].sentTo.firstname);
                                    mailOptions.body = mailOptions.body.replace('{{fromSvpLname}}', response.data[0].sentTo.lastname);
                                    mailOptions.body = mailOptions.body.replace('{{fromSvpEmail}}', response.data[0].sentTo.email);
                                    mailOptions.body = mailOptions.body.replace('{{notificationCount}}', notificationCount);

                                    var notificationreq = {
                                        subject: mailOptions.subject,
                                        body: mailOptions.body,
                                        sentTo: response2.data._id
                                    };
                                    //var notificationreq = { subject: 'Notification for '+notificationCount+' invitation for ' + response.data[0].sentTo.firstname+' '+response.data[0].sentTo.lastname, body: notificationCount+' invitation sent to un-registered provider:' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname + ' (' + response.data[0].sentTo.email + ')', sentTo: response2.data._id };
                                    //var notificationreq = { subject: 'Notification for 5th invitation for ' + response.data[0].sentTo.firstname+' '+response.data[0].sentTo.lastname, body: ' 5th invitation sent to un-registered provider:' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname + ' (' + response.data[0].sentTo.email + ')', sentTo: response2.data._id };
                                    doctorService.sendnotificationSuperAdmin().save(notificationreq, function (resp) {
                                        if (resp.code == 200) {
                                            logger.logSuccess('Send Successfully');
                                            $scope.template = null;
                                        } else {
                                            logger.logError(resp.message);
                                        }
                                    })
                                })
                                //end 

                            })
                        }
                    })

                    //end by arv for invitation log

                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    $rootScope.loading = false;
                    logger.logSuccess('Invitation sent successfully.');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError('Unable to process your request. Please try again.');
                }
            })
        }


        /**
        * Get all available services, specialty and insurance networks 
        * Created Bu Suman Chakraborty
        * last Modified on 09-04-2018
        */
        $scope.getAvailableServices = function () {
            // Get available services
            $rootScope.loading = true;

            doctorService.GetServices().save({}, function (response) {
                if (response.code == 200) {
                    response.data = response.data.map(function (item) { item.serviceName = item.serviceName; return item; })
                    $scope.serviceData = response.data;
                    $rootScope.loading = false;
                } else { }
            })
            // Get all specialty
            doctorService.GetSpecialty().get({}, function (response) {
                if (response.code == 200) {
                    $scope.specialityData = response.data;
                } else { }
            })
            // get all insurance plans 
            insuranceService.getNetwork().get({ id: '000' }, function (response) {
                if (response.code == 200) {
                    response.data = response.data.map(function (item) { item.name = item.name; return item; })
                    $scope.networkData = response.data;
                } else { }
            });
        }

        /**
        * Add new doctor
        * Created By Suman Chakraborty
        * Last modified on 11-12-2017
        */
        $scope.addToNetwork = function (doctorsInfo) {
            //console.log(" add doctor ",$scope.user);
            //console.log(" doctorsInfo ",doctorsInfo);
            $rootScope.loading = true;
            var actvLog = { type: 5, detail: 'Add doctor', userId: $scope.frontDeskAcc };

            doctorsInfo.speciality = (doctorsInfo.hasOwnProperty('specialty')) ? doctorsInfo.specialty : [];
            doctorsInfo.createdById = $rootScope.user._id;
            doctorsInfo.subject = $scope.user.lastname ? "Patient Referrals from " + $scope.user.lastname : "Patient Referral";
            var invSal = '';
            if ($scope.user.userType === 'user') {
                invSal = '';
            }
            var invDoc = invSal + $scope.user.lastname;
            doctorsInfo.fromSvpFname = $scope.user.firstname;
            doctorsInfo.fromSvpLname = $scope.user.lastname;
            doctorsInfo.fromSvpDegree = $scope.user.degree;
            doctorsInfo.fromSvpCenter = $scope.user.centername;
            doctorsInfo.mailBody = "<p>You have received a referral from " + $scope.user.lastname + " who is now using Which Docs to expedite the patient referral  process.  It allows referring doctors to instantly check for your in network status, current availability, and then send the referral without requiring a phone call. Status of the referral is automatically tracked and communicated through an online dashboard to ensure speedy completion of the referral and enhanced communication in a HIPAA compliant, cloud-based environment.</p>\n\ <p> Please login using the following info to create an account, update your contact info and start using your account. There is currently no cost to you for using NoWait Doc.</p>";
            doctorsInfo.reqfrom = 'faxAddDoctor';
            if (doctorsInfo.fax_temp) {
                doctorsInfo.fax = doctorsInfo.ccodeFax + doctorsInfo.fax_temp
            } else {
                doctorsInfo.fax = '';
            }
            if (doctorsInfo.cell_phone_temp) {
                doctorsInfo.cell_phone = doctorsInfo.ccode + doctorsInfo.cell_phone_temp
            } else {
                doctorsInfo.cell_phone = '';
            }
            doctorsInfo.invitingDoc = invDoc;
            doctorsInfo.location = (typeof doctorsInfo.location != 'object') ? doctorsInfo.location : '';

            doctorService.addDoctor().save(doctorsInfo, function (response) {
                //console.log(" response --> ",response);
                var invitationLog = { sentBy: $scope.user._id, sentTo: response.userdata._id };
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });

                    //console.log(" invitationLogReferral called 444 ******==> ");
                    //start by arv for invitation log @invitationLogReferral                   
                    logProvider.addInvitationLog().save(invitationLog, function (res) { });
                    logProvider.getInvitationListById().get({ id: response.userdata._id }, function (response) {
                        var notificationCount = response.data.length;
                        if (notificationCount >= 5) {
                            var SuperAdmin = 'SuperAdmin';
                            // logProvider.getSuperAdminId().get({ id: SuperAdmin }, function (response2) {
                            //console.log(" getSuperAdminId called inside 444  ******==> ", response2.data._id);
                            // console.log(" getInvitationList called inside 444  ******==> ", response.data[0].sentTo.email);
                            //var notificationreq = { subject: 'Notification for 5th invitation', body: ' 5th invitation sent to un-registered provider:' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname + ' (' + response.data[0].sentTo.email + ')', sentTo: response2.data._id };
                            // console.log(" getInvitationList called inside 444 ******==> ", response.data[0].sentTo.email);

                            //var SuperAdmin = 'SuperAdmin';
                            logProvider.getSuperAdminId().get({ id: SuperAdmin }, function (response2) {
                                //console.log(" getSuperAdminId called inside 444  ******==> ", response2.data._id);
                                //console.log(" getInvitationList called inside 444  ******==> ", response.data[0].sentTo.email);

                                //code to fetch template for notification tosuper admin start
                                var notification_superadmin = 'notification_superadmin';
                                doctorService.getEmailTemplateByKey().save({ key: notification_superadmin }, function (response3) {
                                    //console.log(" notification_superadmin==> ", response3); //die; exit;
                                    // var replaceObj = {
                                    //     "{{fromSvpEmail}}": response.data[0].sentTo.email,
                                    //     "{{fromSvpFname}}": response.data[0].sentTo.firstname,
                                    //     "{{fromSvpLname}}": response.data[0].sentTo.lastname
                                    // };
                                    var mailOptions = {};
                                    mailOptions.subject = response3.data.subject;
                                    mailOptions.body = response3.data.body;
                                    //mailOptions.subject = utility.replaceString(response3.data.subject, replaceObj);
                                    //mailOptions.body = utility.replaceString(response3.data.body, replaceObj);
                                    mailOptions.subject = mailOptions.subject.replace('{{fromSvpFname}}', response.data[0].sentTo.firstname);
                                    mailOptions.subject = mailOptions.subject.replace('{{fromSvpLname}}', response.data[0].sentTo.lastname);
                                    mailOptions.subject = mailOptions.subject.replace('{{notificationCount}}', notificationCount);

                                    mailOptions.body = mailOptions.body.replace('{{fromSvpFname}}', response.data[0].sentTo.firstname);
                                    mailOptions.body = mailOptions.body.replace('{{fromSvpLname}}', response.data[0].sentTo.lastname);
                                    mailOptions.body = mailOptions.body.replace('{{fromSvpEmail}}', response.data[0].sentTo.email);
                                    mailOptions.body = mailOptions.body.replace('{{notificationCount}}', notificationCount);

                                    var notificationreq = {
                                        subject: mailOptions.subject,
                                        body: mailOptions.body,
                                        sentTo: response2.data._id
                                    };


                                    //var notificationreq = { subject: 'Notification for ' + notificationCount + ' invitation for ' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname, body: notificationCount + ' invitation sent to un-registered provider:' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname + ' (' + response.data[0].sentTo.email + ')', sentTo: response2.data._id };
                                    //var notificationreq = { subject: 'Notification for 5th invitation for ' + response.data[0].sentTo.firstname+' '+response.data[0].sentTo.lastname, body: ' 5th invitation sent to un-registered provider:' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname + ' (' + response.data[0].sentTo.email + ')', sentTo: response2.data._id };
                                    doctorService.sendnotificationSuperAdmin().save(notificationreq, function (resp) {
                                        if (resp.code == 200) {
                                            logger.logSuccess('Send Successfully');
                                            $scope.template = null;
                                        } else {
                                            logger.logError(resp.message);
                                        }
                                    })
                                })
                            })
                            //})
                        }
                    })
                    //end by arv for invitation log

                    logger.logSuccess('Doctor has been added to network');
                    $state.go('dashboard');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    $scope.done = false;
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Get all available specialty and total count
        * Created By Suman Chakraborty
        * Last Modified on 09-04-2018
        */
        $scope.getAvailableSpecialty = function () {
            doctorService.GetSpecialty().get(function (response) {
                if (response.code == 200) {
                    response.data = response.data.map(function (item) { item.specialityName = item.specialityName; return item; })
                    $scope.specialtyData = response.data;
                    $scope.datalength = response.data.length;
                } else { }
            })

            // get all insurance plans 
            insuranceService.getNetwork().get({ id: '000' }, function (response) {
                if (response.code == 200) {
                    response.data = response.data.map(function (item) { item.name = item.name; return item; })
                    $scope.networkData = response.data;
                } else { }
            });
        }

        $scope.isDelete = function (index, email) {
            $scope.emailId = {}
            $scope.emailId.email = email;
            swal({
                title: "Are you sure?",
                text: "It will remove this user from the network!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        doctorService.deleteUser().save($scope.emailId, function (response) {
                            if (response.code == 200) {
                                $scope.doctorList.splice(index, 1)
                                $state.reload('doctors-list');
                                swal("Deleted!", "User has been deleted.", "success");
                            } else { }
                        })
                    } else {
                        swal("Cancelled", "You cancelled :)", "error");
                    }
                });
        }

        $scope.editDetails = function (doctor) {
            $state.go('editDoctor');
        }

        /**
        * Edit provider
        * Created By Suman Chakaborty
        * Last modified on 28-11-2017
        */


        $scope.getById = function () {
            //var searchable = JSON.parse($window.sessionStorage.getItem('searchable'));
            // console.log(" search searchable -> ",searchable);
            $rootScope.loading = true;
            var actvLog = { type: 4, detail: 'view provider', userId: $scope.frontDeskAcc };
            doctorService.getById().get({ id: $state.params.id }, function (response) {
                if (response.code == 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    // for showing only one specialty as per the new rule

                    response.data.speciality = (response.data.speciality && response.data.speciality !== null && response.data.speciality.length > 0) ? response.data.speciality : [];
                    if (response.data.fax && response.data.fax.length > 10 && response.data.fax.substr(0, response.data.fax.length - 10).length > 1) {
                        response.data.ccodeFax = response.data.fax.substr(0, response.data.fax.length - 10);
                        response.data.fax_temp = response.data.fax.substr(response.data.fax.length - 10);
                    } else {
                        response.data.ccodeFax = '+1';
                        response.data.fax_temp = '';
                    }
                    if (response.data.cell_phone && response.data.cell_phone.length > 10 && response.data.cell_phone.substr(0, response.data.cell_phone.length - 10).length > 1) {
                        response.data.ccode = response.data.cell_phone.substr(0, response.data.cell_phone.length - 10);
                        response.data.cell_phone_temp = response.data.cell_phone.substr(response.data.cell_phone.length - 10);
                    } else {
                        response.data.ccode = '+1';
                        response.data.cell_phone_temp = '';
                    }
                    //console.log(" resp ",response.data);
                    $scope.doctor = response.data;
                    //console.log(" degree ",$scope.degree);
                    // console.log(" states ",$scope.state);
                    $rootScope.loading = false;
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Update doctor details
        * Created By Suman Chakraborty
        * Last modified on 11-12-2017
        */
        $scope.updatedoctor = function (editdoctor) {
            // console.log(" hrer11 ",editdoctor);
            $rootScope.loading = true;
            var actvLog = { type: 6, detail: 'Update doctor', userId: $scope.frontDeskAcc };
            // for showing only one specialty as per the new rule
            editdoctor.speciality = (editdoctor.hasOwnProperty('speciality')) ? (editdoctor.speciality[0] !== undefined) ? editdoctor.speciality : [] : [];
            if (editdoctor.fax_temp) {
                editdoctor.fax = editdoctor.ccodeFax + editdoctor.fax_temp
            }
            if (editdoctor.cell_phone_temp) {
                editdoctor.cell_phone = editdoctor.ccode + editdoctor.cell_phone_temp
            }
            if (editdoctor.email) {
                editdoctor.emailAvailable = 1;
            }
            doctorService.updateUser().save(editdoctor, function (response) {
                // console.log(" hrer22 ",response);
                if (response.code == 200) {
                    $rootScope.loading = false;
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess(response.message);
                    $state.go('dashboard');
                } else {
                    $rootScope.loading = false;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    $scope.done = false;
                    logger.logError(response.message);
                }
            })
        }

        $scope.changeStatus = function (id, item) {
            $rootScope.loading = true;

            var userArr = { 'id': id, 'status': item === '1' ? '0' : '1' };
            doctorService.updateStatus().save(userArr, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    logger.logSuccess(item === '1' ? 'User deactivated successfully.' : 'User activated successfully.');
                    $state.reload('doctors-list');
                } else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            })
        }

        $scope.referFrom = function (user) {
            $rootScope.referringDoctorDetails = user;
            $state.go('network');
        }

        $scope.showFaq = function (pageid) {
            CommonService.showFaq(pageid);
        }

        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var componentForm = {
                //premise                     : 'long_name',
                street_number: 'short_name',
                route: 'long_name',
                sublocality_level_1: 'long_name',
                sublocality_level_2: 'long_name',
                locality: 'long_name',
                administrative_area_level_1: 'short_name',
                postal_code: 'short_name'
            };
            var mapping = {
                //premise                     : 'sute',
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
            //$scope.doctor.user_loc = [location.lat(), location.lng()];
            $scope.doctor.user_loc = [location.lng(), location.lat()];

            // User address field text value update
            //$scope.doctor.location = $scope.doctor.location.getPlace().formatted_address;
            $scope.doctor.location = '';
            //$scope.doctor.sute       = '';
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