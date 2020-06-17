'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('user'),
    referModel = mongoose.model('refers'),
    userToken = mongoose.model('userToken'),
    userPreferenceModel = mongoose.model('userPreference'),
    userPreferenceRatingModel = mongoose.model('userPreferenceRating'),
    serviceModel = mongoose.model('services'),
    SpecialityModel = mongoose.model('specialities'),
    patientsModel = mongoose.model('patients'),
    networkModel = mongoose.model('networks'),
    userNetwork = mongoose.model('userNetwork'),
    faxmodel = mongoose.model('faxTemplate'),
    logPhiAccessModel = mongoose.model('logPhiAccess'),
    logUserActivityModel = mongoose.model('logUserActivity'),
    invitationLogReferralModel = mongoose.model('invitationLogReferral'),
    referralsModel = mongoose.model('refers'),
    async = require('async'),
    fs = require('fs-extra'),
    Underscore = require('underscore'),
    path = require('path'),
    utility = require('../lib/utility.js'),
    constant = require('../lib/constants'),
    jwt = require('jsonwebtoken'),
    utills = require('../lib/util.js');
var generator = require('generate-password');
var co = require('co');
var d = new Date();
var currentYear = new Date().getFullYear()
module.exports = {
    migrateData: migrateData,
    addUser: addUser,
    registerUser: registerUser,
    getById: getById,
    getCounts: getCounts,
    changePass: changePass,
    changePassAdmin: changePassAdmin,
    updateUser: updateUser,
    deleteUser: deleteUser,
    getUserList: getUserList,
    providerList: providerList,
    addPhiAccess: addPhiAccess,
    updateStatus: updateStatus,
    updateNetworkProviderStatus: updateNetworkProviderStatus,
    addPreference: addPreference,
    getPreference: getPreference,
    updateNetwork: updateNetwork,
    resetPassword: resetPassword,
    updateUserPic: updateUserPic,
    updateService: updateService,
    updateProfile: updateProfile,
    getDoctorsList: getDoctorsList,
    getDoctorsListUnAssociatedInsurance: getDoctorsListUnAssociatedInsurance,
    getDoctorsListAssociatedInsurance: getDoctorsListAssociatedInsurance,
    getDoctorsExportList: getDoctorsExportList,
    getDoctorRatingList: getDoctorRatingList,
    getUserDetails: getUserDetails,
    getUserProfile: getUserProfile,
    changePassword: changePassword,
    addUserActivity: addUserActivity,
    addInvitationLog: addInvitationLog,
    updateUserEmail: updateUserEmail,
    getUserRegStatus: getUserRegStatus,
    updateSpeciality: updateSpeciality,
    getFrontDeskAdmin: getFrontDeskAdmin,
    getUnregisteredDoctorsList: getUnregisteredDoctorsList,
    UpdateContactDetails: UpdateContactDetails,
    insertOrUpdateUsernetworks: insertOrUpdateUsernetworks,
    validateFrontDeskAccess: validateFrontDeskAccess,
    validateTokenAccess: validateTokenAccess,
    getPreferenceBySpecialty: getPreferenceBySpecialty,
    updateProviderNetwork: updateProviderNetwork,
    updateProviderNetworkUnlisted: updateProviderNetworkUnlisted,
    existMember: existMember,

};

/**
* Validate front desk admin access to login as a doctor
* Created by Suman Chakraborty
* Last modified on 24-04-2018
*/
function validateFrontDeskAccess(req, res) {
    var userInfoData = {};
    var superAdmin = false;
    co(function* () {
        // Check if it is a super admin access 
        yield User.findOne({ _id: mongoose.Types.ObjectId(req.body.reqUser), userType: 'superAdmin' }, function (err, res) {
            if (!err && res) {
                superAdmin = true;
            }
        })
        User.findOne({ _id: mongoose.Types.ObjectId(req.body.docId), userType: { "$in": ['user', 'network', 'officeAdmin'] } },
            { password: 0, passwordResetToken: 0, updatedAt: 0, createdAt: 0, verifying_token: 0 },
            function (err, userInfo) {
                if (!err) {
                    // Check if the doctor has shared his profile with this frontdesk admin or it is super admin who want to login
                    if ((userInfo.frontdesk && userInfo.frontdesk.indexOf(req.body.reqUser) > -1) || superAdmin) {
                        var expirationDuration = 60 * 60 * 8 * 1; // expiration duration 8 Hours
                        //var expirationDuration = 60; // expiration duration 1 minute
                        var params = {
                            id: userInfo._id
                        }
                        var jwtToken = {};
                        jwtToken = jwt.sign(params, req.config.encryption.secret, {
                            expiresIn: expirationDuration
                        });
                        var userTokenArr = new userToken({
                            userId: userInfo._id,
                            token: jwtToken
                        });
                        userTokenArr.save(function (err) {
                            if (err) {
                                res.json({ code: 401, message: 'Request could not be processed. Please try again.', data: {} });
                            } else {

                                userInfoData._id = userInfo._id;
                                userInfoData.fax = userInfo.fax;
                                userInfoData.sute = userInfo.sute;
                                userInfoData.city = userInfo.city;
                                userInfoData.email = userInfo.email;
                                userInfoData.state = userInfo.state;
                                userInfoData.profile_image = userInfo.image;
                                userInfoData.image = userInfo.image;
                                userInfoData.zipcode = userInfo.zipcode;
                                userInfoData.lastname = userInfo.lastname;
                                userInfoData.centername = userInfo.centername;
                                userInfoData.location = userInfo.location;
                                userInfoData.user_loc = userInfo.user_loc;
                                userInfoData.userType = userInfo.userType;
                                userInfoData.firstname = userInfo.firstname;
                                userInfoData.firstLogin = userInfo.firstLogin;
                                userInfoData.cell_phone = userInfo.cell_phone;
                                userInfoData.doctorStatus = userInfo.doctorStatus;
                                userInfoData.phone_number = userInfo.phone_number;
                                userInfoData.emailAvailable = userInfo.emailAvailable;
                                userInfoData.token = 'admin_bearer ' + jwtToken;
                                userInfoData.service = userInfo.service ? userInfo.service : '';
                                userInfoData.degree = userInfo.degree ? userInfo.degree : '';
                                userInfoData.network = userInfo.network ? userInfo.network : '';
                                userInfoData.speciality = userInfo.speciality ? userInfo.speciality : '';
                                return res.json({ code: 200, message: 'You have been loggedin successfully!', data: userInfoData });
                            }
                        });
                    } else {
                        res.json({
                            code: 402,
                            message: 'Access denined.'
                        });
                    }
                } else {
                    res.json({
                        code: 201,
                        message: 'Request could not be processed. Please try again.'
                    });
                }
            })

    }).then(function (value) {
        //console.log(value);
    }, function (err) {
        console.error(err.stack);
    });

}

/**
* Validate front desk admin access to login as a doctor
* Created by Suman Chakraborty
* Last modified on 24-04-2018
*/

function validateTokenAccess(req, res) {


    var userInfoData = {};
    var network = false;
    co(function* () {
        // Check if it is a super admin access 
        yield networkModel.findOne({ _id: mongoose.Types.ObjectId(req.body.reqUser), verified: true }, function (err, res) {
            if (!err && res) {
                network = true;
            }
        })
        User.findOne({ _id: mongoose.Types.ObjectId(req.body.docId), userType: { "$in": ['user', 'network', 'officeAdmin'] } },
            { password: 0, passwordResetToken: 0, updatedAt: 0, createdAt: 0, verifying_token: 0 },
            function (err, userInfo) {
                if (!err) {
                    // Check if the doctor has shared his profile with this frontdesk admin or it is super admin who want to login
                    if (network) {
                        var expirationDuration = 60 * 60 * 8 * 1; // expiration duration 8 Hours
                        var params = {
                            id: userInfo._id
                        }
                        var jwtToken = {};
                        jwtToken = jwt.sign(params, req.config.encryption.secret, {
                            expiresIn: expirationDuration
                        });
                        var userTokenArr = new userToken({
                            userId: userInfo._id,
                            token: jwtToken
                        });
                        userTokenArr.save(function (err) {
                            if (err) {
                                res.json({ code: 401, message: 'Request could not be processed. Please try again.', data: {} });
                            } else {

                                var gpassword = generator.generate({
                                    length: 10,
                                    numbers: true,
                                    excludeSimilarCharacters: true
                                });
                                var passExpOn = new Date();
                                passExpOn.setDate(passExpOn.getDate() + 90);
                                var Encpassword = utility.getEncryptText(gpassword);
                                var updateUserRecord = {
                                    password: Encpassword,
                                    passExpDate: passExpOn
                                }

                                User.update({ _id: mongoose.Types.ObjectId(userInfo._id) }, { $set: updateUserRecord }, function (err) {

                                    if (err) {
                                        res.json({
                                            code: 201,
                                            message: 'Request could not be processed. Please try again.'
                                        });
                                    } else {
                                        co(function* () {
                                            var templateKey = 'send_password_exist_member';
                                            let usrDegree = (userInfo.degree) ? yield utility.getTitleById(userInfo.degree) : '';
                                            let frmSvpDeg = (userInfo.degree) ? yield utility.getTitleById(userInfo.degree) : '';
                                            let toSvpDeg = (userInfo.degree) ? yield utility.getTitleById(userInfo.degree) : '';
                                            var lastname = (userInfo.lastname) ? userInfo.lastname : '';
                                            var firstname = (userInfo.firstname) ? userInfo.firstname : '';
                                            var degree = (userInfo.degree && userInfo.degree != '') ? ', ' + usrDegree : '';
                                            var centername = (userInfo.centername) ? userInfo.centername : '';
                                            var replacement = {
                                                "{{lastname}}": lastname,
                                                "{{firstname}}": firstname,
                                                "{{title}}": degree,
                                                "{{center}}": centername,
                                                "{{mailBody}}": (req.body.mailBody) ? req.body.mailBody : '',
                                                "{{webUrl}}": (req.config.webUrl) ? req.config.webUrl : '',
                                                "{{email}}": userInfo.email,
                                                "{{gpassword}}": gpassword,
                                                "{{currentYear}}": currentYear,
                                            }


                                            utility.sendmailbytemplate(userInfo.email, templateKey, replacement, function (error, templateData) {

                                                if (error) {
                                                    res.json({
                                                        code: 343,
                                                        'message': 'Error while Sending E-mail',
                                                        data: {}
                                                    });
                                                } else {

                                                    userInfoData._id = userInfo._id;
                                                    userInfoData.fax = userInfo.fax;
                                                    userInfoData.sute = userInfo.sute;
                                                    userInfoData.city = userInfo.city;
                                                    userInfoData.email = userInfo.email;
                                                    userInfoData.password = gpassword;
                                                    userInfoData.state = userInfo.state;
                                                    userInfoData.profile_image = userInfo.image;
                                                    userInfoData.image = userInfo.image;
                                                    userInfoData.zipcode = userInfo.zipcode;
                                                    userInfoData.lastname = userInfo.lastname;
                                                    userInfoData.centername = userInfo.centername;
                                                    userInfoData.location = userInfo.location;
                                                    userInfoData.user_loc = userInfo.user_loc;
                                                    userInfoData.userType = userInfo.userType;
                                                    userInfoData.firstname = userInfo.firstname;
                                                    userInfoData.firstLogin = userInfo.firstLogin;
                                                    userInfoData.cell_phone = userInfo.cell_phone;
                                                    userInfoData.doctorStatus = userInfo.doctorStatus;
                                                    userInfoData.phone_number = userInfo.phone_number;
                                                    userInfoData.emailAvailable = userInfo.emailAvailable;
                                                    userInfoData.token = 'admin_bearer ' + jwtToken;
                                                    userInfoData.service = userInfo.service ? userInfo.service : '';
                                                    userInfoData.degree = userInfo.degree ? userInfo.degree : '';
                                                    userInfoData.network = userInfo.network ? userInfo.network : '';
                                                    userInfoData.speciality = userInfo.speciality ? userInfo.speciality : '';
                                                    return res.json({ code: 200, message: 'You have been loggedin successfully!', data: userInfoData });



                                                }
                                            });
                                        }).then(function (value) {
                                            //console.log(value);
                                        }, function (err) {
                                            console.error(err.stack);
                                        });
                                    }
                                });


                            }
                        });
                    } else {
                        res.json({
                            code: 402,
                            message: 'Access denined.'
                        });
                    }
                } else {
                    res.json({
                        code: 201,
                        message: 'Request could not be processed. Please try again.'
                    });
                }
            })

    }).then(function (value) {
        //console.log(value);
    }, function (err) {
        console.error(err.stack);
    });

}

/**
 * existMember
 * @access private
 * @return json
 * Created by suman
 * @smartData Enterprises (I) Ltd
 * Created Date 21st nov 2018
 * task #552
 */
function existMember(req, res) {
    if (req.body.id != '') {
        User.findOne({
            _id: mongoose.Types.ObjectId(req.body.id),
            status: 1
        }, function (err, userRecord) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                if (userRecord) {
                    var userInfo = {};
                    userInfo = {
                        userId: userRecord._id,
                        firstname: userRecord.firstname,
                        lastname: userRecord.lastname,
                        email: userRecord.email,
                        firstLogin: userRecord.firstLogin
                    }
                    var gpassword = utility.getDecryptText(userRecord.password);
                    co(function* () {
                        var templateKey = 'send_password_exist_member';
                        let usrDegree = (userRecord.degree) ? yield utility.getTitleById(userRecord.degree) : '';
                        let frmSvpDeg = (userRecord.degree) ? yield utility.getTitleById(userRecord.degree) : '';
                        let toSvpDeg = (userRecord.degree) ? yield utility.getTitleById(userRecord.degree) : '';
                        var lastname = (userRecord.lastname) ? userRecord.lastname : '';
                        var firstname = (userRecord.firstname) ? userRecord.firstname : '';
                        var degree = (userRecord.degree && userRecord.degree != '') ? ', ' + usrDegree : '';
                        var centername = (userRecord.centername) ? userRecord.centername : '';
                        var replacement = {
                            "{{lastname}}": lastname,
                            "{{firstname}}": firstname,
                            "{{title}}": degree,
                            "{{center}}": centername,
                            "{{mailBody}}": (req.body.mailBody) ? req.body.mailBody : '',
                            "{{webUrl}}": (req.config.webUrl) ? req.config.webUrl : '',
                            "{{email}}": userInfo.email,
                            "{{gpassword}}": gpassword,
                            "{{currentYear}}": currentYear,
                        }
                        utility.sendmailbytemplate(userInfo.email, templateKey, replacement, function (error, templateData) {
                            if (error) {
                                res.json({
                                    code: 343,
                                    'message': 'Error while Sending E-mail',
                                    data: {}
                                });
                            } else {
                                res.json({
                                    code: 200,
                                    message: 'Email sent successfully.'
                                });
                            }
                        });
                    }).then(function (value) {
                        //console.log(value);
                    }, function (err) {
                        console.error(err.stack);
                    });

                }
            }
        });

    } else {
        return res.json(Response(402, "Email didn't Sent Successfully"));
    }

}

/**
 * Function is use to add new user
 * @access private
 * @return json
 * Created by Sanjiv Gupta
 * @smartData Enterprises (I) Ltd
 * last Modified Date 15-12-2017
 */


