"use strict";


angular.module("login")
angular.module("welcome")

nwdApp.controller('userLoginController', ['$scope', '$rootScope', '$location', 'AuthenticationService', '$window', 'logger', 'logProvider', '$state', '$timeout',
    function ($scope, $rootScope, $location, AuthenticationService, $window, logger, logProvider, $state, $timeout) {
        var inputJSON = "";
        $scope.user = {};
        $scope.forgotPass = {};
        $scope.isChecks = false;
        $scope.isPasswordSent = false;
        $scope.disabled = false;
        $scope.loader = false;
        $scope.isContinues = 'welcome';
        $scope.resetPass = false;
        $scope.userdata = $rootScope.user;
        $scope.frontDeskAcc = sessionStorage.getItem('frontDeskAdmin') ? sessionStorage.getItem('frontDeskAdmin') : ($rootScope.user) ? $rootScope.user._id : '';
        $scope.currentYear = new Date().getFullYear();
        $scope.resetPassword = function () {
            $location.path('/forgetPassword');
        }

        /**
        * Allow front desk admin to login on behalf of doctors
        * Created By Suman Chakraborty
        * Last Modified on 14-11-2017
        */
        $scope.loginAs = function () {

            //console.log(" $state.params loginAs ", $state.params);

            var data;
            if ($window.sessionStorage.test) {
                data = JSON.parse($window.sessionStorage.test);
            }
            // match request and session id




            if (data && data._id === $state.params.req) {
                AuthenticationService.validateFrontDeskAccess().save({ docId: $state.params.id, reqUser: $state.params.req }, function (response) {
                    if (response.code == 200 && response.data.userType == 'user') {
                        
                        $window.sessionStorage;
                        $rootScope.userLoggedIn = true;
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.changePass = response.data.changePass;
                        $window.sessionStorage.token1 = response.data.token;
                        $window.sessionStorage.userType = 'user';
                        $window.sessionStorage.frontDeskAccess = true;
                        $window.sessionStorage.frontDeskAdmin = $state.params.req;
                        $scope.imageUrl = response.data.image;
                        $window.sessionStorage.test = JSON.stringify(response.data);
                        $window.sessionStorage.userStatus = response.data.doctorStatus;
                        $rootScope.user = JSON.parse($window.sessionStorage.test);
                        $rootScope.loginAsReq = true;
                        logger.logSuccess(response.message);
                        if (response.data.firstLogin) {
                            $location.path('/welcome');
                        } else {
                            // $location.path('/dashboard');
                            $location.path('/referPatient');

                        }
                    } else if (response.code == 200 && response.data.userType == 'officeAdmin') {
                        $window.sessionStorage;
                        $rootScope.userLoggedIn = true;
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.userType = 'officeAdmin';
                        $scope.imageUrl = response.data.image;
                        $window.sessionStorage.token1 = response.data.token;
                        $window.sessionStorage.changePass = response.data.changePass;
                        $window.sessionStorage.test = JSON.stringify(response.data);
                        $window.sessionStorage.userStatus = response.data.doctorStatus;
                        $rootScope.user = JSON.parse($window.sessionStorage.test);
                        var a = response.data.service.length;
                        var b = response.data.speciality.length;
                        $rootScope.loginAsReq = true;
                        logger.logSuccess(response.message);
                        // if(formData.rememberme){
                        //     $window.localStorage.setItem('token1',response.data.token);
                        // }
                        if (response.data.firstLogin) {
                            $location.path('/welcome');
                        } else {
                            // console.log(" here 2 ");
                            $location.path('/doctor/list');
                        }
                    } else {
                        logger.logError(response.message);
                    }
                    // else {
                    //    logger.logError('Unable to access user data.'); 
                    // }
                })
            } else {
                logger.logError('Unauthorized request. Please close this tab and try again.');
            }
        }


        /**
       * Login functionality for Doctor, front desk admin, network admin
       * Created By Suman Chakraborty
       * Last Modified on 29-11-2017
       * #Task542 partB
       */
        $scope.loginAsUser = function () {
            //console.log(" $state.params loginAsUser ", $state.params);


            AuthenticationService.validateTokenAccess().save({ docId: $state.params.id, reqUser: $state.params.req }, function (response) {
                
                //console.log(" response ", response)

                // email: "sdsd@yopmail.com"
                // password: "Password@as01"
                // userType: "Doctor"

                $scope.user = { email: response.data.email, password: response.data.password, userType: "Doctor" }

                //console.log(" $scope.user ", $scope.user)


                var formData = $scope.user;
                var actvLog = { type: 2, detail: 'User login' };
                AuthenticationService.Login(formData, function (response) {
                    var errorMessage = '';
                    console.log("\n response",response);
                    if (response.code == 200) {
                        actvLog.userId = response.data._id;
                        actvLog.success = true;
                        $scope.timer.start();
                        if (response.data.userType == 'admin') {
                            $window.sessionStorage;
                            $window.sessionStorage.test = JSON.stringify(response.data);
                            $window.sessionStorage.userLoggedIn = true;
                            $window.sessionStorage.token1 = response.data.token;
                            $window.sessionStorage.loggedInUser = response.data.email;
                            $window.sessionStorage.userType = 'admin';
                            $window.sessionStorage.emailAvailable = response.data.emailAvailable;
                            $window.sessionStorage.firstLogin = response.data.firstLogin;
                            if (response.data.firstLogin) {
                                //console.log(" firstlogin11 -> ",response.data.firstLogin);
                                $window.sessionStorage.firstLoginTemp = 1;
                            } else {
                                $window.sessionStorage.firstLoginTemp = 0;
                            }
                            $rootScope.loginAsReq = false;
                            // $window.location = "http://localhost:8003/admin";
                            $window.location = mainUrl + '/admin/#/dashboard';
                        } else if (response.code == 200 && response.data.userType == 'user') {
                            $window.sessionStorage;
                            $rootScope.userLoggedIn = true;
                            $window.sessionStorage.userLoggedIn = true;
                            $window.sessionStorage.token1 = response.data.token;
                            $window.sessionStorage.changePass = response.data.changePass;
                            $window.sessionStorage.userType = 'user';
                            $window.sessionStorage.emailAvailable = response.data.emailAvailable;
                            $window.sessionStorage.firstLogin = response.data.firstLogin;
                            if (response.data.firstLogin) {
                                //console.log(" firstlogin22 -> ",response.data.firstLogin);
                                $window.sessionStorage.firstLoginTemp = 1;
                            } else {
                                //console.log(" firstlogin222 -> ",response.data.firstLogin);
                                $window.sessionStorage.firstLoginTemp = 0;
                            }
                            $scope.imageUrl = response.data.image;
                            $window.sessionStorage.test = JSON.stringify(response.data);
                            $window.sessionStorage.userStatus = response.data.doctorStatus;
                            $rootScope.user = JSON.parse($window.sessionStorage.test);
                            $rootScope.loginAsReq = false;
                            if (formData.rememberme) {
                                $window.localStorage.setItem('token1', response.data.token);
                            }
                            var a = response.data.service.length;
                            var b = response.data.speciality.length;
                            logger.logSuccess(response.message);

                            if (response.data.firstLogin) {
                                $location.path('/welcome');
                            } else if (!response.data.hasfrntdesk) {
                                $location.path('/front-desk');
                            } else {

                                // $location.path('/dashboard');
                                $location.path('/referPatient');

                            }
                        } else if (response.data.userType == 'officeAdmin') {
                            $window.sessionStorage;
                            $rootScope.userLoggedIn = true;
                            $window.sessionStorage.userLoggedIn = true;
                            $window.sessionStorage.userType = 'officeAdmin';
                            $scope.imageUrl = response.data.image;
                            $window.sessionStorage.emailAvailable = response.data.emailAvailable;
                            $window.sessionStorage.firstLogin = response.data.firstLogin;
                            if (response.data.firstLogin) {
                                //console.log(" firstlogin33 -> ",response.data.firstLogin);
                                $window.sessionStorage.firstLoginTemp = 1;
                            } else {
                                $window.sessionStorage.firstLoginTemp = 0;
                            }
                            $window.sessionStorage.token1 = response.data.token;
                            $window.sessionStorage.changePass = response.data.changePass;
                            $window.sessionStorage.test = JSON.stringify(response.data);
                            $window.sessionStorage.userStatus = response.data.doctorStatus;
                            $rootScope.user = JSON.parse($window.sessionStorage.test);
                            var a = response.data.service.length;
                            var b = response.data.speciality.length;
                            $rootScope.loginAsReq = false;
                            $scope.timer.cancel();
                            logger.logSuccess(response.message);
                            if (formData.rememberme) {
                                $window.localStorage.setItem('token1', response.data.token);
                            }
                            if (response.data.firstLogin) {
                                $location.path('/welcome');
                                //task #550 start
                            } else if (response.data.firstLogin == false && response.data.firstname == '') {
                                $location.path('/contact-details');
                                //task #550 end
                            } else {
                                $location.path('/doctor/list');
                            }
                        } else {
                            logger.logError(response.message);
                        }
                    } else {
                        logger.logError(response.message);
                    }
                    // Log login record 
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                });

            })
        }

        $scope.forgotPassword = function (req) {
        }
        $scope.reg = function () {
            $location.path('/register');
        }
        /**
        * Login functionality for Doctor, front desk admin, network admin
        * Created By Suman Chakraborty
        * Last Modified on 29-11-2017
        */
        /*$scope.loginUser = function () {
            
            var formData    = $scope.user;
            var actvLog     = {type: 2, detail: 'User login'};
            AuthenticationService.Login(formData, function (response) {
                var errorMessage = '';
                if(response.code == 200){
                    actvLog.userId  = response.data._id;
                    actvLog.success = true; 
                    if (response.data.userType == 'admin') {
                        $window.sessionStorage;
                        $window.sessionStorage.test         = JSON.stringify(response.data);
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.token1       = response.data.token;
                        $window.sessionStorage.loggedInUser = response.data.email;
                        $window.sessionStorage.userType     = 'admin';
                        // $window.location = "http://localhost:8003/admin";
                        $window.location = mainUrl + '/admin/#/dashboard';
                    } else if (response.code == 200 && response.data.userType == 'user') {
                        $window.sessionStorage;
                        $rootScope.userLoggedIn             = true;
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.token1       = response.data.token;
                        $window.sessionStorage.changePass   = response.data.changePass;
                        $window.sessionStorage.userType     = 'user';
                        $scope.imageUrl                     = response.data.image;
                        $window.sessionStorage.test         = JSON.stringify(response.data);
                        $window.sessionStorage.userStatus   = response.data.doctorStatus;
                        $rootScope.user                     = JSON.parse($window.sessionStorage.test);
                        if (formData.rememberme) {
                            $window.localStorage.setItem('token1', response.data.token);
                        }
                        var a = response.data.service.length;
                        var b = response.data.speciality.length;
                        logger.logSuccess(response.message);
                        
                        if (response.data.firstLogin) {
                            $location.path('/welcome');
                        } else if(!response.data.hasfrntdesk){
                            $location.path('/front-desk');
                        } else {
                            $location.path('/dashboard');
                        }
                    } else if (response.data.userType == 'officeAdmin') {
                        $window.sessionStorage;
                        $rootScope.userLoggedIn             = true;
                        $window.sessionStorage.userLoggedIn = true;
                        $window.sessionStorage.userType     = 'officeAdmin';
                        $scope.imageUrl                     = response.data.image;
                        $window.sessionStorage.token1       = response.data.token;
                        $window.sessionStorage.changePass   = response.data.changePass;
                        $window.sessionStorage.test         = JSON.stringify(response.data);
                        $window.sessionStorage.userStatus   = response.data.doctorStatus;
                        $rootScope.user                     = JSON.parse($window.sessionStorage.test);
                        var a = response.data.service.length;
                        var b = response.data.speciality.length;
                        logger.logSuccess(response.message);
                        if(formData.rememberme){
                            $window.localStorage.setItem('token1',response.data.token);
                        }
                        if (response.data.firstLogin) {
                            $location.path('/welcome');
                        }else {
                            //console.log(" here 3 ");
                            $location.path('/doctor/list');
                        }
                    }else {
                        logger.logError(response.message);
                    }
                    
                }else{
                    logger.logError(response.message);
                }
                // Log login record 
                logProvider.addUserActivity().save(actvLog, function(res){});
            });
        }*/

        $scope.register = function (user) {
            $scope.user = user;
            var actvLog = { type: 1, detail: 'New registration' };
            AuthenticationService.Register($scope.user, function (response) {
          
                var errorMessage = '';
                if (response.code == 200) {
                    actvLog.success = true;
                    actvLog.userId = response.data._id;
                    logger.logSuccess(response.message);
                    $location.path('/');
                    // task #552 start
                } else if (response.code == 402) {
                    //"That email is on file. To send a password to that email, click here and have that click send that email."
                    logger.logError(response.message);
                    $location.path('/existMember/' + response.data._id);
                    // $location.path('/');
                    // task#552 end   

                } else {
                    logger.logError(response.message);
                }
                logProvider.addUserActivity().save(actvLog, function (res) { });
            });
        }

        $scope.continue = function (name) {
            /*if($rootScope.user.firstLogin){
                $location.path('/change-password');
            }
            else*/

            if (name === 'fdesk' && $rootScope.user.userType == 'user') {

                $location.path('/front-desk');
            }
            else if (name === 'remindlater' && $rootScope.user.userType == 'user') {
                AuthenticationService.UpdateContactDetails().save({ userId: $rootScope.user._id }, function (resp) {
                    if (resp.code === 200) {
                        if ($rootScope.user.firstLogin) {

                            $location.path('/change-password');
                        }
                        else {
                            // $location.path('/dashboard');
                            $location.path('/referPatient');
                        }
                    } else {
                        logger.logError(resp.message);
                    }
                });
            } else if (name == 'profile' || $rootScope.user.userType != 'user') {
                if ($scope.fdemail) {
                    var officeAdminIdArr = [];
                    var officeAdminArr = $scope.fdemail.split(',');
                    var referringDoc = ($rootScope.user.lastname) ? $rootScope.user.lastname : '';
                    // insert each mail id
                    officeAdminArr.forEach(item => {
                        item = item.trim();
                        if ((/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@([a-zA-Z0-9]{1})[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/.test(item))) {
                            var officeAdmin = {
                                fromSvpFname: ($rootScope.user.firstname) ? $rootScope.user.firstname : '',
                                fromSvpLname: ($rootScope.user.lastname) ? $rootScope.user.lastname : '',
                                fromSvpDegree: ($rootScope.user.degree) ? $rootScope.user.degree : '',
                                email: item,
                                userType: 'officeAdmin'
                            };
                            AuthenticationService.addOfficeAdmin().save(officeAdmin, function (res) {
                                if (res.data && res.data.userId) {
                                    // console.log(res.data.userId)
                                    officeAdminIdArr.push(res.data.userId);
                                }
                            });
                        }
                    })
                    $timeout(function () {

                        AuthenticationService.UpdateContactDetails().save({ userId: $rootScope.user._id, frontdesk: officeAdminIdArr }, function (resp) {
                            if (resp.code === 200) {
                                if ($rootScope.user.firstLogin)
                                    $location.path('/change-password');
                                else
                                    // $location.path('/dashboard');
                                    $location.path('/referPatient');

                            } else {
                                logger.logError(resp.message);
                            }
                        });
                    }, 5000);

                } else {
                    if ($rootScope.user.firstLogin)
                        $location.path('/change-password');
                    else
                        $location.path('/contact-details');
                }
            } else { }
            $scope.isContinues = name;
        }

        $scope.updateUserFdsk = function (adminArr) {
            AuthenticationService.UpdateContactDetails().save({ userId: $rootScope.user._id, frontdesk: adminArr }, function (resp) {
                if (resp.code === 200) {
                    $location.path('/contact-details');
                } else {
                    logger.logError(resp.message);
                }
            });
        }

        /**
        * Logout user
        */
        $scope.logout = function () {
            var userid = $scope.frontDeskAcc;
            var actvLog = { userId: userid, type: 3, detail: 'Logged out from application', success: true };
            logProvider.addUserActivity().save(actvLog, function (res) { });
            $rootScope.userLoggedIn = false;
            delete sessionStorage.test;

            sessionStorage.removeItem('test');
            sessionStorage.removeItem('userStatus');

            sessionStorage.setItem('userLoggedIn', false);
            $window.sessionStorage.clear();
            $window.localStorage.clear();
            logger.logSuccess('You have been logged out successfully');
            $location.path('/login');
        }

        //forgot password
        $scope.forgotPassword = function (req) {
            //console.log(" inside fun ");
            var actvLog = { type: 8, detail: 'Request for forget password' };
            $scope.loader = true;
            if (req.email !== undefined) {
                AuthenticationService.resendPassword().save(req, function (res) {
                    if (res.code == 200) {
                        actvLog.success = true;
                        actvLog.userId = res.data.id;
                        logger.logSuccess('A link to reset password has been sent to your registered email.');
                        $scope.resetPass = false;
                        $scope.loader = false;
                        $location.path('/');
                    } else {
                        //console.log(" inside else");
                        $scope.loader = false;
                        logger.logError(res.message);
                    }
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                })
            } else {
                $scope.loader = false;
                logProvider.addUserActivity().save(actvLog, function (res) { });
            }
            $scope.loader = false;
        }

        $scope.updatePassword = function (req) {
            var actvLog = { type: 9, detail: 'Change password' };
            if ($scope.updateUserPass.hasOwnProperty('confPass')) {
                var reqArr = { token: $state.params.id, pass: $scope.updateUserPass.confPass }
                AuthenticationService.updatePassword().save(reqArr, function (res) {
                    if (res.code == 200) {
                        actvLog.userId = res.data.id;
                        actvLog.success = true;
                        logger.logSuccess('Password reset successfully.');
                        $location.path('/');

                    } else {
                        logger.logError(res.message);
                    }
                    logProvider.addUserActivity().save(actvLog, function (res) { });
                })
            } else {
                logger.logError('Please enter password and confirm password.');
                logProvider.addUserActivity().save(actvLog, function (res) { });
            }
        }
    }
]);