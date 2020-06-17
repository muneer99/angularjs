"use strict";

angular.module("Dashboard")

nwdApp.controller("dashboardController", [
    '$scope',
    '$window',
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$sessionStorage',
    'dashboardService',
    'insuranceService',
    'preferranseService',
    'orderByFilter',
    '$routeParams',
    '$route',
    '$location',
    '$state',
    '$stateParams',
    '$http',
    'logger',
    'logProvider',
    'ReferService',
    'ngTableParamsService',
    'ngTableParams',
    'CommonService',
    function (
        $scope, $window, $filter, $mdDialog, $rootScope, $sessionStorage, dashboardService, insuranceService, preferranseService, orderBy, $routeParams, $route, $location, $state, $stateParams, $http, logger, logProvider, ReferService, ngTableParamsService, ngTableParams, CommonService) {
        $scope.service = {};
        $rootScope.loading = false;
        $scope.name = $rootScope.name;
        $scope.userdata = $rootScope.user;
        $scope.UserStatus = sessionStorage.getItem('userStatus');
        $scope.emailAvailable = (sessionStorage.getItem('emailAvailable') == 1) ? true : false;
        $scope.firstLoginTemp = (sessionStorage.getItem('firstLoginTemp') == 1) ? false : true;
        $scope.firstLogin = sessionStorage.getItem('firstLogin');
        $scope.frontDeskAccess = sessionStorage.getItem('frontDeskAccess');
        $scope.frontDesk = (sessionStorage.getItem('userType') === 'officeAdmin') ? false : true;
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;
        $scope.disabled = false;
        $scope.loader = false;
        $scope.active = true;
        $scope.disabledUpdate = false;
        $scope.reverseSort = false;
        $scope.loaderChangePass = false;
        $scope.doc_name = $rootScope.user.lastname;
        $scope.referredToArr = [];
        $scope.referredByArr = [];
        $scope.statusArr = referralStatusArr;
        $scope.selectedStatus = '1';
        $scope.statusObj = referralStatusObj;
        $scope.currentPage = 0;
        $scope.currentPage2 = 0;
        $scope.pageSize = 5;
        $scope.reference = {};
        $scope.reference.status = 0;
        $scope.localtion = $location.path();
        $scope.propertyName = 'date';
        $scope.propertyName1 = 'date';
        $scope.reverse = true;
        $scope.reverse1 = true;
        $scope.title = "";
        $scope.fileList = '';
        //$scope.degree           = degree;
        //console.log(" firstLoginTemp -> ",$scope.firstLoginTemp);
        //console.log(" firstLogin -> ",$scope.firstLogin);

        //dashboardService.getDashboardAccess(userdata);

        CommonService.getDegreeList();

        var socket = io();
        socket.on('broadcast', function (data) {
            if (data.sendto.length == 0 || data.sendto.indexOf($scope.userdata._id) != -1)
                logger.logSuccess('New notification received <br />' + data.subject);
        });
        var localData = JSON.parse(sessionStorage.getItem('test'));
        $scope.showService = function (itemId) {
            $state.go('service', { itemId: itemId });
        };
        $scope.imageUrl = $rootScope.user.image;

        $scope.setstatus = function (status) {
            var status = {
                id: $scope.userdata._id,
                doctorStatus: status
            }
            dashboardService.setStatus().save(status, function (response) {

                if (response.code == 200) {
                    logProvider.addUserActivity().save({ userId: $scope.frontDeskAcc, success: true, type: 12, detail: 'Change availability' }, function (res) { });
                    $scope.UserStatus = status.doctorStatus;
                    var userStatus = status.doctorStatus;
                    sessionStorage.setItem('userStatus', userStatus);
                    logger.logSuccess(response.message);
                } else {
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Sort inbound outbound referral list 
        * Created By Suman Chakrabory
        * Last Modified On: 30-10-2017
        */
        $scope.sortBy = function (collection, propertyName) {

            $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName) ?
                !$scope.reverse : false;
            if (collection == 1) {
                $scope.referredByArr = orderBy($scope.referredByArr, propertyName, $scope.reverse);
                $scope.propertyName = propertyName;
            } else {
                $scope.referredToArr = orderBy($scope.referredToArr, propertyName, $scope.reverse1);
                $scope.propertyName1 = propertyName;
            }
        };
        /** 
        * Logout users
        * Created By Suman Chakraborty
        * last modified on 09-09-2017
        */
        $scope.logout = function () {
           
            
            var actvLog = { userId: $scope.frontDeskAcc, type: 3, detail: 'user log out' };
            var userid = $scope.userdata._id;
            var frontDeskAccess = sessionStorage.getItem('frontDeskAccess');
            var token = sessionStorage.getItem('token1');
            $rootScope.userLoggedIn = false;
            delete $sessionStorage.test;
            sessionStorage.removeItem('test');
            sessionStorage.removeItem('userStatus');
            sessionStorage.clear();
            sessionStorage.setItem('userLoggedIn', false);
            sessionStorage.setItem('token1', '');
            dashboardService.UserLogout().save({ userId: userid, token: token }, function (res) {
                if (res.code === 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logSuccess('You have been logged out successfully');
                    if (frontDeskAccess) {
                        $window.close();
                    } else {
                        $location.path('/');
                    }
                } else {
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    logger.logError(response.message);
                }
            })
            
        }

        $scope.getDashboardList = function () {
            $scope.serviceList = dashboardService.getDashboardList().get({}, function (response, err) {
                if (response.code == 200) {
                    $scope.serviceList = response.data;
                } else {
                    $scope.serviceList = {};
                }
            });
        }

        /*
         * Get total no of rererral received 
         * @id requesting user's ld
         * Created By Suman Chakraborty
         * last modified on 26-07-2017
         */
        $scope.getReferredTo = function (type) {

            $location.path('/referPatient');

            var reqArr = { id: $rootScope.user._id };
            if (typeof type !== 'undefined') {
                reqArr = { id: $rootScope.user._id, type: false };
            }
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                // counts: [], //comment to hide pager
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.tableLoader = true;
                    $scope.referredToArr = [];
                    $scope.params = {
                        reqArr: reqArr,
                        paramUrl: $scope.paramUrl
                    }

                    // dashboardService.getReferredTo().save($scope.params, function (response, err) {
                    //     if (response.code == 200) {
                    //         var iteArr = [];
                    //         response.data.forEach(function (item) {
                    //             var deg = (item.referredBy) ? (item.referredBy.degree && item.referredBy.degree != '0') ? ', ' + $rootScope.degree[item.referredBy.degree] : '' : '';
                    //             var refBy = (item.referredBy) ? item.referredBy.hasOwnProperty('firstname') ? item.referredBy.firstname + ' ' + item.referredBy.lastname + deg : '' : '';
                    //             var site = (item.referredBy) ? item.referredBy.centername : '';
                    //             var seen = true;
                    //             if (item.lastOperationOn && item.refToOprTime) {
                    //                 if (item.lastOperationOn > item.refToOprTime) {
                    //                     seen = false;
                    //                 }
                    //             }
                    //             iteArr.push({
                    //                 _id: item._id,
                    //                 by: refBy,
                    //                 seen: seen,
                    //                 patient: item.firstName + ' ' + item.lastName,
                    //                 lastName: item.lastName,
                    //                 serviceName: item.serviceName,
                    //                 centername: site,
                    //                 status: item.status,
                    //                 date: item.referredDate
                    //             });
                    //         })
                    //         $scope.referredToArr = iteArr;
                    //         $scope.tableLoader = false;
                    //         var data = response.data;
                    //         $scope.totalCount = response.totalCount;
                    //         params.total(response.totalCount);
                    //         $defer.resolve(data);
                    //     } 
                    //     // else if (response.code == 304) { // task #535 start
                    //     //    // console.log(" response -> ", $scope.firstLogin); die;
                    //     //     $scope.tableLoader = false;
                    //     //    // if ($scope.firstLogin) {
                    //     //       //  $location.path('/change-password');
                    //     //     //} else {
                    //     //         $state.go('contact');
                    //     //    // }
                    //     //     // $scope.tableLoader = false;
                    //     //     // $state.go('contact');
                    //     //     logger.logError('Please update your profile before access Dashboard.');
                    //     //     //task #535 end
                    //     // } 
                    //     else {
                    //         logger.logError(response.message);
                    //     }
                    // });
                }
            });
        }

        $scope.testy = function (active) {
            if (active) {
                // $scope.getReferredBy();
                $scope.getReferredTo();
                logger.logSuccess('Showing active referrals.');
            } else {
                // $scope.getReferredBy(1);
                $scope.getReferredTo(1);
                logger.logSuccess('Showing completed referrals.');
            }
        }

        /**
         * Get total referral sent by this user
         * @id requesting users id 
         * Created By Suman Chakraborty
         * last modified on 26-07-2017
         */
        // $scope.getReferredBy = function (type) {
        //     var reqArr = { id: $rootScope.user._id };
        //     if (typeof type !== 'undefined') {
        //         reqArr = { id: $rootScope.user._id, type: false };
        //     }
        //     ngTableParamsService.set('', '', undefined, '');
        //     $scope.tableParamOutBound = new ngTableParams(ngTableParamsService.get(), {
        //         // counts: [], //comment to hide pager
        //         getData: function ($defer, params) {
        //             // send an ajax request to your server. in my case MyResource is a $resource.
        //             ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
        //             $scope.paramUrl = params.url();
        //             $scope.tableLoader = true;
        //             $scope.referredByArr = [];
        //             $scope.params = {
        //                 reqArr: reqArr,
        //                 paramUrl: $scope.paramUrl
        //             }
        //             dashboardService.getReferredBy().save($scope.params, function (response) {
        //                 if (response.code === 200) {
        //                     var iteArr = [];
        //                     response.data.forEach(function (item) {
        //                         var deg = (item.referredTo) ? (item.referredTo.degree && item.referredTo.degree != '0') ? ', ' + $rootScope.degree[item.referredTo.degree] : '' : '';
        //                         var refBy = (item.referredTo) ? (item.referredTo.userType === 'user') ? item.referredTo.hasOwnProperty('firstname') ? item.referredTo.firstname + ' ' + item.referredTo.lastname + deg : '' : item.referredTo.lastname : '';
        //                         var site = (item.referredTo) ? item.referredTo.centername : '';
        //                         var seen = true;
        //                         if (item.lastOperationOn && item.refByOprTime) {
        //                             if (item.lastOperationOn > item.refByOprTime) {
        //                                 seen = false;
        //                             }
        //                         }
        //                         iteArr.push({
        //                             _id: item._id,
        //                             to: refBy,
        //                             seen: seen,
        //                             patient: item.firstName + ' ' + item.lastName,
        //                             lastName: item.lastName,
        //                             serviceName: item.serviceName,
        //                             centername: site,
        //                             status: item.status,
        //                             date: item.referredDate
        //                         });

        //                     })
        //                     $scope.referredByArr = iteArr;
        //                     $scope.tableLoader = false;
        //                     var data = response.data;
        //                     $scope.totalCount = response.totalCount;
        //                     params.total(response.totalCount);
        //                     $defer.resolve(data);
        //                 } else {
        //                     logger.logError(response.message);
        //                 }
        //             })
        //         }
        //     })
        // }

        $scope.notificationDeletedByUser = function (notificationId) {
            dashboardService.notificationDeletedByUser().get({ user_id: localData._id, notification_id: notificationId }, function (response) {
                if (response.code == 200) {
                    logger.logSuccess('Notification deleted successfully.');
                    $scope.count = response.count;
                    var notification = response.data;
                    notification.forEach(function (list, index) {
                        var userIdArr = list.user_ids;
                        userIdArr.forEach(function (item) {
                            if (item == localData._id) {
                                notification[index].status = true;
                            }
                        }, this);

                    }, this);
                    $scope.notificationList = notification;
                } else {
                    logger.logSuccess('Something went wrong');
                }
            });
        }

        $scope.sendAcknowledge = function (id) {
            var req = { id: id };
            dashboardService.sendAck().save(req, function (res) {
                if (res.code === 200) {
                    var msg = "<p> Hello " + res.data.name + ",</p>\n\<p><br />" + "I have received your fax. Thank you. " + '</p>';
                    var mail1 = { to: res.data.mail, subject: 'Referral Acknowledgement', content: msg };
                    ReferService.sendMail().save(mail1, function (res) {
                        logger.logSuccess('Referral acknowledgement sent successfully.');
                        $state.reload('dashboard');
                    })
                }
            })
        }

        /**
        * Reject referral from dashboard
        * Created By Suman Chakraborty
        * Last modified on 04-05-2018
        */
        $scope.statusUpdate = function () {
            $scope.updateRefReq.comment = $scope.rejectReason;
            $scope.updateRefReq.updatedBy = $rootScope.user._id;
            // For successful rejection the request must have a reason and a referral id 
            if (typeof $scope.rejectReason !== 'undefined' && typeof $scope.updateRefReq.id !== 'undefined') {
                dashboardService.getReferralDetail().save({ id: $scope.updateRefReq.id }, function (res) {
                    if (res.code === 200) {
                        // Notify patient by text message
                        var firstname = (res.data.referredTo.hasOwnProperty('firstname')) ? res.data.referredTo.firstname : '';
                        var lastname = (res.data.referredTo.hasOwnProperty('lastname')) ? res.data.referredTo.lastname : '';
                        var toSvpDegree = (res.data.referredTo.hasOwnProperty('degree')) ? ', ' + $rootScope.degree[res.data.referredTo.degree] : '';
                        var centername = (res.data.referredTo.hasOwnProperty('centername')) ? res.data.referredTo.centername : '';

                        var docMsg = firstname + ' ' + lastname + toSvpDegree + centername + ' is unable to accept your referral because ' + $scope.rejectReason + '. ';
                        var smsObj = {
                            '{{fromSvpFirstname}}': firstname,
                            '{{fromSvpLastname}}': lastname,
                            '{{fromSvpTitle}}': toSvpDegree,
                            '{{fromSvpCenter}}': centername,
                            '{{rejectReason}}': $scope.rejectReason
                        };
                        if (res.data.patientInfo.hasOwnProperty('contact_no')) {

                            ReferService.sendSms().save({ phno: res.data.patientInfo.contact_no, key: 'reject_referral', paramObj: smsObj }, function (res) { })
                        }
                        // Notify referring doctor by email
                        if (res.data.referredBy.hasOwnProperty('email')) {
                            var referringDoc = (res.data.referredBy.hasOwnProperty('lastname')) ? res.data.referredBy.lastname : '';
                            var msgForReferering = "<p> Hello " + referringDoc + ",</p>\n\<p><br />" + docMsg + '</p>';
                            ReferService.sendMail().save({ to: res.data.referredBy.email, subject: 'Referral Rejected', content: msgForReferering }, function (res) { });
                        }
                        // Update status and refresh dashboard content
                        dashboardService.setReferralStatus().save($scope.updateRefReq, function (res) {
                            if ($scope.active === false) {
                                // $scope.getReferredBy(1);
                                $scope.getReferredTo(1);
                            } else {
                                // $scope.getReferredBy();
                                $scope.getReferredTo();
                            }
                            logger.logSuccess('Status update successfully.');
                        })
                    } else {
                        logger.logError(res.message);
                    }
                })
                $mdDialog.hide();
            } else {
                logger.logError('Incomplete request received.');
            }
        }

        // Cancel reject referral
        $scope.cancelStatusUpdate = function () {
            $mdDialog.hide();
            // $scope.getReferredBy();
            $scope.getReferredTo();
            if ($scope.active === false) {
                // $scope.getReferredBy(1);
                $scope.getReferredTo(1);
            }
        }

        $scope.reasonArr = ['Not a network provider', 'Service not provided', 'Provider not available'];
        /**
         * Update status of a referral
         * @id referral id
         * @status new status
         * Created By Suman Chakraborty
         * Last modified on 22-11-2017
         */
        $scope.setReferralStatus = function (ev, referralId, newStatus, reqType) {
            var logObj = { accessBy: $scope.frontDeskAcc, activityDetail: 'Update referral status', activityType: 2 };
            var actvLog = { userId: $scope.frontDeskAcc, type: 6, detail: 'Update referral status' };

            // Add referral status update time
            var currentTime = new Date();
            var req = { id: referralId, status: newStatus, lastUpdatedOn: currentTime, updatedBy: $rootScope.user._id, lastOperationOn: currentTime };
            // reqType define if this user is the referred user or referring user. 1= referred user 2 = referring user
            if (reqType === 1) {
                req.refToOprTime = currentTime;
            }
            if (reqType === 2) {
                req.refByOprTime = currentTime;
            }
            $scope.updateRefReq = { id: referralId, status: newStatus };
            if (newStatus === 5) {
                $mdDialog.show({
                    template: "<md-dialog aria-label='options dialog'><md-dialog-content layout-padding><h2 class='md-title'>Please select a reason for rejection.</h2><md-select ng-model='rejectReason' placeholder='{{rejectReason}}'><md-option ng-repeat='reason in reasonArr'>{{reason}}</md-option></md-select></md-dialog-content><md-dialog-actions><span flex></span><md-button ng-click='cancelStatusUpdate()'>Cancel</md-button> <md-button ng-click='statusUpdate()'>Reject</md-button></md-dialog-actions></md-dialog>",
                    scope: $scope,
                    preserveScope: true,
                    //parent: angular.element(document.body),
                    targetEvent: ev,
                    required: true,
                    clickOutsideToClose: false,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
            } else {
                actvLog.success = true;
                logProvider.addUserActivity().save(actvLog, function (res) { });

                dashboardService.setReferralStatus().save(req, function (res) {
                    logObj.patientId = res.data.patientInfo;
                    logProvider.PhiAccLog().save(logObj, function (res) { });
                    // refersh records if status is set to 4 or 5 
                    if ([4, 5].indexOf(newStatus) > -1) {
                        // $scope.getReferredBy();
                        $scope.getReferredTo();
                    }
                    if ($scope.active === false) {
                        // $scope.getReferredBy(1);
                        $scope.getReferredTo(1);
                    }
                    logger.logSuccess('Status update successfully.');
                })
            }
        }

        $scope.updateReferral = function (id) { }

        /**
         * set menu class
         */
        $scope.getClass = function (path, source) {
            var isDoc = -1;
            var isAnc = -1;
            var isPatient = -1;
            var isLookup = -1;
            var isInsurance = -1;
            var docPathArr = ['edit', 'list', 'add'];
            // var patientArr = ['edit', 'list', 'add'];
            var lookupArr = ['/lookup', '/add-doctor', '/confirmation', '/success', '/searchProvider'];
            // var lookupArr = ['/lookup', '/patients', '/add-doctor', '/confirmation', '/success', '/searchProvider'];
            var networkArr = ['/referPatient', '/makeReferral', '/searchProvider', '/doctors', '/confirmation', '/success'];
            // var networkArr = ['/referPatient', '/makeReferral', '/searchProvider', '/doctors', '/patients', '/confirmation', '/success'];
            if (path === 'doctor') {
                var locationArr = $location.path().split('/');
                if (locationArr.length > 1 && locationArr[1] === 'doctor') {
                    var isDoc = docPathArr.indexOf(locationArr[2]);
                }
            }
            // if (path === 'patient') {
            //     var locationArr = $location.path().split('/');
            //     if (locationArr.length > 1 && locationArr[1] === 'patient') {
            //         var isPatient = patientArr.indexOf(locationArr[2]);
            //     }
            // }
            if (path === 'insurance') {
                var locationArr = $location.path().split('/');
                if (locationArr.length > 1 && locationArr[1] === 'insurance') {
                    var isInsurance = patientArr.indexOf(locationArr[2]);
                }
            }

            return ((networkArr.indexOf(path) !== -1) && source === 'referPatient' && $rootScope.makeReferral) ? 'active' :
                ((lookupArr.indexOf(path) !== -1) && source === 'lookup' && $rootScope.takeReferral) ? 'active' :
                    ($location.path() == '/preference' && path === 'preference') ? 'active' :
                        ($location.path() == '/dashboard' && path === 'dashboard') ? 'active' :
                            (isDoc !== -1) ? 'active' :
                                (isPatient !== -1) ? 'active' :
                                    (isInsurance !== -1) ? 'active' :
                                        '';
        }

        $scope.deleteAttachment = function (req) { }
        /**
        * Generate referral details folder's content
        * Created By Suman Chakraborty
        * Last modified on 28-11-2017
        */
        $scope.showAdvanced = function (ev, id, reqType) {
            // reqType is used to update doctors last view timestamp
            var req = { id: id, reqType: reqType };
            var logObj = { accessBy: $scope.frontDeskAcc, activityDetail: 'View referral details' };
            var actvLog = { userId: $scope.frontDeskAcc, type: 4, detail: 'View referral detail' };
            dashboardService.getReferralDetail().save(req, function (res) {
                if (res.code === 200) {
                    actvLog.success = true;
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    // fetch referral log
                    dashboardService.getReferralLog().save(req, function (resp) {
                        if (resp.code === 200) {
                            var dhtml = ""; var frntdeskhtml = "";
                            resp.data.forEach(function (item) {
                                if (item.updatedBy) {
                                    var by = item.updatedBy.lastname;
                                    if (item.updatedBy.userType === 'user') {
                                        by = item.updatedBy.lastname;
                                    }
                                }
                                dhtml += "<tr><td data-title='status'>" + $scope.statusArr[item.status] + "</td>";
                                dhtml += "<td data-title='eventtime'>" + new Date(item.updateOn).toLocaleString("en-US", { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); + "</td>";
                                dhtml += "<td data-title='type'>" + by + "</td></tr>";
                            })
                            var byUser = { fname: '', lname: '', email: '', phno: '' };
                            var toUser = { fname: '', lname: '', email: '', phno: '' };
                            var patient = { fname: '', lname: '', email: '', phno: '' };
                            if (res.data.referredBy !== null) {
                                var byUser = {
                                    fname: (res.data.referredBy && res.data.referredBy.firstname) ? res.data.referredBy.firstname : '',
                                    lname: (res.data.referredBy && res.data.referredBy.lastname) ? res.data.referredBy.lastname : '',
                                    site: (res.data.referredBy && res.data.referredBy.centername) ? res.data.referredBy.centername : '',
                                    email: (res.data.referredBy && res.data.referredBy.email) ? res.data.referredBy.email : '',
                                    phno: (typeof res.data.referredBy.phone_number !== 'undefined') ? $filter('phonenumber')(res.data.referredBy.phone_number) : ''
                                };
                            }
                            if (res.data.referredTo !== null) {
                                var toUser = {
                                    fname: (res.data.referredTo && res.data.referredTo.firstname) ? res.data.referredTo.firstname : '',
                                    lname: (res.data.referredTo && res.data.referredTo.lastname) ? res.data.referredTo.lastname : '',
                                    site: (res.data.referredTo && res.data.referredTo.centername) ? res.data.referredTo.centername : '',
                                    email: (res.data.referredTo && res.data.referredTo.email) ? res.data.referredTo.email : '',
                                    phno: (typeof res.data.referredTo.phone_number !== 'undefined') ? $filter('phonenumber')(res.data.referredTo.phone_number) : ''
                                };
                            }
                            if (res.data.frontDeskReferredBy && res.data.frontDeskReferredBy !== null) {
                                var frontDeskUser = {
                                    fname: (res.data.frontDeskReferredBy && res.data.frontDeskReferredBy.firstname) ? res.data.frontDeskReferredBy.firstname : '',
                                    lname: (res.data.frontDeskReferredBy && res.data.frontDeskReferredBy.lastname) ? res.data.frontDeskReferredBy.lastname : '',
                                    site: (res.data.frontDeskReferredBy && res.data.frontDeskReferredBy.centername) ? res.data.frontDeskReferredBy.centername : '',
                                    email: (res.data.frontDeskReferredBy && res.data.frontDeskReferredBy.email) ? res.data.frontDeskReferredBy.email : '',
                                    phno: (res.data.frontDeskReferredBy && typeof res.data.frontDeskReferredBy.phone_number !== 'undefined') ? $filter('phonenumber')(res.data.frontDeskReferredBy.phone_number) : ''
                                };

                                frntdeskhtml = "<tr><td data-title='fname'>Added By<br />(Frontdesk User)</td><td data-title='fname'>" + frontDeskUser.fname + " " + frontDeskUser.lname + "</td><td data-title='lname'>" + frontDeskUser.site + "</td><td data-title='email'>" + frontDeskUser.email + "</td><td data-title='Phone'>" + frontDeskUser.phno + "</td></tr>";
                            }

                            if (res.data.patientInfo != null) {
                                logObj.patientId = res.data.patientInfo._id;
                                // Save PHI access Log
                                logProvider.PhiAccLog().save(logObj, function (res) { });
                                var patient = {
                                    fname: (res.data.patientInfo && res.data.patientInfo.firstName) ? res.data.patientInfo.firstName : '',
                                    lname: (res.data.patientInfo && res.data.patientInfo.lastName) ? res.data.patientInfo.lastName : '',
                                    email: (res.data.patientInfo && res.data.patientInfo.email) ? res.data.patientInfo.email : '',
                                    phno: (typeof res.data.patientInfo.contact_no !== 'undefined') ? $filter('phonenumber')(res.data.patientInfo.contact_no) : ''
                                };
                            }

                            var chifComp = (res.data.chiefComplain !== '') ? res.data.chiefComplain : 'NA';
                            var other = (res.data.other !== '') ? res.data.other : 'NA';
                            var services = '';
                            var attachment = '';

                            res.data.services.forEach(function (item) {
                                services += item.serviceName + ' ';
                            })
                            if (res.data.serviceName) {
                                services = (res.data.serviceName) ? res.data.serviceName : '';
                            }
                            $scope.reqData = res.data;
                            res.data.attachment.split(',').forEach(function (item) {
                                if (item !== '' && typeof item !== 'undefined') {
                                    var nameArr = item.split('_');
                                    delete nameArr[0];
                                    var fileName = nameArr.join('');
                                    attachment += "</br><span id=" + item.replace(/ /g, '') + "><a target='_blank' href='" + baseUrl + '/images/user/' + item + "'> <i class='' aria-hidden='true'>" + fileName + "</i></a> <i class='fa fa-trash' style='color:red' onclick='angular.element(this).scope().deleteAttachment(" + '"' + res.data._id + '",' + '"' + item + '"' + ")'></i></span>";
                                }
                            })
                            attachment = (attachment !== '') ? attachment : 'No attachments.';
                            $mdDialog.show({
                                controller: DialogController,
                                template: "<md-dialog aria-label='patient'><form ng-cloak> <md-toolbar><div class='md-toolbar-tools'><h2>Referral Details</h2> <span flex></span> <md-button class='md-icon-button' ng-click='cancel()'> <md-icon aria-label='Close dialog'><i class='fa fa-times' aria-hidden='true'></i></md-icon> </md-button></div> </md-toolbar> <md-dialog-content><div><div class='table-responsive-vertical shadow-z-1'><table id='table' class='table table-hover table-mc-light-blue'><thead><tr><th>User Type</th><th>Name</th><th>Site</th><th>Email</th><th>Phone No</th></tr></thead><tbody><tr><td data-title='type'>Patient</td><td data-title='fname'>" + patient.fname + " " + patient.lname + "</td><td data-title='lname'></td><td data-title='email'>" + patient.email + "</td><td data-title='Phone'>" + patient.phno + "</td></tr><tr><td data-title='fname'>Referred By</td><td data-title='fname'>" + byUser.fname + " " + byUser.lname + "</td><td data-title='lname'>" + byUser.site + "</td><td data-title='email'>" + byUser.email + "</td><td data-title='Phone'>" + byUser.phno + "</td></tr><tr><td data-title='fname'>Referred To</td><td data-title='fname'>" + toUser.fname + " " + toUser.lname + "</td><td data-title='lname'>" + toUser.site + "</td><td data-title='email'>" + toUser.email + "</td><td data-title='Phone'>" + toUser.phno + "</td></tr>" + frntdeskhtml + "</tbody></table></div><div class='row'><div class='col-sm-4' style='padding:10px;'><h4><u>Additional Details</u></h4><div style='margin-bottom: 10px;'>Chief Complaint: " + chifComp + "</div><div style='margin-bottom: 10px;'>Services Required: " + services + "</div><div style='margin-bottom: 10px;'>Other: " + other + "</div><div style='margin-bottom: 10px;'>Attachments: " + attachment + " </div></div><div class='col-sm-8' style='padding:10px;'><h4><u>Referral Log</u></h4><div class='table-responsive-vertical shadow-z-1'><table id='table' class='table table-hover table-mc-light-blue'><thead><tr><th>Status</th><th>Time</th><th>By</th></tr></thead><tbody> " + dhtml + "</tbody></table></div></div></div> </md-dialog-content></form> </md-dialog>",
                                parent: angular.element(document.body),
                                targetEvent: ev,
                                clickOutsideToClose: true,
                                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                            })
                                .then(function (answer) {
                                    $scope.status = 'You said the information was "' + answer + '".';
                                }, function () {

                                });
                        }
                    })
                } else {
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                }
            })
        };

        $scope.showPrompt = function () { };

        /**
        * Update referral details
        * Created By Suman Chakraborty
        * Last modified on 24-01-2018
        */
        $scope.updateReferral = function (ev, id, reqType) {
            var req = { id: id, noDetails: true };
            $scope.reqType = reqType;
            var actvLog = { userId: $scope.frontDeskAcc, type: 4, detail: 'View referral details' };
            $scope.refDeatail = {};
            // Fetch specialty
            preferranseService.getSpeciality({}, function (response) {
                if (response.code == 200) {
                    $scope.specialityData = response.data;
                } else { }
            })
            // get services
            ReferService.GetServices().save({}, function (response) {
                if (response.code === 200) {
                    $scope.serviceslist = response.data;
                } else { }
            })
            dashboardService.getReferralDetail().save(req, function (res) {
                if (res.code === 200) {
                    actvLog.success = true;
                    $scope.refDeatail._id = res.data._id;
                    $scope.refDeatail.chiefComplain = res.data.chiefComplain;
                    $scope.refDeatail.specialities = (res.data.specialities && res.data.specialities.length > 0) ? res.data.specialities[0] : '';
                    $scope.refDeatail.serviceName = (res.data.serviceName) ? res.data.serviceName : '';
                    $mdDialog.show({
                        template: "<md-dialog aria-label='patient'style='width: 450px;'><form ng-cloak><md-toolbar><div class='md-toolbar-tools'><h2>Update Referral Details</h2> <span flex></span> <md-button class='md-icon-button' ng-click='cancelRefUpdate()'> <md-icon aria-label='Close dialog'><i class='fa fa-times' aria-hidden='true'></i></md-icon> </md-button></div></md-toolbar><md-dialog-content style='padding:10px'><label class='control-label' for='specialities'>Select Specialty:</label><ui-select ng-model='refDeatail.specialities' id='specialities' name='specialities' style='width 500px;'  theme='select2' style='padding-left: 0px;' class='form-control height-auto' title='Choose a specialty'><ui-select-match placeholder='Search a specialty'>{{$select.selected.specialityName}}</ui-select-match><ui-select-choices repeat='item._id as item in specialityData | filter: $select.search' position='down'><div ng-bind-html='item.specialityName | highlight: $select.search '></div></ui-select-choices></ui-select><label class='control-label' for='serviceName'> Service:</label><input type='text' class='form-control makerefInp' id='serviceName' placeholder='Service Required' name='serviceName' ng-model='refDeatail.serviceName' maxlength='100'><label class='control-label' for='chiefComplain'> Chief Complaint:</label><input type='text' class='form-control makerefInp' id='chiefComplain' placeholder='Chief Complaint' name='chiefComplain' ng-model='refDeatail.chiefComplain' maxlength='100'></md-dialog-content><md-dialog-actions><span flex></span><md-button ng-click='updateRefDetails(reqType)'>Update</md-button></md-dialog-actions></md-dialog>",
                        scope: $scope,
                        preserveScope: true,
                        //parent: angular.element(document.body),
                        targetEvent: ev,
                        required: true,
                        clickOutsideToClose: false,
                        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                    })
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                } else {
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                }
            });
        };

        /**
        * Update referral specialty, service, network and chief complaint after referral from doctor dashboard
        * Created By Suman Chakraborty 
        * Last Modified on 05-04-2018
        */
        $scope.updateRefDetails = function (reqType) {
            var actvLog = { userId: $scope.frontDeskAcc, type: 4, detail: 'View referral details' };
            $scope.refDeatail.serviceName = ($scope.refDeatail.serviceName) ? $scope.refDeatail.serviceName : '';
            $scope.refDeatail.specialities = ($scope.refDeatail.specialities) ? [$scope.refDeatail.specialities] : [];
            var currentTime = new Date();
            // Update last access time of the user who is updating the record and last operation time of this referral
            $scope.refDeatail.lastOperationOn = currentTime;
            if (reqType === 1) {
                $scope.refDeatail.refToOprTime = currentTime;
            } else if (reqType === 2) {
                $scope.refDeatail.refByOprTime = currentTime;
            }
            if (!$scope.refDeatail.services) {
                delete $scope.refDeatail.services;
            }
            ReferService.updateReferralDetail().save($scope.refDeatail, function (response) {
                if (response.code === 200) {
                    actvLog.success = true;

                    $state.reload('dashboard');
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                    $scope.refDeatail = {};
                    $mdDialog.hide();
                    logger.logSuccess('Details update successfully.');
                } else {
                    $scope.refDeatail = {};
                    $mdDialog.hide();
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                }
            })
            $mdDialog.hide();
        }
        $scope.cancelRefUpdate = function () {
            $scope.refDeatail = {};
            $mdDialog.hide();
        }
        /** 
        * Upload iamges
        * Created By Suman Chakraborty
        * last modified on 28-11-2017
        */
        $scope.uploadImage = function (event, referralId, reqType) {
            //console.log(" here upload image dashboard controller ===> ");
            $rootScope.loading = true;
            var logObj = { accessBy: $scope.frontDeskAcc, activityDetail: 'Upload new attachment in referral', activityType: 2 };
            var actvLog = { userId: $scope.frontDeskAcc, type: 6, detail: 'Upload new attachment in referral' };
            if (referralId) {
                var formData = new FormData();
                var currentTime = new Date();
                formData.append('attachmentFile', event.files[0]);
                ReferService.uploadAttachments().save(formData, function (resp) {

                    actvLog.success = true;
                    if (resp.code === 200) {
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        ReferService.updateReferral().save({ _id: referralId, attachment: resp.message, reqType: reqType }, function (res) {
                            // Add PHI Access log
                            //console.log(" res--> ",res);
                            logObj.patientId = res.patientInfo;

                            if (res.code === 200) {

                                // task#548 start
                                //console.log(" res referredBy --> ", res.data.referredBy);
                                //console.log(" res referredTo--> ", res.data.referredTo);

                                //if mail id exists then only fire api to send mail
                                if (res.data.referredTo.email && res.data.referredTo.isRegistered == true) { //$rootScope.referredDocEmailNotificationPref
                                    // console.log(" emailpateint2 -->", res.data.referredTo.email);
                                    //console.log(" referredDocMailMe2 -->",$rootScope.referredDocMail);
                                    //console.log(" referredDocEmailNotificationPreffrom2 -->",$rootScope.referredDocEmailNotificationPref);
                                    if (reqType == 1) {
                                        var mailObj = {
                                            patient:
                                            {
                                                // name: patientName,
                                                // mail: patientMail
                                            },
                                            referredUser:
                                            {
                                                name: res.data.referredBy.firstname,
                                                mail: res.data.referredBy.email,
                                                // degree: refDegree,
                                                //address: $rootScope.referredDocAddress,
                                                // phone: $rootScope.referredDocPhone,
                                                // firstLogin: $rootScope.referredDocFirstLogin
                                            },
                                            referringUser: res.data.referredTo.firstname,

                                            fromSvpFname: res.data.referredTo.firstname,
                                            fromSvpLname: res.data.referredTo.lastname,
                                            //fromSvpDegree: $rootScope.referingUserDegree,
                                            fromSvpCenter: res.data.referredTo.centername,

                                            toSvpFname: res.data.referredBy.firstname,
                                            toSvpLname: res.data.referredBy.lastname,
                                            // toSvpDegree: $rootScope.referredUserDegree,
                                            toSvpCenter: res.data.referredBy.centername,

                                            // patientName: patientName,
                                            salutation: '',
                                            service: '',
                                            hasTemplate: true,
                                            //referralMail: true,
                                            //selfRefer: tmpSlfRef,
                                            senduploadRefMail: true
                                        };
                                        //console.log(" mailObj1 -->", mailObj);//die;
                                        ReferService.sendMail().save(mailObj, function (res) { })
                                    } if (reqType == 2) {
                                        var mailObj = {
                                            patient:
                                            {
                                                // name: patientName,
                                                // mail: patientMail
                                            },
                                            referredUser:
                                            {
                                                name: res.data.referredTo.firstname,
                                                mail: res.data.referredTo.email,
                                                // degree: refDegree,
                                                //address: $rootScope.referredDocAddress,
                                                // phone: $rootScope.referredDocPhone,
                                                // firstLogin: $rootScope.referredDocFirstLogin
                                            },
                                            referringUser: res.data.referredBy.firstname,

                                            fromSvpFname: res.data.referredBy.firstname,
                                            fromSvpLname: res.data.referredBy.lastname,
                                            //fromSvpDegree: $rootScope.referingUserDegree,
                                            fromSvpCenter: res.data.referredBy.centername,

                                            toSvpFname: res.data.referredTo.firstname,
                                            toSvpLname: res.data.referredTo.lastname,
                                            // toSvpDegree: $rootScope.referredUserDegree,
                                            toSvpCenter: res.data.referredTo.centername,

                                            // patientName: patientName,
                                            salutation: '',
                                            service: '',
                                            hasTemplate: true,
                                            //referralMail: true,
                                            //selfRefer: tmpSlfRef,
                                            senduploadRefMail: true
                                        };
                                        //console.log(" mailObj2 -->", mailObj);//die;
                                        ReferService.sendMail().save(mailObj, function (res) { })
                                    }

                                    // console.log(" mailObj -->", mailObj);die;exit;

                                }
                                // task#548 end



                                // Add document upload event
                                var currentTime = new Date();
                                var req = { id: referralId, status: 7, lastUpdatedOn: currentTime, updatedBy: $rootScope.user._id, lastOperationOn: currentTime };
                                dashboardService.setReferralStatus().save(req, function (res) { });

                                // Save PHI access log
                                logProvider.PhiAccLog().save(logObj, function (res) { });
                                $rootScope.loading = false;
                                logger.logSuccess('File uploaded successfully.');
                            } else {
                                $rootScope.loading = false;
                                logger.logError(res.message);
                            }
                        })
                    } else {
                        $rootScope.loading = false;
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        logger.logError(resp.message);
                    }
                });
            } else {
                $rootScope.loading = false;
                logProvider.addUserActivity().save(actvLog, function (res) { });
                logger.logError('Unable to process your request.');
            }
        }

        /**
        * Referral detail dialog controller
        * Created by Suman Chakraborty
        * Last Modified by 25-04-2018
        */
        function DialogController($scope, $mdDialog) {
            $scope.deleteAttachment = function (id, fileName) {
                if (id && fileName) {
                    ReferService.deleteAttachment().save({ id: id, fileName: fileName }, function (resp) {
                        if (resp.code === 200) {
                            document.getElementById(fileName.replace(/ /g, '')).style.display = 'none';
                            logger.logSuccess(resp.message);
                        } else {
                            logger.logError(resp.message);
                        }
                    });
                }
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {

                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }

        /**
        * Get content for notification list page
        *
        */
        $scope.getCount = function (searchTxt) {
            var condition = { user_id: localData._id };
            if (searchTxt) {
                condition.searchTxt = searchTxt;
            }
            dashboardService.getCount().get(condition, function (response) {
                if (response.code == 200) {
                    $scope.count = response.count;
                    var notification = response.data;
                    notification.forEach(function (list, index) {
                        var userIdArr = list.user_ids;
                        userIdArr.forEach(function (item) {
                            if (item == localData._id) {
                                notification[index].status = true;
                            }
                        }, this);
                    }, this);
                    $scope.notificationList = notification;
                }
            });
        }

        /**
        * Open notificaton modal on notification list page
        * 
        */
        $scope.openModal = function (notification, index) {
            var reversed = $scope.notificationList.reverse();
            reversed[index].status = true;
            $scope.notificationList = reversed.reverse();
            $scope.subject = notification.subject;
            $scope.body = notification.body;
            dashboardService.getCount().get({ user_id: localData._id, notification_id: notification._id }, function (response) {
            });//performing update on notification for read.

            $mdDialog.show({
                // controller: DialogController,
                template: "<md-dialog aria-label='patient'><md-toolbar><div class='md-toolbar-tools'><h2 class='ng-binding'>{{subject}}</h2><span flex></span><md-button class='md-icon-button' ng-click='cancelRefUpdate()'> <md-icon aria-label='Close dialog'><i class='fa fa-times' aria-hidden='true'></i></md-icon></md-button></div> </md-toolbar><p class='ng-binding' style='font-family: serif;padding: 15px;font-size: larger;'>{{body}}</p><md-dialog-content style='width: 450px; height:300px' layout-padding ><label class='control-label'></md-dialog-content><md-dialog-actions></md-dialog-actions></md-dialog>",
                // parent: angular.element(document.body),
                // targetEvent: ev,
                clickOutsideToClose: false,
                preserveScope: true,
                scope: $scope,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
        }

        $scope.showFaq = function (pageid) {
            CommonService.showFaq(pageid);
        }

        $scope.shouldShow = function (referralStatus) {
            // put your authorization logic here
            return referralStatus.display;
        }
    }
]);
nwdApp.directive('customOnChange', function () {
    return {
        require: "ngModel",
        link: function postLink(scope, elem, attrs, ngModel) {
            elem.on("change", function (e) {
                var files = elem[0].files;
                ngModel.$setViewValue(files);
            })
        }
    }
})
    /** Filter for pagination on dashboard content
     *  Last modified on 26-07-2017
     */
    .filter('startFrom', function () {
        return function (input, start) {
            start = +start; //parse to int
            return input.slice(start);
        }
    })