function addUser(req, res) {
    req.body.firstname = (typeof req.body.firstname !== 'undefined') ? req.body.firstname : '',
        req.body.lastname = (typeof req.body.lastname !== 'undefined') ? req.body.lastname : '';
    var gpassword = generator.generate({
        length: 10,
        numbers: true,
        excludeSimilarCharacters: true
    });
    var passExpOn = new Date()
    passExpOn.setDate(passExpOn.getDate() + 90);
    var userInfo = {};
    var userdata = {};
    var Encpassword = utility.getEncryptText(gpassword);
    console.log("\n req.body",req.body);
    
    var userData = {
        username: (typeof req.body.firstname !== 'undefined') ? req.body.firstname : '',
        password: Encpassword,
        passExpDate: passExpOn,
        firstname: (typeof req.body.firstname !== 'undefined') ? req.body.firstname : '',
        lastname: (typeof req.body.lastname !== 'undefined') ? req.body.lastname : '',
        centername: (typeof req.body.centername !== 'undefined') ? req.body.centername : '',
        email: (req.body.hasOwnProperty('email')) ? req.body.email.toLowerCase() : '',
        phone_number: req.body.phone_number,
        fax: (req.body.hasOwnProperty('fax')) ? req.body.fax : '',
        poc_name: (req.body.hasOwnProperty('poc_name')) ? req.body.poc_name.toLowerCase() : '',
        poc_phone: (req.body.hasOwnProperty('poc_phone')) ? req.body.poc_phone : '',
        status: 1,
        deleted: false,
        doctorsNPI: req.body.doctorsNPI,
        speciality: (req.body.speciality && req.body.speciality[0] !== '') ? req.body.speciality : [],
        frontdesk: req.body.frontdesk || [],
        network: req.body.network,

        sute: req.body.sute,
        city: (req.body.city) ? req.body.city.toLowerCase() : '',
        state: req.body.state,

        zipcode: req.body.zipcode,
        createdById: (req.body.hasOwnProperty('createdById')) ? req.body.createdById : null,
        service: (req.body.hasOwnProperty('service')) ? req.body.service : [],
        cell_phone: (req.body.hasOwnProperty('cell_phone')) ? req.body.cell_phone : '',
        user_loc: (req.body.hasOwnProperty('user_loc')) ? req.body.user_loc.reverse() : [],
    };

    if (req.body.hasOwnProperty('location') && req.body.location)
        userData.location = req.body.location;

    if (req.body.hasOwnProperty('degree') && req.body.degree)
        userData.degree = req.body.degree;

    if (req.body.hasOwnProperty('officeadminTitle') && req.body.officeadminTitle)
        userData.officeadminTitle = req.body.officeadminTitle;

    var salutation = 'Dr. ';
    if (req.body.hasOwnProperty('userType')) {
        userData.userType = req.body.userType;
        if (['officeAdmin'].indexOf(req.body.userType) !== -1) {
            salutation = '';
        }
    }
    if (req.body.hasOwnProperty("isVerified")) {
        userData.isVerified = req.body.isVerified;
    }
    async.waterfall([
        function (callback) {
            if (utills.notEmpty(userData.email)) {
                User.findOne({
                    email: req.body.email,
                    deleted: false,
                    isOutside: false
                }, { email: 1 }, function (err, email) {
                    if (err) {
                        callback({
                            code: 201,
                            'message': 'Request could not be processed. Please try again.'
                        });
                    } else {
                        if (email) {
                            callback({
                                code: 201,
                                'message': 'Email already exist.',
                                data: { userId: email._id }
                            });
                        } else {
                            callback(null);
                        }
                    }
                });
            } else {
                userData.emailAvailable = 0;
                callback(null);
            }
        },
        function (callback) {
            if (utills.notEmpty(userData.email) || utills.notEmpty(userData.fax)) {
                if (!utills.notEmpty(userData.email)) {
                    userData.email = Math.floor(10000 + Math.random() * 90000, new Date().getTime()) + '_temp@wd.com';
                    userData.emailAvailable = 0;
                }
                var UsersRecord = new User(userData);
                UsersRecord.save(function (err, userRecord) {
                    if (err) {
                        callback({
                            code: 201,
                            'message': 'Email id already exists.',
                            data: err
                        });
                    } else {
                        if (userRecord) {
                            userdata = userRecord;
                            userInfo = {
                                userId: userRecord._id,
                                firstname: userRecord.firstname,
                                lastname: userRecord.lastname,
                                email: userRecord.email,
                                firstLogin: userRecord.firstLogin
                            }
                            if (userData.emailAvailable === 0 && utills.notEmpty(userRecord.fax) && userRecord.fax != '+1undefined') {
                                var dr = 'Dr. ';
                                var dataText = '';

                                if (!userdata.firstLogin && req.body.reqfrom && req.body.reqfrom == 'faxAddAndRefer') {
                                    co(function* () {
                                        let refUsrDeg = (req.body.referingUserDegree) ? yield utility.getTitleById(req.body.referingUserDegree) : '';
                                        let userDeg = (userRecord.degree) ? yield utility.getTitleById(userRecord.degree) : '';
                                        var templateKey = 'add_and_refer_specialist';

                                        var absolutePath = path.resolve();

                                        var logoUrl = "/public/assets/images/logo_new.png";


                                        var faxreplacement = {
                                            "{{firstname}}": userRecord.firstname,
                                            "{{lastname}}": userRecord.lastname,
                                            "{{center}}": userRecord.centername,
                                            "{{title}}": (userRecord.degree && userRecord.degree != '0') ? ', ' + userDeg : '',
                                            "{{referringProviderFirstname}}": (req.body.referingUserFname) ? req.body.referingUserFname : '',
                                            "{{referringProviderLname}}": (req.body.referingUserLname) ? req.body.referingUserLname : '',
                                            "{{referringProviderTitle}}": (req.body.referingUserDegree && req.body.referingUserDegree != '') ? ', ' + refUsrDeg : '',
                                            "{{referringProviderCenter}}": (req.body.referingUserCenter) ? req.body.referingUserCenter : '',
                                            "{{referingUserFnameAgain}}": (req.body.referingUserFname) ? req.body.referingUserFname : '',
                                            "{{webUrl}}": req.config.webUrl,
                                            "{{email}}": userInfo.email,
                                            "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                                            "{{gpassword}}": gpassword
                                        }
                                        // Get fax template from database
                                        faxmodel.findOne({ key: templateKey }, {}, function (err, resp) {
                                            if (!err) {
                                                if (resp.body) {
                                                    // Update template with content
                                                    dataText = utility.replaceString(resp.body, faxreplacement);

                                                    utills.createfaxFile(dataText, function (err, filePath) {
                                                        if (!err) {
                                                            utills.sendFax(userRecord.fax, filePath, function (err, fax_id) {
                                                            })
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                        callback(null);
                                    }).then(function (value) {
                                        //console.log(value);
                                    }, function (err) {
                                        console.error(err.stack);
                                    });
                                } else if (req.body.reqfrom == 'add_doc_take_outside_referral') {
                                    co(function* () {
                                        let toSvpDeg = (req.body.toSvpDegree) ? yield utility.getTitleById(req.body.toSvpDegree) : '';
                                        let frmSvpDeg = (req.body.fromSvpDegree) ? yield utility.getTitleById(req.body.fromSvpDegree) : '';
                                        var templateKey = 'add_doc_take_outside_referral';

                                        var absolutePath = path.resolve();

                                        var logoUrl = "/public/assets/images/logo_new.png";


                                        var faxreplacement = {
                                            "{{dr}}": dr,
                                            "{{referredtoProviderFirstname}}": (req.body.toSvpFname) ? req.body.toSvpFname : '',
                                            "{{referredtoProviderLastname}}": (req.body.toSvpLname) ? req.body.toSvpLname : '',
                                            "{{referredtoProviderTitle}}": (req.body.toSvpDegree && req.body.toSvpDegree != '0') ? ', ' + toSvpDeg : '',
                                            "{{referringProviderCenter}}": (req.body.toSvpCenter) ? req.body.toSvpCenter : '',
                                            "{{referringProviderFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                            "{{referringProviderLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                            "{{referringProviderTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '0') ? ', ' + frmSvpDeg : '',
                                            "{{referredtoProviderCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                            "{{mailBody}}": req.body.mailBody,
                                            "{{email}}": userInfo.email,
                                            "{{gpassword}}": gpassword,
                                            "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                                            "{{webUrl}}": req.config.webUrl
                                        }
                                        // Get fax template from database
                                        faxmodel.findOne({ key: templateKey }, {}, function (err, resp) {
                                            if (!err) {
                                                if (resp.body) {
                                                    // Update template with content
                                                    dataText = utility.replaceString(resp.body, faxreplacement);

                                                    utills.createfaxFile(dataText, function (err, filePath) {
                                                        if (!err) {
                                                            utills.sendFax(userRecord.fax, filePath, function (err, fax_id) {
                                                            })
                                                        } else { }
                                                    });
                                                }
                                            } else { }
                                        })
                                        callback(null);
                                    }).then(function (value) {
                                        //console.log(value);
                                    }, function (err) {
                                        console.error(err.stack);
                                    });
                                } else /*if (req.body.hasOwnProperty("createdByAdmin") && req.body.createdByAdmin)*/ {
                                    co(function* () {
                                        let userDeg = (userRecord.degree) ? yield utility.getTitleById(userRecord.degree) : '';
                                        let frmSvpDeg = (req.body.fromSvpDegree) ? yield utility.getTitleById(req.body.fromSvpDegree) : '';
                                        var templateKey = 'add_specialist';

                                        var absolutePath = path.resolve();

                                        var logoUrl = "/public/assets/images/logo_new.png";


                                        var faxreplacement = {
                                            "{{firstname}}": userRecord.firstname,
                                            "{{lastname}}": (userRecord.lastname) ? userRecord.lastname : '',
                                            "{{title}}": (userRecord.degree && userRecord.degree != '0') ? ', ' + userDeg : '',
                                            "{{center}}": (userRecord.centername) ? userRecord.centername : '',
                                            "{{referringProviderFirstname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                            "{{referringProviderLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                            "{{referringProviderTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                            "{{referringProviderCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                            "{{invitingDoc}}": (req.body.invitingDoc) ? req.body.invitingDoc : '',
                                            "{{mailBody}}": req.body.mailBody,
                                            "{{email}}": userInfo.email,
                                            "{{gpassword}}": gpassword,
                                            "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                                            "{{webUrl}}": req.config.webUrl
                                        }
                                        // Get fax template from database
                                        faxmodel.findOne({ key: templateKey }, {}, function (err, resp) {
                                            if (!err) {
                                                if (resp.body) {
                                                    // Update template with content
                                                    dataText = utility.replaceString(resp.body, faxreplacement);

                                                    utills.createfaxFile(dataText, function (err, filePath) {
                                                        if (!err) {
                                                            utills.sendFax(userRecord.fax, filePath, function (err, fax_id) {
                                                            })
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                        callback(null);
                                    }).then(function (value) {
                                        //console.log(value);
                                    }, function (err) {
                                        console.error(err.stack);
                                    });
                                } /*else {
                                    callback(null);
                                }*/

                            } else {
                                co(function* () {
                                    let usrDegree = (req.body.degree) ? yield utility.getTitleById(req.body.degree) : '';
                                    let frmSvpDeg = (req.body.fromSvpDegree) ? yield utility.getTitleById(req.body.fromSvpDegree) : '';
                                    let toSvpDeg = (req.body.toSvpDegree) ? yield utility.getTitleById(req.body.toSvpDegree) : '';

                                    if (req.body.subject) {

                                        var templateKey = 'add_user_static_subject';
                                        var lastname = (req.body.lastname) ? req.body.lastname : '';
                                        var firstname = (req.body.firstname) ? req.body.firstname : '';
                                        var degree = (req.body.degree && req.body.degree != '') ? ', ' + usrDegree : '';
                                        var centername = (req.body.centername) ? req.body.centername : '';
                                        var replacement = {
                                            "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                            "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                            "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                            "{{fromSvpCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                            "{{lastname}}": lastname,
                                            "{{firstname}}": firstname,
                                            "{{title}}": degree,
                                            "{{center}}": centername,
                                            "{{mailBody}}": (req.body.mailBody) ? req.body.mailBody : '',
                                            "{{webUrl}}": (req.config.webUrl) ? req.config.webUrl : '',
                                            "{{email}}": userInfo.email,
                                            "{{gpassword}}": gpassword,
                                            "{{currentYear}}": currentYear,
                                        }
                                    } else if (req.body.reqfrom == 'add_doc_take_outside_referral') {

                                        var templateKey = 'add_doc_take_outside_referral';
                                        var salutation = (req.body.salutation) ? req.body.salutation : '';
                                        var lastname = (req.body.lastname) ? req.body.lastname : '';
                                        var firstname = (req.body.firstname) ? req.body.firstname : '';
                                        var degree = (req.body.degree && req.body.degree != '') ? ',' + usrDegree : '';
                                        var replacement = {
                                            "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                            "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                            "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                            "{{fromSvpCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                            "{{toSvpFname}}": (req.body.toSvpFname) ? req.body.toSvpFname : '',
                                            "{{toSvpLname}}": (req.body.toSvpLname) ? req.body.toSvpLname : '',
                                            "{{toSvpTitle}}": (req.body.toSvpDegree && req.body.toSvpDegree != '') ? ', ' + toSvpDeg : '',
                                            "{{toSvpCenter}}": (req.body.toSvpCenter) ? req.body.toSvpCenter : '',
                                            "{{webUrl}}": (req.config.webUrl) ? req.config.webUrl : '',
                                            "{{email}}": userInfo.email,
                                            "{{gpassword}}": gpassword,
                                            "{{currentYear}}": currentYear,
                                            "mailSubject": (req.body.subject) ? req.body.subject : ''
                                        }

                                    } else {
                                        if (userRecord.userType === "officeAdmin") {

                                            var templateKey = 'add_frontdesk_user';
                                            var lastname = (req.body.lastname) ? req.body.lastname : '';
                                            var replacement = {
                                                "{{lastname}}": lastname,
                                                "{{firstname}}": (req.body.firstname) ? req.body.firstname : '',
                                                "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                                "{{webUrl}}": req.config.webUrl,
                                                "{{email}}": userInfo.email,
                                                "{{gpassword}}": gpassword,
                                                "{{currentYear}}": currentYear
                                            }
                                        } else if (!userdata.firstLogin || (req.body.hasOwnProperty("createdByAdmin") && req.body.createdByAdmin)) {

                                            var templateKey = 'add_user_static_subject';
                                            var salutation = (req.body.salutation) ? req.body.salutation : '';
                                            var lastname = (req.body.lastname) ? req.body.lastname : '';
                                            var firstname = (req.body.firstname) ? req.body.firstname : '';
                                            var degree = (req.body.degree && req.body.degree != '') ? ', ' + usrDegree : '';
                                            var centername = (req.body.centername) ? req.body.centername : '';
                                            var replacement = {
                                                "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                                "{{fromSvpCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                                "{{lastname}}": lastname,
                                                "{{firstname}}": firstname,
                                                "{{title}}": degree,
                                                "{{center}}": centername,
                                                "{{webUrl}}": req.config.webUrl,
                                                "{{email}}": userInfo.email,
                                                "{{gpassword}}": gpassword,
                                                "{{currentYear}}": currentYear
                                            }
                                        }
                                    }
                                    if (templateKey) {
                                        utility.sendmailbytemplate(req.body.email, templateKey, replacement, function (error, templateData) {
                                            if (error) {
                                            } else { }
                                            callback(null);
                                        });
                                    } else {
                                        callback(null);
                                    }
                                }).then(function (value) {
                                    //console.log(value);
                                }, function (err) {
                                    console.error(err.stack);
                                });
                            }
                        } else {
                            callback({
                                code: 201,
                                'message': 'Something is wrong. Please try again!'
                            });
                        }
                    }
                });
            } else {
                callback({
                    code: 201,
                    'message': 'Please provide email or fax no.'
                });
            }
        }
    ], function (errs) {
        if (errs) {
            res.json(errs);
        } else {
            res.json({
                code: 200,
                'message': 'Congratulations, Account added successfully.',
                data: userInfo,
                userdata: userdata
            })
        }
    });
}

function registerUser(req, res) {
    req.body.firstname = (typeof req.body.firstname !== 'undefined') ? req.body.firstname : '',
        req.body.lastname = (typeof req.body.lastname !== 'undefined') ? req.body.lastname : '';
    var gpassword = generator.generate({
        length: 10,
        numbers: true,
        excludeSimilarCharacters: true
    });
    var passExpOn = new Date()
    passExpOn.setDate(passExpOn.getDate() + 90);
    var userInfo = {};
    var userdata = {};
    var Encpassword = utility.getEncryptText(gpassword);
    var userData = {
        username: (typeof req.body.firstname !== 'undefined') ? req.body.firstname : '',
        password: Encpassword,
        passExpDate: passExpOn,
        firstname: (typeof req.body.firstname !== 'undefined') ? req.body.firstname : '',
        lastname: (typeof req.body.lastname !== 'undefined') ? req.body.lastname : '',
        centername: (typeof req.body.centername !== 'undefined') ? req.body.centername : '',
        email: (req.body.hasOwnProperty('email')) ? req.body.email.toLowerCase() : '',
        phone_number: req.body.phone_number,
        fax: (req.body.hasOwnProperty('fax')) ? req.body.fax : '',
        poc_name: (req.body.hasOwnProperty('poc_name')) ? req.body.poc_name.toLowerCase() : '',
        poc_phone: (req.body.hasOwnProperty('poc_phone')) ? req.body.poc_phone : '',
        status: 1,
        deleted: false,
        doctorsNPI: req.body.doctorsNPI,
        speciality: (req.body.speciality && req.body.speciality[0] !== '') ? req.body.speciality : [],
        frontdesk: req.body.frontdesk || [],
        network: req.body.network,

        sute: req.body.sute,
        city: (req.body.city) ? req.body.city.toLowerCase() : '',
        state: req.body.state,

        zipcode: req.body.zipcode,
        createdById: (req.body.hasOwnProperty('createdById')) ? req.body.createdById : null,
        service: (req.body.hasOwnProperty('service')) ? req.body.service : [],
        cell_phone: (req.body.hasOwnProperty('cell_phone')) ? req.body.cell_phone : '',
        user_loc: (req.body.hasOwnProperty('user_loc')) ? req.body.user_loc.reverse() : [],
        isOutside: false,
        firstLogin: true,
        isRegistered: false
    };

    if (req.body.hasOwnProperty('location') && req.body.location)
        userData.location = req.body.location;

    if (req.body.hasOwnProperty('degree') && req.body.degree)
        userData.degree = req.body.degree;

    if (req.body.hasOwnProperty('officeadminTitle') && req.body.officeadminTitle)
        userData.officeadminTitle = req.body.officeadminTitle;

    var salutation = 'Dr. ';
    if (req.body.hasOwnProperty('userType')) {
        userData.userType = req.body.userType;
        if (['officeAdmin'].indexOf(req.body.userType) !== -1) {
            salutation = '';
        }
    }
    if (req.body.hasOwnProperty("isVerified")) {
        userData.isVerified = req.body.isVerified;
    }


    async.waterfall([
        function (callback) {
            if (utills.notEmpty(userData.email)) {
                User.findOne({
                    email: req.body.email,
                    deleted: false,
                    isOutside: false
                }, { email: 1 }, function (err, email) {
                    if (err) {
                        callback({
                            code: 201,
                            'message': 'Request could not be processed. Please try again.'
                        });
                    } else {
                        if (email) {
                            callback({
                                code: 201,
                                'message': 'Email already exist.',
                                data: { userId: email._id }
                            });
                        } else {
                            callback(null);
                        }
                    }
                });
            } else {
                userData.emailAvailable = 0;
                callback(null);
            }
        },
        function (callback) {
            if (utills.notEmpty(userData.email) || utills.notEmpty(userData.fax)) {
                if (!utills.notEmpty(userData.email)) {
                    userData.email = Math.floor(10000 + Math.random() * 90000, new Date().getTime()) + '_temp@wd.com';
                    userData.emailAvailable = 0;
                }

                User.update({
                    _id: mongoose.Types.ObjectId(req.body._id)
                }, {
                        $set: userData
                    }, function (err, userRecord) {
                        if (err) {
                            callback({
                                code: 201,
                                'message': 'Error occured',
                                data: err
                            });
                        } else {
                            User.findOne({
                                _id: mongoose.Types.ObjectId(req.body._id),
                                status: 1
                            }, {
                                    password: 0
                                }, function (err, userRecord) {
                                    if (err) {
                                        res.json({
                                            code: 201,
                                            message: 'Request could not be processed. Please try again.'
                                        });
                                    } else {
                                        if (userRecord) {
                                            userdata = userRecord;
                                            userInfo = {
                                                userId: userRecord._id,
                                                firstname: userRecord.firstname,
                                                lastname: userRecord.lastname,
                                                email: userRecord.email,
                                                firstLogin: userRecord.firstLogin
                                            }
                                            if (userData.emailAvailable === 0 && utills.notEmpty(userRecord.fax) && userRecord.fax != '+1undefined') {

                                                var dr = 'Dr. ';
                                                var dataText = '';

                                                if (!userdata.firstLogin && req.body.reqfrom && req.body.reqfrom == 'faxAddAndRefer') {
                                                    co(function* () {
                                                        let refUsrDeg = (req.body.referingUserDegree) ? yield utility.getTitleById(req.body.referingUserDegree) : '';
                                                        let userDeg = (userRecord.degree) ? yield utility.getTitleById(userRecord.degree) : '';
                                                        var templateKey = 'add_and_refer_specialist';

                                                        var absolutePath = path.resolve();

                                                        var logoUrl = "/public/assets/images/logo_new.png";


                                                        var faxreplacement = {
                                                            "{{firstname}}": userRecord.firstname,
                                                            "{{lastname}}": userRecord.lastname,
                                                            "{{center}}": userRecord.centername,
                                                            "{{title}}": (userRecord.degree && userRecord.degree != '0') ? ', ' + userDeg : '',
                                                            "{{referringProviderFirstname}}": (req.body.referingUserFname) ? req.body.referingUserFname : '',
                                                            "{{referringProviderLname}}": (req.body.referingUserLname) ? req.body.referingUserLname : '',
                                                            "{{referringProviderTitle}}": (req.body.referingUserDegree && req.body.referingUserDegree != '') ? ', ' + refUsrDeg : '',
                                                            "{{referringProviderCenter}}": (req.body.referingUserCenter) ? req.body.referingUserCenter : '',
                                                            "{{referingUserFnameAgain}}": (req.body.referingUserFname) ? req.body.referingUserFname : '',
                                                            "{{webUrl}}": req.config.webUrl,
                                                            "{{email}}": userInfo.email,
                                                            "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                                                            "{{gpassword}}": gpassword
                                                        }
                                                        // Get fax template from database
                                                        faxmodel.findOne({ key: templateKey }, {}, function (err, resp) {
                                                            if (!err) {
                                                                if (resp.body) {
                                                                    // Update template with content
                                                                    dataText = utility.replaceString(resp.body, faxreplacement);

                                                                    // send fax

                                                                    utills.createfaxFile(dataText, function (err, filePath) {
                                                                        if (!err) {
                                                                            utills.sendFax(userRecord.fax, filePath, function (err, fax_id) {
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        })
                                                        callback(null);
                                                    }).then(function (value) {
                                                        //console.log(value);
                                                    }, function (err) {
                                                        console.error(err.stack);
                                                    });
                                                } else if (req.body.reqfrom == 'add_doc_take_outside_referral') {
                                                    co(function* () {
                                                        let toSvpDeg = (req.body.toSvpDegree) ? yield utility.getTitleById(req.body.toSvpDegree) : '';
                                                        let frmSvpDeg = (req.body.fromSvpDegree) ? yield utility.getTitleById(req.body.fromSvpDegree) : '';
                                                        var templateKey = 'add_doc_take_outside_referral';

                                                        var absolutePath = path.resolve();

                                                        var logoUrl = "/public/assets/images/logo_new.png";


                                                        var faxreplacement = {
                                                            "{{dr}}": dr,
                                                            "{{referredtoProviderFirstname}}": (req.body.toSvpFname) ? req.body.toSvpFname : '',
                                                            "{{referredtoProviderLastname}}": (req.body.toSvpLname) ? req.body.toSvpLname : '',
                                                            "{{referredtoProviderTitle}}": (req.body.toSvpDegree && req.body.toSvpDegree != '0') ? ', ' + toSvpDeg : '',
                                                            "{{referringProviderCenter}}": (req.body.toSvpCenter) ? req.body.toSvpCenter : '',
                                                            "{{referringProviderFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                            "{{referringProviderLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                            "{{referringProviderTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '0') ? ', ' + frmSvpDeg : '',
                                                            "{{referredtoProviderCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                                            "{{mailBody}}": req.body.mailBody,
                                                            "{{email}}": userInfo.email,
                                                            "{{gpassword}}": gpassword,
                                                            "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                                                            "{{webUrl}}": req.config.webUrl
                                                        }
                                                        // Get fax template from database
                                                        faxmodel.findOne({ key: templateKey }, {}, function (err, resp) {
                                                            if (!err) {
                                                                if (resp.body) {
                                                                    // Update template with content
                                                                    dataText = utility.replaceString(resp.body, faxreplacement);

                                                                    // create fax file and send

                                                                    utills.createfaxFile(dataText, function (err, filePath) {
                                                                        if (!err) {
                                                                            utills.sendFax(userRecord.fax, filePath, function (err, fax_id) {
                                                                            })
                                                                        } else { }
                                                                    });
                                                                }
                                                            } else { }
                                                        })
                                                        callback(null);
                                                    }).then(function (value) {
                                                        //console.log(value);
                                                    }, function (err) {
                                                        console.error(err.stack);
                                                    });
                                                } else {
                                                    co(function* () {
                                                        let userDeg = (userRecord.degree) ? yield utility.getTitleById(userRecord.degree) : '';
                                                        let frmSvpDeg = (req.body.fromSvpDegree) ? yield utility.getTitleById(req.body.fromSvpDegree) : '';
                                                        var templateKey = 'add_specialist';

                                                        var absolutePath = path.resolve();

                                                        var logoUrl = "/public/assets/images/logo_new.png";


                                                        var faxreplacement = {
                                                            "{{firstname}}": userRecord.firstname,
                                                            "{{lastname}}": (userRecord.lastname) ? userRecord.lastname : '',
                                                            "{{title}}": (userRecord.degree && userRecord.degree != '0') ? ', ' + userDeg : '',
                                                            "{{center}}": (userRecord.centername) ? userRecord.centername : '',
                                                            "{{referringProviderFirstname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                            "{{referringProviderLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                            "{{referringProviderTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                                            "{{referringProviderCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                                            "{{invitingDoc}}": (req.body.invitingDoc) ? req.body.invitingDoc : '',
                                                            "{{mailBody}}": req.body.mailBody,
                                                            "{{email}}": userInfo.email,
                                                            "{{gpassword}}": gpassword,
                                                            "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                                                            "{{webUrl}}": req.config.webUrl
                                                        }
                                                        // Get fax template from database
                                                        faxmodel.findOne({ key: templateKey }, {}, function (err, resp) {
                                                            if (!err) {
                                                                if (resp.body) {
                                                                    // Update template with content
                                                                    dataText = utility.replaceString(resp.body, faxreplacement);

                                                                    // create fax file and send

                                                                    utills.createfaxFile(dataText, function (err, filePath) {
                                                                        if (!err) {
                                                                            utills.sendFax(userRecord.fax, filePath, function (err, fax_id) {
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        })
                                                        callback(null);
                                                    }).then(function (value) {
                                                        //console.log(value);
                                                    }, function (err) {
                                                        console.error(err.stack);
                                                    });
                                                }

                                            } else {
                                                co(function* () {
                                                    let usrDegree = (req.body.degree) ? yield utility.getTitleById(req.body.degree) : '';
                                                    let frmSvpDeg = (req.body.fromSvpDegree) ? yield utility.getTitleById(req.body.fromSvpDegree) : '';
                                                    let toSvpDeg = (req.body.toSvpDegree) ? yield utility.getTitleById(req.body.toSvpDegree) : '';

                                                    if (req.body.subject) {

                                                        var templateKey = 'add_user_static_subject';
                                                        var lastname = (req.body.lastname) ? req.body.lastname : '';
                                                        var firstname = (req.body.firstname) ? req.body.firstname : '';
                                                        var degree = (req.body.degree && req.body.degree != '') ? ', ' + usrDegree : '';
                                                        var centername = (req.body.centername) ? req.body.centername : '';
                                                        var replacement = {
                                                            "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                            "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                            "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                                            "{{fromSvpCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                                            "{{lastname}}": lastname,
                                                            "{{firstname}}": firstname,
                                                            "{{title}}": degree,
                                                            "{{center}}": centername,
                                                            "{{mailBody}}": (req.body.mailBody) ? req.body.mailBody : '',
                                                            "{{webUrl}}": (req.config.webUrl) ? req.config.webUrl : '',
                                                            "{{email}}": userInfo.email,
                                                            "{{gpassword}}": gpassword,
                                                            "{{currentYear}}": currentYear,
                                                        }
                                                    } else if (req.body.reqfrom == 'add_doc_take_outside_referral') {
                                                        var templateKey = 'add_doc_take_outside_referral';
                                                        var salutation = (req.body.salutation) ? req.body.salutation : '';
                                                        var lastname = (req.body.lastname) ? req.body.lastname : '';
                                                        var firstname = (req.body.firstname) ? req.body.firstname : '';
                                                        var degree = (req.body.degree && req.body.degree != '') ? ',' + usrDegree : '';
                                                        var replacement = {
                                                            "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                            "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                            "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                                            "{{fromSvpCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                                            "{{toSvpFname}}": (req.body.toSvpFname) ? req.body.toSvpFname : '',
                                                            "{{toSvpLname}}": (req.body.toSvpLname) ? req.body.toSvpLname : '',
                                                            "{{toSvpTitle}}": (req.body.toSvpDegree && req.body.toSvpDegree != '') ? ', ' + toSvpDeg : '',
                                                            "{{toSvpCenter}}": (req.body.toSvpCenter) ? req.body.toSvpCenter : '',
                                                            "{{webUrl}}": (req.config.webUrl) ? req.config.webUrl : '',
                                                            "{{email}}": userInfo.email,
                                                            "{{gpassword}}": gpassword,
                                                            "{{currentYear}}": currentYear,
                                                            "mailSubject": (req.body.subject) ? req.body.subject : ''
                                                        }

                                                    } else {
                                                        if (userRecord.userType === "officeAdmin") {
                                                            var templateKey = 'add_frontdesk_user';
                                                            var lastname = (req.body.lastname) ? req.body.lastname : '';
                                                            var replacement = {
                                                                "{{lastname}}": lastname,
                                                                "{{firstname}}": (req.body.firstname) ? req.body.firstname : '',
                                                                "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                                "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                                "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                                                "{{webUrl}}": req.config.webUrl,
                                                                "{{email}}": userInfo.email,
                                                                "{{gpassword}}": gpassword,
                                                                "{{currentYear}}": currentYear
                                                            }
                                                        } else if (!userdata.firstLogin) {
                                                            var templateKey = 'add_user_static_subject';
                                                            var salutation = (req.body.salutation) ? req.body.salutation : '';
                                                            var lastname = (req.body.lastname) ? req.body.lastname : '';
                                                            var firstname = (req.body.firstname) ? req.body.firstname : '';
                                                            var degree = (req.body.degree && req.body.degree != '') ? ', ' + usrDegree : '';
                                                            var centername = (req.body.centername) ? req.body.centername : '';
                                                            var replacement = {
                                                                "{{fromSvpFname}}": (req.body.fromSvpFname) ? req.body.fromSvpFname : '',
                                                                "{{fromSvpLname}}": (req.body.fromSvpLname) ? req.body.fromSvpLname : '',
                                                                "{{fromSvpTitle}}": (req.body.fromSvpDegree && req.body.fromSvpDegree != '') ? ', ' + frmSvpDeg : '',
                                                                "{{fromSvpCenter}}": (req.body.fromSvpCenter) ? req.body.fromSvpCenter : '',
                                                                "{{lastname}}": lastname,
                                                                "{{firstname}}": firstname,
                                                                "{{title}}": degree,
                                                                "{{center}}": centername,
                                                                "{{webUrl}}": req.config.webUrl,
                                                                "{{email}}": userInfo.email,
                                                                "{{gpassword}}": gpassword,
                                                                "{{currentYear}}": currentYear
                                                            }
                                                        }
                                                    }
                                                    if (templateKey) {
                                                        utility.sendmailbytemplate(req.body.email, templateKey, replacement, function (error, templateData) {
                                                            if (error) {
                                                            } else { }
                                                            callback(null);
                                                        });
                                                    } else {
                                                        callback(null);
                                                    }
                                                }).then(function (value) {
                                                    //console.log(value);
                                                }, function (err) {
                                                    console.error(err.stack);
                                                });
                                            }
                                        } else {
                                            callback({
                                                code: 201,
                                                'message': 'Something is wrong. Please try again!'
                                            });
                                        }
                                    }
                                });
                        }
                    });
            } else {
                callback({
                    code: 201,
                    'message': 'Please provide email or fax no.'
                });
            }
        }
    ], function (errs) {
        if (errs) {
            res.json(errs);
        } else {
            res.json({
                code: 200,
                'message': 'Congratulations, Account added successfully.',
                data: userInfo,
                userdata: userdata
            })
        }
    });
}

/**
 * Function is use to update user info by id
 * @access private
 * @return json
 * Created by Sanjiv Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 16-June-2017
 */

function updateProfile(req, res) {
    var updateUserRecord = {
        firstname: req.body.firstname,
        lastname: req.body.lastname
    }
    User.update({
        _id: mongoose.Types.ObjectId(req.body.userId)
    }, {
            $set: updateUserRecord
        }, function (err) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Profile info updated successfully.'
                });
            }
        });
}

function updateUserEmail(req, res) {
    User.findOne({ email: req.body.email, deleted: false, isOutside: false }, { email: 1 }, function (err, email) {
        if (err) {
            res.json({
                code: 201,
                'message': 'Request could not be processed. Please try again.'
            });
        } else {
            if (email) {
                res.json({
                    code: 201,
                    'message': 'Email already exist.'
                });
            } else {
                var updateUserRecord = {
                    email: req.body.email.toLowerCase(),
                    emailAvailable: 1
                }
                User.update({ _id: mongoose.Types.ObjectId(req.body.userId) }, { $set: updateUserRecord }, function (err) {
                    if (err) {
                        res.json({
                            code: 201,
                            message: 'Request could not be processed. Please try again.'
                        });
                    } else {
                        res.json({
                            code: 200,
                            message: 'Profile info updated successfully.'
                        });
                    }
                });
            }
        }
    });
}

function changePass(req, res) {
    var encPassword = (req.body.pass) ? utility.getEncryptText(req.body.pass) : '';
    var updateUserRecord = {
        passwordResetToken: '',
        password: encPassword
    };
    User.findOneAndUpdate({ passwordResetToken: req.body.token }, { $set: updateUserRecord }, function (err, resp) {
        if (err) {
            res.json({ code: 201, message: 'Invalid token.' });
        } else {
            if (resp) {
                res.json({
                    code: 200,
                    message: 'Password reset successfully.',
                    data: { id: resp._id }
                });
            } else {
                res.json({ code: 201, message: 'Invalid token.' });
            }
        }
    });
}

function changePassAdmin(req, res) {
    var encPassword = (req.body.pass) ? utility.getEncryptText(req.body.pass) : '';
    var updateUserRecord = {
        passwordResetToken: '',
        password: encPassword
    };

    User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.userId) }, { $set: updateUserRecord }, function (err, resp) {
        if (err) {
            res.json({ code: 201, message: 'Invalid request.' });
        } else {
            if (resp) {
                res.json({
                    code: 200,
                    message: 'Password updated successfully.',
                    data: { id: resp._id }
                });
            } else {
                res.json({ code: 201, message: 'Invalid request.' });
            }
        }
    });
}


/**
 * Function is use to update user profile pic
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 16-July-2017
 */
function updateUserPic(req, res) {
    var timestamp = Number(new Date()); // current time as number
    var file = req.swagger.params.file.value;
    var userId = req.swagger.params.id.value;
    var filename = +timestamp + '_' + file.originalname;
    var imagePath = "./images/user/" + timestamp + '_' + file.originalname;
    fs.writeFile(path.resolve(imagePath), file.buffer, function (err) {
        if (err) {
            res.json({
                code: 201,
                'message': 'Request could not be processed. Please try again.'
            });
        } else {
            var UserImage = {
                image: req.config.webUrl + "/images/user/" + filename
            };
            User.update({
                _id: mongoose.Types.ObjectId(userId)
            }, {
                    $set: UserImage
                }, function (err) {
                    if (err) {
                        res.json({
                            code: 201,
                            message: 'Request could not be processed. Please try again.'
                        });
                    } else {
                        res.json({
                            code: 200,
                            message: 'User profile pic updated successfully.'
                        });
                    }
                });
        }
    });
}
/**
 * Function is use to delete user from network
 * @access private
 * @return json
 * Created by Sanjeev
 * @smartData Enterprises (I) Ltd
 * Created Date 12-July-2017
 */
function deleteUser(req, res) {
    User.remove({
        email: req.body.email
    }, function (err) {
        if (err) {
            res.json({
                code: 201,
                message: 'Request could not be processed. Please try again.'
            });
        } else {
            res.json({
                code: 200,
                message: 'User removed  from network.'
            });
        }
    });
}

function updateUser(req, res) {

    var updateUserRecord = {
        firstname: (req.body.firstname) ? req.body.firstname : '',
        lastname: (req.body.lastname) ? req.body.lastname : '',
        centername: (req.body.centername) ? req.body.centername : '',
        phone_number: (req.body.phone_number) ? req.body.phone_number : '',

        network: (req.body.network) ? req.body.network : '',
        frontdesk: req.body.frontdesk || [],

        sute: (req.body.sute) ? req.body.sute : '',
        city: (req.body.city) ? req.body.city : '',

        state: (req.body.state) ? req.body.state : '',
        zipcode: (req.body.zipcode) ? req.body.zipcode : '',
        doctorsNPI: (req.body.doctorsNPI) ? req.body.doctorsNPI : '',
        user_loc: (req.body.hasOwnProperty('user_loc')) ? req.body.user_loc : [],
    }



    if (req.body.hasOwnProperty('location') && req.body.location)
        updateUserRecord.location = req.body.location;

    if (req.body.hasOwnProperty('degree') && req.body.degree)
        updateUserRecord.degree = req.body.degree;

    if (req.body.hasOwnProperty('officeadminTitle') && req.body.officeadminTitle)
        updateUserRecord.officeadminTitle = req.body.officeadminTitle;

    if (req.body.hasOwnProperty('email')) {
        updateUserRecord.email = req.body.email.toLowerCase();
        //Task #535 start

        var str = updateUserRecord.email;
        var emailFlag = str.indexOf("temp@wd.com");
        if (emailFlag > -1) {

            updateUserRecord.emailAvailable = 0;
            updateUserRecord.isRegistered = false;
        } else {

            updateUserRecord.emailAvailable = 1;
            updateUserRecord.isRegistered = true;
        }
        //Task #535 end        
    }
    //die;
    if (req.body.hasOwnProperty('isVerified')) {
        updateUserRecord.isVerified = req.body.isVerified;
    }
    if (req.body.hasOwnProperty('fax')) {
        updateUserRecord.fax = req.body.fax;
    }
    if (req.body.hasOwnProperty('cell_phone')) {
        updateUserRecord.cell_phone = req.body.cell_phone;
    }
    if (req.body.hasOwnProperty('poc_name')) {
        updateUserRecord.poc_name = req.body.poc_name;
    }
    if (req.body.hasOwnProperty('poc_phone')) {
        updateUserRecord.poc_phone = req.body.poc_phone;
    }
    if (req.body.hasOwnProperty('speciality')) {
        updateUserRecord.speciality = req.body.speciality;
    }

    User.findOne({
        email: updateUserRecord.email,
        isOutside: false,
        _id: {
            $ne: mongoose.Types.ObjectId(req.body._id)
        }
    }, function (err, email) {
        if (err) {
            throw err;
        } else {
            if (email) {
                res.json({
                    code: 202,
                    message: 'Email Id already exist ! Try with different Email.',
                    data: {}
                });
            } else {
                User.update({
                    _id: mongoose.Types.ObjectId(req.body._id)
                }, {
                        $set: updateUserRecord
                    }, function (err) {
                        if (err) {
                            res.json({
                                code: 201,
                                data: updateUserRecord,
                                message: 'Request could not be processed. Please try again.'
                            });
                        } else {

                            res.json({
                                code: 200,
                                data: updateUserRecord,
                                message: 'Profile updated successfully.'
                            });
                        }
                    })
            }
        }
    });
}
/**
 * Function is use to fetch user details by ids
 * @access private
 * @return json
 * Created by Sanjeev
 * @smartData Enterprises (I) Ltd
 * Created Date 24-June-2017
 */
function getUserDetails(req, res) {


    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.userId),
        status: 1
    }, {
            password: 0
        }, function (err, userInfo) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                if (userInfo.user_loc) {
                    userInfo.user_loc.reverse()
                }
                res.json({
                    code: 200,
                    message: 'User info fetched successfully.',
                    data: userInfo
                });
            }
        });
}

/**
 * Get doctor profile
 * last modified on 13-07-2017
 */
function getUserProfile(req, res) {
    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.userId),
        status: 1
    }, {
            password: 0
        })
        .populate('speciality')
        .populate('service')
        .populate('network')
        .exec(function (err, userInfo) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.',
                    data: err
                });
            } else {
                res.json({
                    code: 200,
                    message: 'User info fetched successfully.',
                    data: userInfo
                });
            }
        });
}


/**
 * Check user status (1. If completed welcome process, 2. Updated location )
 * last modified on 10-05-2018
 */
function getUserRegStatus(req, res) {
    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.userId),
        status: 1
    }, {
            firstLogin: 1,
            user_loc: 1
        })
        .exec(function (err, userInfo) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.',
                    data: err
                });
            } else {
                var complete = false;
                if (userInfo.firstLogin) {
                    complete = false;
                } else {
                    if (userInfo.user_loc) {
                        if (userInfo.user_loc[0] == 0 && userInfo.user_loc[1] == 0) {
                            complete = false;
                        } else {
                            complete = true;
                        }
                    }
                }
                res.json({
                    code: 200,
                    message: 'User info fetched successfully.',
                    data: complete
                });
            }
        });
}

/**
 * Function is use to change user password by user id
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 05-12-2017
 */
function changePassword(req, res) {
    User.findOne({ _id: mongoose.Types.ObjectId(req.body.userId) }, { password: 1 }, function (err, users) {
        if (err) {
            res.json({
                code: 201,
                message: 'Request could not be processed. Please try again.'
            });
        } else {
            if (users) {
                if (users.password == req.body.oldPassword) {
                    var passExpOn = new Date();
                    passExpOn.setDate(passExpOn.getDate() + 90);
                    var updateUserRecord = {
                        password: req.body.newPassword,
                        passExpDate: passExpOn
                    }
                    User.update({ _id: mongoose.Types.ObjectId(req.body.userId) }, { $set: updateUserRecord }, function (err) {
                        if (err) {
                            res.json({
                                code: 201,
                                message: 'Request could not be processed. Please try again.'
                            });
                        } else {
                            res.json({
                                code: 200,
                                message: 'Password reset successfully.'
                            });
                        }
                    });
                } else {
                    res.json({
                        code: 201,
                        message: 'Please provide correct current password.'
                    });
                }
            }
        }
    })
}
/**
 * Function is use to reset user password by user id
 * last modified on 05-12-2017
 */
function resetPassword(req, res) {

    User.findOne({ _id: mongoose.Types.ObjectId(req.body.userId) }, { email: 1, lastname: 1, firstname: 1, degree: 1 }, function (err, users) {
        if (err) {
            res.json({
                code: 201,
                message: 'Request could not be processed. Please try again.'
            });
        } else {
            if (users) {
                var gpassword = generator.generate({
                    length: 10,
                    numbers: true,
                    excludeSimilarCharacters: true
                });
                var passExpOn = new Date();
                passExpOn.setDate(passExpOn.getDate() + 90);
                var Encpassword = utility.getEncryptText(gpassword);
                var updateUserRecord = {
                    password: Encpassword,
                    passExpDate: passExpOn
                }

                User.update({ _id: mongoose.Types.ObjectId(req.body.userId) }, { $set: updateUserRecord }, function (err) {

                    if (err) {
                        res.json({
                            code: 201,
                            message: 'Request could not be processed. Please try again.'
                        });
                    } else {
                        var templateKey = 'reset_password';
                        co(function* () {
                            let usrDeg = (users.degree) ? yield utility.getTitleById(users.degree) : '';
                            var replacement = {
                                "{{firstname}}": (users.firstname) ? users.firstname : '',
                                "{{lastname}}": (users.lastname) ? users.lastname : '',
                                "{{title}}": (users.degree && users.degree != '') ? ', ' + usrDeg : '',
                                "{{webUrl}}": req.config.webUrl,
                                "{{gpassword}}": gpassword,
                                "{{currentYear}}": currentYear
                            }
                            utility.sendmailbytemplate(users.email, templateKey, replacement, function (error, templateData) {

                                if (error) {
                                    res.json({
                                        code: 343,
                                        'message': 'Error while Sending E-mail',
                                        data: {}
                                    });
                                } else {

                                    res.json({
                                        code: 200,
                                        message: 'Password reset successfully.'
                                    });
                                }
                            });
                        }).then(function (value) {
                            //console.log(value);
                        }, function (err) {
                            console.error(err.stack);
                        });
                    }
                });
            }
        }

    })
}
/**
 * Function is use to fetch users list
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 29-Jun-2017
 */
function getUserList(req, res) {
    User.find({ deleted: false, userType: { $in: ["user"] } },
        {
            _id: 1,
            firstname: 1,
            lastname: 1,
            doctorStatus: 1,
            email: 1,
            createdDate: 1,
            doctorsNPI: 1,
            status: 1,
            speciality: 1
        })
        .sort({
            createdDate: -1
        }).exec(function (err, userRecord) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Users info fetched successfully.',
                    data: userRecord
                });
            }
        });
}
function getFrontDeskAdmin(req, res) {
    User.find({ deleted: false, isVerified: true, userType: { $in: ["officeAdmin"] } },
        {
            _id: 1,
            firstname: 1,
            lastname: 1,
            email: 1
        })
        .sort({
            createdDate: -1
        }).exec(function (err, userRecord) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Users info fetched successfully.',
                    data: userRecord
                });
            }
        });
}


function providerList(req, res) {
    User.find({
        deleted: false,
        userType: {
            $in: ['user']
        }
    }, {
            _id: 1,
            lastname: 1,
            userType: 1
        })
        .sort({
            createdDate: -1
        }).exec(function (err, userRecord) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'success',
                    data: userRecord
                });
            }
        });
}

function updateSpeciality(req, res) {
    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.userId)
    }).then(function (user) {
        if (user) {
            if (!user.speciality) {
                user.speciality = [];
            }
            user.speciality = req.body.specialityId;
            user.save(function (err, userData) {
                if (err) {
                    throw err;
                } else {
                    res.json({
                        code: 200,
                        message: 'Speciality has been added'
                    });
                }
            });
        } else {
            res.json({
                code: 201,
                message: 'Something went wrong'
            });

        }
    }).catch(function (err) {

    });
}

function updateService(req, res) {
    var data = req.body;
    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.userId)
    }).then(function (user) {
        if (user) {
            if (!user.service) {
                user.service = [];
            }
            user.service = req.body.serviceId;
            user.save(function (err, userData) {
                if (err) {
                    throw err;
                } else {
                    res.json({
                        code: 200,
                        message: 'Service has been added'
                    });
                }
            });
        } else {
            res.json({
                code: 201,
                message: 'Something went wrong'
            });

        }
    }).catch(function (err) {

    });
}

/**
 * Update network preference of a user
 * last modified on 18-08-2017
 */
function updateNetwork(req, res) {
    var data = req.body;
    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.userId)
    }).then(function (user) {
        if (user) {
            if (!user.network) {
                user.network = [];
            }
            user.network = req.body.network;
            user.save(function (err, userData) {
                if (err) {
                    throw err;
                } else {
                    res.json({
                        code: 200,
                        message: 'Network has been added'
                    });
                }
            });
        } else {
            res.json({
                code: 201,
                message: 'Something went wrong'
            });
        }
    }).catch(function (err) {
    });
}

/**
 * Update doctors contact details
 * Created By Suman Chakraborty
 * last modified on 12-07-2017
 */
function UpdateContactDetails(req, res) {

    let userId = req.body.userId;
    delete req.body.userId;

    if (req.body.firstname) {
        req.body.firstname = req.body.firstname;
    }
    if (req.body.lastname) {
        req.body.lastname = req.body.lastname;
    }
    if (req.body.user_loc) {
        req.body.user_loc = req.body.user_loc.reverse();
    }

    if (!req.body.degree)
        delete req.body.degree;

    if (!req.body.officeadminTitle)
        delete req.body.officeadminTitle;


    User.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(userId)
    }, {
            $set: req.body
        }, function (err, resp) {

            if (err) {

                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                User.findOne({
                    _id: mongoose.Types.ObjectId(userId)
                }, {
                        email: 1,
                        emailAvailable: 1,
                        firstLogin: 1
                    })
                    .lean()
                    .exec(function (err, userInfo) {

                        res.json({
                            code: 200,
                            message: 'Contact details updated successfully.',
                            responseData: userInfo
                        });

                    });
            }
        });

}

function getById(req, res) {
    var id = req.swagger.params.id.value;
    User.findOne({
        _id: mongoose.Types.ObjectId(id)
    }, {
            firstname: 1,
            lastname: 1,
            centername: 1,
            email: 1,
            cell_phone: 1,
            phone_number: 1,
            doctorsNPI: 1,
            speciality: 1,
            service: 1,
            network: 1,
            location: 1,
            sute: 1,
            city: 1,
            state: 1,
            degree: 1,
            officeadminTitle: 1,
            zipcode: 1,
            fax: 1,
            poc_name: 1,
            poc_phone: 1,
            frontdesk: 1,
            user_loc: 1
        })
        .lean()
        .exec(function (err, userInfo) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.',
                    data: err
                });
            } else {
                var tempArr = [];
                async.each(userInfo.frontdesk, function (item, callback) {
                    User.findOne({ _id: mongoose.Types.ObjectId(item) }, function (err, frontDeskData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (frontDeskData) {
                                tempArr.push(frontDeskData._id);
                                callback(null, true);
                            } else {
                                callback(null, true);
                            }
                        }
                    });
                }, function (err) {
                    if (err) {
                        res.json({
                            code: 201,
                            message: 'Request could not be processed. Please try again.',
                            data: err
                        });
                    } else {
                        userInfo.frontdesk = tempArr;
                        res.json({
                            code: 200,
                            message: 'User info fetched successfully.',
                            data: userInfo
                        });
                    }
                });
            }
        });
}

