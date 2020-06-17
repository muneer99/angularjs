"use strict";
angular.module('doctors')
nwdApp.controller("inviteController", [
    '$scope',
    '$timeout',
    '$filter',
    '$rootScope',
    '$sessionStorage',
    'dashboardService',
    '$routeParams',
    '$route',
    '$location',
    '$state',
    '$stateParams',
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
    function ($scope, $timeout, $filter, $rootScope, $sessionStorage, dashboardService, $routeParams, $route, $location, $state, $stateParams, $http, logger, logProvider, $anchorScroll, ReferService, preferranseService, PreferenceServices, insuranceService, doctorService, CommonService) {
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
        $scope.usStates = stateList;
        //$scope.degreeList               = degree;
        $scope.showHospital = false;
        $scope.hospitalArr = [];
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : $rootScope.user._id;
        $scope.patientSelected = '';
        $scope.search = {};
        $scope.accRange = 0;
        CommonService.getDegreeList();
        /**
         * Reset contactDetail form
         */
        $scope.resetForm = function () {
            $scope.contactDetail = {}
        }

        $scope.getDoctorList = function (getAllDoc, getOutsideDocs) {

            $rootScope.loading = true;
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
            });
        }

        $scope.getNonDocById = function () {
            $rootScope.loading = true;

            /*if ($scope.selfRefer) {
                $rootScope.selfRefer = $scope.selfRefer;
            } else {
                $rootScope.selfRefer = 0;
            }*/

            doctorService.getNonDocById().get({ id: $state.params.id }, function (response) {

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
            doctorService.addDoctor().save(doc, function (response) {
                if (response.code == 200) {
                    $rootScope.loading = false;
                    //Update non-reg doc list and proceed with referral
                    if (response.userdata && response.userdata._id) {
                        doctorService.updateNonRegDoc().save({ _id: doc.id, isImported: true }, function (response) { })
                        $scope.sendInvite(response.userdata);
                    } else {
                        $rootScope.loading = false;
                        logger.logError(response.message);
                    }
                }
                else if (response.code == 201) {
                    // If data exists then return to View Provider screen
                    $rootScope.loading = false;
                    logger.logError(response.message);
                    $location.path('/view-invite-provider/' + doc.id);

                }
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
        $scope.sendInvite = function (doctr) {

            $rootScope.loading = true;

            var mailObj = {
                fromSvpFname    : ($rootScope.user.firstname) ? $rootScope.user.firstname : '',
                fromSvpLname    : ($rootScope.user.lastname) ? $rootScope.user.lastname : '',
                fromSvpDegree   : ($rootScope.user.degree) ? $rootScope.user.degree : '',
                fromSvpCenter   : ($rootScope.user.centername) ? $rootScope.user.centername : '',

                toSvpFname      : (doctr.firstname) ? doctr.firstname : '',
                toSvpLname      : (doctr.lastname) ? doctr.lastname : '',
                toSvpDegree     : (doctr.degree) ? doctr.degree : '',
                toSvpCenter     : (doctr.centername) ? doctr.centername : '',
                toSvpMail       : (doctr.email) ? doctr.email : '',
                isRegistered    : (doctr.isRegistered) ? doctr.isRegistered : false,
                hasTemplate     : true,
                inviteMail      : true                
            };
            ReferService.sendMail().save(mailObj, function (res) {
                logger.logSuccess('Invitation sent successfully.');
                $state.go('inviteStaff', {}, {reload: true});
             })

            
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
    }
]);
