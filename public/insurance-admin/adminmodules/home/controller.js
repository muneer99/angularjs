"use strict";

angular.module("Home")

nwdApp.controller("homeController", ['$scope', '$rootScope', '$sessionStorage', '$mdDialog',
    '$stateParams', 'HomeService', 'logger', '$state', '$location',
    function ($scope, $rootScope, $sessionStorage, $mdDialog,
        $stateParams, HomeService, logger, $state, $location) {

        // Just put the states in all the array,Check on run function the state change,
        // InHTML check the current state and use the class 
        //$scope.UserStatus = sessionStorage.getItem('userStatus');
        //$scope.frontDeskAccess = sessionStorage.getItem('frontDeskAccess');
        //$scope.frontDesk = (sessionStorage.getItem('userType') === 'officeAdmin') ? false : true;
        //$scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;

        $scope.menuDoctors = ['doctors-list'];
        $scope.menuDoctorRatings = ['regDocsRating'];
        $scope.nonRegDoc = ['nonRegDocs', 'editNonRegDoctor'];
        $scope.menuOfficeAdmin = ['officeAdmin-list'];
        $scope.menuPatients = ['patient-list'];
        $scope.menuSpeciality = ['speciality', 'addSpeciality', 'editSpeciality'];
        $scope.menuServices = ['services', 'addServices', 'editServices'];
        $scope.insuranceMenu = ['insurance', 'addInsurance', 'editInsurance'];
        $scope.titleMenu = ['title', 'addTitle', 'editTitle'];
        $scope.frontdesktitleMenu = ['frontdesktitle', 'addFrontdeskTitle', 'editFrontdeskTitle'];
        $scope.officeAdmin = ['officeAdmin', 'addofficeAdmin', 'editofficeAdmin'];
        $scope.faqMenu = ['editFaq', 'faq'];
        $scope.faxmenu = ['fax-list', 'fax'];
        $scope.emailmenu = ['email-list', 'email'];
        $scope.smsmenu = ['sms-list', 'sms'];
        $scope.hospitalMenu = ['hospital', 'addHospital', 'editHospital'];
        $scope.phiAccMenu = ['phiLog'];
        $scope.refAccMenu = ['referral-list'];
        $scope.userActvMenu = ['userActvLog'];
        $scope.invitationMenu = ['invitationLog'];
        $scope.notificationMenu = ['notification'];
        $scope.counts = {};
        $scope.contactDetail = {};

        /*$scope.$watch(function () {
            return $rootScope.autoLogoutTime;
        }, function () {
            $scope.autoLogoutTime = $rootScope.autoLogoutTime;
        }, true);*/

        var socket = io();
        socket.on('broadcast', function (data) {

            if (data.sendto.length == 0 || (($scope.userdata) && (data.sendto.indexOf($scope.userdata._id) != -1)))
                logger.logSuccess('New notification received <br />' + data.subject);
        });

        var localData = JSON.parse(sessionStorage.getItem('test'));

        $scope.contactDetail = {
            'firstname': localData.name,
            'lastname': localData.desc,
            'email': localData.email,
            'network_id': localData._id
        }

        $scope.activationMessage = function () {
            $scope.parmas = $location.search();
            $scope.success = $scope.parmas.success;
        }

        /**
        * Get users count for dashboard 
        * Created by Suman CHakraborty
        * Last modified on 09-09-2017
        */
        $scope.getCounts = function () {
           // console.log(" inside get counts ");
            var localData = JSON.parse(sessionStorage.getItem('test'));
           // console.log(" localData ", localData);

            $scope.paramUrl = {};

            $scope.paramUrl.insurance = localData._id;
            $scope.paramUrl.network = [localData._id];

            //doctorService.getDoctorsListAssociatedInsurance().save($scope.paramUrl, function (response, err) {


            $rootScope.loading = true;
            // HomeService.getDoctorsListAssociatedInsurance($scope.paramUrl).get(function (response) {
            HomeService.getDoctorsListAssociatedInsurance().save($scope.paramUrl, function (response, err) {
                //console.log(" response getDoctorsListAssociatedInsurance ", response);
                if (response.code == 200) {
                    $scope.counts = response;
                }
               // console.log(" total ",$scope.counts.totalCount);
                $rootScope.loading = false;
            });
        }

        /**
* Get content for notification list page
*
*/
        $scope.getCountSuperAdmin = function (searchTxt) {
            //alert(" here "+searchTxt);
            //console.log(" here ",localData._id);die;
            // var condition = { user_id: localData._id };
            if (searchTxt) {
                var condition = { user_id: localData._id, status: 0 };
                condition.searchTxt = searchTxt;
            } else {
                var condition = { user_id: localData._id };
            }
            //console.log(" here ",condition);//die;
            HomeService.getCountSuperAdmin().get(condition, function (response) {
                //console.log("data=>", response.data);
                if (response.code == 200) {
                    $scope.count = response.count;
                    var notification = response.data;
                    // console.log(" notification -> ", response.data);
                    // notification.forEach(function (list, index) {
                    //     // var userIdArr = list.user_ids;
                    //     // userIdArr.forEach(function (item) {
                    //     //     if (item == localData._id) {
                    //     //         notification[index].status = true;
                    //     //     }
                    //     // }, this);
                    // }, this);
                    $scope.notificationList = notification;
                }
            });
        }
        /**
        * Open notificaton modal on notification list page
        * 
        */
        $scope.openModal = function (notification, index) {
            //console.log(" modal ",$scope.notificationList);
            var reversed = $scope.notificationList.reverse();
            //console.log(" reversed ", reversed);
            reversed[index].status = true;
            $scope.notificationList = reversed.reverse();
            $scope.subject = notification.subject;
            $scope.body = notification.body;

            // HomeService.notificationReadBySuperAdmin().get({ user_id: localData._id, notification_id: notification._id }, function (response) {
            // });//performing update on notification for read.
            //HomeService.notificationDeletedBySuperAdmin().get({ user_id: localData._id, notification_id: notificationId }, function (response) {
            HomeService.notificationReadBySuperAdmin().get({ user_id: localData._id, notification_id: notification._id }, function (response) {
                //console.log(" notification read outside",response);
                if (response.code == 200) {
                    //console.log(" notification read inside ", response);
                    //logger.logSuccess('Notification deleted successfully.');
                    $scope.count = response.count;
                    var notification = response.data;
                    // notification.forEach(function (list, index) {
                    //     var userIdArr = list.user_ids;
                    //     userIdArr.forEach(function (item) {
                    //         if (item == localData._id) {
                    //             notification[index].status = true;
                    //         }
                    //     }, this);

                    // }, this);
                    $scope.notificationList = notification;
                } else {
                    //console.log(" notification read inside failed ", response);
                    // logger.logSuccess('Something went wrong');
                }
            });

            HomeService.getCountSuperAdmin().get({ user_id: localData._id, notification_id: notification._id }, function (response) {
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

        $scope.cancelRefUpdate = function () {
            $scope.refDeatail = {};
            $mdDialog.hide();
        }

        /**
         * update super admin contact details
         * Last modified on 09-04-2018
         */
        $scope.updateContact = function () {
            $rootScope.loading = true;

            var localUser = JSON.parse(sessionStorage.getItem('test'));
            $scope.contactDetail.userId = localUser._id;

            // if ($scope.contactDetail.cell_phone_temp) {
            //     var loc_code = ($scope.contactDetail.ccode) ? $scope.contactDetail.ccode : '+1';
            //     $scope.contactDetail.cell_phone = loc_code + $scope.contactDetail.cell_phone_temp;
            // }
            // // set lat lon
            // if ($scope.contactDetail.fax_temp) {
            //     var loc_codefax = ($scope.contactDetail.ccodeFax) ? $scope.contactDetail.ccodeFax : '+1';
            //     $scope.contactDetail.fax = loc_codefax + $scope.contactDetail.fax_temp;
            // }
            // $scope.contactDetail.city = ($scope.contactDetail.city) ? $scope.contactDetail.city : '';
            // $scope.contactDetail.state = ($scope.contactDetail.city) ? $scope.contactDetail.state : '';
            //console.log(" contctdetail11 -> ", $scope.contactDetail);
            //console.log(" contctdetails11 -> ", $scope.contactDetails);


            if ($scope.contactDetail.email.length > 4) {

                if ($scope.contactDetail.hasOwnProperty('confPass')) {
                    // console.log(" contact detail ", $scope.contactDetail);
                    if (($scope.contactDetail.confPass) === ($scope.contactDetail.newpass)) {
                        var reqArr = { userId: localUser._id, pass: $scope.contactDetail.confPass }
                        HomeService.updatePassword().save(reqArr, function (res) {
                            if (res.code == 200) {
                                //actvLog.userId = res.data.id;
                                //actvLog.success = true;
                                //$window.sessionStorage.firstLogin = false;
                                logger.logSuccess('Password updated successfully.');
                                // $location.path('/');
                            } else {
                                logger.logError(res.message);
                            }
                            //logProvider.addUserActivity().save(actvLog, function (res) { });
                        })
                    } else {
                        logger.logError('Password and confirm password did not match.');
                    }
                }
                // else {
                //     logger.logError('Please enter password and confirm password.....');
                //     //logProvider.addUserActivity().save(actvLog, function (res) { });
                // }

                if ($rootScope.hasOwnProperty('profilePic') && $rootScope.profilePic.length > 0) {
                    //console.log(" contctdetail22 -> ", $scope.contactDetail);
                    var formData = new FormData();
                    formData.append('attachmentFile', $rootScope.profilePic[0]);
                    HomeService.uploadAttachments().save(formData, function (resp) {
                        // console.log(" rep image ", resp);
                        if (resp.code === 200) {
                            // console.log(" rep image ", resp);
                            var fileName = resp.message;
                            $scope.contactDetail.image = resp.message;
                            //}
                            HomeService.UpdateContactDetailsSuperAdmin().save($scope.contactDetail, function (res) {
                                //console.log(" res22 ",res);
                                if (res.code == 200) {
                                    //actvLog.success = true;
                                    // logProvider.addUserActivity().save(actvLog, function (res) { });
                                    $rootScope.user.image = $scope.contactDetail.image;
                                    // if (typeof $scope.contactDetail.speciality !== 'undefined' && $scope.contactDetail.speciality.length > 0) {
                                    //     $scope.contactDetail.speciality = $scope.contactDetail.speciality;
                                    // }
                                    var localData = JSON.parse(sessionStorage.getItem('test'));

                                    // update local storage
                                    localData.firstname = $scope.contactDetail.firstname;
                                    localData.lastname = $scope.contactDetail.lastname;
                                    // localData.location = $scope.contactDetail.location;
                                    // localData.phone_number = $scope.contactDetail.phone_number;
                                    // localData.cell_phone = $scope.contactDetail.cell_phone;
                                    // localData.fax = $scope.contactDetail.fax;
                                    // localData.sute = $scope.contactDetail.sute;
                                    // localData.city = $scope.contactDetail.city;
                                    // localData.state = $scope.contactDetail.state;
                                    // localData.degree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                                    // localData.officeadminTitle = ($scope.contactDetail.officeadminTitle) ? $scope.contactDetail.officeadminTitle : '';
                                    // localData.zipcode = $scope.contactDetail.zipcode;
                                    // localData.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                                    // localData.service = $scope.contactDetail.service;
                                    // localData.network = $scope.contactDetail.network;
                                    // $rootScope.user.firstname = $scope.contactDetail.firstname;
                                    // $rootScope.user.lastname = $scope.contactDetail.lastname;
                                    // $rootScope.user.location = $scope.contactDetail.location;
                                    // $rootScope.user.phone_number = $scope.contactDetail.phone_number;
                                    // $rootScope.user.cell_phone = $scope.contactDetail.cell_phone;
                                    // $rootScope.user.fax = $scope.contactDetail.fax;
                                    // $rootScope.user.sute = $scope.contactDetail.sute;
                                    // $rootScope.user.city = $scope.contactDetail.city;
                                    // $rootScope.user.state = $scope.contactDetail.state;
                                    // $rootScope.user.zipcode = $scope.contactDetail.zipcode;
                                    // $rootScope.user.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                                    // $rootScope.user.service = $scope.contactDetail.service;
                                    // $rootScope.user.network = $scope.contactDetail.network;
                                    // $rootScope.user.user_loc = $scope.contactDetail.user_loc.reverse();
                                    sessionStorage.setItem('test', JSON.stringify(localData));
                                    //console.log(" res33 ",res);
                                    //sessionStorage.emailAvailable = res.responseData.emailAvailable; //Task #535                                    
                                    //sessionStorage.firstLogin = res.responseData.firstLogin;
                                    logger.logSuccess('Super Admin Contact details updated successfully.');
                                    $rootScope.loading = false;
                                    //$state.go('admindashboard');
                                    //$state.go('admindashboard', {}, { reload: true });
                                    //$location.path('/');
                                    //$state.go('super-admin');
                                    $location.path('/');


                                } else {
                                    //logProvider.addUserActivity().save(actvLog, function (res) { });
                                    $rootScope.loading = false;
                                    logger.logError(resp.message);
                                }

                            });
                            // }
                        } else {
                            //logProvider.addUserActivity().save(actvLog, function (res) { });
                            $rootScope.loading = false;
                            logger.logError(resp.message);
                        }
                    });
                } else {
                    //console.log(" contctdetail33 -> ", $scope.contactDetail);//return false; die;

                    //console.log(" contctdetail55 -> ", $scope.contactDetail);
                    HomeService.UpdateContactDetailsSuperAdmin().save($scope.contactDetail, function (res) {
                        //console.log(" res-> ", res);
                        //console.log(" res55 ", res); //return false; die;
                        // console.log(" contctdetail33 -> ", $scope.contactDetail);
                        if (res.code == 200) {

                            var localData = JSON.parse(sessionStorage.getItem('test'));

                            // update local storage
                            localData.firstname = $scope.contactDetail.firstname;
                            localData.lastname = $scope.contactDetail.lastname;
                            // localData.location = $scope.contactDetail.location;
                            // localData.phone_number = $scope.contactDetail.phone_number;
                            // localData.cell_phone = $scope.contactDetail.cell_phone;
                            // localData.fax = $scope.contactDetail.fax;
                            // localData.sute = $scope.contactDetail.sute;
                            // localData.city = $scope.contactDetail.city;
                            // localData.state = $scope.contactDetail.state;
                            // localData.degree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                            // localData.zipcode = $scope.contactDetail.zipcode;
                            // localData.speciality = $scope.contactDetail.speciality;
                            // localData.service = $scope.contactDetail.service;
                            // localData.network = $scope.contactDetail.network;
                            // $rootScope.user.firstname = $scope.contactDetail.firstname;
                            // $rootScope.user.lastname = $scope.contactDetail.lastname;
                            // $rootScope.user.location = $scope.contactDetail.location;
                            // $rootScope.user.phone_number = $scope.contactDetail.phone_number;
                            // $rootScope.user.cell_phone = $scope.contactDetail.cell_phone;
                            // $rootScope.user.fax = $scope.contactDetail.fax;
                            // $rootScope.user.sute = $scope.contactDetail.sute;
                            // $rootScope.user.city = $scope.contactDetail.city;
                            // $rootScope.user.state = $scope.contactDetail.state;
                            // $rootScope.user.zipcode = $scope.contactDetail.zipcode;
                            // $rootScope.user.speciality = ($scope.contactDetail.speciality !== null) ? $scope.contactDetail.speciality : [];
                            // $rootScope.user.service = $scope.contactDetail.service;
                            // $rootScope.user.network = $scope.contactDetail.network;
                            // $rootScope.user.user_loc = $scope.contactDetail.user_loc.reverse();
                            sessionStorage.setItem('test', JSON.stringify(localData));
                            //sessionStorage.emailAvailable = res.responseData.emailAvailable; //Task #535
                            //sessionStorage.firstLogin = res.responseData.firstLogin;
                            // logger.logSuccess('Super Admin details updated successfully.');
                            logger.logSuccess('Super Admin Contact details updated successfully.');
                            $rootScope.loading = false;
                            // $state.go('admindashboard');
                            // $state.go('admindashboard', {}, { reload: true });
                            //$location.path('/');
                            //$state.go('super-admin');
                            $location.path('/');
                            // }
                            //}
                        } else {
                            $rootScope.loading = false;
                            //logProvider.addUserActivity().save(actvLog, function (res) { });
                            logger.logError(res.message);
                        }
                    });

                }

            } else {
                logger.logError('The email address is required.');
            }
            $rootScope.loading = false;

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
         * Get contact details of the logged in user to show on login screen
         * Last modified on 02-02-2018
         */
        //$scope.getServices();
        // $scope.getAvailableNetworks();
        $scope.getContactDetailsInsuranceAdmin = function () {
           // console.log(" resp.data ", resp.data);
            // $rootScope.loading = true;
            // $scope.tab = 1;
            // var ccode = '+1';
            // var ccodeFax = '+1';
            // var localUser = JSON.parse(sessionStorage.getItem('test'));
            // var userDetail = [];
            // var userSpecName = [];
            // var officeAdminArr = [];
            // var allOfficeAdmin = [];

            // HomeService.getContactDetailsSuperAdmin().save({ userId: localUser._id }, function (resp) {
            //console.log(" resp.data ", resp.data);
            // console.log(" localUser ", localUser);
            //     if (resp.code === 200) {
            //         userDetail = resp.data;
            //     } else {
            //         userDetail = localUser;
            //     }

            //     // if (userDetail.cell_phone && userDetail.cell_phone.length > 10 && userDetail.cell_phone.substr(0, userDetail.cell_phone.length - 10).length > 1) {
            //     //     ccode = userDetail.cell_phone.substr(0, userDetail.cell_phone.length - 10);
            //     //     userDetail.cell_phone = userDetail.cell_phone.substr(userDetail.cell_phone.length - 10);
            //     // } else {
            //     //     userDetail.cell_phone = '';
            //     // }
            //     // if (userDetail.fax && userDetail.fax.length > 10 && userDetail.fax.substr(0, userDetail.fax.length - 10).length > 1) {
            //     //     ccodeFax = userDetail.fax.substr(0, userDetail.fax.length - 10);
            //     //     userDetail.fax = userDetail.fax.substr(userDetail.fax.length - 10);
            //     // } else {
            //     //     userDetail.fax = '';
            //     // }
            //     // if (userDetail.user_loc && userDetail.user_loc[0] !== 0) {
            //     //     userDetail.user_loc = userDetail.user_loc;
            //     //     $scope.depth = 17;
            //     // } else {
            //     //     userDetail.user_loc = defaultLocation
            //     // }
            //     $scope.contactDetail = {
            //         'userId': userDetail._id,
            //         'firstname': userDetail.firstname,
            //         'lastname': userDetail.lastname,
            //         'email': userDetail.email,
            //         'image': userDetail.image,
            //         //  'location': userDetail.location,
            //         // 'centername': userDetail.centername,
            //         // 'degree': (userDetail.degree) ? userDetail.degree : '',
            //         //  'officeadminTitle': (userDetail.officeadminTitle) ? userDetail.officeadminTitle : '',
            //         // 'phone_number': userDetail.phone_number,
            //         //  'ccode': ccode,
            //         //  'ccodeFax': ccodeFax,
            //         // 'cell_phone': userDetail.cell_phone,
            //         // 'cell_phone_temp': userDetail.cell_phone,
            //         // 'fax': userDetail.fax,
            //         // 'fax_temp': userDetail.fax,
            //         // 'sute': userDetail.sute,
            //         // 'city': userDetail.city,
            //         // 'state': userDetail.state,
            //         // 'zipcode': userDetail.zipcode,
            //         //'speciality': (userDetail.speciality.length > 0) ? userDetail.speciality : '',
            //         // 'poc_name': (userDetail.poc_name) ? userDetail.poc_name : '',
            //         // 'poc_phone': (userDetail.poc_phone) ? userDetail.poc_phone : '',
            //         // 'service': serviceArr,
            //         //  'frontdesk': officeAdminArr,
            //         //'network': netArr,
            //         // 'range': (userDetail.range) ? userDetail.range : 0,
            //         // 'user_loc': userDetail.user_loc,
            //         // 'emailnotificationPref': userDetail.emailnotificationPref,
            //         // 'txtnotificationPref': userDetail.txtnotificationPref,
            //         // 'showMobile': userDetail.showMobile
            //     };
            //     $scope.firstname = $scope.contactDetail.firstname;
            //     $scope.lastname = $scope.contactDetail.lastname;
            //     $scope.centerlatlng = userDetail.user_loc;
            //     //console.log(" scope.contactDetail ", $scope.contactDetail);
            //     $rootScope.loading = false;
            // })

        }


        $scope.notificationDeletedBySuperAdmin = function (notificationId) {
            HomeService.notificationDeletedBySuperAdmin().get({ user_id: localData._id, notification_id: notificationId }, function (response) {
                //console.log(" notification deleted outside",response);
                if (response.code == 200) {
                    //console.log(" notification deleted inside ", response);
                    //logger.logSuccess('Notification deleted successfully.');
                    $scope.count = response.count;
                    var notification = response.data;
                    // notification.forEach(function (list, index) {
                    //     var userIdArr = list.user_ids;
                    //     userIdArr.forEach(function (item) {
                    //         if (item == localData._id) {
                    //             notification[index].status = true;
                    //         }
                    //     }, this);

                    // }, this);
                    $scope.notificationList = notification;
                } else {
                    // logger.logSuccess('Something went wrong');
                }
            });
        }

        $scope.getdoctors = function (req, res) {
            $rootScope.loading = true;
            HomeService.GetUserList({}, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    $scope.doctorList = response.data;
                    $scope.datalength = response.data.length;
                } else { $rootScope.loading = false; }
            })
        }

    }
]);