function updateStatus(req, res) {
    var updateUserRecord = {
        status: req.body.status
    }
    User.update({
        _id: mongoose.Types.ObjectId(req.body.id)
    }, {
            $set: updateUserRecord
        }, function (err) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Status updated successfully.'
                });
            }
        });
}

function updateNetworkProviderStatus(req, res) {

    userNetwork.findOne({
        userId: mongoose.Types.ObjectId(req.body.userId),
        network: mongoose.Types.ObjectId(req.body.network)
    }, function (err, userRecord) {
        if (err) {
            res.json({
                code: 201,
                message: 'Request could not be processed. Please try again.'
            });
        } else {


            if (userRecord) {
                //update

                var updateUserRecord = {
                    status: req.body.status
                }

                userNetwork.update({
                    _id: mongoose.Types.ObjectId(userRecord._id)
                }, {
                        $set: updateUserRecord
                    }, function (err) {
                        if (err) {
                            res.json({
                                code: 201,
                                message: 'Request could not be processed. Please try again.'
                            });
                        } else {

                            res.json({
                                code: 200,
                                message: 'Status updated successfully.'
                            });
                        }
                    });


            } else {
                //insert

                var userNetworkArr = new userNetwork({
                    userId: req.body.userId,
                    network: req.body.network,
                    status: req.body.status,
                    createdById: req.body.createdById
                });
                userNetworkArr.save(function (err) {
                    if (err) {
                        res.json({ code: 401, message: 'Request could not be processed. Please try again.', data: {} });
                    } else {

                        res.json({
                            code: 200,
                            message: 'Status inserted successfully.'
                        });
                    }
                });


            }

        }
    });

}

