"use strict";

angular.module('speciality', ['ui.bootstrap'])
nwdApp.controller("referralController", [
    '$scope',
    '$timeout',
    '$filter',
    '$window',    
    '$rootScope',
    '$sessionStorage',
    'dashboardService',
    '$routeParams',
    '$route',
    '$location',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParams',
    '$http',
    'logger',
    'logProvider',
    '$anchorScroll',
    'ReferService',
    'preferranseService',
    'PreferenceServices',
    'insuranceService',
    'doctorService',
    'CommonService',
    
    function ($scope, $timeout, $filter,$window,  $rootScope, $sessionStorage, dashboardService, $routeParams, $route, $location, $state, $stateParams, ngTableParamsService,ngTableParams, $http, logger, logProvider, $anchorScroll, ReferService, preferranseService, PreferenceServices, insuranceService, doctorService, CommonService) {
        $scope.userdata = $rootScope.user;
        $scope.networkArr = [];
        $scope.countryCodes = countryCodes;
        // new page refer self
        $scope.selfRefer = 0;
        $scope.done = false;
        $scope.notFrontDesk = (sessionStorage.getItem('userType') === 'officeAdmin') ? false : true;
        $scope.contactDetail = {};
        $scope.contactDetail.ccodeFax = '+1';
        $scope.contactDetail.ccode = '+1';
        $scope.contactDetail.userType = 'Doctor';
        $scope.contactDetail.userTypes = 'Doctor';
        $scope.choices = ['Doctor'];
        $scope.nextpage = 'network';
        $scope.iteArr = [];
        $scope.addNew = false;
        $rootScope.prescription = '';
        $rootScope.searchedState = '';
        //$rootScope.user.state = ''
        //$rootScope.contactDetail.state ={};
        $scope.usStates = stateList;
        //$scope.degreeList               = degree;
        $scope.showHospital = false;
        $scope.hospitalArr = [];
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;
        $scope.patientSelected = '';
        $scope.search = {};
        $scope.accRange = 0;
        $scope.unverifiedUser = [];
        $scope.distanceSliderSelected = false;
        $scope.arrayOfRefferedRankingTitle = [{id : 1 , title : 'Your Most Refered to'},{id : 2 , title : 'Most Refered by others'}]
        $scope.referralChoiceVal = '';
        CommonService.getDegreeList();
        CommonService.getStateList();
        //$scope.availableDocsArr = [];
        //$scope.availableDocsArrNon = [];
        $scope.currentPage = 1;
        $scope.itemsPerPage = 5;
        $scope.itemsPerPageNonReg = 5;
        $scope.maxSize = 10;
        //$scope.totalItems = 250;
        //console.log(" us states list ", $scope.usStates);
        /**
         * Reset contactDetail form
         */
        $scope.resetForm = function () {
            $scope.contactDetail = {}
        }

        /**
        * Let the referring provider view the details when he/she is selecting non-registered doctor
        * Created By Suman Chakraborty
        * Last Modified on 06-05-2018
        */
        $scope.viewProvider = function (doc) {

            if ($scope.selfRefer) {
                $rootScope.selfRefer = $scope.selfRefer;
            } else {
                $rootScope.selfRefer = 0;
            }
            /*$rootScope.docDetail                  = {};
            $rootScope.docDetail.id               = doc._id;
            $rootScope.docDetail.ccodeFax         = '+1';
            $rootScope.docDetail.ccode            = '+1';
            $rootScope.docDetail.userType         = (doc.userType) ? doc.userType : 'user';
            $rootScope.docDetail.firstname        = (doc.firstname) ? doc.firstname : '';
            $rootScope.docDetail.lastname         = (doc.lastname) ? doc.lastname : '';
            $rootScope.docDetail.degree           = (doc.degree) ? doc.degree : '';
            $rootScope.docDetail.centername       = (doc.centername) ? doc.centername : '';
            $rootScope.docDetail.email            = (doc.email) ? doc.email : '';
            $rootScope.docDetail.fax_temp         = (doc.fax) ? doc.fax : '';
            $rootScope.docDetail.phone_number     = (doc.phone_number) ? doc.phone_number : '';
            $rootScope.docDetail.cell_phone_temp  = (doc.cell_phone) ? doc.cell_phone : '';
            $rootScope.docDetail.state            = (doc.state) ? doc.state : '';
            $rootScope.docDetail.zipcode          = (doc.zipcode) ? doc.zipcode : '';
            $rootScope.docDetail.location         = (doc.location) ? doc.location : '';            
            $rootScope.docDetail.city             = (doc.city) ? doc.city : '';
            
            $location.path('/view-providers');*/
        }
     
       
        //   $scope.numPages = function () {
        //     return Math.ceil($scope.todos.length / $scope.numPerPage);
        //   };
          
        //   $scope.$watch('currentPage + numPerPage', function() {
        //     var begin = (($scope.currentPage - 1) * $scope.numPerPage)
        //     , end = begin + $scope.numPerPage;
            
        //     $scope.filteredTodos = $scope.todos.slice(begin, end);
        //   });

        $scope.getNonDocById = function (selfRefer) {
            $rootScope.loading = true;
            //console.log(" self refer ",selfRefer);
            // if ($scope.selfRefer) {
            //     $rootScope.selfRefer = $scope.selfRefer;
            // } else {
            //     $rootScope.selfRefer = 0;
            // }
            if (selfRefer) {
                $scope.selfRefer = 1;
            }

            doctorService.getNonDocById().get({ id: $state.params.id }, function (response) {
                //console.log(" res ",response);
                if (response.code == 200) {
                    $rootScope.loading = false;
                    // for showing only one specialty as per the new rule
                    response.data.id = response.data._id;
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

                    response.data.user_loc = (response.data.user_loc) ? response.data.user_loc.reverse() : [];

                    $scope.contactDetail = response.data;

                } else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            })
        }

        /**
        * Save non-registered doctor in user table and proceed to referral
        * Created By Suman Chakraborty
        * Last Modified on 16-05-2018
        */
        $scope.saveProvider = function (doc) {
            $rootScope.loading = true;
            // Arrange country code and number for fax and mobile
            if (doc && doc.fax_temp != '') {
                var loc_ccodefax = (doc.ccodeFax) ? doc.ccodeFax : '+1';
                doc.fax = loc_ccodefax + doc.fax_temp;
            }
            if (doc && doc.cell_phone_temp != '') {
                var loc_ccode = (doc.ccode) ? doc.ccode : '+1';
                doc.cell_phone = loc_ccode + doc.cell_phone_temp;
            }
            // Save doctor and continue referral
            doctorService.registerDoctor().save(doc, function (response) {
                //console.log(" response ", response);
                if (response.code == 200) {
                    $rootScope.loading = false;
                    //Update non-reg doc list and proceed with referral
                    if (response.userdata && response.userdata._id) {
                        doctorService.updateNonRegDoc().save({ _id: doc.id, isOutside: false }, function (response) {
                            //console.log(" response2 ", response);
                        })
                        //console.log(" response3 ", response.userdata);
                        $rootScope.referral.nonRegisterReferredTo = response.userdata._id
                        $scope.startRefer('lookup', response.userdata);
                    } else {
                        $rootScope.loading = false;
                        logger.logError(response.message);
                    }
                }
                else if (response.code == 201) {
                    // If data exists then return to View Provider screen
                    $rootScope.loading = false;
                    $scope.done = false;
                    logger.logError(response.message);
                    $location.path('/view-providers/' + doc.id);

                }
                /*else if ( response.code ==201 && response.data && response.data.userId ) {
                    // If data exists then fetch the data and proceed to referral
                    doctorService.getById().get({ id: response.data.userId }, function(response) {
                        $rootScope.loading = false;
                        //Update non-reg doc list and proceed with referral
                        if ( response.data && response.data._id ) {
                            doctorService.updateNonRegDoc().save({ _id: doc.id, isImported : true }, function(response) {})
                            $scope.startRefer('lookup',response.data)
                        } else {
                            $rootScope.loading = false;
                            logger.logError(response.message);
                        }
                    });
                }*/
                else {
                    $rootScope.loading = false;
                    logger.logError(response.message);
                }
            });
        }

        /** 
        * Referral process
        * Created By Suman Chakraborty
        * last modified on 18-01-2018
        */
        $scope.startRefer = function (page, doctr) {
            //console.log(" startrefer page ", page);
            //console.log(" startrefer doctr ", doctr);
            $rootScope.loading = true;
            $rootScope.salutation = '';
            $rootScope.refTime = new Date();
            $scope.selectPatient = false;
            $rootScope.targetType = 'Provider';
            //if(!$rootScope.selfRefer){
            //console.log(" selfrefre ", $scope.selfRefer);
            if ($scope.selfRefer) {
                //console.log(" inside self if  ", $scope.selfRefer);
                $rootScope.selfRefer = $scope.selfRefer;
            } else {
                //console.log(" inside self else  ", $scope.selfRefer);
                $rootScope.selfRefer = 0;
            }

            //console.log("selfRefer", $rootScope.selfRefer);

            //}

            // get service name for page title
            var titleService = '';
            /*if ($rootScope.referral && $rootScope.referral.serviceName) {
                titleService = $filter('capitalize')($rootScope.referral.serviceName);
            }*/
            var title = $rootScope.servicesSelected + ' Doctors offering ';
            var subtile = titleService;
            $rootScope.serviceNames = titleService;
            title += subtile;
            // for future reference
            //$rootScope.SelectedServiceName = subtile;
            // merge phone no with country code when adding new provider
            if ($scope.contactDetail && $scope.contactDetail.fax_temp != '') {
                var loc_ccodefax = ($scope.contactDetail.ccodeFax) ? $scope.contactDetail.ccodeFax : '+1';
                $scope.contactDetail.fax = loc_ccodefax + $scope.contactDetail.fax_temp;
            }
            if ($scope.contactDetail && $scope.contactDetail.cell_phone_temp != '') {
                var loc_ccode = ($scope.contactDetail.ccode) ? $scope.contactDetail.ccode : '+1';
                $scope.contactDetail.cell_phone = loc_ccode + $scope.contactDetail.cell_phone_temp;
            }
            /** 
            * When you want to add a new doctor during referral
            * Possible cases: 
            *       1. Add new doctor and refer to that doctor
            *       2. Refer to an existing doctor
            *       3. Add new doctor and take referral from that doctor
            *       4. Take referral from an existing doctor
            *
            *  @page == addAndRefer denotes user want to add a doctor and refer  
            *  $scope.selfRefer true value denotes you are taking referral from this new doctor and false denote you are referring to the new doctor
            */
            if (page === 'addAndRefer') {
                //console.log(" addandrefer ",$scope.selfRefer);
                if ($scope.selfRefer === 1) {
                    console.log(" selfRefer 1");
                    //console.log(" addandrefer self if ");
                    if (!$rootScope.referral) {
                        $rootScope.referral = {};
                    }
                    $scope.contactDetail.lastname = ($scope.contactDetail.lastname) ? $scope.contactDetail.lastname : '';
                    $scope.contactDetail.referredUserFname = ($rootScope.user.firstname) ? $rootScope.user.firstname : '';
                    $scope.contactDetail.referredUserLname = ($rootScope.user.lastname) ? $rootScope.user.lastname : '';
                    $rootScope.referingUser = $scope.contactDetail.firstname + ' ' + $scope.contactDetail.lastname;
                    // new variables for mail and sms
                    $rootScope.referingUserFname = ($scope.contactDetail.firstname) ? $scope.contactDetail.firstname : '';
                    $rootScope.referingUserLname = ($scope.contactDetail.lastname) ? $scope.contactDetail.lastname : '';
                    $rootScope.referingUserDegree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                    $rootScope.referingUserCenter = ($scope.contactDetail.centername) ? $scope.contactDetail.centername : '';

                    $rootScope.referredUserFname = ($rootScope.user.firstname) ? $rootScope.user.firstname : '';
                    $rootScope.referredUserLname = ($rootScope.user.lastname) ? $rootScope.user.lastname : '';
                    $rootScope.referredUserDegree = ($rootScope.user.degree) ? $rootScope.user.degree : '';
                    $rootScope.referredUserCenter = ($rootScope.user.centername) ? $rootScope.user.centername : '';


                    $rootScope.referingDocPhone = $scope.contactDetail.phone_number;
                    $rootScope.referingDocFax = $scope.contactDetail.fax;
                    $scope.contactDetail.userType = 'user';
                    $scope.contactDetail.salutation = '';

                    $scope.contactDetail.reqfrom = 'add_doc_take_outside_referral';
                    $scope.contactDetail.referringDoc = $rootScope.user.lastname;

                    $scope.contactDetail.fromSvpFname = $scope.contactDetail.firstname;
                    $scope.contactDetail.fromSvpLname = $scope.contactDetail.lastname;
                    $scope.contactDetail.fromSvpDegree = $scope.contactDetail.degree;
                    $scope.contactDetail.fromSvpCenter = $scope.contactDetail.centername;
                    $scope.contactDetail.toSvpFname = $rootScope.user.firstname;
                    $scope.contactDetail.toSvpLname = $rootScope.user.lastname;
                    $scope.contactDetail.toSvpDegree = $rootScope.user.degree;
                    $scope.contactDetail.toSvpCenter = $rootScope.user.centername;
                    doctorService.addDoctor().save($scope.contactDetail, function (response) {
                        if (response.code == 200) {
                            logProvider.addUserActivity().save({ userId: $scope.frontDeskAcc, type: 5, success: true, detail: 'Add referring doctor' }, function (res) { });
                            addr += $rootScope.user.location;
                            addr += ($rootScope.user.city !== null && $rootScope.user.city !== '') ? ', ' + this.convertAddress($rootScope.user.city) : '';
                            addr += ($rootScope.user.state !== null && $rootScope.user.state !== '') ? ', ' + $rootScope.user.state : '';
                            addr += ($rootScope.user.zipcode !== null && $rootScope.user.zipcode !== '') ? ', ' + $rootScope.user.zipcode : '';
                            $rootScope.referredDocAddress = addr;
                            $rootScope.pageTitleNew = 'Referral to ' + (($rootScope.user.firstname) ? $rootScope.user.firstname + " " : '') + (($rootScope.user.lastname) ? $rootScope.user.lastname + " " : '') + (($rootScope.user.centername) ? $rootScope.user.centername : '');
                            $rootScope.referral.referredTo = $rootScope.user._id;
                            $rootScope.referral.referredBy = response.data.userId;



                            //console.log(" invitationLogReferral called 555 ******==> ", $rootScope);
                            //start by arv for invitation log @invitationLogReferral   
                            var invitationLog = { sentBy: $rootScope.user._id, sentTo: response.data.userId };
                            logProvider.addInvitationLog().save(invitationLog, function (res) { });
                            logProvider.getInvitationListById().get({ id: response.data.userId }, function (response) {
                                var notificationCount = response.data.length;
                                if (notificationCount >= 5) {
                                    //console.log(" getInvitationList called inside  ******==> ", response.data[0].sentTo.email);
                                    var SuperAdmin = 'SuperAdmin';
                                    logProvider.getSuperAdminId().get({ id: SuperAdmin }, function (response2) {
                                        //console.log(" getSuperAdminId called inside 555  ******==> ", response2.data._id);
                                        // console.log(" getInvitationList called inside 555  ******==> ", response.data[0].sentTo.email);
                                        //var notificationreq = { subject: 'Notification for 5th invitation', body: ' 5th invitation sent to un-registered provider:' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname + ' (' + response.data[0].sentTo.email + ')', sentTo: response2.data._id };




                                        var notificationreq = { subject: 'Notification for ' + notificationCount + ' invitation for ' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname, body: notificationCount + ' invitation sent to un-registered provider:' + response.data[0].sentTo.firstname + ' ' + response.data[0].sentTo.lastname + ' (' + response.data[0].sentTo.email + ')', sentTo: response2.data._id };
                                        doctorService.sendnotificationSuperAdmin().save(notificationreq, function (resp) {
                                            if (resp.code == 200) {
                                                logger.logSuccess('Send Successfully');
                                                $scope.template = null;
                                            } else {
                                                logger.logError(resp.message);
                                            }
                                        })





                                    })
                                }
                            })
                            //end by arv for invitation log

                            $rootScope.loading = false;
                            $location.path('/confirmation');
                        } else {
                            $rootScope.loading = false;
                            $scope.done = false;
                            logger.logError(response.message);
                        }
                    })
                } else {
                    //  if (!$rootScope.referral) {
                    //     $rootScope.referral = {};
                    // }
                    //console.log(" addandrefer self else ", $rootScope);
                    console.log("not selfRefer 2");
                    $scope.contactDetail.speciality = ($rootScope.referral && typeof $rootScope.referral.specialities === 'string') ? [$rootScope.referral.specialities] : $rootScope.referral.specialities;
                    /*if ($rootScope.referral && $rootScope.referral.serviceName) {
                        $scope.contactDetail.serviceName = $filter('capitalize')($rootScope.referral.serviceName);
                    }*/
                    if ($rootScope.referral && ['', 1, 2].indexOf($rootScope.referral.network) === -1) {
                        $scope.contactDetail.network = ($rootScope.referral.network) ? [$rootScope.referral.network] : [];
                    }
                    //  console.log(" issue ",$rootScope.referral.network.selected._id);
                    //  console.log(" outside issue", ['', 1, 2].indexOf($rootScope.referral.network.selected._id));


                    if ($rootScope.referral.network.hasOwnProperty('selected') && ($rootScope.referral.network.selected._id == 1 || $rootScope.referral.network.selected._id == 2)) {
                        //console.log(" issue ",$rootScope.referral.network.selected._id);

                        $scope.contactDetail.network = ($rootScope.referral.network.selected_id) ? [$rootScope.referral.network.selected_id] : [];
                    }

                    // if ($rootScope.referral && ['', 1, 2].indexOf($rootScope.referral.network.selected._id) === 1) {
                    //     console.log(" inside issue", ['', 1, 2].indexOf($rootScope.referral.network.selected._id));
                    //     $scope.contactDetail.network = ($rootScope.referral.network.selected) ? [$rootScope.referral.network.selected] : [];
                    // } 
                    //console.log(" contactdetail issue",$scope.contactDetail.network);

                    $scope.contactDetail.createdById = $rootScope.user._id;
                    $rootScope.referingUser = $rootScope.user.firstname + ' ' + $rootScope.user.lastname;
                    // new variables for mail and sms
                    $rootScope.referingUserFname = ($rootScope.user.firstname) ? $rootScope.user.firstname : '';
                    $rootScope.referingUserLname = ($rootScope.user.lastname) ? $rootScope.user.lastname : '';
                    $rootScope.referingUserDegree = ($rootScope.user.degree) ? $rootScope.user.degree : '';
                    $rootScope.referingUserCenter = ($rootScope.user.centername) ? $rootScope.user.centername : '';

                    $rootScope.referredUserFname = ($scope.contactDetail.firstname) ? $scope.contactDetail.firstname : '';
                    $rootScope.referredUserLname = ($scope.contactDetail.lastname) ? $scope.contactDetail.lastname : '';
                    $rootScope.referredUserDegree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                    $rootScope.referredUserCenter = ($scope.contactDetail.centername) ? $scope.contactDetail.centername : '';


                    $rootScope.referingDocPhone = $rootScope.user.phone_number;
                    $rootScope.referingDocFax = $rootScope.user.fax;
                    $scope.contactDetail.referingUserFname = $rootScope.user.firstname;
                    $scope.contactDetail.referingUserLname = $rootScope.user.lastname;
                    $scope.contactDetail.referingUserDegree = $rootScope.user.degree;
                    $scope.contactDetail.referingUserCenter = $rootScope.user.centername;
                    $scope.contactDetail.reqfrom = 'faxAddAndRefer';
                    $scope.contactDetail.userType = 'user';
                    $scope.contactDetail.salutation = '';
                    $scope.contactDetail.fromSvpFname = $rootScope.user.firstname;
                    $scope.contactDetail.fromSvpLname = $rootScope.user.lastname;
                    $scope.contactDetail.fromSvpDegree = $rootScope.user.degree;
                    $scope.contactDetail.fromSvpCenter = $rootScope.user.centername;
                    //console.log(" scope.contactDetail ",$scope.contactDetail);
                    doctorService.addDoctor().save($scope.contactDetail, function (response) {
                        //console.log(" res add refer -> ", response);
                        // console.log(" res2 -> ", $scope.contactDetail);
                        if (response.code == 200) {
                            logProvider.addUserActivity().save({ userId: $scope.frontDeskAcc, type: 5, detail: 'Add and refer a provider', success: true }, function (res) { });

                            $rootScope.reffDegree = ($rootScope.referredUserDegree && $rootScope.referredUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referredUserDegree] : '';

                            //$rootScope.userDegree
                            $rootScope.referredDocName = $scope.contactDetail.firstname + ' ' + $scope.contactDetail.lastname;
                            $rootScope.referredDocNames = $scope.contactDetail.firstname + ' ' + $scope.contactDetail.lastname + ' ' + $rootScope.reffDegree;
                            $rootScope.degreeRef = parseInt($rootScope.user.degree) ? ', ' + ($rootScope.degree[$rootScope.user.degree]) : '';
                            // console.log(" $rootScope.degreeRef  ", $rootScope.degreeRef);

                            //Task #556 start
                            if (response.userdata.firstname == '' && response.userdata.lastname == '') {
                                //console.log(" here if ");
                                $rootScope.referredDocName = response.userdata.centername;
                                $rootScope.referredDocNames = response.userdata.centername;
                            } else {
                                if (response.userdata.centername == '') {
                                    //console.log(" here else if ");
                                    $rootScope.referredDocName = response.userdata.firstname + ' ' + response.userdata.lastname;
                                    $rootScope.referredDocNames = response.userdata.firstname + ' ' + response.userdata.lastname + ' ' + $rootScope.reffDegree;
                                } else {
                                    //console.log(" here else ");
                                    if ($rootScope.reffDegree == '') {
                                        $rootScope.referredDocName = response.userdata.firstname + ' ' + response.userdata.lastname + ' - ' + response.userdata.centername;
                                        $rootScope.referredDocNames = response.userdata.firstname + ' ' + response.userdata.lastname + ' - ' + response.userdata.centername;
                                    } else {
                                        $rootScope.referredDocName = response.userdata.firstname + ' ' + response.userdata.lastname + ' - ' + response.userdata.centername;
                                        $rootScope.referredDocNames = response.userdata.firstname + ' ' + response.userdata.lastname + ' ' + $rootScope.reffDegree + ' - ' + response.userdata.centername;
                                    }

                                }
                            }
                            //console.log(" here at the end ",$rootScope);
                            //Task #556 end

                            $rootScope.referredDocLname = $scope.contactDetail.lastname;
                            $rootScope.referredDocId = $scope.contactDetail._id;
                            $rootScope.salutation = '';
                            $rootScope.targetType = 'Doctor';
                            $rootScope.referredDocFName = $scope.contactDetail.firstname;
                            $rootScope.referredDocMail = $scope.contactDetail.email;
                            $rootScope.userDegree = ($scope.contactDetail.degree) ? $scope.contactDetail.degree : '';
                            $rootScope.referredDocPhone = $scope.contactDetail.phone_number;
                            $rootScope.referredDocMobile = $scope.contactDetail.cell_phone;
                            $rootScope.refmob = $scope.contactDetail.cell_phone;
                            $rootScope.reffax = $scope.contactDetail.fax;
                            $rootScope.referredDocFirstLogin = response.data.firstLogin;
                            $rootScope.referredDocEmailNotificationPref = response.userdata.emailnotificationPref;
                            $rootScope.referredDocTxtNotificationPref = response.userdata.txtnotificationPref;
                            var addr = '';
                            addr += ($scope.contactDetail.location !== undefined) ? $scope.contactDetail.location : '';
                            addr += ($scope.contactDetail.city !== null && $scope.contactDetail.city !== '' && $scope.contactDetail.city !== undefined) ? ', ' + this.convertAddress($scope.contactDetail.city) : '';
                            // addr += ($scope.contactDetail.city !== null && $scope.contactDetail.city !== '' && $scope.contactDetail.city !== undefined) ? ', ' + $scope.contactDetail.city.toUpperCase() : '';
                            addr += ($scope.contactDetail.state !== null && $scope.contactDetail.state !== '' && $scope.contactDetail.state !== undefined) ? ', ' + $scope.contactDetail.state : '';
                            addr += ($scope.contactDetail.zipcode !== null && $scope.contactDetail.zipcode !== '' && $scope.contactDetail.zipcode !== undefined) ? ', ' + $scope.contactDetail.zipcode : '';
                            $rootScope.referredDocAddress = addr;
                            $rootScope.pageTitleNew = 'Referral to ' + (($scope.contactDetail.firstname) ? $scope.contactDetail.firstname + " " : '') + (($scope.contactDetail.lastname) ? $scope.contactDetail.lastname + " " : '') + (($scope.contactDetail.centername) ? $scope.contactDetail.centername : '');
                            $rootScope.referral.referredTo = response.data.userId;
                            $rootScope.referral.referredBy = $rootScope.user._id;
                            $rootScope.loading = false;
                            // In case of multiple network chosen at the time of referral then the network of the referral should be updated at this stage based the first match between the preference and the network the selected doctor serve          
                            $location.path('/confirmation');
                        } else {
                            $rootScope.loading = false;
                            $scope.done = false;
                            logger.logError(response.message);
                        }
                    })
                }
            } else {
                console.log('******here*************', doctr);
                // if request is coming from front desk user or not
                if ($rootScope.selfRefer === 1 && $scope.notFrontDesk) {
                    console.log('****** hereinsideif *************', doctr);
                    $scope.referingDoc = doctr;
                    $rootScope.referredDocName = $rootScope.user.firstname + ' ' + $rootScope.user.lastname;
                    $rootScope.reffDegree = ($rootScope.referredUserDegree && $rootScope.referredUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referredUserDegree] : '';
                    //Task #556 start
                    if (doctr.firstname == '' && doctr.lastname == '') {
                        $rootScope.referredDocName = doctr.centername;
                        $rootScope.referredDocNames = doctr.centername;
                    } else {
                        if (doctr.centername == '') {
                            $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname;
                            $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' ' + $rootScope.reffDegree;
                        } else {
                            if ($rootScope.reffDegree == '') {
                                $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                                $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                            } else {
                                $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                                $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' ' + $rootScope.reffDegree + ' - ' + doctr.centername;
                            }
                        }
                    }
                    //Task #556 end

                    $rootScope.referredDocLname = $rootScope.user.lastname;
                    $rootScope.referredDocId = $rootScope.user._id;
                    $rootScope.referredDocFName = ($rootScope.user.userType === 'user') ? $rootScope.user.firstname : '';
                    $rootScope.referredDocMail = $rootScope.user.email;
                    $rootScope.userDegree = ($rootScope.user.degree) ? $rootScope.user.degree : '';
                    $rootScope.referredDocPhone = $rootScope.user.phone_number;
                    $rootScope.referredDocMobile = $rootScope.user.cell_phone;
                    $rootScope.refmob = $rootScope.user.cell_phone;
                    $rootScope.reffax = $rootScope.user.fax;
                    var addr = ($rootScope.user.sute !== null && $rootScope.user.sute !== '') ? $rootScope.user.sute + ', ' : '';
                    addr += $rootScope.user.location;
                    addr += ($rootScope.user.city !== null && $rootScope.user.city !== '') ? ', ' + this.convertAddress($rootScope.user.city) : '';
                    // addr += ($rootScope.user.city !== null && $rootScope.user.city !== '') ? ', ' + $rootScope.user.city.toUpperCase() : '';
                    addr += ($rootScope.user.state !== null && $rootScope.user.state !== '') ? ', ' + $rootScope.user.state : '';
                    addr += ($rootScope.user.zipcode !== null && $rootScope.user.zipcode !== '') ? ', ' + $rootScope.user.zipcode : '';
                    $rootScope.referredDocAddress = (addr !== undefined) ? addr : '';
                    $rootScope.pageTitleNew = 'Accepted Referral from ' + (($scope.referingDoc.firstname) ? $scope.referingDoc.firstname + " " : '') + (($scope.referingDoc.lastname) ? $scope.referingDoc.lastname : '') + (($scope.referingDoc.degree) ? ", " + $rootScope.degree[$scope.referingDoc.degree] : '') + (($scope.referingDoc.centername) ? " " + $scope.referingDoc.centername : '');
                    // $rootScope.pageTitleNew = 'Referral to ' + (($scope.referingDoc.firstname) ? $scope.referingDoc.firstname + " " : '') + (($scope.referingDoc.lastname) ? $scope.referingDoc.lastname : '') + (($scope.referingDoc.degree) ? ", " + $rootScope.degree[$scope.referingDoc.degree] : '') + (($scope.referingDoc.centername) ? " " + $scope.referingDoc.centername : '');
                   
                    if (!$rootScope.referral) {
                        $rootScope.referral = {};
                    }
                    $rootScope.referral.referredTo = $rootScope.user._id;
                    $rootScope.referral.referredBy = $scope.referingDoc._id;
                    $rootScope.referingUser = $scope.referingDoc.firstname + ' ' + $scope.referingDoc.lastname;
                    // new variables for mail and sms
                    $rootScope.referingUserFname = $scope.referingDoc.firstname;
                    $rootScope.referingUserLname = $scope.referingDoc.lastname;
                    $rootScope.referingUserDegree = ($scope.referingDoc.degree) ? $scope.referingDoc.degree : '';
                    $rootScope.referingUserCenter = ($scope.referingDoc.centername) ? $scope.referingDoc.centername : '';


                    $rootScope.referredUserFname = ($rootScope.user.firstname) ? $rootScope.user.firstname : '';
                    $rootScope.referredUserLname = ($rootScope.user.lastname) ? $rootScope.user.lastname : '';
                    $rootScope.referredUserDegree = ($rootScope.user.degree) ? $rootScope.user.degree : '';
                    $rootScope.referredUserCenter = ($rootScope.user.centername) ? $rootScope.user.centername : '';

                    ////console.log('userdata**** ',$rootScope.user);
                    $rootScope.referingDocMail = $scope.referingDoc.email;
                    $rootScope.referingDocemailnotificationPref = ($scope.referingDoc.emailnotificationPref) ? $scope.referingDoc.emailnotificationPref : 'false'; //arv
                    $rootScope.isRegistered = ($scope.referingDoc.isRegistered) ? $scope.referingDoc.isRegistered : 'false'; //arv
                    $rootScope.firstLogin = ($scope.referingDoc.firstLogin) ? $scope.referingDoc.firstLogin : 'false'; //arv
                    $rootScope.referingDocPhone = $scope.referingDoc.phone_number;
                    $rootScope.referingDocFax = $scope.referingDoc.fax;
                    console.log("\n self refer $rootScope.referingDocFax",$rootScope.referingDocFax);
                } else if (!$scope.notFrontDesk) {
                    //console.log('****** hereinside elseif *************', doctr);
                    // if referring doctor is selected then it will take the user to select patient page

                    if (typeof $rootScope.referingDoc !== 'undefined') {
                        $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname;
                        //Task #556 start
                        $rootScope.reffDegree = ($rootScope.referredUserDegree && $rootScope.referredUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referredUserDegree] : '';

                        if (doctr.firstname == '' && doctr.lastname == '') {
                            $rootScope.referredDocName = doctr.centername;
                            $rootScope.referredDocNames = doctr.centername;
                        } else {
                            if (doctr.centername == '') {
                                $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname;
                                $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' ' + $rootScope.reffDegree;
                            } else {
                                if ($rootScope.reffDegree == '') {
                                    $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                                    $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' ' + $rootScope.reffDegree + ' - ' + doctr.centername;
                                } else {
                                    $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                                    $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' ' + $rootScope.reffDegree + ' - ' + doctr.centername;
                                }

                            }
                        }
                        //Task #556 end


                        $rootScope.referredDocLname = doctr.lastname;
                        // new variables for mail and sms
                        $rootScope.referingUserFname = $rootScope.referingDoc.firstname;
                        $rootScope.referingUserLname = $rootScope.referingDoc.lastname;
                        $rootScope.referingUserDegree = ($rootScope.referingDoc.degree) ? $rootScope.referingDoc.degree : '';
                        $rootScope.referingUserCenter = ($rootScope.referingDoc.centername) ? $rootScope.referingDoc.centername : '';

                        $rootScope.referredUserFname = (doctr.firstname) ? doctr.firstname : '';
                        $rootScope.referredUserLname = (doctr.lastname) ? doctr.lastname : '';
                        $rootScope.referredUserDegree = (doctr.degree) ? doctr.degree : '';
                        $rootScope.referredUserCenter = (doctr.centername) ? doctr.centername : '';



                        $rootScope.referredDocId = doctr._id;
                        $rootScope.referredDocFName = (doctr.userType === 'user') ? doctr.firstname : '';
                        $rootScope.referredDocMail = doctr.email;
                        $rootScope.userDegree = (doctr.degree) ? doctr.degree : '';
                        $rootScope.referredDocPhone = doctr.phone_number;
                        $rootScope.referredDocMobile = doctr.cell_phone;
                        $rootScope.refmob = doctr.cell_phone;
                        $rootScope.reffax = doctr.fax;
                        var addr = (doctr.sute !== null && doctr.sute !== '') ? doctr.sute + ', ' : '';
                        addr += doctr.location;
                        addr += (doctr.city !== null && doctr.city !== '') ? ', ' + thi.convertAddress(doctr.city) : '';
                        // addr += (doctr.city !== null && doctr.city !== '') ? ', ' + doctr.city.toUpperCase() : '';
                        addr += (doctr.state !== null && doctr.state !== '') ? ', ' + doctr.state : '';
                        addr += (doctr.zipcode !== null && doctr.zipcode !== '') ? ', ' + doctr.zipcode : '';
                        $rootScope.referredDocAddress = (addr !== undefined) ? addr : '';
                        $rootScope.pageTitleNew = 'Referral to ' + ((doctr.firstname) ? doctr.firstname + " " : '') + ((doctr.lastname) ? doctr.lastname + " " : '') + ((doctr.centername) ? doctr.centername : '');
                        $rootScope.referral.referredTo = doctr._id;
                        $rootScope.referral['referredBy'] = $rootScope.referingDoc._id;
                        $rootScope.referingUser = $rootScope.referingDoc.firstname + ' ' + $rootScope.referingDoc.lastname;
                        $rootScope.referingUserFname = $rootScope.referingDoc.firstname;
                        $rootScope.referingUserLname = $rootScope.referingDoc.lastname;
                        $rootScope.referingUserCenter = $rootScope.referingDoc.centername;
                        $rootScope.referingDocMail = $rootScope.referingDoc.email;

                        $rootScope.referingDocemailnotificationPref = ($rootScope.referingDoc.emailnotificationPref) ? $rootScope.referingDoc.emailnotificationPref : 'false'; //arv
                        $rootScope.isRegistered = ($rootScope.referingDoc.isRegistered) ? $rootScope.referingDoc.isRegistered : 'false'; //arv
                        $rootScope.firstLogin = ($rootScope.referingDoc.firstLogin) ? $rootScope.referingDoc.firstLogin : 'false'; //arv

                        $rootScope.referingDocemailnotificationPref = $rootScope.referingDoc.emailnotificationPref; //arv
                        $rootScope.referingDocPhone = $rootScope.referingDoc.phone_number;
                        $rootScope.referingDocFax = $rootScope.referingDoc.fax;
                        $scope.selectPatient = true;
                        console.log("\n$rootScope.referingDocFax 22",$rootScope.referingDocFax);
                    } else {
                        // this section will be executed at the time of selecting referring doctor
                        $rootScope.referingDoc = doctr;
                    }
                } else {
                    //console.log('****** hereinside else *************', doctr);
                    $rootScope.referingDoc = doctr;
                    // Not a self refer or not front desk user i.e, when doctor's are refering

                    $rootScope.referredDocLname = doctr.lastname;
                    $rootScope.referredDocId = doctr._id;
                    $rootScope.referredDocFName = (doctr.userType === 'user') ? doctr.firstname : '';
                    $rootScope.referredDocFirstLogin = doctr.firstLogin;
                    $rootScope.referredDocEmailNotificationPref = doctr.emailnotificationPref;
                    $rootScope.referredDocTxtNotificationPref = doctr.txtnotificationPref;
                    // new variables for mail and sms
                    $rootScope.referingUserFname = $rootScope.user.firstname;
                    $rootScope.referingUserLname = $rootScope.user.lastname;
                    $rootScope.referingUserDegree = ($rootScope.user.degree) ? $rootScope.user.degree : '';
                    $rootScope.referingUserCenter = ($rootScope.user.centername) ? $rootScope.user.centername : '';

                    $rootScope.referredUserFname = (doctr.firstname) ? doctr.firstname : '';
                    $rootScope.referredUserLname = (doctr.lastname) ? doctr.lastname : '';
                    $rootScope.referredUserDegree = (doctr.degree) ? doctr.degree : '';
                    $rootScope.referredUserCenter = (doctr.centername) ? doctr.centername : '';


                    $rootScope.referredDocMail = doctr.email;
                    $rootScope.userDegree = (doctr.degree) ? doctr.degree : '';
                    $rootScope.referredDocPhone = doctr.phone_number;
                    $rootScope.referredDocMobile = doctr.cell_phone;
                    $rootScope.refmob = doctr.cell_phone;
                    $rootScope.reffax = doctr.fax;
                    var addr = doctr.location;
                    addr += (doctr.sute !== null && doctr.sute !== '') ? ', ' + doctr.sute : '';
                    addr += (doctr.city !== null && doctr.city !== '') ? ', ' + this.convertAddress(doctr.city) : '';
                    addr += (doctr.state !== null && doctr.state !== '') ? ', ' + doctr.state : '';
                    addr += (doctr.zipcode !== null && doctr.zipcode !== '') ? ', ' + doctr.zipcode : '';
                    $rootScope.referredDocAddress = (addr !== undefined) ? addr : '';
                    $rootScope.pageTitleNew = 'Referral to ' + ((doctr.firstname) ? doctr.firstname + " " : '') + ((doctr.lastname) ? doctr.lastname + " " : '') + ((doctr.centername) ? doctr.centername : '');
                    $rootScope.referral.referredTo = doctr._id;
                    $rootScope.referral.referredBy = $rootScope.user._id;



                    //console.log(" $rootScope.user.degree ", $rootScope.user.degree);
                    //console.log(" $rootScope.degree[$rootScope.user.degree] ", $rootScope.degree[$rootScope.user.degree]);

                    $rootScope.degreeRef = parseInt($rootScope.user.degree) ? ', ' + ($rootScope.degree[$rootScope.user.degree]) : '';
                    // console.log(" $rootScope.degreeRef  ", $rootScope.degreeRef);
                    $rootScope.referingUser = $rootScope.user.firstname + ' ' + $rootScope.user.lastname;
                    $rootScope.referingUserFname = $rootScope.user.firstname;
                    $rootScope.referingDocMail = $rootScope.user.email;


                    $rootScope.referingDocemailnotificationPref = ($rootScope.referingDoc.emailnotificationPref) ? $rootScope.referingDoc.emailnotificationPref : 'false'; //arv
                    $rootScope.isRegistered = ($rootScope.referingDoc.isRegistered) ? $rootScope.referingDoc.isRegistered : 'false'; //arv
                    $rootScope.firstLogin = ($rootScope.referingDoc.firstLogin) ? $rootScope.referingDoc.firstLogin : 'false'; //arv

                    $rootScope.referingDocemailnotificationPref = $rootScope.user.emailnotificationPref; //arv

                    $rootScope.referingDocPhone = $rootScope.user.phone_number;
                   // $rootScope.referingDocFax = doctr.fax ? doctr.fax : ''//$rootScope.user.fax;
                    $rootScope.referingDocFax = $rootScope.user.fax;
                  
                 //   console.log("\n$rootScope.referingDocFax 333",$rootScope.referingDocFax);
                    //Task #556 start
                    $rootScope.reffDegree = ($rootScope.referredUserDegree && $rootScope.referredUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referredUserDegree] : '';
                    if (doctr.firstname == '' && doctr.lastname == '') {
                        $rootScope.referredDocName = doctr.centername;
                        $rootScope.referredDocNames = doctr.centername;
                    } else {
                        if (doctr.centername == '') {
                            $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname;
                            $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' ' + $rootScope.reffDegree;
                        } else {
                            if ($rootScope.reffDegree == '') {
                                $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                                $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                            } else {
                                $rootScope.referredDocName = doctr.firstname + ' ' + doctr.lastname + ' - ' + doctr.centername;
                                $rootScope.referredDocNames = doctr.firstname + ' ' + doctr.lastname + ' ' + $rootScope.reffDegree + ' - ' + doctr.centername;
                            }

                        }
                    }
                    //Task #556 end                  

                    //console.log(" $rootScope---> ", $rootScope);
                }
                if (doctr.userType === 'user') {
                    $rootScope.targetType = 'Doctor';
                }

                $rootScope.salutation = '';

                // In case of multiple network chosen at the time of referral then the network of the referral should be updated at this stage based the first match between the preference and the network the selected doctor serve          
                if (!$scope.notFrontDesk) {
                    if ($scope.selectPatient) {
                        $rootScope.loading = false;
                        $location.path('/confirmation');
                    } else {
                        $rootScope.loading = false;
                        $location.path('doctors');
                    }
                } else {
                    $rootScope.loading = false;
                    $location.path('/confirmation');
                }
            }
        }

        $scope.convertAddress = function (str) {
            str = str.split(" ");

            for (var i = 0, x = str.length; i < x; i++) {
                str[i] = str[i][0].toUpperCase() + str[i].substr(1);
            }

            return str.join(" ");
        }

        // search patents by name
        $scope.getPatients = function (search) {
            $rootScope.loading = true;
            ReferService.GetPatient(search, function (resp) {
                $scope.patientInfo = resp.data;
                $rootScope.loading = false;
            })
        }

        $scope.confirmSpec = function (data) {
            //console.log(" confirmed **** ");
            if ($rootScope.referral.specialities && $rootScope.referral.services) {
                //console.log(" confirmed if **** ");
                $location.path('/success');
            } else {
                $rootScope.pdata = data;
                //console.log(" confirmed else **** ");
                $location.path('/confirmSpec');
            }
        }

        /**
         * Referral final step
         * Last modified on 13-12-2017
         */
        $scope.referPatient = function (data) {
            //alert(" inside ",data);//die;

            //$rootScope.referral.network.selected._id

            //console.log(" referalsend ", data)
            // debugger;
            var choiceSet = {};
            choiceSet.preference = [];
            $rootScope.loading = true;
            $rootScope.referral.speciality = [];

            //While making referral if speciality and services are not selected then take the user to the page to select the specialty and services            
            if ($rootScope.referral.specialities || $rootScope.takeReferral) {
                var titleService = '';
                /*if ($rootScope.referral.serviceName) {
                    titleService = $filter('capitalize')($rootScope.referral.serviceName);
                }*/

                var condition = {};
                var actvLog = { userId: $scope.frontDeskAcc };
                var logObj = { accessBy: $scope.frontDeskAcc };
                var tmpSlfRef = false;
                var sendPtRefMail = true;
                // get specialty name of the referred doctor
                if ($rootScope.referral.referredBy === $rootScope.user._id) {
                    condition.userId = $rootScope.referral.referredTo;
                } else {
                    condition.userId = $rootScope.referral.referredBy;
                }
                if ($rootScope.referral.referredTo === $scope.user._id) {
                    tmpSlfRef = true;
                }
                if (typeof $rootScope.referral.network === 'string' && $rootScope.referral.network !== '') {
                    data.network = [$rootScope.referral.network]
                }
                $scope.referredDocSpecialty = 'ssss';
                if (data && data.contact_no_tmp) {
                    var loc_code = (data.ccode) ? data.ccode : '+1';
                    data.contact_no = loc_code + data.contact_no_tmp;
                }
                data.createdBy = $rootScope.user._id;
                $rootScope.refSalutation = '';

                var specname = ''; var sendPtRef = '1';
                // Specialty is selected then get the names
                if ($rootScope.referral.hasOwnProperty('specialities') && $rootScope.specialityData) {
                    $rootScope.specialityData.forEach(function (item) {
                        if ($rootScope.referral.specialities.indexOf(item._id) !== -1) {
                            specname = item.specialityName;
                            sendPtRef = item.sendPtRef;
                        }
                    })
                }
                //console.log(" specialityData ", $rootScope.specialityData)
                //console.log(" specialities ", $rootScope.referral.specialities)

                ReferService.addPatient().save(data, function (res) {
                    //console.log("inside save function data -->", data);
                    //console.log("inside save patient function res -->", res);
                    //console.log("inside save function rootScope -->", $rootScope.referingDoc);
                    //console.log("inside save function Scope -->", $scope.referingDoc);
                    if (res.code === 200) {
                        actvLog.success = true;
                        //PHI log for update / add new patient data 
                        if (data.hasOwnProperty('_id')) {
                            logObj.activityDetail = 'Update patient data from referral screen';
                            logObj.activityType = 2;
                            actvLog.detail = 'Update patient from referral screen';
                            actvLog.type = 6;
                        } else {
                            logObj.activityDetail = 'Add new patient from referral screen';
                            logObj.activityType = 3;
                            actvLog.detail = 'Add patient from referral screen';
                            actvLog.type = 5;
                        }
                        logObj.patientId = res.id;
                        logProvider.addUserActivity().save(actvLog, function (res) { });
                        logProvider.PhiAccLog().save(logObj, function (res) { });
                        // $rootScope.referral['patientInfo'] = res.id;
                        // $rootScope.referral['firstName'] = data.firstName;
                        // $rootScope.referral['lastName'] = data.lastName;
                        // $rootScope.referral['attachment'] = (data.prescription) ? data.prescription : $rootScope.prescription;
                        $rootScope.referral['chiefComplain'] = (data.hasOwnProperty('complaint')) ? data.complaint : '';
                        $rootScope.referral['serviceName'] = (data.hasOwnProperty('serviceName')) ? data.serviceName : '';

                        if (sessionStorage.getItem('frontDeskAdmin'))
                            $rootScope.referral['frontDeskReferredBy'] = (sessionStorage.getItem('frontDeskAdmin')) ? sessionStorage.getItem('frontDeskAdmin') : '';

                        $rootScope.serviceNames = (data.hasOwnProperty('serviceName')) ? data.serviceName : '';
                        // save referral 
                        var service = $rootScope.serviceNames;
                        // service                                 += $rootScope.serviceNames;
                        // if network field is blank or having value like self pay , unlisted insurance then delete the key before save 
                        //console.log(" selected id ", $rootScope.referral.network);

                        if ($rootScope.referral.network === '' || $rootScope.referral.network === 1 || $rootScope.referral.network === 2) {
                            delete $rootScope.referral.network;
                        }

                        if ($rootScope.referral.hasOwnProperty('network')) {
                            if ($rootScope.referral.network.hasOwnProperty('selected')) {
                                if ($rootScope.referral.network.selected._id === 1 || $rootScope.referral.network.selected._id === 2) {
                                    delete $rootScope.referral.network;
                                }
                            }
                        }

                        // console.log(" referral inside  ", $rootScope.referral.network);



                        //console.log(" specialities before ", $rootScope.referral.specialities);
                        if (typeof $rootScope.referral.specialities === 'string') {

                            $rootScope.referral.specialities = [$rootScope.referral.specialities]
                            //console.log(" inside ", $rootScope.referral.specialities);
                        }
                        //console.log(" specialities after ", $rootScope.referral.specialities);

                        $rootScope.referral.selfRefer = tmpSlfRef;
                        //console.log(" rootscope.....=>", $rootScope.referral);

                        ReferService.referPatients().save($rootScope.referral, function (res) {
                            // console.log(" save refer pateint ", res);
                            if (res.code === 200) {
                                // code start for Task# 602
                                // get count of total refferals in reffered speciality for logged in user 
                                $rootScope.referral.speciality = $rootScope.referral.specialities;
                                // console.log(" rootscope... referPatients ..=>", $rootScope.referral);
                                ReferService.getReferredCounts().save($rootScope.referral, function (res) {

                                    if (res.code === 200) {
                                        //  console.log(" referral", res);
                                        var ite = 0;

                                        res.data.forEach(function (item, index) {
                                            if (item._id.length > 0 && ite < 10) {

                                                // console.log(" item ", item._id[0]._id);
                                                // console.log(" ite ", ite);
                                                if (item._id[0]._id && item._id[0]._id.length > 0) {
                                                    choiceSet.preference[ite] = item._id[0]._id;
                                                    ite++;
                                                }


                                            }

                                        });
                                        //  console.log(" scope.choiceSet ", choiceSet);
                                        // start prefrences

                                        //choiceSet.preference.forEach(function (item, index) {
                                        // console.log(" $rootScope.referral.speciality ", $rootScope.referral.speciality);
                                        var dataObj = {
                                            userId: $rootScope.user._id,
                                            speciality: ($rootScope.referral.speciality[0]) ? $rootScope.referral.speciality[0] : '',
                                            preference: choiceSet.preference
                                        }
                                        //});

                                        //var specialityArr = [];
                                        //console.log(" scope.choiceSet ", $scope.choiceSet);
                                        //console.log(" scope prop ", prop);
                                        //for (var prop in $scope.choiceSet) {
                                        //if (prop !== '') {
                                        // var dataObj = {
                                        //     userId: $rootScope.referral.referredBy,
                                        //     speciality: prop,
                                        //     preference: $scope.choiceSet[prop]
                                        // }


                                        // console.log(" dataObj ", dataObj);
                                        PreferenceServices.addPreference().save(dataObj, function (res) {
                                            if (res.code === 200) {
                                                logger.logSuccess('Preferences updated successfully.');
                                            } else {
                                                logger.logError('Preferences did not updated successfully.');
                                            }
                                        });


                                        //}
                                        //}
                                        //end of update


                                        // end prefrences


                                    }

                                });


                                // end for Task#602








                                var msg = 'Refer a patient to ' + $rootScope.referredDocName;
                                var refUserId = $scope.frontDeskAcc;
                                if ($rootScope.selfRefer) {
                                    var refUserId = $rootScope.referral.referredBy
                                }
                                logProvider.addUserActivity().save({ userId: refUserId, type: 7, detail: msg, success: true }, function (res) { });
                                var logObj = { accessBy: $scope.frontDeskAcc, activityDetail: 'Refer patient', patientId: $rootScope.referral.patientInfo, activityType: 4 };
                                logProvider.PhiAccLog().save(logObj, function (res) { });
                                $rootScope.refDegree = ($rootScope.userDegree && $rootScope.userDegree != '') ? ', ' + $rootScope.degree[$rootScope.userDegree] : '';
                                var referralID = res.id;
                                var referingUser = $rootScope.referingUser;
                                var referingUserFname = $rootScope.referingUserFname;
                                var referingDocMail = $rootScope.referingDocMail;
                                var referingDocPhone = $rootScope.referingDocPhone;
                                //console.log(" rootscope -> ", $rootScope);
                                var referingDocFax = $rootScope.referingDocFax;
                                // Referred doc details
                                var referredUser = $rootScope.referredDocName;
                                var referredUserFname = $rootScope.referredDocFName;
                                var referredDocMail = $rootScope.referredDocMail;
                                var refDegree = ($rootScope.userDegree && $rootScope.userDegree != '') ? ', ' + $rootScope.degree[$rootScope.degree] : '';
                                var referredDocPhone = $rootScope.referingDocPhone;
                                // Patients details
                                var patientName = data.firstName + ' ' + data.lastName;
                                var patientMail = data.email;
                                var patientPhone = data.contact_no;
                                var othr = '';
                                if ($rootScope.hasOwnProperty('other')) {
                                    othr = ' and ' + $rootScope.other;
                                }
                                var salu = '';
                                var refdUser = referredUser;
                                var refUser = salu + referingUser;

                                if (sendPtRef == '0') // Blocking Patient Ref Email based on Specialty
                                    sendPtRefMail = false;


                                // if mail id exists then only fire api to send mail
                                if ((data.email || $rootScope.referredDocMail) && $rootScope.referredDocEmailNotificationPref) { //$rootScope.referredDocEmailNotificationPref
                                    //console.log(" emailpateint2 -->",data.email);
                                    // console.log(" referredDocMailMe2 -->",$rootScope.referredDocMail);
                                    // console.log(" referredDocEmailNotificationPreffrom2 -->",$rootScope.referredDocEmailNotificationPref);

                                    var mailObj = {
                                        patient:
                                        {
                                            name: patientName,
                                            mail: patientMail
                                        },
                                        referredUser:
                                        {
                                            name: refdUser,
                                            mail: referredDocMail,
                                            degree: refDegree,
                                            address: $rootScope.referredDocAddress,
                                            phone: $rootScope.referredDocPhone,
                                            firstLogin: $rootScope.referredDocFirstLogin
                                        },
                                        referringUser: refUser,

                                        fromSvpFname: $rootScope.referingUserFname,
                                        fromSvpLname: $rootScope.referingUserLname,
                                        fromSvpDegree: $rootScope.referingUserDegree,
                                        fromSvpCenter: $rootScope.referingUserCenter,

                                        toSvpFname: $rootScope.referredUserFname,
                                        toSvpLname: $rootScope.referredUserLname,
                                        toSvpDegree: $rootScope.referredUserDegree,
                                        toSvpCenter: $rootScope.referredUserCenter,

                                        patientName: patientName,
                                        salutation: salu,
                                        service: service,
                                        hasTemplate: true,
                                        referralMail: true,
                                        selfRefer: tmpSlfRef,
                                        sendPtRefMail: sendPtRefMail
                                    };
                                    // console.log(" mailObj1 -->", mailObj);//die;
                                    ReferService.sendMail().save(mailObj, function (res) { })


                                    //console.log(" mailObj -->",mailObj);

                                }

                                // Saurabh Udapure 09 July 2019 
                                 // if fax exists then only fire api to send fax mail( || $rootScope.referredDocMail) && $rootScope.referredDocEmailNotificationPref
                                 if ((data.fax || $rootScope.referredDocMail) && $rootScope.referredDocEmailNotificationPref ) { //$rootScope.referredDocEmailNotificationPref
                                    //console.log(" emailpateint2 -->",data.email);
                                    // console.log(" referredDocMailMe2 -->",$rootScope.referredDocMail);
                                    // console.log(" referredDocEmailNotificationPreffrom2 -->",$rootScope.referredDocEmailNotificationPref);
                                    console.log("\n inside data.fax");
                                    var mailObj = {
                                        patient:
                                        {
                                            name: patientName,
                                            mail: patientMail
                                        },
                                        referredUser:
                                        {
                                            name: refdUser,
                                            mail: referredDocMail,
                                            degree: data.degree,
                                            address: $rootScope.referredDocAddress,
                                            phone: $rootScope.referredDocPhone,
                                            firstLogin: $rootScope.referredDocFirstLogin
                                        },
                                        referringUser: refUser,

                                        fromSvpFname: $rootScope.referingUserFname,
                                        fromSvpLname: $rootScope.referingUserLname,
                                        fromSvpDegree: $rootScope.referingUserDegree,
                                        fromSvpCenter: $rootScope.referingUserCenter,

                                        toSvpFname: $rootScope.referredUserFname,
                                        toSvpLname: $rootScope.referredUserLname,
                                        toSvpDegree: $rootScope.referredUserDegree,
                                        toSvpCenter: $rootScope.referredUserCenter,

                                        patientName: patientName,
                                        salutation: salu,
                                        service: service,
                                        hasTemplate: true,
                                        referralMail: true,
                                        selfRefer: tmpSlfRef,
                                        sendPtRefMail: sendPtRefMail,
                                        emailAvailable : 0,
                                        fax : $rootScope.referingDocFax
                                    };
                                    // console.log(" mailObj1 -->", mailObj);//die;
                                    ReferService.sendMail().save(mailObj, function (res) { })


                                    //console.log(" mailObj -->",mailObj);

                                }

                                console.log("\n $rootScope.referingDocFax",$rootScope.referingDocFax);
                                //mail send to referring arv start
                                if ((data.email || $rootScope.referredDocMail) && $rootScope.referingDocemailnotificationPref) {
                                    //console.log(" data -> ", data);
                                    //console.log(" emailpateint3 -->", data.email);
                                    //  console.log(" referredDocMailMe2 -->", $rootScope.referredDocMail);
                                    //console.log(" referredDocEmailNotificationPreffrom2 -->", $rootScope.referredDocEmailNotificationPref);

                                    //Task #554 start
                                    var str = referingDocMail;
                                    var emailFlag = str.indexOf("temp@wd.com");
                                    if (emailFlag > -1) {

                                        // code to send add_doc_take_outside_referral faxtemplate start

                                        // console.log(" fax send --> ",$rootScope.referingDocFirstLogin);








                                        // code to send add_doc_take_outside_referral faxtemplate end 

                                        //console.log(" 11 ");
                                        //fax code
                                        //$scope.contactDetail.emailAvailable = 0;
                                        //$scope.contactDetail.isRegistered = false;

                                        //req.body.emailAvailable
                                        //mail code
                                        var mailObj1 = {
                                            patient:
                                            {
                                                name: patientName,
                                                mail: patientMail
                                            },
                                            referredUser:
                                            {
                                                name: refdUser,
                                                //mail: referredDocMail,
                                                degree: refDegree,
                                                address: $rootScope.referredDocAddress,
                                                phone: $rootScope.referredDocPhone,
                                                //firstLogin: $rootScope.referredDocFirstLogin
                                            },
                                            referringUser:
                                            {
                                                name: $rootScope.referingUserFname,
                                                mail: referingDocMail,
                                                isRegistered: $rootScope.isRegistered,
                                                firstlogin: $rootScope.firstLogin,
                                                //degree: refDegree,
                                                //address: $rootScope.referredDocAddress,
                                                //phone: $rootScope.referredDocPhone,
                                                //firstLogin: $rootScope.referingDocFirstLogin,
                                                // firstLogin: true
                                            },
                                            //referringUser: refUser, 
                                            //mail: referingDocMail,
                                            fromSvpFname: $rootScope.referingUserFname,
                                            fromSvpLname: $rootScope.referingUserLname,
                                            fromSvpDegree: $rootScope.referingUserDegree,
                                            fromSvpCenter: $rootScope.referingUserCenter,
                                            firstLogin: true,

                                            toSvpFname: $rootScope.referredUserFname,
                                            toSvpLname: $rootScope.referredUserLname,
                                            toSvpDegree: $rootScope.referredUserDegree,
                                            toSvpCenter: $rootScope.referredUserCenter,

                                            patientName: patientName,
                                            salutation: salu,
                                            service: service,
                                            hasTemplate: true,
                                            emailAvailable: 0,
                                            fax: referingDocFax,
                                            referralMail: true,
                                            //selfRefer: tmpSlfRef,
                                            sendPtRefMail: false //task#543

                                        };
                                        // console.log(" mailObj2fax -->", mailObj1);//die;
                                        ReferService.sendMail().save(mailObj1, function (res) {

                                        })





                                    } else {
                                        //console.log(" 22 ");
                                        //mail code
                                        var mailObj1 = {
                                            patient:
                                            {
                                                name: patientName,
                                                mail: patientMail
                                            },



                                            referredUser:
                                            {
                                                name: refdUser,
                                                //mail: referredDocMail,
                                                degree: refDegree,
                                                address: $rootScope.referredDocAddress,
                                                phone: $rootScope.referredDocPhone,
                                                //firstLogin: $rootScope.referredDocFirstLogin
                                            },
                                            referringUser:
                                            {
                                                name: $rootScope.referingUserFname,
                                                mail: referingDocMail,
                                                isRegistered: $rootScope.isRegistered,
                                                firstlogin: $rootScope.firstlogin,
                                                //degree: refDegree,
                                                //address: $rootScope.referredDocAddress,
                                                //phone: $rootScope.referredDocPhone,
                                                //firstLogin: $rootScope.referingDocFirstLogin,
                                                // firstLogin: true
                                            },
                                            //referringUser: refUser, 
                                            //mail: referingDocMail,
                                            fromSvpFname: $rootScope.referingUserFname,
                                            fromSvpLname: $rootScope.referingUserLname,
                                            fromSvpDegree: $rootScope.referingUserDegree,
                                            fromSvpCenter: $rootScope.referingUserCenter,
                                            firstLogin: true,

                                            toSvpFname: $rootScope.referredUserFname,
                                            toSvpLname: $rootScope.referredUserLname,
                                            toSvpDegree: $rootScope.referredUserDegree,
                                            toSvpCenter: $rootScope.referredUserCenter,

                                            patientName: patientName,
                                            salutation: salu,
                                            service: service,
                                            hasTemplate: true,
                                            referralMail: true,
                                            //selfRefer: tmpSlfRef,
                                            sendPtRefMail: false //task#543

                                        };
                                        //console.log(" mailObj2 -->", mailObj1);//die;
                                        ReferService.sendMail().save(mailObj1, function (res) { })

                                        //$scope.contactDetail.emailAvailable = 1;
                                        //$scope.contactDetail.isRegistered = true;
                                    }
                                    //Task #554 end  




                                }






                                /////////////////Refering user email to provider end  by arv////////	

                                // arv end

                                if($rootScope.referral.nonRegisterReferredTo){
                                    $rootScope.referral.referredTo = $rootScope.referral.nonRegisterReferredTo
                                }
                                // Customize message if this is taking referral
                                if ($rootScope.referral.referredTo === $scope.user._id) {
                                    $rootScope.msg1 = 'The referral for your patient has been generated.';
                                    // $rootScope.msg1 = 'The referral for ' + patientName + ' now appears on your dashboard.';
                                    $rootScope.showPres = false;
                                    $rootScope.takeReferral = false;
                                } else {
                                    $rootScope.showPres = true;
                                    $rootScope.makeReferral = false;
                                    $rootScope.msg1 = 'Your patient has been referred successfully to ' + referredUser + "'s office.";
                                    // $rootScope.msg1 = 'Your patient ' + patientName + ' has been referred successfully to ' + referredUser + "'s office and now appears on your dashboard.";
                                }
                                $rootScope.referredDocSpecialty = specname

                                // If referred doc has mobile no then send sms
                                // tmpSlfRef indicates if this is a self referral or not, If self referral then sms will not be sent
                                if ($rootScope.referredDocMobile && !tmpSlfRef && $rootScope.referredDocTxtNotificationPref) {
                                    // Send SMS to referred doc
                                    var docSmsObj = {
                                        "{{referingUser}}": $rootScope.referingUser,

                                        "{{fromSvpFname}}": $rootScope.referingUserFname,
                                        "{{fromSvpLname}}": $rootScope.referingUserLname,
                                        "{{fromSvpTitle}}": ($rootScope.referingUserDegree && $rootScope.referingUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referingUserDegree] : '',
                                        "{{fromSvpCenter}}": $rootScope.referingUserCenter,

                                        "{{toSvpFname}}": $rootScope.referredUserFname,
                                        "{{toSvpLname}}": $rootScope.referredUserLname,
                                        "{{toSvpTitle}}": ($rootScope.referredUserDegree && $rootScope.referredUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referredUserDegree] : '',
                                        "{{toSvpCenter}}": $rootScope.referredUserCenter,
                                    }

                                    ReferService.sendSms().save({ phno: $rootScope.referredDocMobile, key: 'referral_toDoc', paramObj: docSmsObj }, function (res) {
                                    })
                                }
                                /* send sms to patient when this is a make referral request 
                                * as we are showing prescription on makereferral screen so $rootScope.showPres denotes if it is a make referral or not
                                */
                                // if (data.contact_no && $rootScope.showPres && sendPtRef == '1') {
                                //     var patientSmsObj = {
                                //         "{{fromSvpFname}}": $rootScope.referingUserFname,
                                //         "{{fromSvpLname}}": $rootScope.referingUserLname,
                                //         "{{fromSvpTitle}}": ($rootScope.referingUserDegree && $rootScope.referingUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referingUserDegree] : '',
                                //         "{{fromSvpCenter}}": $rootScope.referingUserCenter,

                                //         "{{toSvpFname}}": $rootScope.referredUserFname,
                                //         "{{toSvpLname}}": $rootScope.referredUserLname,
                                //         "{{toSvpTitle}}": ($rootScope.referredUserDegree && $rootScope.referredUserDegree != '') ? ', ' + $rootScope.degree[$rootScope.referredUserDegree] : '',
                                //         "{{toSvpCenter}}": $rootScope.referredUserCenter,
                                //         "{{referredProviderAddress}}": $rootScope.referredDocAddress,
                                //         "{{referredProviderPhone}}": $filter('phonenumber')($rootScope.referredDocPhone),
                                //         "{{specname}}": specname,
                                //         "{{service}}": service
                                //     }
                                //     // Send SMS to referred doc
                                //     ReferService.sendSms().save({ phno: data.contact_no, key: 'referral_toPatient', paramObj: patientSmsObj }, function (res) {
                                //     })
                                // }
                                $scope.referral = {};
                                $rootScope.referral.network = '';
                                $rootScope.referral.services = [];
                                $rootScope.referral.serviceName = '';
                                $rootScope.referral.specialities = [];
                                $rootScope.loading = true;
                                //console.log(" $rootScope.prescription ==> ",$rootScope)
                                //console.log(" save success ");
                                // $location.path('/success');
                                $rootScope.makeReferral = true;
                                $rootScope.takeReferral = false;
                                data.prescription = ($rootScope.prescription) ? $rootScope.prescription : '';
                                $scope.confirmSpec(data);
                                $location.path('/success');
                                // $scope.referPatient($rootScope.pdata);
                            }
                        })
                    }
                })
            } else {
                data.prescription = ($rootScope.prescription) ? $rootScope.prescription : '';
                $scope.confirmSpec(data);
                $location.path('/success');
                //console.log($scope.confirmSpec);
            }
        }

        /** 
        * Print prescitpion
        * Created By Suman Chakraborty
        * last modified on 19-10-2017
        */
        $scope.printDiv = function (divName) {
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('');
            popupWin.document.open();
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
            popupWin.document.close();
        }

        /** 
        * Add Patient
        * Created By Suman Chakraborty
        * last modified on 28-11-2017
        */
        $scope.addPatient = function (info) {
            $rootScope.loading = true;
            var logObj = { accessBy: $scope.frontDeskAcc, activityDetail: 'View patient details from referral screen' };
            if (info && info._id) {
                logObj.patientId = info._id;
                logProvider.PhiAccLog().save(logObj, function (res) { });
                if (info.contact_no) {
                    info.ccode = info.contact_no.substr(0, info.contact_no.length - 10);
                    info.contact_no_tmp = info.contact_no.substr(info.contact_no.length - 10);
                }
            }
            if (typeof info === 'undefined') {
                info = {};
            }
            if (!info._id) {
                info.ccode = '+1';
            }
            $rootScope.patientInfo = info;

            //console.log(" $rootScope.referral.referredTo ", $rootScope.referral.referredTo);
            //console.log(" $scope.user._id ", $scope.user._id);

            if ($rootScope.referral.referredTo === $scope.user._id) {
                //console.log(" inside if ");
                $rootScope.btnTitle = "Accept Patient"
            } else {
                //console.log(" inside else ");
                $rootScope.btnTitle = 'Refer Patient';
            }
            $rootScope.loading = false;
            $location.path('/confirmation');
        }

        $scope.addDoc = function () {
            /*if ($scope.search) {
                $rootScope.searc = $scope.search;
            }*/
            $location.path('/add-doctor');
        }

        /**
         * Check if all data are present of prev steps otherwise redirect the user to the corresponding page
         */
        $scope.checkStatus = function (conditions) {
            if ($rootScope.hasOwnProperty('referral') && ((($rootScope.referral.hasOwnProperty('network') || $rootScope.referral.hasOwnProperty('newInsurance'))) || $rootScope.selfRefer)) {
                if (conditions !== 'self') {
                    if ($rootScope.referral.hasOwnProperty('referredTo') && $rootScope.referral.referredTo.length > 0) {
                    } else {
                        logger.logError('Please select a doctor first.');
                        $location.path('/doctors');
                    }
                }
            } else if ($rootScope.makeReferral) {
                // do nothing
            } else {
                logger.logError('Please select network and speciality first.');
                if ($rootScope.takeReferral) {
                    $location.path('/lookup');
                } else {
                    $location.path('/makeReferral');
                }
                // $location.path('/referPatient');
            }
        }

        $scope.lookupReq = function () {
            ReferService.getUserRegStatus().save({ 'userId': $rootScope.user._id }, function (response) {
                if (response.code === 200) {
                    if (response.data == true) {
                        $rootScope.referral = {};
                        $scope.referral = {};
                        $rootScope.takeReferral = true;
                        $rootScope.makeReferral = false;
                    } else {
                        $rootScope.loading = false;
                        $state.go('contact');
                        logger.logError('Please update your profile before starting referral.');
                    }
                } else {
                    $rootScope.loading = false;
                    $state.go('dashboard');
                    logger.logError('Something went wrong. Please try again letter.');
                }
            })
        }

        /** 
        * Get dcotor list
        * Created By Suman Chakraborty
        * last modified on 15-10-2017
        */
        $scope.getDoctorList = function (getAllDoc, getOutsideDocs) {
            // console.log(" inside fun getDoctorList",$rootScope.user)
               

            var search = $scope.search;
            var frontDeskReq = false;
            if (sessionStorage.getItem('userType') === 'officeAdmin') {
                frontDeskReq = true;
            }
            //var reqParams = { 'search': search, 'userId': $rootScope.user._id, 'frontDeskReq': frontDeskReq };

            ngTableParamsService.set('', '', search, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), search, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.frontDeskReq = frontDeskReq;
                    $scope.paramUrl.search = search;
                    $scope.paramUrl.userId = $rootScope.user._id;

                    if (getAllDoc) {
                        $scope.paramUrl.getAll = true;
                    }
                    $scope.paramUrl.getOutsideDocs = false;
                    if ($scope.paramUrl.hasOwnProperty('sorting[_id]')) {
                        delete $scope.paramUrl['sorting[_id]'];
                        $scope.paramUrl['sorting[firstname]'] = 1;
                    }
                    $scope.tableLoader = true;
                    $scope.docsList = [];
                    if ($rootScope.user.state) {
                        if ($rootScope.user.state == 'ALL') {
                            $scope.paramUrl.state = '';
                        } else {
                            $scope.paramUrl.state = $rootScope.user.state;
                        }

                    }
                    if ($rootScope.user.user_loc) {
                        $scope.paramUrl.userLoc = $rootScope.user.user_loc;
                        $scope.paramUrl.range = $scope.accRange;
                    }
                    $scope.paramUrl.searchRegistered = 1;
                    //console.log(" re ", $scope.paramUrl);
                    ReferService.GetDoctors().save($scope.paramUrl, function (response) {
                        // console.log(" doclist ",response.data);

                        $scope.tableLoader = false;
                        if (response.code == 200) {
                            $scope.docsList = response.data;
                            var data = response.data;
                            $scope.totalCount = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logger.logError('Something went wrong. Please try again.');
                        }
                    });
                }
            });


            $scope.tableOutsideDoctorParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    console.log("params",params.page(),params.count(),search, params.sorting());
                    ngTableParamsService.set(params.page(), params.count(), search, params.sorting());
                    $scope.paramUrl = params.url();
                    $scope.paramUrl.frontDeskReq = frontDeskReq;
                    $scope.paramUrl.search = search;
                    $scope.paramUrl.userId = $rootScope.user._id;

                    if (getOutsideDocs) {
                        $scope.paramUrl.getOutsideDocs = true;
                    }
                    $scope.paramUrl.getAll = false;
                    if ($scope.paramUrl.hasOwnProperty('sorting[_id]')) {
                        delete $scope.paramUrl['sorting[_id]'];
                        $scope.paramUrl['sorting[firstname]'] = 1;
                    }
                    $scope.tableNonRegDocLoader = true;
                    $scope.nonRegDocsList = [];
                    if ($rootScope.user.state) {
                        if ($rootScope.user.state == 'ALL') {
                            $scope.paramUrl.state = '';
                        } else {
                            $scope.paramUrl.state = $rootScope.user.state;
                        }

                    }
                    if ($rootScope.user.user_loc) {
                        $scope.paramUrl.userLoc = $rootScope.user.user_loc;
                        $scope.paramUrl.range = $scope.accRange;
                    }
                    ReferService.GetDoctors().save($scope.paramUrl, function (response) {
                        //console.log(" response nonreglist ",response);
                        $scope.tableNonRegDocLoader = false;
                        if (response.code == 200) {
                            $scope.nonRegDocsList = (response.outside) ? response.outside : [];
                            var data = response.outside;
                            $scope.totalCount = response.unregUsertotalCount;
                            params.total(response.unregUsertotalCount);
                            $defer.resolve(data);
                        } else {
                            logger.logError('Something went wrong. Please try again.');
                        }
                    });
                }
            });
       

            /*$rootScope.loading = true;
            var search = $scope.search;
            var frontDeskReq = false;
            if (sessionStorage.getItem('userType') === 'officeAdmin') {
                frontDeskReq = true;
            }
            var reqParams = { 'search': search, 'userId': $rootScope.user._id, 'frontDeskReq': frontDeskReq };
            // It will return registered doctor as well as non-registered doctors 
            if (getOutsideDocs) {
                reqParams.getOutsideDocs = true;
            }
            if (getAllDoc) {
                reqParams.getAll = true;
            }
            ReferService.GetDoctors().save(reqParams, function (response) {
                if (response.code == 200) {
                    $scope.docsList = response.data;
                    $scope.nonRegDocsList = (response.outside) ? response.outside : [];
                    $rootScope.loading = false;
                } else {
                    $rootScope.loading = false;
                    logger.logError('Something went wrong. Please try again.');
                }
            });*/
        }

        $scope.updateform = function () {
            /*if ($scope.search) {
                $scope.contactDetail.firstname  = ($scope.search.firstName) ? $scope.search.firstName : '';
                $scope.contactDetail.lastname   = ($scope.search.lastName) ? $scope.search.lastName : '';
            }*/
            $scope.addNew = !$scope.addNew;
        }

        $scope.intfunc = function () {
            if ($rootScope.searc) {
                $scope.contactDetail.firstname = ($rootScope.searc.firstName) ? $rootScope.searc.firstName : '';
                $scope.contactDetail.lastname = ($rootScope.searc.lastName) ? $rootScope.searc.lastName : '';
            }
        }
        $scope.nxtReferral = function () {
            //$location.path('/makeReferral');
            $location.path('/referPatient');
        }

        /**
        * Fetch insurance, services and specialty for starting the referral process
        * Created By Suman Chakraborty
        * Last modified on 09-01-2018
        */
        $scope.getContent = function () {
            //console.log(" getcontent ");
            $rootScope.loading = true;
            // $rootScope.makeReferral = true;
            // $rootScope.takeReferral = false;
            $scope.contactDetail = {
                'state': $rootScope.user.state
            }

            // $scope.state.selected = {name: $scope.state.[0].name};
            // Check if the user has updated profile (welcome screen and update location)
            ReferService.getUserRegStatus().save({ 'userId': $rootScope.user._id }, function (response) {

                if (response.code === 200) {
                    if (response.data == true) {
                        //console.log(" statelist ", $rootScope.stateList);
                        //console.log(" user state ", $rootScope.user.state);


                        // Assign previous existing value when coming to the page browser back 
                        if ($rootScope.referral) {
                            $scope.referral.other = ($rootScope.referral.other) ? $rootScope.referral.other : '';
                            $scope.referral.network = ($rootScope.referral.network) ? $rootScope.referral.network : '';
                            $scope.referral.specialities = ($rootScope.referral.specialities && $rootScope.referral.specialities.length > 0) ? $rootScope.referral.specialities[0] : '';
                        } else {
                            $rootScope.referral = {};
                        }
                        var serviceIDs = [];
                        var serviceArr = [];
                        //$scope.country = {};
                        //console.log(" referral.network before  ",$scope.referral.network );

                        // get network
                        insuranceService.getNetwork().get({ id: '000' }, function (response) {

                            if (response.code == 200) {
                                var firstElm = {
                                    _id: 1,
                                    name: "Self Pay",
                                    searchKey: "searchkey"
                                }
                                var unlistitem = {
                                    _id: 2,
                                    name: "Unlisted Insurance",
                                    searchKey: "searchkey"
                                }
                                //

                                $scope.networkArr = response.data;
                                //console.log(" networkarr before   ",$scope.networkArr);

                                $scope.networkArr.unshift(firstElm, unlistitem);
                                // console.log(" networkarr after   ",$scope.networkArr);

                                $scope.referral.network = {};
                                $scope.referral.network = ($rootScope.referral.network) ? $rootScope.referral.network : '';
                                // $scope.referral.network = $scope.networkArr;
                                $scope.referral.network.selected = $scope.networkArr[0];

                            } else { }
                        });

                        // Fetch specialty
                        preferranseService.getSpeciality({}, function (response) {
                            if (response.code == 200) {
                                $rootScope.specialityData = response.data;
                            } else { }
                        })
                        $rootScope.loading = false;
                    } else {
                        $rootScope.loading = false;
                        $state.go('contact');
                        logger.logError('Please update your profile before starting referral.');
                    }
                } else {
                    $rootScope.loading = false;
                    $state.go('dashboard');
                    logger.logError('Something went wrong. Please try again letter.');

                }
            });
        }

        /**
        * Get doctor list based on selected network, specialty and service
        * Created By Suman Chakraborty
        * Last Modified on 19-01-2017
        */
        $scope.getDocs = function () {



            // $scope.contactDetail = {
            //     'state': $rootScope.user.state
            // }
            //  console.log(" inside getDocs ", $scope.contactDetail);
           // console.log(" network after submit ",$scope.referral.network);
            $scope.pageTitle = 'Select Providers';
            $rootScope.referral.specialities = (typeof $scope.referral.specialities === 'string') ? [$scope.referral.specialities] : $scope.referral.specialities;
            // add service name
            //$rootScope.referral.serviceName = $filter('capitalize')($scope.referral.serviceName);
            //console.log(" selected before  ", $scope.referral.network.selected);
            // If network is given and it is not self pay (self pay insturanve id is 1 and 2 is not listed insurance) then only insurance will come in condition 
            if ($scope.referral.network.selected._id) {
                $rootScope.referral.network = $scope.referral.network.selected._id;
            } else {
                $rootScope.referral.network = $scope.referral.network.selected;
            }

            //console.log(" selected after  ", $rootScope.referral.network);

            $rootScope.referral.other = $scope.referral.other;
            //$rootScope.contactDetail.state = $scope.contactDetail.state;

            // add new insurance
            if ($scope.referral.newInsurance && $scope.referral.newInsurance != '') {
                //console.log(" inside getdocs ");
                $rootScope.referral.newInsurance = $scope.referral.newInsurance
                insuranceService.addNetwork().save({ name: $scope.referral.newInsurance, verified: false }, function (res) {
                    logProvider.addUserActivity().save({ userId: $rootScope.user._id, type: 5, detail: 'Add new insurance network', success: true }, function (res) { });
                })
            }
            $location.path('doctors');
        }

        /**
         * Get doctors list for referral section
         * Last modified on 03-07-2017
         */
        $scope.getDoctors = function () {
            // $scope.contactDetail = {
            //     'state': $scope.contactDetail
            // }
            // console.log(" inside getDoctors ", $rootScope.searchedState);
            $rootScope.loading = true;
            $scope.pageTitle = 'Select Provider';
            // console.log(" range ", $scope.accRange);
            var titleService = '';
            if (!$scope.accRange)
                $scope.accRange = $rootScope.user.range;

            //console.log(" $rootScope.user.range ", $rootScope.user.range);
            // check if network is selected
            if ($rootScope.hasOwnProperty('referral') && ($rootScope.referral.hasOwnProperty('network') || $rootScope.referral.hasOwnProperty('newInsurance'))) {
                //console.log(" inside getDoctors ", $rootScope.user.state);
                // console.log(" inside getDoctors ", $rootScope.searchedState);

                //console.log( " $rootScope.referral. ", $rootScope.referral);


                // check if speciality is selected 
                // get service name for title
                /*if($rootScope.referral.serviceName) {
                    titleService = $filter('capitalize')($rootScope.referral.serviceName);
                }*/
                var subtile = titleService;
                $rootScope.serviceNames = titleService;
                //$rootScope.SelectedServiceName  = subtile;
                var frontDeskReq = false;
                if (sessionStorage.getItem('userType') === 'officeAdmin') {
                    frontDeskReq = true;
                }
                var reqParams = { 'speciality': $rootScope.referral.specialities, 'network': ($rootScope.referral.hasOwnProperty('network')) ? $rootScope.referral.network : '', 'userId': $rootScope.user._id, 'frontDeskReq': frontDeskReq };
                if ($rootScope.referral.hospital) {
                    reqParams.hospital = $rootScope.referral.hospital;
                }
                //console.log( " reqParams. ", reqParams);

                /*if ($rootScope.referral.serviceName) {
                    reqParams.serviceName = $rootScope.referral.serviceName;
                }*/

                if ($rootScope.user.user_loc) {
                    reqParams.userLoc = $rootScope.user.user_loc;
                    reqParams.range = $scope.accRange;
                }

                if ($rootScope.user.state) {
                    if ($rootScope.user.state == 'ALL') {
                        reqParams.state = '';
                    } else {
                        reqParams.state = $rootScope.user.state;
                    }

                }

                // if ($rootScope.contactDetail.state) {
                //     if ($rootScope.user.state == '') {
                //         reqParams.state = '';
                //     } else {
                //         reqParams.state = $rootScope.user.state;
                //     }

                // }                

                // if ($scope.contactDetail.state) {
                //     if ($scope.contactDetail.state == '') {
                //         reqParams.state = '';
                //     } else {
                //         reqParams.state = $scope.contactDetail.state;
                //     }

                //  }

                if (reqParams.speciality && typeof reqParams.speciality === 'object') {
                    //console.log(" reqParams ", reqParams);

                    // $scope.contactDetail = {
                    //     'state': reqParams.state
                    // }

                    ReferService.GetDoctors().save(reqParams, function (response) {
                        //console.log(" userInfo ",response.data);
                        if (response.code == 200) {
                            var availableDocsArr = [];
                            var waitListArr = [];
                            var notAcceptingArr = [];
                            if (response.data.length > 0) {
                                response.data.forEach(function (item) {

                                    item.name = item.firstname + ' ' + item.lastname;
                                    if (item.degree && item.degree != '0') {
                                        item.name += ', ' + $rootScope.degree[item.degree];
                                    }
                                    //console.log(" isregis ",item.isRegistered);
                                    if (item.isRegistered) {
                                        item.isRegistered = "Yes";
                                    } else {
                                        item.isRegistered = "No";
                                    }

                                    var addr = item.location;
                                    addr += (item.sute !== null && item.sute !== '') ? ', ' + $filter('capitalize')(item.sute) : '';
                                    addr += (item.city !== null && item.city !== '') ? ', ' + $filter('capitalize')(item.city) : '';
                                    addr += (item.state !== null && item.state !== '') ? ', ' + item.state : '';
                                    addr += (item.zipcode !== null && item.zipcode !== '') ? ', ' + item.zipcode : '';
                                    item.addr = addr;
                                    switch (item.doctorStatus) {
                                        case 'available':
                                            availableDocsArr.push(item);
                                            break;
                                        case 'waiting':
                                            waitListArr.push(item);
                                            break;
                                        case 'notavailable':
                                            notAcceptingArr.push(item);
                                            break;
                                        default:
                                    }
                                })
                            }
                            // Sort final data by user preference
                            // fetch list of preferred doctors based on the preference
                            PreferenceServices.getPreferenceBySpecialty().save({ userId: $rootScope.user._id, speciality: $rootScope.referral.specialities }, function (res) {
                                var prefArr = [];
                                if (res.code === 200) {
                                    res.data.forEach(function (item) {
                                        if (item.preference.length > 0) {
                                            // ref #1
                                            item.preference.forEach(function (item) {
                                                if (prefArr.indexOf(item) === -1) {
                                                    prefArr.push(item);
                                                }
                                            })
                                        }
                                    })
                                    // final array of preferences of the logged in doctor
                                    prefArr.reverse(); // Reverse the actual order array to get data in proper order after merge sort
                                    // re-arrange doctors list by the preference if the doctors length more than 0
                                    if (availableDocsArr.length > 1) {
                                        availableDocsArr.sort(function (a, b) {
                                            return prefArr.indexOf(b._id) - prefArr.indexOf(a._id);
                                        });
                                    }
                                    if (waitListArr.length > 1) {
                                        waitListArr.sort(function (a, b) {
                                            return prefArr.indexOf(b._id) - prefArr.indexOf(a._id);
                                        });
                                    }
                                    $rootScope.docsArr = { 'availableList': availableDocsArr, 'waitingList': waitListArr };
                                    $rootScope.loading = false;
                                    
                                        
                            
                                }
                            });
                        } else {
                            $rootScope.loading = false;
                            logger.logError(response.message);
                        }
                    })
                } else {
                    $rootScope.loading = false;
                    logger.logError('Please select a doctor.');
                }
            } else {
                $rootScope.loading = false;
                logger.logError('Please select a network first.');
                $scope.nextpage = 'confSpec';
                if ($rootScope.takeReferral) {
                    $rootScope.loading = false
                    $location.path('/lookup');
                } else {
                    $rootScope.loading = false;
                    $location.path('/makeReferral');
                }

                // $rootScope.loading = false;
                // $location.path('/referPatient');
            }
        }
                       

        /**
         * Get doctors list for referral section
         * Last modified on 03-07-2017
         */
        
      
       
        $scope.getDoctorsReg = function (valueOfReferralChoice,paginateCounterReg) {
           // $scope.makeTodos(); 
            // debugger;
            // myModule.numPages();
            
            if(paginateCounterReg){
                $scope.itemsPerPage = paginateCounterReg
            }

            // console.log("paginateCounterNonReg =====" ,paginateCounterNonReg)
            // if(paginateCounterNonReg){
            //     $scope.itemsPerPageNonReg = paginateCounterNonReg
            // }

            $scope.referralChoiceVal = valueOfReferralChoice
            console.log("valueOfReferralChoice",valueOfReferralChoice,"model value",$scope.referralChoiceVal);
            $rootScope.loading = true;
            $scope.pageTitle = 'Select Provider';

            var titleService = '';
            if (!$scope.accRange){
                $scope.accRange = $rootScope.user.range;
            }
               

            if ((!$scope.accRange) || $scope.accRange == 0) {
                $scope.accRange = 15;
            }

            // check if network is selected
            if ($rootScope.hasOwnProperty('referral') && ($rootScope.referral.hasOwnProperty('network') || $rootScope.referral.hasOwnProperty('newInsurance'))) {

                var subtile = titleService;
                $rootScope.serviceNames = titleService;
                //$rootScope.SelectedServiceName  = subtile;
                var frontDeskReq = false;
                if (sessionStorage.getItem('userType') === 'officeAdmin') {
                    frontDeskReq = true;
                }
                var reqParams = { 'speciality': $rootScope.referral.specialities, 'network': ($rootScope.referral.hasOwnProperty('network')) ? $rootScope.referral.network : '', 'userId': $rootScope.user._id, 'frontDeskReq': frontDeskReq };
                
                if ($rootScope.referral.hospital) {
                    reqParams.hospital = $rootScope.referral.hospital;
                }

                if ($rootScope.user.user_loc) {
                    reqParams.userLoc = $rootScope.user.user_loc;
                    reqParams.range = $scope.accRange;
                }

                if ($rootScope.user.state) {
                    if ($rootScope.user.state == 'ALL') {
                        reqParams.state = '';
                    } else {
                        reqParams.state = $rootScope.user.state;
                    }

                }
                // Saurabh June 25 ,2019
                // if ($rootScope.user.zipcode) {
                //     reqParams.zipcode = $rootScope.user.zipcode;
                // }
                
                // console.log("\n\n ",$rootScope.profileZip != $rootScope.user.zipcode,$rootScope.profileZip,$rootScope.user.zipcode)
                if ($rootScope.profileZip != $rootScope.user.zipcode) {
                    reqParams.zipcode = $rootScope.user.zipcode;
                }
                // else{
                //     reqParams.zipcode = $rootScope.profileZip
                // }
                reqParams.count = 10;
                reqParams.page = 1;
                if (reqParams.speciality && typeof reqParams.speciality === 'object') {
                    //console.log(" reqParams ", reqParams);
                    reqParams.searchRegisteredRef = 1;
                    ReferService.GetDoctorsReg().save(reqParams, function (response) {

                        // debugger;
                        if (response.code == 200) {
                            var availableDocsArr = [];
                            var waitListArr = [];
                            var notAcceptingArr = [];
                            if (response.data.length > 0) {
                                response.data.forEach(function (item) {

                                    item.name = item.firstname + ' ' + item.lastname;
                                    if (item.degree && item.degree != '0') {
                                        item.name += ', ' + $rootScope.degree[item.degree];
                                    }
                                    //console.log(" isregis ",item.isRegistered);
                                    if (item.isRegistered) {
                                        item.isRegistered = "Yes";
                                    } else {
                                        item.isRegistered = "No";
                                    }

                                    var addr = item.location;
                                    addr += (item.sute !== null && item.sute !== '') ? ', ' + $filter('capitalize')(item.sute) : '';
                                    addr += (item.city !== null && item.city !== '') ? ', ' + $filter('capitalize')(item.city) : '';
                                    addr += (item.state !== null && item.state !== '') ? ', ' + item.state : '';
                                    addr += (item.zipcode !== null && item.zipcode !== '') ? ', ' + item.zipcode : '';
                                    item.addr = addr;
                                    switch (item.doctorStatus) {
                                        case 'available':
                                            availableDocsArr.push(item);
                                            break;
                                        case 'waiting':
                                            //waitListArr.push(item);
                                            availableDocsArr.push(item);
                                            break;
                                        case 'notavailable':
                                            //notAcceptingArr.push(item);
                                            availableDocsArr.push(item);
                                            break;
                                        default:
                                    }
                                }) 
                            }
                            // Sort final data by user preference
                            // fetch list of preferred doctors based on the preference
                            PreferenceServices.getPreferenceBySpecialty().save({ userId: $rootScope.user._id, speciality: $rootScope.referral.specialities }, function (res) {
                                var prefArr = [];
                                //  console.log(" res prefer ",res);
                                if (res.code === 200) {
                                    res.data.forEach(function (item) {
                                        if (item.preference.length > 0) {
                                            // ref #1
                                            item.preference.forEach(function (item) {
                                                if (prefArr.indexOf(item) === -1) {
                                                    prefArr.push(item);
                                                }
                                            })
                                        }
                                    })
                                    // final array of preferences of the logged in doctor
                                    prefArr.reverse(); // Reverse the actual order array to get data in proper order after merge sort
                                    // re-arrange doctors list by the preference if the doctors length more than 0
                                    if (availableDocsArr.length > 1) {
                                        availableDocsArr.sort(function (a, b) {
                                            return prefArr.indexOf(b._id) - prefArr.indexOf(a._id);
                                        });
                                    }

                                    //  console.log(" availableDocsArr2 ", availableDocsArr);
                                    //  $rootScope.docsArr = { 'availableList': availableDocsArr, 'waitingList': waitListArr };
                                    
                                    $rootScope.docsArr = { 'availableList': availableDocsArr };
                                    //  console.log(" availableDocsArr2 ", availableDocsArr);


                                    // var localUser = JSON.parse($window.sessionStorage.getItem("test"));
/*                                     let result = [];
                                   result = availableDocsArr.forEach(function(item){
                                        PreferenceServices.getUserNetwork().get({
                                            id: item._id
                                        }, function (resp) {
                                            // debugger;
                                            if (resp.code == 200) {
                                                console.log("Unverified User Data", resp)
                                                $scope.unverifiedUser = resp.data;
                                                for (let i = 0; i < $scope.unverifiedUser.length; i++) {
                                                    for (let j = 0; j < $rootScope.docsArr.availableList.length; j++) {
                                                        for (let k = 0 ; k < $rootScope.docsArr.availableList[j].network.length;k++){
                                                        console.log("Unverified User Data", $scope.unverifiedUser[i].network, "Provider Data", $rootScope.docsArr.availableList[j].network[k])

                                                            if ($scope.unverifiedUser[i].network == $rootScope.docsArr.availableList[j].network[k] &&
                                                                $scope.unverifiedUser[i].status == "1" && $scope.unverifiedUser[i].userId == item._id
                                                            ) {
                                                                delete $rootScope.docsArr.availableList[j].network[k];
                                                            }
                                                            // else{
                                                            //     result.push($rootScope.docsArr.availableList)
                                                            // }
                                                        }
    
                                                       
                                                    }
                                                }
    
                                            }
    
                                        })
                                    }) */
                                    // console.log("Final Result",result);
                                    // setTimeout(function () {
                                    // $rootScope.docsArr = { 'availableList': availableDocsArr };

                                    //  }, 3000);




                                    // console.log(" docarr ", $rootScope.docsArr);
                                    // $rootScope.loading = false;
                                }
                            });
                        } else {
                            $rootScope.loading = false;
                            logger.logError(response.message);
                        }
                    })

                    var reqParamsNon = { 'speciality': $rootScope.referral.specialities, 'network': ($rootScope.referral.hasOwnProperty('network')) ? $rootScope.referral.network : '', 'userId': $rootScope.user._id, 'frontDeskReq': frontDeskReq };
                    if ($rootScope.user.zipcode) {
                        reqParamsNon.zipcode = $rootScope.user.zipcode;
                    }
                    //newly added by saurabh 13-June-2019
                    if ($rootScope.user.user_loc) {
                        reqParamsNon.userLoc = $rootScope.user.user_loc;
                        reqParamsNon.range = $scope.accRange;
                    }
                    //----------------
                    if ($rootScope.user.state) {
                        if ($rootScope.user.state == 'ALL') {
                            reqParamsNon.state = '';
                        } else {
                            reqParamsNon.state = $rootScope.user.state;
                        }

                    }
                    reqParamsNon.searchRegisteredRef = 0;
                    reqParamsNon.getOutsideDocs = true;
                    reqParamsNon.count = 10;
                    reqParamsNon.page = 1;
                    ReferService.GetDoctorsNonReg().save(reqParamsNon, function (response) {
                        console.log(" GetDoctorsNonReg ");
                        if (response.code == 200) {
                            var availableDocsArrNon = [];
                            var waitListArr = [];
                            var notAcceptingArr = [];
                            if (response.data.length > 0) {

                                // for unique _id start                                   
                                response.data = response.data.filter((data, index, self) =>
                                    index === self.findIndex((t) => (
                                        t._id === data._id
                                    ))
                                );
                                //console.log(" unique data",response.data);

                                // unique _id  end

                                response.data.forEach(function (item) {
                                    item.name = item.firstname + ' ' + item.lastname;
                                    if (item.degree && item.degree != '0') {
                                        item.name += ', ' + $rootScope.degree[item.degree];
                                    }
                                    //console.log(" isregis ",item.isRegistered);
                                    if (item.isRegistered) {
                                        item.isRegistered = "Yes";
                                    } else {
                                        item.isRegistered = "No";
                                    }

                                    var addr = item.location;
                                    addr += (item.sute !== null && item.sute !== '') ? ', ' + $filter('capitalize')(item.sute) : '';
                                    addr += (item.city !== null && item.city !== '') ? ', ' + $filter('capitalize')(item.city) : '';
                                    addr += (item.state !== null && item.state !== '') ? ', ' + item.state : '';
                                    addr += (item.zipcode !== null && item.zipcode !== '') ? ', ' + item.zipcode : '';
                                    item.addr = addr;
                                    switch (item.doctorStatus) {
                                        case 'available':
                                            availableDocsArrNon.push(item);
                                            break;
                                        case 'waiting':
                                            //waitListArr.push(item);
                                            availableDocsArrNon.push(item);
                                            break;
                                        case 'notavailable':
                                            //notAcceptingArr.push(item);
                                            availableDocsArrNon.push(item);
                                            break;
                                        default:
                                    }
                                })
                            }
                            //   console.log(" availableDocsArrNon ", availableDocsArrNon);
                            // Sort final data by user preference
                            // fetch list of preferred doctors based on the preference
                            PreferenceServices.getPreferenceBySpecialty().save({ userId: $rootScope.user._id, speciality: $rootScope.referral.specialities }, function (res) {
                                var prefArr = [];
                                if (res.code === 200) {
                                    res.data.forEach(function (item) {
                                        if (item.preference.length > 0) {
                                            // ref #1
                                            item.preference.forEach(function (item) {
                                                if (prefArr.indexOf(item) === -1) {
                                                    prefArr.push(item);
                                                }
                                            })
                                        }
                                    })
                                    // final array of preferences of the logged in doctor
                                    prefArr.reverse(); // Reverse the actual order array to get data in proper order after merge sort
                                    // re-arrange doctors list by the preference if the doctors length more than 0
                                    if (availableDocsArrNon.length > 1) {
                                        availableDocsArrNon.sort(function (a, b) {
                                            return prefArr.indexOf(b._id) - prefArr.indexOf(a._id);
                                        });
                                    }

                                    $rootScope.docsArrNon = { 'availableListNon': availableDocsArrNon };
                                    $rootScope.loading = false;
                                }
                            });
                        } else {
                            $rootScope.loading = false;
                            logger.logError(response.message);
                        }
                    })

                } else {
                    $rootScope.loading = false;
                    logger.logError('Please select a doctor.');
                }
            } else {
                $rootScope.loading = false;
                logger.logError('Please select a network first.');
                $scope.nextpage = 'confSpec';

                $rootScope.loading = false;
                $location.path('/referPatient');
            }
        }

        /**
         * Upload files from referral section
         * Last modified on 28-07-2017
         */
        $scope.uploadFile = function (files) {
            for (var i = 0; i < files.length; i++) {
                var formData = new FormData();
                formData.append('attachmentFile', files[i]);
                ReferService.uploadAttachments().save(formData, function (resp) {
                    if (resp.code === 200) {
                        $rootScope.prescription += resp.message + ',';
                    }
                });
            }
        };

        /** 
        * Search patients for referral
        * Created By Suman Chakraborty
        * last modified on 30-08-2017
        */
        $scope.searchPatients = function (searchBy, inp) {
            var query = { val: inp };
            if (searchBy === 'email') {
                query.param = 'email';
            } else {
                query.param = 'contact_no';
            }
            ReferService.searchPatients().save(query, function (resp) {
                if (resp.data.hasOwnProperty('_id')) {
                    $scope.patientInfo = [resp.data];
                } else {
                    $scope.patientInfo = [];
                }
            })
        }

        $scope.searchProvider = function () {
            $location.path('/searchProvider');
        }

        $scope.selectProvider = function () {
            $location.path('/makeReferral');
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
            //$scope.contactDetail.sute       = '';
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

        $scope.onStatusChange = function (eventVal) {
            // console.log("result of checkbox",eventVal);
            $scope.toggleCheckVal ;
            if(eventVal.target.checked==true){
                $scope.toggleCheckVal = eventVal.target.checked
            }
            else{
                $scope.toggleCheckVal = eventVal.target.checked
            }
        }
    }
]);