/**
 * Get dashboard counts   details
 * Created By Sanjeev Gupta
 * last modified on 10-04-2018
 */
function getCounts(req, res) {
    var dashboardCount = {};
    User.count({
        deleted: false,
        userType: {
            $in: ['user']
        }
    }, function (err, count) {
        if (err) {
            res.json({
                code: 201,
                message: 'Error',
                data: {}
            })
        } else {
            dashboardCount.doctorCount = count;
            referralsModel.count({

            }, function (err, count) {
                if (err) {
                    res.json({
                        code: 201,
                        message: 'Error',
                        data: {}
                    })
                } else {
                    dashboardCount.referralCount = count;
                    User.count({
                        deleted: false,
                        userType: {
                            $in: ['officeAdmin']
                        }
                    }, function (err, count) {
                        if (err) {
                            res.json({
                                code: 201,
                                message: 'Error',
                                data: {}
                            })
                        } else {
                            dashboardCount.frontDeskCount = count;
                            networkModel.count({}, function (err, resCount) {
                                if (err) {
                                    throw err
                                } else {
                                    dashboardCount.networkCount = resCount;
                                    serviceModel.count({ isDeleted: false }, function (err, serviceCount) {
                                        if (err) {
                                            throw err
                                        } else {
                                            dashboardCount.serviceCount = serviceCount;
                                            SpecialityModel.count({
                                                "isDeleted": false
                                            }, function (err, specialityCount) {
                                                if (err) {
                                                    throw err;
                                                } else {
                                                    dashboardCount.specialityCount = specialityCount;
                                                    patientsModel.count({
                                                        "isDeleted": false
                                                    }, function (err, patientCount) {
                                                        if (err) {
                                                            throw err;
                                                        } else {
                                                            dashboardCount.patientCount = patientCount;
                                                            res.json({
                                                                code: 200,
                                                                message: 'Count has been fetched',
                                                                data: dashboardCount
                                                            });
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
            });
        }
    });
}

/**
 * Delete and insert user preference
 * last modified on 01-08-2017
 */
function addPreference(req, res) {
    var userId = req.body.userId;
    var spec = req.body.speciality;
    var data = new userPreferenceModel(req.body);
    userPreferenceModel.remove({
        userId: userId,
        speciality: spec
    }, function (err) {
        if (err) {
        } else {
            data.save(function (err, data) {
                if (err) {
                    res.json({
                        code: 201,
                        message: "Data not Addded"
                    })
                } else {

                    userPreferenceRatingModel.remove({
                        userId: userId,
                        speciality: spec
                    }, function (err) {
                        if (!err) {
                            var rating = 10;
                            async.eachSeries(data.preference, function (item, callback) {
                                co(function* () {

                                    var prefRat = {
                                        userId: req.body.userId,
                                        speciality: req.body.speciality,
                                        preferenceUserId: item,
                                        preferenceRating: rating
                                    }

                                    var prefRatData = new userPreferenceRatingModel(prefRat);

                                    yield prefRatData.save(function (error, prefuserData) {
                                        if (error) {
                                            // console.log(error);
                                        } else { }
                                    });
                                    rating--;
                                    callback();
                                }).then(function (value) {

                                }, function (err) {
                                    console.error(err.stack);
                                });
                            }, function (err) {
                                res.json({
                                    code: 200,
                                    message: "Data Added"
                                });
                            });
                        }
                    })
                }
            });
        }
    })
}

/**
 * Return user's preference 
 */
// function getPreference(req, res) {
//     var userId = req.body.userId;
//     // Code added by Saurabh 20-June-2019 (for getting preference list as per slider distance)
//     if(req.body.range && req.body.userLoc){

//         let calculatedMaxDistance = req.body.range* 1300//1500//1609.34 // 1.60934;
//        let aggreagteQuerry= [
// 		// Stage 1
// 		// {
// 		// 	$match: {
// 		// 	 _id: ObjectId("598058ceb02df2055adaf894")
// 		// 	}
// 		// },

// 		// Stage 2
// 		{
// 			$unwind: "$preference"
// 		},

// 		// Stage 3
// 		{
// 			$lookup: {
// 			    from: "user",
// 			    localField: "preference",
// 			    foreignField: "_id",
// 			    as: "preferenceData"
// 			}
// 		},

// 		// Stage 4
// 		{
// 			$unwind: {
// 			    path : "$preferenceData",
// 			    preserveNullAndEmptyArrays : false // optional
// 			}
// 		},

// 		// Stage 5
// 		{
// 			$group: {
// 			 _id: "$_id",
// 			   "products": { "$push": "$preference" },
// 			   "productObjects": { "$push": "$preferenceData" }
// 			}
// 		},

// 		// // Stage 6
// 		// {
//         //     $geoNear: {
//         //         near: {
//         //             type: "Point",
//         //             coordinates: [parseFloat(req.body.userLoc[0]), parseFloat(req.body.userLoc[1])]

//         //         },
//         //         distanceField: "dist.calculated",
//         //         maxDistance: calculatedMaxDistance, // miles to meter
//         //         // distanceMultiplier: 0.000621371, // meter to miles 1m = 0.000621371 miles
//         //         includeLocs: "dist.location",
//         //         //	num: 18,
//         //         spherical: true
//         //     }   
// 		// },
// 	]

//     userPreferenceModel.aggregate(aggreagteQuerry).exec(function (err, userData) {
//         if (err) {
//             console.log("\n\n error \n",err);
//           res.json({
//             code: 201,
//             message: 'internal error.',
//           });
//         } else if (userData) {       
//             console.log("\n\n userData :\n",userData);
//             res.json({
//               code: 200,
//               message: "success",
//               data: userData,
//             });

//         }
//       })

//     }
//     else{
//         userPreferenceModel.find({
//             userId: req.body.userId,
//             isDeleted: false
//         }, {
//                 isDeleted: 0,
//                 _id: 0,
//                 userId: 0
//             }, function (err, prefrenceInfo) {
//                 if (err) {
//                     res.json({
//                         code: 201,
//                         message: 'Request could not be processed. Please try again.'
//                     });
//                 } else {
//                     console.log("\nprefrenceInfo : \n",prefrenceInfo);
//                     res.json({
//                         code: 200,
//                         message: 'Success',
//                         data: prefrenceInfo
//                     });
//                 }
//             });
//     }

// }

// Return user preference by array of specialties passed

function getPreference(req, res) {
    var userId = req.body.userId;
    userPreferenceModel.find({
        userId: req.body.userId,
        isDeleted: false
    }, {
            isDeleted: 0,
            _id: 0,
            userId: 0
        }, function (err, prefrenceInfo) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Success',
                    data: prefrenceInfo
                });
            }
        });
}

function getPreferenceBySpecialty(req, res) {
    var userId = req.body.userId;
    userPreferenceModel.find({
        userId: req.body.userId,
        isDeleted: false,
        speciality: {
            "$in": req.body.speciality
        },
    }, {
            isDeleted: 0,
            _id: 0,
            userId: 0
        }, function (err, prefrenceInfo) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Success',
                    data: prefrenceInfo
                });
            }
        });


}

/**
 * Get dashboard counts details
 * Created By Sanjeev Gupta
 * last modified on 17-11-2017
 */
// function getDoctorsListUnAssociatedInsurance(req, res) {

//     var specCond = {};

//     var count = parseInt(req.body.count ? req.body.count : 100);
//     var skip = parseInt(req.body.count * (req.body.page - 1));
//     var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
//     var type = 'user';
//     if (req.body.hasOwnProperty('userType')) {
//         type = req.body.userType;

//     }
//     var condition = {
//         deleted: false,
//         status: '1',
//         userType: {
//             $in: [type]
//         }
//     };
//     if (req.body.frontDeskReq) {
//         condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
//     }

//     if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
//         condition.isRegistered = req.body.isRegistered;
//     }

//     if (req.body.hasOwnProperty('emailtype')) {
//         if (req.body.emailtype == 'with_mail') {
//             condition.emailAvailable = { $ne: 0 }
//         } else if (req.body.emailtype == 'without_mail') {
//             condition.emailAvailable = 0
//         }
//     }

//     if (req.body.service) {
//         condition.service = {
//             $in: req.body.service.map(function (item) {
//                 return mongoose.Types.ObjectId(item)
//             })
//         }
//     }
//     if (req.body.specialty) {
//         condition.speciality = {
//             $in: req.body.specialty.map(function (item) {
//                 return mongoose.Types.ObjectId(item)
//             })
//         }
//     }
//     if (req.body.network) {
//         if (req.body.insurance) {
//             condition.network = {
//                 $in: req.body.network.map(function (item) {
//                     return mongoose.Types.ObjectId(item)
//                 })
//             }
//         } else {
//             condition.network = {
//                 $nin: req.body.network.map(function (item) {
//                     return mongoose.Types.ObjectId(item)
//                 })
//             }
//         }

//     }


//     var sorting = utility.getSortObj(req.body);
//     var searchText = req.body.searchText;
//     if (req.body.searchText) {
//         condition.$or = [
//             {
//                 '_id': {
//                     $in: req.body.selectedIDs.map(function (item) {
//                         return mongoose.Types.ObjectId(item)
//                     })
//                 }
//             },
//             {
//                 'doctorStatus': new RegExp(searchText, 'gi')
//             },
//             {
//                 'email': new RegExp(searchText, 'gi')
//             },
//             {
//                 'phone_number': new RegExp(searchText, 'gi')
//             },
//             {
//                 'fax': new RegExp(searchText, 'gi')
//             },
//             {
//                 'cell_phone': new RegExp(searchText, 'gi')
//             },
//             {
//                 'insfirstname': new RegExp(searchText, 'gi')
//             },
//             {
//                 'inslastname': new RegExp(searchText, 'gi')
//             },
//             {
//                 'centername': new RegExp(searchText, 'gi')
//             },
//             {
//                 'poc_name': new RegExp(searchText, 'gi')
//             }

//         ];
//     }


//     let aggregate = [


//         {
//             $unwind: {
//                 path: "$createdById",
//                 preserveNullAndEmptyArrays: true
//             }
//         },

//         {
//             $project: {
//                 firstname: 1,
//                 "insfirstname": {
//                     "$toLower": "$firstname"
//                 },
//                 lastname: 1,
//                 "inslastname": {
//                     "$toLower": "$lastname"
//                 },
//                 centername: 1,
//                 degree: 1,
//                 poc_name: 1,
//                 email: 1,
//                 image: 1,
//                 phone_number: 1,
//                 fax: 1,
//                 cell_phone: 1,
//                 doctorStatus: 1,
//                 speciality: 1,
//                 service: 1,
//                 network: 1,
//                 deleted: 1,
//                 userType: 1,
//                 frontdesk: 1,
//                 status: 1,
//                 createdById: 1,
//                 firstLogin: 1,
//                 emailAvailable: 1,
//                 showMobile: 1,
//                 isRegistered: 1,
//                 isOutside: 1,

//             }
//         },

//         {
//             $lookup: {
//                 from: 'users',
//                 localField: "createdById",
//                 foreignField: "_id",
//                 as: "createdByInfo"
//             },

//         },


//         {
//             $match: condition
//         },
//         {
//             $group: {
//                 _id: '$_id',
//                 firstname: {
//                     $first: '$firstname'
//                 },
//                 insfirstname: {
//                     $first: '$insfirstname'
//                 },
//                 lastname: {
//                     $first: '$lastname'
//                 },
//                 inslastname: {
//                     $first: '$inslastname'
//                 },
//                 centername: {
//                     $first: '$centername'
//                 },
//                 degree: {
//                     $first: '$degree'
//                 },
//                 poc_name: {
//                     $first: '$poc_name'
//                 },
//                 doctorStatus: {
//                     $first: '$doctorStatus'
//                 },
//                 image: {
//                     $first: '$image'
//                 },
//                 email: {
//                     $first: '$email'
//                 },
//                 phone_number: {
//                     $first: '$phone_number'
//                 },
//                 fax: {
//                     $first: '$fax'
//                 },
//                 cell_phone: {
//                     $first: '$cell_phone'
//                 },
//                 doctorsNPI: {
//                     $first: '$doctorsNPI'
//                 },
//                 status: {
//                     $first: '$status'
//                 },
//                 firstLogin: {
//                     $first: '$firstLogin'
//                 },
//                 isRegistered: {
//                     $first: '$isRegistered'
//                 },
//                 createdById: {
//                     $first: '$createdById'
//                 },

//                 created_by: {
//                     $push: {
//                         createdByInfo: '$createdByInfo',
//                     }
//                 },
//                 emailAvailable: {
//                     $first: '$emailAvailable',
//                 },
//                 showMobile: {
//                     $first: '$showMobile',
//                 },


//             }
//         },
//         {
//             $sort: sorting
//         }
//     ];

//     var aggregateCnt = [].concat(aggregate);
//     if (req.body.count && req.body.page) {
//         aggregate.push({
//             $sort: sorting
//         });
//         aggregate.push({
//             $skip: skip
//         });
//         aggregate.push({
//             $limit: count
//         });
//     }
//     if (req.body.selectedIDsLength) {
//         count = parseInt(count + req.body.selectedIDsLength);
//     }
//     aggregate.push({
//         $limit: count
//     });
//     User.aggregate(aggregate).allowDiskUse(true).exec(function (err, userData) {
//         if (err) {

//             res.json({
//                 code: 201,
//                 message: 'internal error.',
//                 data: {}
//             });
//         } else if (userData) {
//             aggregateCnt.push({
//                 $group: {
//                     _id: null,
//                     count: {
//                         $sum: 1
//                     }
//                 }
//             });
//             User.aggregate(aggregateCnt).allowDiskUse(true).exec(function (err, userDataCount) {
//                 if (err) {
//                     res.json({
//                         code: 201,
//                         message: 'internal error.',
//                         data: {}
//                     });
//                 } else if (userDataCount) {

//                     var ite = 0;
//                     userData.forEach(function (item, index) {
//                         ite++;
//                         referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
//                             userData[index].inboxCount = res;
//                         })
//                         referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
//                             userData[index].notesent = res;
//                         })
//                     })
//                     setTimeout(function () {
//                         return res.json({
//                             code: 200,
//                             message: 'Data retrieved successfully',
//                             data: userData,
//                             totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
//                         });
//                     }, 1000);
//                 }
//             })
//         }
//     })
// }

function getDoctorsListUnAssociatedInsurance(req, res) {
    try {
        var specCond = {};
        var count = parseInt(req.body.count ? req.body.count : 0);
        var skip = parseInt(req.body.count * (req.body.page - 1));
        var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
        var type = 'user';
        if (req.body.hasOwnProperty('userType')) {
            type = req.body.userType;

        }
        var condition = {
            deleted: false,
            status: '1',
            userType: {
                $in: [type]
            },

        };
        if (req.body.frontDeskReq) {
            condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
        }

        if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
            condition.isRegistered = req.body.isRegistered;
        }

        if (req.body.hasOwnProperty('emailtype')) {
            if (req.body.emailtype == 'with_mail') {
                condition.emailAvailable = { $ne: 0 }
            } else if (req.body.emailtype == 'without_mail') {
                condition.emailAvailable = 0
            }
            // saurabh 06-June-2019
            else {
                condition.$or = [
                    { emailAvailable: { $ne: 0 } },
                    { emailAvailable: 0 }
                ]

            }
        }

        if (req.body.service) {
            condition.service = {
                $in: req.body.service.map(function (item) {
                    return mongoose.Types.ObjectId(item)
                })
            }
        }
        if (req.body.specialty) {
            condition.speciality = {
                $in: req.body.specialty
            }
        }

        var sorting = utility.getSortObj(req.body);
        var searchText = req.body.searchText;
        if (req.body.searchText) {
            condition.$or = [
                {
                    'doctorStatus': new RegExp(searchText, 'gi')
                },
                {
                    'firstname': new RegExp(searchText, 'gi')
                },
                {
                    'lastname': new RegExp(searchText, 'gi')
                },
                {
                    'email': new RegExp(searchText, 'gi')
                },
                {
                    'phone_number': new RegExp(searchText, 'gi')
                },
                {
                    'fax': new RegExp(searchText, 'gi')
                },
                {
                    'cell_phone': new RegExp(searchText, 'gi')
                },
                {
                    'insfirstname': new RegExp(searchText, 'gi')
                },
                {
                    'inslastname': new RegExp(searchText, 'gi')
                },
                {
                    'centername': new RegExp(searchText, 'gi')
                },
                {
                    'poc_name': new RegExp(searchText, 'gi')
                },

            ];
        }


        // *************$$$$$***** 10th  June 2019 Saurabh Udapure Code : Optimized Code for fetching non reg doctor list******************* 
        User.find(condition)
            .limit(parseInt(count))
            .populate({ path: 'createdById', model: 'user' })
            .sort(sorting)
            .skip(skip)
            .lean()
            .exec(function (err, userData) {
                co(function* () {
                    let finalUserData = [];
                    if (err) {
                        console.log("\n\n\nErr in find query", err);
                        res.json({
                            code: 201,
                            message: 'internal error.',
                            data: {}
                        });
                    } else if (userData && userData.length) {
                        // ****************** replaced code 6-June-2019 **************************

                        if (req.body.network) {
                            for (let i = 0; i < userData.length; i++) {
                                let findUserNetworkData = {};
                                if (req.body.network) {
                                    findUserNetworkData = {
                                        userId: userData[i]._id,
                                        status: "0"
                                    }
                                    if (req.body.insurance) {
                                        findUserNetworkData.network = {
                                            $in: req.body.network
                                        }
                                    }
                                    else {
                                        findUserNetworkData.network = {
                                            $nin: req.body.network
                                        }
                                    }

                                }

                                yield userNetwork.find(findUserNetworkData, function (err, userNetworkData) {
                                    if (err) {
                                        console.log("\n\nError", err);
                                    } else {
                                        if (userNetworkData.length > 0) {
                                            userData[i].user_network = userNetworkData
                                            finalUserData.push(userData[i]);
                                        }
                                    }

                                });

                            }
                        }
                        if (finalUserData.length == 0) {
                            finalUserData = userData
                        }

                        User.count(condition).exec(function (err, userDataCount) {
                            if (err) {
                                res.json({
                                    code: 201,
                                    message: 'internal error.',
                                    data: {}
                                });
                            } else if (userDataCount) {

                                var ite = 0;

                                finalUserData.forEach(function (item, index) {
                                    ite++;
                                    referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
                                        finalUserData[index].inboxCount = res;
                                    })
                                    referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
                                        finalUserData[index].notesent = res;
                                    })
                                })
                                setTimeout(function () {
                                    return res.json({
                                        code: 200,
                                        message: 'Data retrieved successfully',
                                        data: finalUserData,
                                        totalCount: userDataCount //((userDataCount[0]) ? userDataCount[0].count : 0)
                                    });
                                }, 1000);
                            }
                        })

                        //***************** replaced code ends *****************************

                    }
                    else {
                        return res.json({
                            code: 200,
                            message: 'Data retrieved successfully',
                            data: finalUserData,
                        });
                    }
                })

            })
    }
    catch (errrr) {
        console.log("\n\nErrororrrrrrrrr \n", errrr);
        res.json({
            code: 201,
            message: 'internal error.',
            data: {}
        });
    }
}

/**
 * Get dashboard counts details
 * Created By Sanjeev Gupta
 * last modified on 17-11-2017
 */

// previously working API using aggreagtion which takes too much time for e 
function getDoctorsListAssociatedInsurance(req, res) {
    var specCond = {};
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var type = 'user';
    if (req.body.hasOwnProperty('userType')) {
        type = req.body.userType;

    }
    var condition1 = {
        isDeleted : false,
    }
    var condition = {
        // deleted: false,
        // userType: {
        //     $in: [type]
        // }
        isDeleted : false,
    };
    var str = String(req.body.network)
    var resNetwork = str.substring(0, 26);
    if(req.body.network){
        condition1.network = mongoose.Types.ObjectId(resNetwork) //{$in : resNetwork} 
    }

    if (req.body.frontDeskReq) {
        condition.$and = [
            {
                "$usersData.frontdesk":{ $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
            },
        
        ]
    }
     

    if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
        condition.$and.push(
            {
                "$usersData.isRegistered":req.body.isRegistered
            }
        )
        // condition.isRegistered = req.body.isRegistered;
    }

    if (req.body.hasOwnProperty('emailtype')) {

        if (req.body.emailtype == 'with_mail') {
            condition.$and.push({
                 "$usersData.emailAvailable": { $ne: 0 } 
            })
            // condition.emailAvailable = { $ne: 0 }
        } else if (req.body.emailtype == 'without_mail') {
            condition.$and.push({
                "$usersData.emailAvailable": 0 
           })
            // condition.emailAvailable = 0
        }
        else {
            condition.$and.push({
                $or : [
                    {"$usersData.emailAvailable":{ $ne: 0 }},
                    {"$usersData.emailAvailable": 0 }
            ]
                
           })
            // condition.$or = [
            //     { emailAvailable: { $ne: 0 } },
            //     { emailAvailable: 0 }
            // ]
        }
    }

    if (req.body.service) {
        condition.$and.push({
            "$usersData.service": {$in : req.body.service} 
       })
        // condition.service = {
        //     $in: req.body.service.map(function (item) {
        //         return mongoose.Types.ObjectId(item)
        //     })
        // }
    }
    if (req.body.specialty) {
        condition.$and.push({
            "$usersData.speciality": {$in : req.body.specialty} 
       })
        // condition.speciality = {
        //     $in: req.body.specialty.map(function (item) {
        //         return mongoose.Types.ObjectId(item)
        //     })
        // }
    }
   
    var sorting = utility.getSortObj(req.body);
    var searchText = req.body.searchText;
    if (req.body.searchText) {
        condition.$or = [
            {
                '$usersData.doctorStatus': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.email': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.firstname': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.lastname': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.phone_number': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.fax': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.cell_phone': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.insfirstname': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.inslastname': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.centername': new RegExp(searchText, 'gi')
            },
            {
                '$usersData.poc_name': new RegExp(searchText, 'gi')
            }
        ];
    }

    let aggregate = [
        {
			$match: condition1
		},

		{
			$lookup: {
			    "from" : "users",
			    "localField" : "userId",
			    "foreignField" : "_id",
			    "as" : "usersData"
			}
        },
        {
			$match: condition
		},
		
		{
			$unwind: {
			    path : "$usersData",
			    preserveNullAndEmptyArrays : true // optional
			}
        },
        {
			$project: {
			    // path : "$usersData",
                // preserveNullAndEmptyArrays : true // optional
                "usersData.cell_phone" : 1,
                "usersData.centername" : 1,
                "usersData.createdById" : 1,
                "usersData.created_by" : 1,
                "usersData.degree" : 1,
                "usersData.doctorStatus" : 1,
                "usersData.doctorsNPI" : 1,
                "usersData.email" : 1,
                "usersData.emailAvailable" : 1,
                "usersData.fax" : 1,
                "usersData.firstLogin" : 1,
                "usersData.firstname" : 1,
                "usersData.image" : 1,
                "usersData.inboxCount" : 1,
                "usersData.isRegistered" : 1,
                "usersData.lastname" : 1,
                "usersData.notesent" : 1,
                "usersData.phone_number" : 1,
                "usersData.poc_name" : 1,
                "usersData.showMobile" : 1,
                "usersData._id" : 1,
			}
        }
    ]

    var aggregateCnt = [].concat(aggregate);
    if (req.body.count && req.body.page) {
        aggregate.push({
            $sort: sorting
        });
        aggregate.push({
            $skip: skip
        });
        aggregate.push({
            $limit: count
        });
    }

    // console.log('aggregate')
    // console.log('aggregate')
    console.log(JSON.stringify(aggregate))
    // console.log('aggregate')
    // console.log('aggregate')
    userNetwork.aggregate(aggregate).allowDiskUse(true).exec(function (err, userData) {
        if (err) {

            res.json({
                code: 201,
                message: 'internal error...',
                data: {}
            });
        } else if (userData) {
            // console.log("\n userData",userData);
            
            aggregateCnt.push({
                $group: {
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }
            });
            userNetwork.aggregate(aggregateCnt).allowDiskUse(true).exec(function (err, userDataCount) {
                if (err) {
                    res.json({
                        code: 201,
                        message: 'internal error....',
                        data: {}
                    });
                } else if (userDataCount) {
                    var ite = 0;
                    var finalResponse = []
                    userData.forEach(function (item, index) {
                        ite++;
                        referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
                            userData[index].inboxCount = res;
                        })
                        referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
                            userData[index].notesent = res;
                        })
                        finalResponse.push(item.usersData)

                    })
                    setTimeout(function () {
                        return res.json({
                            code: 200,
                            message: 'Data retrieved successfully',
                            data: finalResponse,
                            totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
                        });
                    }, 3000);
                }
            })
        }
    })
    // condition.isDeleteBy = "admin"
    // var sorting = utility.getSortObj(req.body);
    // var searchText = req.body.searchText;
    // if (req.body.searchText) {
    //     condition.$or = [
    //         {
    //             'doctorStatus': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'email': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'firstname': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'lastname': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'phone_number': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'fax': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'cell_phone': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'insfirstname': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'inslastname': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'centername': new RegExp(searchText, 'gi')
    //         },
    //         {
    //             'poc_name': new RegExp(searchText, 'gi')
    //         }
    //     ];
    // }

    // var condition2 ;
    // if (req.body.network) {
    //     condition2 = 
         
    //         {
    //             "userNetworkInfo.network":
    //             {
    //                 $in: req.body.network.map(function (item) {
    //                     return mongoose.Types.ObjectId(item)
    //                 })
    //             }
    //         }
        
    // }

    // console.log("\n\n\n Condition ====",condition);
    
    // let aggregate = [
    //     {
    //         "$match": condition
    //     },

    //     { "$unwind": { "path": "$createdByInfo", "preserveNullAndEmptyArrays": true } },

    //     {
    //         "$lookup": {
    //             "from": "users",
    //             "localField": "createdById",
    //             "foreignField": "_id",
    //             "as": "createdByInfo"
    //         }
    //     },

    //     {
    //         "$lookup": {
    //             "from": "usernetworks",
    //             "localField": "_id",
    //             "foreignField": "userId",
    //             "as": "userNetworkInfo"
    //         }
    //     },
    //     {
    //         "$unwind": {
    //             path: "$userNetworkInfo",
    //             preserveNullAndEmptyArrays: true // optional
    //         }
    //     },

    //     {
    //         "$match": condition2
    //     },
    //     {
    //         "$group": {
    //             _id: '$_id',
    //             firstname: {
    //                 $first: '$firstname'
    //             },
    //             insfirstname: {
    //                 $first: '$insfirstname'
    //             },
    //             lastname: {
    //                 $first: '$lastname'
    //             },
    //             inslastname: {
    //                 $first: '$inslastname'
    //             },
    //             centername: {
    //                 $first: '$centername'
    //             },
    //             degree: {
    //                 $first: '$degree'
    //             },
    //             poc_name: {
    //                 $first: '$poc_name'
    //             },
    //             doctorStatus: {
    //                 $first: '$doctorStatus'
    //             },
    //             image: {
    //                 $first: '$image'
    //             },
    //             email: {
    //                 $first: '$email'
    //             },
    //             phone_number: {
    //                 $first: '$phone_number'
    //             },
    //             fax: {
    //                 $first: '$fax'
    //             },
    //             cell_phone: {
    //                 $first: '$cell_phone'
    //             },
    //             doctorsNPI: {
    //                 $first: '$doctorsNPI'
    //             },
    //             firstLogin: {
    //                 $first: '$firstLogin'
    //             },
    //             isRegistered: {
    //                 $first: '$isRegistered'
    //             },
    //             createdById: {
    //                 $first: '$createdById'
    //             },

    //             created_by: {
    //                 $push: {
    //                     createdByInfo: '$createdByInfo',
    //                 }
    //             },
    //             // user_network: {
    //             //     $push: {
    //             //         userNetworkInfo: '$userNetworkInfo',
    //             //     }
    //             // },
    //             emailAvailable: {
    //                 $first: '$emailAvailable',
    //             },
    //             showMobile: {
    //                 $first: '$showMobile',
    //             },


    //         }
    //     },
    //     {
    //         "$sort": sorting
    //     }
    // ];

    // var aggregateCnt = [].concat(aggregate);
    // if (req.body.count && req.body.page) {
    //     aggregate.push({
    //         $sort: sorting
    //     });
    //     aggregate.push({
    //         $skip: skip
    //     });
    //     aggregate.push({
    //         $limit: count
    //     });
    // }

    // console.log('aggregate')
    // console.log('aggregate')
    // console.log(JSON.stringify(aggregate))
    // console.log('aggregate')
    // console.log('aggregate')
    // User.aggregate(aggregate).allowDiskUse(true).exec(function (err, userData) {
    //     if (err) {

    //         res.json({
    //             code: 201,
    //             message: 'internal error...',
    //             data: {}
    //         });
    //     } else if (userData) {

    //         aggregateCnt.push({
    //             $group: {
    //                 _id: null,
    //                 count: {
    //                     $sum: 1
    //                 }
    //             }
    //         });
    //         User.aggregate(aggregateCnt).allowDiskUse(true).exec(function (err, userDataCount) {
    //             if (err) {
    //                 res.json({
    //                     code: 201,
    //                     message: 'internal error....',
    //                     data: {}
    //                 });
    //             } else if (userDataCount) {
    //                 var ite = 0;
    //                 userData.forEach(function (item, index) {
    //                     ite++;
    //                     referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
    //                         userData[index].inboxCount = res;
    //                     })
    //                     referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
    //                         userData[index].notesent = res;
    //                     })
    //                 })
    //                 setTimeout(function () {
    //                     return res.json({
    //                         code: 200,
    //                         message: 'Data retrieved successfully',
    //                         data: userData,
    //                         totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
    //                     });
    //                 }, 3000);
    //             }
    //         })
    //     }
    // })

    
}



// function getDoctorsList(req, res) {
//     try {
//         var specCond = {};
//         var count = parseInt(req.body.count ? req.body.count : 0);
//         var skip = parseInt(req.body.count * (req.body.page - 1));
//         var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
//         var type = 'user';
//         if (req.body.hasOwnProperty('userType')) {
//             type = req.body.userType;

//         }
//         var condition = {
//             deleted: false,
//             status: '1',
//             userType: {
//                 $in: [type]
//             },

//         };
//         if (req.body.frontDeskReq) {
//             condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
//         }

//         if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
//             condition.isRegistered = req.body.isRegistered;
//         }

//         if (req.body.hasOwnProperty('emailtype')) {
//             if (req.body.emailtype == 'with_mail') {
//                 condition.emailAvailable = { $ne: 0 }
//             } else if (req.body.emailtype == 'without_mail') {
//                 condition.emailAvailable = 0
//             }
//         }

//         if (req.body.service) {
//             condition.service = {
//                 $in: req.body.service.map(function (item) {
//                     return mongoose.Types.ObjectId(item)
//                 })
//             }
//         }
//         if (req.body.specialty) {
//             condition.speciality = {
//                 $in: req.body.specialty
//             }
//         }

//         var sorting = utility.getSortObj(req.body);
//         var searchText = req.body.searchText;
//         if (req.body.searchText) {
//             condition.$or = [
//                 {
//                     'doctorStatus': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'firstname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'lastname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'email': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'phone_number': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'fax': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'cell_phone': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'insfirstname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'inslastname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'centername': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'poc_name': new RegExp(searchText, 'gi')
//                 },

//             ];
//         }


//         // *************$$$$$***** 13th  May 2019 Saurabh Udapure Code : Optimized Code for fetching doctor list******************* 
//         console.log("\n\n\n1111  condition\n\n", condition);
//         User.find(condition)
//             .populate({ path: 'createdById', model: 'user' })
//             .sort(sorting)
//             .skip(skip)
//             .lean()
//             .exec(function (err, userData) {
//                 co(function* () {
//                     let finalUserData = [];
//                     if (err) {
//                         console.log("\n\n\nErr in find query", err);
//                         res.json({
//                             code: 201,
//                             message: 'internal error.',
//                             data: {}
//                         });
//                     } else if (userData && userData.length) {
//                         console.log("\n\n2222  sucessfully got data\n\n", userData.length);
//                         // if(userData.length){
//                         if (req.body.network) {
//                             for (let i = 0; i < userData.length; i++) {
//                                 let findUserNetworkData = {};
//                                 // if (req.body.network ) { 
//                                 findUserNetworkData = {
//                                     userId: userData[i]._id,
//                                     status: "0"
//                                 }
//                                 findUserNetworkData.network = {
//                                     $in: req.body.network
//                                 }
//                                 // }

//                                 yield userNetwork.find(findUserNetworkData, function (err, userNetworkData) {
//                                     if (err) {
//                                         console.log("\n\nError\n\n", err);
//                                     } else {
//                                         if (userNetworkData.length > 0) {
//                                             userData[i].user_network = userNetworkData
//                                             finalUserData.push(userData[i]);
//                                         }
//                                         else {
//                                             finalUserData = userData
//                                         }

//                                     }

//                                 });

//                             }
//                         }
//                         if (finalUserData.length == 0) {
//                             finalUserData = userData
//                         }
//                         finalUserData = Underscore.uniq(finalUserData, '_id');
//                         User.find(condition).exec(function (err, userDataCount) {
//                             if (err) {
//                                 console.log("\n\n 33333 err", err);
//                                 res.json({
//                                     code: 201,
//                                     message: 'internal error.',
//                                     data: {}
//                                 });
//                             } else if (userDataCount) {
//                                 console.log("\n\n 4444 ", userDataCount.length);
//                                 var ite = 0;

//                                 finalUserData.forEach(function (item, index) {
//                                     ite++;
//                                     referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
//                                         finalUserData[index].inboxCount = res;
//                                     })
//                                     referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
//                                         finalUserData[index].notesent = res;
//                                     })
//                                 })
//                                 setTimeout(function () {
//                                     return res.json({
//                                         code: 200,
//                                         message: 'Data retrieved successfully',
//                                         data: finalUserData,
//                                         totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
//                                     });
//                                 }, 1000);
//                             }
//                         })

//                         // }  
//                     }
//                     else {
//                         return res.json({
//                             code: 200,
//                             message: 'Data retrieved successfully',
//                             data: finalUserData,
//                         });
//                     }
//                 })

//             })
//     }
//     catch (errrr) {
//         console.log("\n\nErrororrrrrrrrr \n", errrr);
//         res.json({
//             code: 201,
//             message: 'internal error.',
//             data: {}
//         });
//     }
// }

// function getDoctorsList(req, res) {
//     console.log(" \n\nNew\n\n getDoctorsList ",req.body);
//     var specCond = {};
//     var count = parseInt(req.body.count ? req.body.count : 0);
//     var skip = parseInt(req.body.count * (req.body.page - 1));
//     var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
//     var type = 'user';
//     if (req.body.hasOwnProperty('userType')) {
//         type = req.body.userType;

//     }
//     var condition = {
//         deleted: false,
//         status: '1',
//         // isOutside: false,
//         userType: {
//             $in: [type]
//         },

//     };
//     if (req.body.frontDeskReq) {
//         condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
//     }

//     if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
//         condition.isRegistered = req.body.isRegistered;
//     }

//     if (req.body.hasOwnProperty('emailtype')) {
//         if (req.body.emailtype == 'with_mail') {
//             condition.emailAvailable = { $ne: 0 }
//         } else if (req.body.emailtype == 'without_mail') {
//             condition.emailAvailable = 0
//         }
//         // saurabh 06-June-2019
//         else{
//             condition.$or = [
//                     {emailAvailable : { $ne: 0 }},
//                    {emailAvailable : 0} 
//                 ]

//         }
//     }

//     if (req.body.service) {
//         condition.service = {
//             $in: req.body.service.map(function (item) {
//                 return mongoose.Types.ObjectId(item)
//             })
//         }
//     }
//     if (req.body.specialty) {
//         condition.speciality = {
//             $in: req.body.specialty
//             // $elemMatch: { $eq : req.body.specialty[0].toString() }
//         }

//     }


//     var sorting = utility.getSortObj(req.body);
//     var searchText = req.body.searchText;
//     if (req.body.searchText) {
//         condition.$or = [
//             {
//                 'doctorStatus': new RegExp(searchText, 'gi')
//             },
//             {
//                 'firstname': new RegExp(searchText, 'gi')
//             },            
//             {
//                 'lastname': new RegExp(searchText, 'gi')
//             },
//             {
//                 'email': new RegExp(searchText, 'gi')
//             },
//             {
//                 'phone_number': new RegExp(searchText, 'gi')
//             },
//             {
//                 'fax': new RegExp(searchText, 'gi')
//             },
//             {
//                 'cell_phone': new RegExp(searchText, 'gi')
//             },
//             {
//                 'insfirstname': new RegExp(searchText, 'gi')
//             },
//             {
//                 'inslastname': new RegExp(searchText, 'gi')
//             },
//             {
//                 'centername': new RegExp(searchText, 'gi')
//             },
//             {
//                 'poc_name': new RegExp(searchText, 'gi')
//             },

//         ];
//     }

//     // if(condition.superAdminReq==true){
//     //     if(req.body.searchText2[0]){
//     //         delete condition['searchText2[0]'];
//     //     }
//     //     else if(req.body.searchText3[0]){
//     //         delete condition['searchText3[0]'];
//     //     }
//     // }

//     console.log("\n\n condition after delete",condition);
//     // *************$$$$$***** 13th  May 2019******************* 

//     User.find(condition)
//     .populate({path : 'createdById', model : 'user'})
//     // .count(count)
//     .sort(sorting)
//     .skip(skip)
//     .lean()
//     .exec(function (err, userData) {
//         co(function*(){
//             let finalUserData =[] ;
//             console.log("\n\nCo function",userData.length);
//             if (err) {
//                 console.log("err",err);
//                 res.json({
//                     code: 201,
//                     message: 'internal error.',
//                     data: {}
//                 });
//             } else if (userData) {
//             console.log("\n\ninside else if");
//                 // let finalUserData =[] ;
//                 if(userData.length){
//                     for(let i=0;i<userData.length;i++){
//                         let findUserNetworkData = { };                    
//                         if (req.body.network ) { 
//                             findUserNetworkData = {
//                                 userId: userData[i]._id,
//                                 status: "0"
//                             }
//                             findUserNetworkData.network = {
//                                 $in: req.body.network
//                                 // $elemMatch: { $eq : req.body.specialty[0].toString() }
//                             }
//                         }

//                         yield  userNetwork.find(findUserNetworkData, function (err, userNetworkData) {
//                                     if (err) {
//                                        console.log("\n\nError",err);
//                                     } else {
//                                         if(userNetworkData.length > 0){
//                                             userData[i].user_network = userNetworkData
//                                                 finalUserData.push(userData[i]);
//                                         }
//                                     }

//                                 });

//                     }
//                     if(finalUserData.length == 0){
//                         finalUserData = userData
//                     }


//                     User.find(condition).exec(function (err, userDataCount) {
//                         if (err) {
//                             res.json({
//                                 code: 201,
//                                 message: 'internal error.',
//                                 data: {}
//                             });
//                         } else if (userDataCount) {

//                             var ite = 0;

//                             finalUserData.forEach(function (item, index) {
//                                 ite++;
//                                 referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
//                                     finalUserData[index].inboxCount = res;
//                                 })
//                                 referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
//                                     finalUserData[index].notesent = res;
//                                 })
//                             })
//                             setTimeout(function () {
//                                 return res.json({
//                                     code: 200,
//                                     message: 'Data retrieved successfully',
//                                     data: finalUserData,
//                                     totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
//                                 });
//                             }, 1000);
//                         }
//                     })

//                 }

//             }
//             else{
//                 return res.json({
//                     code: 200,
//                     message: 'Data retrieved successfully',
//                     data: finalUserData,
//                     // totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
//                 });
//             }
//         })

//     })


// }

/**
 * Get providers asscociated with insurance listing API
 * Created By Saurabh Udapure
 * Created By Saurabh Udapure
 * last modified on 05-12-2019
 */
/******** 05 Dec 2019 : Optimized API for listing Providers/User associated with insurance list  */
// function getDoctorsListAssociatedInsurance(req, res) {
//     try {
//         var specCond = {};
//         var count = parseInt(req.body.count ? req.body.count : 0);
//         var skip = parseInt(req.body.count * (req.body.page - 1));
//         var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
//         var type = 'user';
//         if (req.body.hasOwnProperty('userType')) {
//             type = req.body.userType;
//         }
//         var condition = {
//             deleted: false,
//             userType: {
//                 $in: [type]
//             }
//         };
//         if (req.body.frontDeskReq) {
//             condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
//         }
    
//         if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
//             condition.isRegistered = req.body.isRegistered;
//         }
    
       
//         if (req.body.hasOwnProperty('emailtype')) {
//             if (req.body.emailtype == 'with_mail') {
//                 condition.$and = [
//                     {
//                         $or: [
//                             { email: { $ne: '' } },
//                             { email: { $not: /temp@wd.com$/ } },
//                         ]
//                     },
    
//                     { emailAvailable: 1 },
    
//                 ]
    
//             } else if (req.body.emailtype == 'without_mail') {
    
//                 condition.$and = [
//                     {
//                         $or: [
//                             { email: { $eq: '' } },
//                             { email: { $eq: /temp@wd.com$/ } }
//                         ]
//                     },
    
//                     { emailAvailable: 0 }
    
//                 ]
//             }
//             // saurabh 05-Dec-2019
//             else {
//                 condition.$or = [
//                     { emailAvailable: { $ne: 0 } },
//                     { emailAvailable: 0 }
//                 ]
    
//             }
//         }
    
//         if (req.body.service) {
//             condition.service = {
//                 $in: req.body.service.map(function (item) {
//                     return mongoose.Types.ObjectId(item)
//                 })
//             }
//         }
//         if (req.body.specialty) {
//             condition.speciality = {
//                 $in: req.body.specialty.map(function (item) {
//                     return mongoose.Types.ObjectId(item)
//                 })
//             }
//         }
    
//         if (req.body.network) {
//             condition.$and = [
//                 {
//                     "userNetworkInfo.network":
//                     {
//                         $in: req.body.network.map(function (item) {
//                             return mongoose.Types.ObjectId(item)
//                         })
//                     }
//                 },
//             ]
//         }
    
//         var sorting = utility.getSortObj(req.body);
//         var searchText = req.body.searchText;
//         if (req.body.searchText) {
//             condition.$or = [
//                 {
//                     'doctorStatus': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'email': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'firstname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'lastname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'phone_number': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'fax': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'cell_phone': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'insfirstname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'inslastname': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'centername': new RegExp(searchText, 'gi')
//                 },
//                 {
//                     'poc_name': new RegExp(searchText, 'gi')
//                 }
//             ];
//         }
    
//         User.find(condition)
//         .collation({ locale: 'en' })
//         .limit(count)
//         .populate({ path: 'createdById', model: 'user' })
//         .sort(sorting)
//         .skip(skip)
//         .lean()
//         .exec(function (err, userData) {
//             co(function* () {
//                 let finalUserData = [];
//                 if (err) {
//                     console.log("\n\n\nErr in find query", err);
//                     res.json({
//                         code: 201,
//                         message: 'internal error.',
//                         data: {}
//                     });
//                 } else if (userData && userData.length) {
                   
//                     // ****************** replaced code 5-Dec-2019 **************************
//                     console.log("\n\n userData.length",userData.length);
                    
//                     if (req.body.network) {
//                         for (let i = 0; i < userData.length; i++) {
//                             let findUserNetworkData = {};
//                             if (req.body.network) {
//                                 findUserNetworkData = {
//                                     userId: userData[i]._id,
//                                     status: "1"
//                                 }
//                                 findUserNetworkData.network = {
//                                     $in: [req.body.network]
//                                     // $elemMatch: { $eq : req.body.specialty[0].toString() }
//                                 }
//                             }
    
//                             // console.log("\n find data , findUserNetworkData",findUserNetworkData);
                            
//                             yield userNetwork.find(findUserNetworkData, function (err, userNetworkData) {
//                                 if (err) {
//                                     console.log("\n\nError", err);
//                                 } else {
//                                     console.log("\n\n userNetwork",userNetworkData.length);
                                    
//                                     if (userNetworkData.length > 0) {
//                                         userData[i].user_network = userNetworkData
//                                         finalUserData.push(userData[i]);
//                                     }
//                                 }
    
//                             });
    
//                         }
//                     }
//                     if (finalUserData.length == 0) {
//                         finalUserData = userData
//                     }
    
//                     User.count(condition).exec(function (err, userDataCount) {
//                         if (err) {
//                             res.json({
//                                 code: 201,
//                                 message: 'internal error.',
//                                 data: {}
//                             });
//                         } else if (userDataCount) {
//                             var ite = 0;
//                             finalUserData.forEach(function (item, index) {
//                                 ite++;
//                                 referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
//                                     finalUserData[index].inboxCount = res;
//                                 })
//                                 referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
//                                     finalUserData[index].notesent = res;
//                                 })
//                             })
//                             console.log("\n\n finalUserData\n\n",finalUserData.length,userDataCount,userData.length);
                            
//                             setTimeout(function () {
//                                 return res.json({
//                                     code: 200,
//                                     message: 'Data retrieved successfully',
//                                     data: finalUserData,
//                                     totalCount: finalUserData.length //== userData.length ? userDataCount : finalUserData.length //((userDataCount[0]) ? userDataCount[0].count : 0)
//                                 });
//                             }, 1000);
//                         }
//                     })
    
//                     //***************** replaced code ends *****************************
    
//                 }
//                 else {
//                     return res.json({
//                         code: 200,
//                         message: 'Data retrieved successfully',
//                         data: finalUserData,
//                     });
//                 }
//             })
    
//         })
//     }catch (errrr) {
//         console.log("\n\nErrororrrrrrrrr \n", errrr);
//         res.json({
//             code: 201,
//             message: 'internal error.',
//             data: {}
//         });
//     }



// }

function getDoctorsList(req, res) {


    try {
        var specCond = {};
        var count = parseInt(req.body.count ? req.body.count : 0);
        var skip = parseInt(req.body.count * (req.body.page - 1));
        var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
        var type = 'user';
        if (req.body.hasOwnProperty('userType')) {
            type = req.body.userType;

        }
        // console.log("is this runing twice",sorting);
        var condition = {
            deleted: false,
            status: '1',
            userType: {
                $in: [type]
            },

        };
        if (req.body.frontDeskReq) {
            condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
        }

        if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
            condition.isRegistered = req.body.isRegistered;
        }

        if (req.body.hasOwnProperty('emailtype')) {
            if (req.body.emailtype == 'with_mail') {
                condition.$and = [
                    {
                        $or: [
                            { email: { $ne: '' } },
                            { email: { $not: /temp@wd.com$/ } },
                        ]
                    },

                    { emailAvailable: 1 },

                ]

            } else if (req.body.emailtype == 'without_mail') {

                condition.$and = [
                    {
                        $or: [
                            { email: { $eq: '' } },
                            { email: { $eq: /temp@wd.com$/ } }
                        ]
                    },

                    { emailAvailable: 0 }

                ]
            }
            // saurabh 06-June-2019
            else {
                condition.$or = [
                    { emailAvailable: { $ne: 0 } },
                    { emailAvailable: 0 }
                ]

            }
        }

        if (req.body.service) {
            condition.service = {
                $in: req.body.service.map(function (item) {
                    return mongoose.Types.ObjectId(item)
                })
            }
        }
        if (req.body.specialty) {
            condition.speciality = {
                $in: req.body.specialty
            }
        }


        // let sortKeys = Object.keys(req.body);
        // console.log(sortKeys);

        var sorting = utility.getSortObj(req.body);

        var searchText = req.body.searchText;
        if (req.body.searchText) {
            condition.$or = [
                {
                    'doctorStatus': new RegExp(searchText, 'gi')
                },
                {
                    'firstname': new RegExp(searchText, 'gi')
                },
                {
                    'lastname': new RegExp(searchText, 'gi')
                },
                {
                    'email': new RegExp(searchText, 'gi')
                },
                {
                    'phone_number': new RegExp(searchText, 'gi')
                },
                {
                    'fax': new RegExp(searchText, 'gi')
                },
                {
                    'cell_phone': new RegExp(searchText, 'gi')
                },
                {
                    'insfirstname': new RegExp(searchText, 'gi')
                },
                {
                    'inslastname': new RegExp(searchText, 'gi')
                },
                {
                    'centername': new RegExp(searchText, 'gi')
                },
                {
                    'poc_name': new RegExp(searchText, 'gi')
                },

            ];
        }


        // *************$$$$$***** 26th  Sept 2019: Optimized Code for fetching doctor list******************* 
        User.find(condition)
            .collation({ locale: 'en' })
            .limit(count)
            .populate({ path: 'createdById', model: 'user' })
            .sort(sorting)
            .skip(skip)
            .lean()
            .exec(function (err, userData) {
                co(function* () {
                    let finalUserData = [];
                    if (err) {
                        console.log("\n\n\nErr in find query", err);
                        res.json({
                            code: 201,
                            message: 'internal error.',
                            data: {}
                        });
                    } else if (userData && userData.length) {
                        // ************** not working code which cannot send respond *********************
                        //  console.log("\n\n2222  sucessfully got data\n\n", userData.length);
                        // // if(userData.length){
                        // if (req.body.network) {
                        //     for (let i = 0; i < userData.length; i++) {
                        //         let findUserNetworkData = {};
                        //         // if (req.body.network ) { 
                        //         findUserNetworkData = {
                        //             userId: userData[i]._id,
                        //             status: "0"
                        //         }
                        //         findUserNetworkData.network = {
                        //             $in: req.body.network
                        //         }
                        //         // }

                        //         yield userNetwork.find(findUserNetworkData, function (err, userNetworkData) {
                        //             if (err) {
                        //                 console.log("\n\nError\n\n", err);
                        //             } else {
                        //                 if (userNetworkData.length > 0) {
                        //                     userData[i].user_network = userNetworkData
                        //                     finalUserData.push(userData[i]);
                        //                 }
                        //                 else {
                        //                     finalUserData = userData
                        //                 }

                        //             }

                        //         });
                        //     }
                        // }
                        // if (finalUserData.length == 0) {
                        //     finalUserData = userData
                        // }
                        // finalUserData = Underscore.uniq(finalUserData, '_id');
                        // User.find(condition).exec(function (err, userDataCount) {
                        //     if (err) {
                        //         console.log("\n\n 33333 err", err);
                        //         res.json({
                        //             code: 201,
                        //             message: 'internal error.',
                        //             data: {}
                        //         });
                        //     } else if (userDataCount) {
                        //         console.log("\n\n 4444 ", userDataCount.length);
                        //         var ite = 0;

                        //         finalUserData.forEach(function (item, index) {
                        //             ite++;
                        //             referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
                        //                 finalUserData[index].inboxCount = res;
                        //             })
                        //             referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
                        //                 finalUserData[index].notesent = res;
                        //             })
                        //         })
                        //         setTimeout(function () {
                        //             return res.json({
                        //                 code: 200,
                        //                 message: 'Data retrieved successfully',
                        //                 data: finalUserData,
                        //                 totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
                        //             });
                        //         }, 1000);
                        //     }
                        // })
                        // // }  

                        // ************** not working code which cannot send respond end*********************

                        // ****************** replaced code 6-June-2019 **************************

                        if (req.body.network) {
                            for (let i = 0; i < userData.length; i++) {
                                let findUserNetworkData = {};
                                if (req.body.network) {
                                    findUserNetworkData = {
                                        userId: userData[i]._id,
                                        status: "0"
                                    }
                                    findUserNetworkData.network = {
                                        $in: req.body.network
                                        // $elemMatch: { $eq : req.body.specialty[0].toString() }
                                    }
                                }

                                yield userNetwork.find(findUserNetworkData, function (err, userNetworkData) {
                                    if (err) {
                                        console.log("\n\nError", err);
                                    } else {
                                        if (userNetworkData.length > 0) {
                                            userData[i].user_network = userNetworkData
                                            finalUserData.push(userData[i]);
                                        }
                                    }

                                });

                            }
                        }
                        if (finalUserData.length == 0) {
                            finalUserData = userData
                        }

                        User.count(condition).exec(function (err, userDataCount) {
                            if (err) {
                                res.json({
                                    code: 201,
                                    message: 'internal error.',
                                    data: {}
                                });
                            } else if (userDataCount) {


                                var ite = 0;

                                finalUserData.forEach(function (item, index) {
                                    //  console.log("this is userDataCount userDataCount ---",item);
                                    ite++;
                                    referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
                                        finalUserData[index].inboxCount = res;


                                    })
                                    referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
                                        finalUserData[index].notesent = res;
                                    })
                                })
                                setTimeout(function () {
                                    return res.json({
                                        code: 200,
                                        message: 'Data retrieved successfully',
                                        data: finalUserData,
                                        totalCount: finalUserData.length == userData.length ? userDataCount : finalUserData.length //((userDataCount[0]) ? userDataCount[0].count : 0)
                                    });
                                }, 1000);
                            }
                        })

                        //***************** replaced code ends *****************************

                    }
                    else {
                        return res.json({
                            code: 200,
                            message: 'Data retrieved successfully',
                            data: finalUserData,
                        });
                    }
                })

            })

    }
    catch (errrr) {
        console.log("\n\nErrororrrrrrrrr \n", errrr);
        res.json({
            code: 201,
            message: 'internal error.',
            data: {}
        });
    }


}

function getDoctorsExportList(req, res) {

    var specCond = {};
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var isOutside = (req.body.isOutside) ? req.body.isOutside : false;
    var type = 'user';
    if (req.body.hasOwnProperty('userType')) {
        type = req.body.userType;

    }
    var condition = {
        deleted: false,
        status: '1',
        isOutside: isOutside,
        userType: {
            $in: [type]
        }
    };
    if (req.body.frontDeskReq) {
        condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
    }

    if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
        condition.isRegistered = req.body.isRegistered;
    }

    if (req.body.hasOwnProperty('emailtype')) {
        if (req.body.emailtype == 'with_mail') {
            condition.emailAvailable = { $ne: 0 }
        } else if (req.body.emailtype == 'without_mail') {
            condition.emailAvailable = 0
        }
    }

    if (req.body.service) {
        condition.service = {
            $in: req.body.service.map(function (item) {
                return mongoose.Types.ObjectId(item)
            })
        }
    }
    if (req.body.specialty) {
        condition.speciality = {
            $in: req.body.specialty.map(function (item) {
                return mongoose.Types.ObjectId(item)
            })
        }
    }
    if (req.body.network) {
        condition.network = {
            $in: req.body.network.map(function (item) {
                return mongoose.Types.ObjectId(item)
            })
        }
    }
    var sorting = utility.getSortObj(req.body);
    var searchText = req.body.searchText;
    if (req.body.searchText) {
        condition.$or = [
            {
                'doctorStatus': new RegExp(searchText, 'gi')
            },
            {
                'email': new RegExp(searchText, 'gi')
            },
            {
                'phone_number': new RegExp(searchText, 'gi')
            },
            {
                'fax': new RegExp(searchText, 'gi')
            },
            {
                'cell_phone': new RegExp(searchText, 'gi')
            },
            {
                'insfirstname': new RegExp(searchText, 'gi')
            },
            {
                'inslastname': new RegExp(searchText, 'gi')
            },
            {
                'centername': new RegExp(searchText, 'gi')
            },
            {
                'poc_name': new RegExp(searchText, 'gi')
            }
        ];
    }

    let aggregate = [

        {
            $unwind: {
                path: "$speciality",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $unwind: {
                path: "$createdById",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$frontdesk",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $unwind: {
                path: "$network",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                firstname: 1,
                "insfirstname": {
                    "$toLower": "$firstname"
                },
                lastname: 1,
                "inslastname": {
                    "$toLower": "$lastname"
                },
                centername: 1,
                degree: 1,
                poc_name: 1,
                email: 1,
                image: 1,
                phone_number: 1,
                fax: 1,
                cell_phone: 1,
                doctorStatus: 1,
                speciality: 1,
                service: 1,
                network: 1,
                frontdesk: 1,
                deleted: 1,
                userType: 1,
                frontdesk: 1,
                status: 1,
                createdById: 1,
                firstLogin: 1,
                emailAvailable: 1,
                showMobile: 1,
                isRegistered: 1,
                isOutside: 1,
                location: 1,
                sute: 1,
                city: 1,
                state: 1,
                zipcode: 1

            }
        },

        {
            $lookup: {
                from: 'specialities',
                localField: "speciality",
                foreignField: "_id",
                as: "specialityInfo"
            },

        },

        {
            $lookup: {
                from: 'users', //which is exported from user schema
                localField: "createdById", //this field is in user schema to be referenced as exported schema name
                foreignField: "_id", //this is going to be the createdbyinfo's as id [if ref is given them its complete data is shown if not only id would be shown as array]
                as: "createdByInfo" // the name which is going to be created or generated to create the aggreate .
            },

        },
        {
            $lookup: {
                from: 'networks',
                localField: "network",
                foreignField: "_id",
                as: "networkInfo"
            }

        },
        {
            $lookup: {
                from: 'users',
                localField: "frontdesk",
                foreignField: "_id",
                as: "frontDeskInfo"
            }
        },
        {
            $lookup: {
                from: 'titles',
                localField: "degree",
                foreignField: "_id",
                as: "titleInfo"
            }
        },


        {
            $match: condition
        },
        {
            $group: {
                _id: '$_id',
                firstname: {
                    $first: '$firstname'
                },
                insfirstname: {
                    $first: '$insfirstname'
                },
                lastname: {
                    $first: '$lastname'
                },
                inslastname: {
                    $first: '$inslastname'
                },
                centername: {
                    $first: '$centername'
                },
                degree: {
                    $first: '$degree'
                },
                poc_name: {
                    $first: '$poc_name'
                },
                doctorStatus: {
                    $first: '$doctorStatus'
                },
                image: {
                    $first: '$image'
                },
                email: {
                    $first: '$email'
                },
                phone_number: {
                    $first: '$phone_number'
                },
                fax: {
                    $first: '$fax'
                },
                cell_phone: {
                    $first: '$cell_phone'
                },
                doctorsNPI: {
                    $first: '$doctorsNPI'
                },
                status: {
                    $first: '$status'
                },
                firstLogin: {
                    $first: '$firstLogin'
                },
                isRegistered: {
                    $first: '$isRegistered'
                },
                createdById: {
                    $first: '$createdById'
                },
                specility_data: {
                    $addToSet: {
                        specialityInfo: '$specialityInfo',
                    }
                },

                network_data: {
                    $addToSet: {
                        networkInfo: '$networkInfo',
                    }
                },
                frontdesk_data: {
                    $addToSet: {
                        frontDeskInfo: '$frontDeskInfo',
                    }
                },
                created_by: {
                    $push: {
                        createdByInfo: '$createdByInfo',
                    }
                },
                title_data: {
                    $push: {
                        titleInfo: '$titleInfo',
                    }
                },
                emailAvailable: {
                    $first: '$emailAvailable',
                },
                showMobile: {
                    $first: '$showMobile',
                },
                location: {
                    $first: '$location',
                },
                sute: {
                    $first: '$sute',
                },
                city: {
                    $first: '$city',
                },
                state: {
                    $first: '$state',
                },
                zipcode: {
                    $first: '$zipcode',
                }
            }
        },
        {
            $sort: sorting
        }
    ];

    var aggregateCnt = [].concat(aggregate);
    if (req.body.count && req.body.page) {
        aggregate.push({
            $sort: sorting
        });
        aggregate.push({
            $skip: skip
        });
        aggregate.push({
            $limit: count
        });
    }
    User.aggregate(aggregate).allowDiskUse(true).exec(function (err, userData) {
        if (err) {

            res.json({
                code: 201,
                message: 'internal error.',
                data: {}
            });
        } else if (userData) {
            aggregateCnt.push({
                $group: {
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }
            });
            User.aggregate(aggregateCnt).allowDiskUse(true).exec(function (err, userDataCount) {
                if (err) {

                    res.json({
                        code: 201,
                        message: 'internal error.',
                        data: {}
                    });
                } else if (userDataCount) {
                    res.json({
                        code: 200,
                        message: 'Data retrieved successfully',
                        data: userData,
                        totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
                    });
                }
            })
        }
    })
}

function getDoctorRatingList(req, res) {
    var specCond = {};
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var type = 'user';

    if (req.body.hasOwnProperty('userType')) {
        type = req.body.userType;
    }
    var condition = {
        deleted: false,
        status: '1',
        isOutside: false,
        userType: {
            $in: [type]
        }
    };

    if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
        condition.isRegistered = req.body.isRegistered;
    }

    if (req.body.hasOwnProperty('emailtype')) {
        if (req.body.emailtype == 'with_mail') {
            condition.emailAvailable = { $ne: 0 }
        } else if (req.body.emailtype == 'without_mail') {
            condition.emailAvailable = 0
        }
    }

    if (req.body.specialty) {
        condition.speciality = {
            $in: req.body.specialty.map(function (item) {

                return mongoose.Types.ObjectId(item)
            })
        }

    }


    var sorting = utility.getSortObj(req.body);
    var searchText = req.body.searchText;
    if (req.body.searchText) {
        condition.$or = [
            {
                'doctorStatus': new RegExp(searchText, 'gi')
            },
            {
                'email': new RegExp(searchText, 'gi')
            },
            {
                'phone_number': new RegExp(searchText, 'gi')
            },
            {
                'fax': new RegExp(searchText, 'gi')
            },
            {
                'cell_phone': new RegExp(searchText, 'gi')
            },
            {
                'insfirstname': new RegExp(searchText, 'gi')
            },
            {
                'inslastname': new RegExp(searchText, 'gi')
            },
            {
                'centername': new RegExp(searchText, 'gi')
            },
            {
                'poc_name': new RegExp(searchText, 'gi')
            },
            {
                'speciality': '595b1ff02d79f3157e6165cf'
            }
        ];
    }
    let aggregate = [];
    if (req.body.hasOwnProperty('user_loc')) {
        var calculatedMaxDistance = parseFloat(req.body.range) / 3963.2;

        aggregate.push({
            $geoNear: {
                near: req.body.user_loc.reverse(),
                key: "user_loc",
                uniqueDocs: true,
                maxDistance: calculatedMaxDistance,
                distanceField: 'distance',
                spherical: true
            }
        });
    }
    aggregate.push(

        {
            $unwind: {
                path: "$preferenceRating",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                firstname: 1,
                "insfirstname": {
                    "$toLower": "$firstname"
                },
                lastname: 1,
                "inslastname": {
                    "$toLower": "$lastname"
                },
                centername: 1,
                "centername": {
                    "$toLower": "$centername"
                },
                degree: 1,
                poc_name: 1,
                email: 1,
                image: 1,
                phone_number: 1,
                fax: 1,
                cell_phone: 1,
                doctorStatus: 1,
                speciality: 1,
                service: 1,
                network: 1,
                deleted: 1,
                userType: 1,
                frontdesk: 1,
                status: 1,
                createdById: 1,
                firstLogin: 1,
                emailAvailable: 1,
                showMobile: 1,
                isRegistered: 1,
                isOutside: 1
            }
        },
        {
            $lookup: {
                from: 'userpreferenceratings',
                localField: "_id",
                foreignField: "preferenceUserId",
                as: "preferenceRatingInfo",
            },


        },
        {
            $match: condition
        },
        {
            $group: {
                _id: '$_id',
                firstname: {
                    $first: '$firstname'
                },
                insfirstname: {
                    $first: '$insfirstname'
                },
                lastname: {
                    $first: '$lastname'
                },
                inslastname: {
                    $first: '$inslastname'
                },
                centername: {
                    $first: '$centername'
                },
                degree: {
                    $first: '$degree'
                },
                poc_name: {
                    $first: '$poc_name'
                },
                doctorStatus: {
                    $first: '$doctorStatus'
                },
                image: {
                    $first: '$image'
                },
                email: {
                    $first: '$email'
                },
                phone_number: {
                    $first: '$phone_number'
                },
                fax: {
                    $first: '$fax'
                },
                cell_phone: {
                    $first: '$cell_phone'
                },
                doctorsNPI: {
                    $first: '$doctorsNPI'
                },
                status: {
                    $first: '$status'
                },
                firstLogin: {
                    $first: '$firstLogin'
                },
                isRegistered: {
                    $first: '$isRegistered'
                },


                preference_rating: {
                    $push: {
                        userIds: '$preferenceRatingInfo.userId',
                        totalRating: '$preferenceRatingInfo.preferenceRating'
                    }
                },
                emailAvailable: {
                    $first: '$emailAvailable',
                },
                showMobile: {
                    $first: '$showMobile',
                }

            }
        },
        {
            $sort: sorting
        }
    );



    var aggregateCnt = [].concat(aggregate);
    if (req.body.count && req.body.page) {
        aggregate.push({
            $sort: sorting
        });
        aggregate.push({
            $skip: skip
        });
        aggregate.push({
            $limit: count
        });
    }

    User.aggregate(aggregate)
        .exec(function (err, userData) {
            if (err) {

                res.json({
                    code: 201,
                    message: 'internal error.',
                    data: {}
                });
            } else if (userData) {

                aggregateCnt.push({
                    $group: {
                        _id: null,
                        preference_rating: {
                            $push: {
                                userIds: '$preferenceUserId.userId',
                                totalRating: '$preferenceUserId.preferenceRating'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                });
                User.aggregate(aggregateCnt)
                    .exec(function (err, userDataCount) {
                        if (err) {
                            res.json({
                                code: 201,
                                message: 'internal error.',
                                data: {}
                            });
                        } else if (userDataCount) {
                            var ite = 0;
                            userData.forEach(function (item, index) {
                                ite++;

                                let ratingusercnt = userData[index].preference_rating[0].userIds.length;

                                let totalPrefRating = userData[index].preference_rating[0].totalRating.reduce((a, b) => a + b, 0);
                                userData[index].preferenceRating = totalPrefRating / ratingusercnt;
                            })
                            setTimeout(function () {
                                return res.json({
                                    code: 200,
                                    message: 'Data retrieved successfully',
                                    data: userData,
                                    totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
                                });
                            }, 1000);
                        }
                    })
            }
        })



}

function getUnregisteredDoctorsList(req, res) {
    var specCond = {};
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var type = 'user';
    if (req.body.hasOwnProperty('userType')) {
        type = req.body.userType;

    }
    var condition = {
        deleted: false,
        userType: {
            $in: [type]
        }
    };

    if (req.body.frontDeskReq) {
        condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
    }

    if (req.body.hasOwnProperty('isRegistered')) {
        condition.isRegistered = req.body.isRegistered;
    } else {
        condition.isOutside = true;
    }

    if (req.body.hasOwnProperty('emailtype')) {
        if (req.body.emailtype == 'with_mail') {
            condition.emailAvailable = { $ne: 0 }
        } else if (req.body.emailtype == 'without_mail') {
            condition.emailAvailable = 0
        }
    }

    if (req.body.service) {
        condition.service = {
            $in: req.body.service.map(function (item) {
                return mongoose.Types.ObjectId(item)
            })
        }
    }
    if (req.body.specialty) {
        condition.speciality = {
            $in: req.body.specialty.map(function (item) {
                return mongoose.Types.ObjectId(item)
            })
        }
    }
    if (req.body.network) {
        condition.network = {
            $in: req.body.network.map(function (item) {
                return mongoose.Types.ObjectId(item)
            })
        }
    }
    var sorting = utility.getSortObj(req.body);
    var searchText = req.body.searchText;
    if (req.body.searchText) {
        condition.$or = [
            {
                'doctorStatus': new RegExp(searchText, 'gi')
            },
            {
                'email': new RegExp(searchText, 'gi')
            },
            {
                'phone_number': new RegExp(searchText, 'gi')
            },
            {
                'fax': new RegExp(searchText, 'gi')
            },
            {
                'cell_phone': new RegExp(searchText, 'gi')
            },
            {
                'firstname': new RegExp(searchText, 'gi')
            },
            {
                'lastname': new RegExp(searchText, 'gi')
            },
            {
                'centername': new RegExp(searchText, 'gi')
            },
            {
                'poc_name': new RegExp(searchText, 'gi')
            }
        ];
    }

    User.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean().exec(function (err, resp) {
            if (!err) {
                if (resp) {
                    User.find(condition)
                        .count()
                        .exec(function (err, totalCount) {
                            if (err) {
                                res.json({
                                    code: 201,
                                    message: 'Internal Error'
                                })
                            } else {
                                res.json({
                                    code: 200,
                                    message: 'success',
                                    data: resp,
                                    totalCount: totalCount
                                })
                            }
                        });
                } else {
                    res.json({
                        code: 200,
                        message: 'success',
                        data: resp,
                        totalCount: 0
                    })
                }
            } else { }
        })
}

/**
 * Add PHI access log
 * Created By Suman Chakraborty
 * last modified on 27-11-2017
 */
function addPhiAccess(req, res) {
    var PhiAccessLog = new logPhiAccessModel(req.body);
    PhiAccessLog.save(function (err, data) {
        if (err) {
            res.json({ code: 401, message: "Data not Addded" })
        } else {
            res.json({ code: 200, message: "Log updated" })
        }
    });
}

/**
 * Add user activity log
 * Created By Suman Chakraborty
 * last modified on 28-11-2017
 */
function addUserActivity(req, res) {
    var logUserActivity = new logUserActivityModel(req.body);
    logUserActivity.save(function (err, data) {
        if (err) {
            res.json({ code: 401, message: "Data not Addded" })
        } else {
            res.json({ code: 200, message: "Log updated" })
        }
    });
}


/**
 * Add invitation log
 * Created By suman
 * last modified on 31-10-2018
 */
function addInvitationLog(req, res) {
    var addInvitationLog = new invitationLogReferralModel(req.body);
    addInvitationLog.save(function (err, data) {
        if (err) {
            res.json({ code: 401, message: "Data not Addded" })
        } else {
            res.json({ code: 200, message: "Log updated" })
        }
    });
}

function updateProviderNetworkUnlisted(req, res) {
    async.each(req.body.netProvs, function (item, callback) {

        userNetwork.findOne({
            userId: mongoose.Types.ObjectId(item),
            network: mongoose.Types.ObjectId(req.body.networkId)
        }, function (err, userRecord) {
            if (err) {
                callback(err, true);

            } else {

                if (userRecord) {
                    //update
                    console.log("User Record", userRecord);
                    if (req.body.flag == 'superadmin') {
                        req.body.status = '0'
                    }

                    var updateUserRecord = {
                        status: req.body.status,
                    }

                    userNetwork.update({
                        _id: mongoose.Types.ObjectId(userRecord._id)
                    }, {
                            $set: updateUserRecord
                        }, function (err) {
                            if (err) {
                                callback(err, true);

                            } else {
                                callback(null, true);
                            }
                        });


                } else {
                    //insert

                    if (req.body.flag == 'superadmin' || req.body.flag == 'insuranceadmin') {
                        req.body.status = '0'
                    }
                    var userNetworkArr = new userNetwork({
                        userId: item,
                        network: mongoose.Types.ObjectId(req.body.networkId),
                        status: req.body.status,
                        createdById: item
                    });
                    userNetworkArr.save(function (err) {
                        if (err) {
                            callback(err, true);
                        } else {
                            callback(null, true);
                        }
                    });


                }

            }
        });

    }, function (err) {
        if (err) {
            res.json({
                code: 201,
                message: 'Request could not be processed. Please try again.',
                data: err
            });
        } else {
            res.json({
                code: 200,
                message: 'Status inserted successfully.',
            });
        }
    });

}



function updateProviderNetwork(req, res) {

    var data = req.body;
    var condition1 = {};
    var condition2 = {};

    condition1.network = { "$ne": [mongoose.Types.ObjectId(req.body.networkId)] }
    condition1._id = {
        $in: req.body.netProvs.map(function (item) {
            return mongoose.Types.ObjectId(item)
        })
    }

    condition2.network = { "$in": [mongoose.Types.ObjectId(req.body.networkId)] }
    condition2._id = {
        $nin: req.body.netProvs.map(function (item) {
            return mongoose.Types.ObjectId(item)
        })
    }

    async.waterfall([
        function (callback) {
            User.find(condition1)
                .exec(function (err, data) {
                    if (err) {
                        callback({
                            code: 201,
                            'message': 'Internal error 1'
                        });
                    } else if (data) {
                        data.forEach(item => {
                            if (!item.network) {
                                item.network = [];
                            }
                            item.network.push(mongoose.Types.ObjectId(req.body.networkId));

                            var updateUserRecord = {
                                network: item.network
                            }
                            User.update({
                                _id: mongoose.Types.ObjectId(item._id)
                            }, {
                                    $set: updateUserRecord
                                }, function (err) {
                                    if (err) {
                                        callback({
                                            code: 201,
                                            'message': 'Request could not be processed. Please try again.'
                                        });
                                    } else {

                                    }
                                });
                        })
                    } else { }
                    callback(null);
                });
        },
        function (callback) {
            User.find(condition2)
                .exec(function (err, data) {
                    if (err) {
                        callback({
                            code: 201,
                            'message': 'Internal error 2'
                        });
                    } else if (data) {
                        data.forEach(item => {
                            if (!item.network) {
                                item.network = [];
                            }

                            item.network.splice(item.network.indexOf(mongoose.Types.ObjectId(req.body.networkId)), 1);

                            var updateUserRecord = {
                                network: item.network
                            }
                            User.update({
                                _id: mongoose.Types.ObjectId(item._id)
                            }, {
                                    $set: updateUserRecord
                                }, function (err) {
                                    if (err) {
                                        callback({
                                            code: 201,
                                            'message': 'Request could not be processed. Please try again.'
                                        });
                                    } else {
                                    }
                                });
                        })

                    } else {
                        callback({
                            code: 201,
                            'message': 'No data found'
                        });
                    }
                    callback(null);
                })
        }
    ], function (errs) {
        if (errs) {
            res.json(errs);
        } else {
            res.json({ code: 200, message: 'success' });
        }
    });

}


function insertOrUpdateUsernetworks(req, res) {
    let network_length = 0;
    console.log("\n\n body network ", req.body.network);
    co(function* () {
        yield userNetwork.find({ userId: mongoose.Types.ObjectId(req.body.userId) },
            function (err, userRecord) {
                if (err) {
                    // if (network_length >= (req.body.network.length + 1)) {
                    res.json({
                        code: 201,
                        error: err,
                        message: 'Request could not be processed. Please try again.'
                    });
                    // }
                }
                else {
                    if (userRecord.length) {
                        console.log("\n\n inside userRecord.length", userRecord.length);
                        var error;
                        if (req.body.network.length) {
                            for (let i = 0; i < userRecord.length; i++) {
                                let status = { status: "0" }

                                for (let j = 0; j < req.body.network.length; j++) {
                                    console.log(userRecord[i].network, req.body.network[j]._id, userRecord[i].network == req.body.network[j]._id, 'userRecord[i].network == req.body.network[j]', i, j);
                                    if (userRecord[i].network == req.body.network[j]._id) {
                                        // status = { status: "1" }
                                        // if (req.body.flag == 'user') {
                                        //     status = '1'
                                        // }
                                        if (req.body.flag == 'superadmin') {
                                            status = '0'
                                        }
                                    }
                                    else {
                                        if (req.body.flag == 'user') {
                                            status = '0'
                                        }
                                        if (req.body.flag == 'superadmin') {
                                            status = '0'
                                        }
                                        var userNetworkArr = new userNetwork({
                                            userId: req.body.userId,
                                            network: req.body.network[j]._id,
                                            status: status,
                                            createdById: req.body.userId,
                                            createdBy: "user"
                                        });

                                        userNetwork.findOne({ userId: mongoose.Types.ObjectId(req.body.userId), network: mongoose.Types.ObjectId(req.body.network[j]._id) }, function (err, alreadyExist) {
                                            if (err) {
                                                error = err;
                                            }
                                            else if (alreadyExist) {
                                                console.log("\n\n Insurance already present ");
                                                userNetwork.update({ _id: mongoose.Types.ObjectId(req.body.userId), network: mongoose.Types.ObjectId(userRecord[i].network) }, { status: '0' }, function (err, data) { })
                                            }
                                            else {
                                                userNetworkArr.save(function (err) {
                                                    if (err) {
                                                        if (j == req.body.network.length - 1) {
                                                            res.json({ code: 401, message: 'Request could not be processed. Please try again.', data: {} });
                                                        }
                                                    } else {
                                                        console.log("\n\n Succesfully created entry");

                                                        // if (j == req.body.network.length - 1) {
                                                        //     res.json({
                                                        //         code: 200,
                                                        //         message: 'Status inserted successfully.'
                                                        //     });
                                                        // }
                                                    }
                                                });
                                            }
                                        });

                                    }


                                    if (j == req.body.network.length - 1) {
                                        userNetwork.updateMany({ _id: mongoose.Types.ObjectId(userRecord[i]._id), network: mongoose.Types.ObjectId(userRecord[i].network) }, status, function (err, data) {
                                            console.log(err, data, 'err,data', i, j, userRecord[i].network);
                                            if (err)
                                                error = err;

                                        });
                                    }
                                }

                                if (i == userRecord.length - 1) {
                                    let networkIds = [];
                                    req.body.network.forEach((element, index) => {
                                        networkIds.push(mongoose.Types.ObjectId(element._id));
                                        if(index == req.body.network.length -1){
                                            console.log("\n\n networkIds ", networkIds);

                                            let findObj = {
                                                userId: mongoose.Types.ObjectId(req.body.userId),
                                                network: { $nin: networkIds }
                                            }
        
                                            console.log("\n\n findObj condition ", findObj);
                                            userNetwork.updateMany(findObj, { status: 0 }, function (err, data) {
                                                if (err) {
                                                    error = err;
                                                }
                                                console.log("\n\n Exexcuted status 0", data);
                                            });
                                        }
                                    });
                                    

                                    res.json({
                                        code: 200,
                                        message: 'Status updated successfully.'
                                    });
                                }

                                // if (i == userRecord.length - 1) {
                                //     let findObj = {
                                //         _id: mongoose.Types.ObjectId(req.body.userId),
                                //         $or :[]
                                //     }
                                //     for(let k=0;k<req.body.network.length;k++){
                                //         findObj.$or.push({
                                //             network: {$ne : mongoose.Types.ObjectId(req.body.network[k]._id)}})

                                //         if(k == req.body.network.length -1){
                                //             userNetwork.updateMany(findObj, { status : 0}, function (err, data) {
                                //                 if (err){
                                //                     error = err;
                                //                 }
                                //                 else{
                                //                     res.json({
                                //                         code: 200,
                                //                         message: 'Status updated successfully.'
                                //                     });
                                //                 }
                                //             });
                                //         }

                                //     }
                                // }
                            }

                        } else {
                            for (let i = 0; i < userRecord.length; i++) {
                                userNetwork.updateMany({ _id: mongoose.Types.ObjectId(userRecord[i]._id), network: mongoose.Types.ObjectId(userRecord[i].network) }, { status: "0" }, function (err, data) {
                                    console.log(err, data, 'err,data', i, userRecord[i].network);
                                    if (err)
                                        error = err;

                                    if (i == userRecord.length - 1) {
                                        if (error) {
                                            res.json({
                                                code: 201,
                                                message: error
                                            });
                                        }
                                        else {
                                            res.json({
                                                code: 200,
                                                message: 'Status updated successfully.'
                                            });
                                        }

                                    }
                                });

                            }
                        }
                    }
                    else {
                        res.json({
                            code: 200,
                            data: [],
                            message: 'No record found'
                        });
                    }
                }
            })
    })



    // req.body.network.forEach(function (item) {
    //     network_length += 1;
    //     if (item) {

    //         userNetwork.findOne({
    //             userId: mongoose.Types.ObjectId(req.body.userId),
    //             network: mongoose.Types.ObjectId(item)
    //         }, function (err, userRecord) {
    //             if (err) {
    //                 if (network_length >= (req.body.network.length + 1)) {
    //                     res.json({
    //                         code: 201,
    //                         message: 'Request could not be processed. Please try again.'
    //                     });
    //                 }

    //             } else {

    //                 if (userRecord) {
    //                     //update
    //                     var updateUserRecord = {
    //                         status: userRecord.status
    //                     }

    //                     userNetwork.update({
    //                         _id: mongoose.Types.ObjectId(userRecord._id)
    //                     }, {
    //                             $set: updateUserRecord
    //                         }, function (err) {
    //                             if (err) {

    //                                 if (network_length >= (req.body.network.length + 1)) {
    //                                     res.json({
    //                                         code: 201,
    //                                         message: 'Request could not be processed. Please try again.'
    //                                     });
    //                                 }

    //                             } else {

    //                                 if (network_length >= (req.body.network.length + 1)) {
    //                                     res.json({
    //                                         code: 200,
    //                                         message: 'Status updated successfully.'
    //                                     });
    //                                 }

    //                             }
    //                         });

    //                 } else {
    //                     //insert

    //                     if (req.body.flag == 'user') {
    //                         req.body.status = '1'
    //                     }
    //                     if (req.body.flag == 'superadmin') {
    //                         req.body.status = '0'
    //                     }
    //                     var userNetworkArr = new userNetwork({
    //                         userId: req.body.userId,
    //                         network: item,
    //                         status: req.body.status,
    //                         createdById: req.body.userId,
    //                         createdBy: "user"
    //                     });
    //                     userNetworkArr.save(function (err) {
    //                         if (err) {
    //                             if (network_length >= (req.body.network.length + 1)) {

    //                                 res.json({ code: 401, message: 'Request could not be processed. Please try again.', data: {} });
    //                             }
    //                         } else {
    //                             if (network_length >= (req.body.network.length + 1)) {

    //                                 res.json({
    //                                     code: 200,
    //                                     message: 'Status inserted successfully.'
    //                                 });
    //                             }
    //                         }
    //                     });


    //                 }

    //             }
    //         });

    //     }

    // })



}

function migrateData(req, res) {

    User.find({ network: { $exists: true }, $where: 'this.network.length > 0' }, function (err, result) {

        result.forEach(function (item) {
            item.network.forEach(function (item1) {
                let userNetworkArr = new userNetwork({
                    userId: item._id,
                    network: item1,
                    status: "0",
                    createdBy: item.createdBy
                });
                userNetworkArr.save(function (err, finalResult) {

                })
            })

        })

    })

}
