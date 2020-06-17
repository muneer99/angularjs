'use strict';

var mongoose = require('mongoose'),
    PatientModel = mongoose.model('patients'),
    referModel = mongoose.model('refers'),
    logReferral = mongoose.model('logReferral'),
    invitationLogReferral = mongoose.model('invitationLogReferral'),
    notificationSuperAdminTemplate = mongoose.model('notificationSuperAdmin'),
    UserModel = mongoose.model('user'),
    mailTemplate = mongoose.model('mailtemplates'),
    utility = require('../lib/utility.js');
var socket;
module.exports = {

    addPatient: addPatient,
    getPatient: getPatient,
    referPatients: referPatients,
    updatePatient: updatePatient,
    deletePatient: deletePatient,
    searchPatients: searchPatients,
    updateReferral: updateReferral,
    getPatientList: getPatientList,
    getPatientById: getPatientById,
    getReferralHistory: getReferralHistory,
    getReferredCounts: getReferredCounts,
    updatePatientStatus: updatePatientStatus,
    socketIO: socketIO,
    updateReferralDetail: updateReferralDetail
};
var fieldNotToSkip = ['_id', 'network', 'referredTo', 'referredBy', 'patientInfo', 'services', 'specialities', 'createdAt', 'updatedAt', 'status', 'createdBy', 'accessableBy'];
/**
 * Function is use to add patient information
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 8-July-2017
 */
function addPatient(req, res) {
    if (typeof req.body._id === 'undefined') {
        req.body.firstName = (req.body.firstName) ? req.body.firstName : req.body.firstName;
        req.body.lastName = (req.body.lastName) ? req.body.lastName : req.body.lastName;
        req.body.city = (req.body.city) ? req.body.city : req.body.city;
        req.body.createdBy = (req.body.createdBy) ? req.body.createdBy : '';
        req.body.accessableBy = (req.body.createdBy) ? [req.body.createdBy] : [];
        req.body.email = (req.body.email) ? req.body.email.toLowerCase() : req.body.email;
        var encrytedPatientObj = utility.encryptedRecord(req.body, fieldNotToSkip);
        var patientsData = new PatientModel(encrytedPatientObj);

        // call the built-in save method to save to the database

        patientsData.save(function (err, patientsData) {
            if (err) {
                res.json({ code: 201, 'message': 'Email already exists. ', data: err });
            } else {
                res.json({ code: 200, 'message': 'Patient added successfully.', id: patientsData._id });
            }
        });
    } else {
        // Update patient details 
        var patientId = req.body._id;
        req.body.firstName = (req.body.firstName) ? req.body.firstName : req.body.firstName;
        req.body.lastName = (req.body.lastName) ? req.body.lastName : req.body.lastName;
        req.body.city = (req.body.city) ? req.body.city : req.body.city;
        req.body.email = (req.body.email) ? req.body.email : req.body.email;
        var encrytedPatientObj = utility.encryptedRecord(req.body, fieldNotToSkip);
        delete req.body._id;
        PatientModel.update({ _id: mongoose.Types.ObjectId(patientId) }, { $set: encrytedPatientObj }, function (err) {
            if (err) {
                res.json({ code: 201, message: 'Email already exists.' });
            } else {
                res.json({ code: 200, 'message': 'Patient details updated', id: patientId });
            }
        })
    }
}
function updateReferral(req, res) {
    referModel.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { attachment: 1 }, function (err, resp) {
        if (!err) {
            var currentTime = new Date();
            resp.attachment += ',' + req.body.attachment;
            var updateObj = {
                attachment: resp.attachment,
                lastOperationOn: currentTime,
            };

            // Update last access time of the user who is updating the record and last operation time of this referral
            if (req.body.reqType === 1) {
                updateObj.refToOprTime = currentTime;
            } else if (req.body.reqType === 2) {
                updateObj.refByOprTime = currentTime;
            }
            referModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: updateObj }, { fields: { patientInfo: 1, referredTo: 1, referredBy: 1 } })
                .populate('referredTo')
                .populate('referredBy')
                .exec(function (err, doc) {
                    if (!err) {

                        res.json({ code: 200, message: 'Success', data: doc });
                    } else {
                        res.json({ code: 401, message: "Unable to process your requiest.", data: err });
                    }
                })

        } else {
            res.json({ code: 401, message: "Unable to process your requiest.", data: err });
        }
    })
}

function updateReferralDetail(req, res) {
    if (req.body._id) {
        var _id = req.body._id;
        delete req.body._id;
        // Update with server date
        var curDate = new Date()
        if (req.body.lastOperationOn) {
            req.body.lastOperationOn = curDate;
        }
        if (req.body.refToOprTime) {
            req.body.refToOprTime = curDate;
        }
        if (req.body.refByOprTime) {
            req.body.refByOprTime = curDate;
        }
        referModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, { $set: req.body }, function (err, doc) {
            if (!err) {
                res.json({ code: 200, message: 'Success', data: doc });
            } else {
                res.json({ code: 401, message: "Unable to process your requiest.", data: err });
            }
        })
    } else {
        res.json({ code: 401, message: "Unable to process your requiest." });
    }
}
/**
* prototyping for socket io
* Created By Prakash Kumar Soni
* Last modified on 06-04-2018
*/

function socketIO(getSocket, data) {
    socket = getSocket;
    this.data = data;
    this.broadcast = function (socket, data) {
        socket.emit('broadcast', data);
    }
}

function referPatients(req, res) {


    if (req.body.services === 1) {
        delete req.body.services;
    }
    req.body.lastOperationOn = new Date();
    if (req.body.selfRefer) {
        req.body.refToOprTime = new Date();
        req.body.refByOprTime = new Date(Date.now() - 1000 * 60);
    } else {
        req.body.refByOprTime = new Date();
        req.body.refToOprTime = new Date(Date.now() - 1000 * 60);
    }
    var fieldSkip = ['attachment', 'serviceName', 'chiefComplain', 'network', 'patientInfo', 'referredBy', 'frontDeskReferredBy', 'referredTo', 'services', 'specialities', 'lastOperationOn', 'refToOprTime', 'refByOprTime'];
    var encrytedPatientObj = utility.encryptedRecord(req.body, fieldSkip);



    var referData = new referModel(encrytedPatientObj);




    referData.save(function (err, referData) {

        if (err) {
            res.json({ code: 401, 'message': 'Request could not be processed. Please try again.', data: err });
        } else {
            PatientModel.update({ _id: mongoose.Types.ObjectId(req.body.patientInfo) }, { $addToSet: { accessableBy: { $each: [req.body.referredBy, req.body.referredTo] } } }, function (err) {
                if (err) {
                    res.json({ code: 401, message: "Unable to process your requiest.", data: err });
                } else {
                    var logData = new logReferral({ referralId: referData._id, updatedBy: req.body.referredBy });
                    logData.save(function (err, res) {
                        if (err) { }
                    })


                    //start  for invitation log @invitationLogReferral 
                    var cond = { _id: req.body.referredBy };
                    UserModel.findOne(cond).exec(function (err, userRecords) {
                        if (err) {
                            res.json({ code: 323, message: "Unable to fetch Record", data: err });
                        } else {

                            if ((userRecords.isRegistered == false)) {

                                var invitationLogData = new invitationLogReferral({ sentBy: req.body.referredTo, sentTo: req.body.referredBy });
                                invitationLogData.save(function (err, res) {
                                    if (err) {
                                        res.json({ code: 401, message: "Unable to process your invitation log request.", data: err });
                                    }
                                    // to get invitation count start
                                    var condlog = { sentTo: req.body.referredBy };
                                    invitationLogReferral.find(condlog)
                                        .populate('sentTo', 'firstname lastname email phone_number centername')

                                        .exec(function (err, resp) {

                                            if (err) {
                                                resp.json({
                                                    code: 201,
                                                    message: 'Request could not be processed. Please try again.'
                                                });
                                            } else {
                                                var notificationCount = resp.length;
                                                if (resp.length >= 5) {

                                                    // to get superadmin id
                                                    var userTypecond = 'superAdmin';
                                                    UserModel.findOne({ userType: userTypecond })

                                                        .exec(function (err, resp2) {

                                                            if (err) {
                                                                resp2.json({
                                                                    code: 201,
                                                                    message: 'Request could not be processed. Please try again.'
                                                                });
                                                            } else {
                                                                // code code for the email template start

                                                                var cond = { key: 'notification_superadmin' };
                                                                mailTemplate.findOne(cond).exec(function (err, templateRecords) {
                                                                    if (err) {
                                                                        res.json({ code: 323, message: "Unable to fetch Record", data: err });
                                                                    } else {


                                                                        var replaceObj = {
                                                                            "{{fromSvpEmail}}": resp[0].sentTo.email,
                                                                            "{{fromSvpFname}}": resp[0].sentTo.firstname,
                                                                            "{{fromSvpLname}}": resp[0].sentTo.lastname,
                                                                            "{{notificationCount}}": notificationCount
                                                                        };
                                                                        var mailOptions = {};
                                                                        var notificationreq = {
                                                                            subject: mailOptions.subject,
                                                                            body: mailOptions.body,
                                                                            sentTo: resp2._id
                                                                        };
                                                                        mailOptions.subject = utility.replaceString(templateRecords.subject, replaceObj);
                                                                        mailOptions.body = utility.replaceString(templateRecords.body, replaceObj);

                                                                        var notificationreq = { subject: mailOptions.subject, body: mailOptions.body, sentTo: resp2._id };

                                                                        var notification = new notificationSuperAdminTemplate(notificationreq);
                                                                        notification.save(function (err, notificationData) {
                                                                            if (err) {
                                                                                resp.json({ code: 200, message: 'Updated successfully', _id: notification._id });
                                                                            } else {


                                                                            }
                                                                        }); 

                                                                    }
                                                                })

                                                                

                                                            }
                                                        });
                                                } 


                                            }
                                        });
                                    

                                })
                            }
                        }
                    });

                    res.json({ code: 200, 'message': 'Item added successfully.', id: referData._id });
                }
            })
        }
    });
}

/**
 * Function is use to get patient information for referral
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 10-July-2017
 */
function getPatient(req, res) {
    var fname = req.body.firstName ? utility.getEncryptText(req.body.firstName) : '';
    var lname = req.body.lastName ? utility.getEncryptText(req.body.lastName) : '';
    var subArr = {};
    if (typeof req.body.accessableBy === 'string') {
        subArr = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.accessableBy) } };
    } else if (typeof req.body.accessableBy === 'object') {
        subArr = { $elemMatch: { $in: req.body.accessableBy.map(function (item) { return mongoose.Types.ObjectId(item) }) } };
    }
    if (lname != '') {
        if (fname != '') {
            var cond = { 'firstName': { "$regex": fname, "$options": "i" }, 'lastName': { "$regex": lname, "$options": "i" }, status: '1' };
            if (Object.keys(subArr).length > 0) {
                cond.accessableBy = subArr;
            }
            PatientModel.find(cond).exec(function (err, userRecords) {
                if (err) {
                    res.json({ code: 323, message: "Unable to fetch Record", data: err });
                } else {
                    utility.decryptedRecord(userRecords, fieldNotToSkip, function (patientRecord) {
                        if (patientRecord) {
                            res.json({ code: 200, message: 'Patient info fetched successfully.', data: patientRecord });
                        } else {
                            res.json({ code: 200, message: 'No data found', data: {} });
                        }
                    })
                }
            });
        } else {
            var cond = { 'lastName': { "$regex": lname, "$options": "i" }, status: '1' };
            if (Object.keys(subArr).length > 0) {
                cond.accessableBy = subArr;
            }
            PatientModel.find(cond).exec(function (err, userRecord) {
                if (err) {
                    res.json({ code: 323, message: "Unable to fetch Record", data: {} });
                } else {
                    utility.decryptedRecord(userRecord, fieldNotToSkip, function (patientRecord) {
                        if (patientRecord) {
                            res.json({ code: 200, message: 'Patient info fetched successfully.', data: patientRecord });
                        } else {
                            res.json({ code: 200, message: 'No data found', data: {} });
                        }
                    })
                }
            });
        }
    } else {
        var cond = { 'firstName': { "$regex": fname, "$options": "i" }, status: '1' };
        if (Object.keys(subArr).length > 0) {
            cond.accessableBy = subArr;
        }
        PatientModel.find(cond).exec(function (err, userRecord) {
            if (err) {
                res.json({ code: 323, message: "Unable to fetch Record", data: {} });
            } else {
                utility.decryptedRecord(userRecord, fieldNotToSkip, function (patientRecord) {
                    if (patientRecord) {
                        res.json({ code: 200, message: 'Patient info fetched successfully.', data: patientRecord });
                    } else {
                        res.json({ code: 200, message: 'No data found', data: {} });
                    }
                })
            }
        });
    }
}
/**
 * Function is use to get patient information for Listing(NgParams Without Listing)
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 24-July-2017
 */
function getPatientList(req, res) {
    var fieldNotToDecrypt = ['_id', 'network_data'];
    var count = req.body.count ? parseInt(req.body.count, 10) : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var sorting = utility.getSortObj(req.body);
    var condition = { isDeleted: false };
    if (req.body.reqUser) {
        condition.accessableBy = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.reqUser) } };
    }

    if (req.body.searchText) {
        var searchText = req.body.searchText;
        var searchText = (searchText);
        condition.$or = [
            { 'firstName': new RegExp(utility.getEncryptText(searchText), 'gi') },
            { 'lastName': new RegExp(utility.getEncryptText(searchText), 'gi') },
            { 'contact_no': new RegExp(utility.getEncryptText(searchText), 'gi') },
            { 'email': new RegExp(utility.getEncryptText(searchText), 'gi') },
        ];
    }
    let aggregate = [
        { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                firstName: 1,
                "insfirstname": { "$toLower": "$firstName" },
                lastName: 1,
                "inslastname": { "$toLower": "$lastName" },
                email: 1,
                contact_no: 1,
                isDeleted: 1,
                network: 1,
                status: 1,
                accessableBy: 1
            }
        },
        {
            $lookup: {
                as: "networkInfo",
                from: 'networks',
                localField: "network",
                foreignField: "_id",
            }

        },
        { $match: condition },
        { $sort: sorting },
        {
            $group: {
                _id: '$_id',
                firstName: { $first: '$firstName' },
                insfirstname: { $first: '$insfirstname' },
                lastName: { $first: '$lastName' },
                inslastname: { $first: '$inslastname' },
                contact_no: { $first: '$contact_no' },
                email: { $first: '$email' },
                status: { $first: '$status' },
                network_data: {
                    $push: {
                        networkInfo: '$networkInfo',
                    }
                }
            }
        }
    ];
    var aggregateCnt = [].concat(aggregate);
    if (req.body.count && req.body.page) {
        aggregate.push({ $sort: sorting });
        aggregate.push({ $skip: skip });
        aggregate.push({ $limit: count });
    }

    PatientModel.aggregate(aggregate).exec(function (err, userData) {
        if (err) {
            res.json({ code: 201, message: 'internal error.', data: {} });
        } else if (userData) {
            aggregateCnt.push({ $group: { _id: null, count: { $sum: 1 } } });
            PatientModel.aggregate(aggregateCnt).exec(function (err, userDataCount) {
                if (err) {
                    res.json({ code: 201, message: 'internal error.', data: {} });
                } else if (userDataCount) {
                    utility.decryptedRecord(userData, fieldNotToDecrypt, function (patientRecord) {
                        if (patientRecord) {
                            return res.json({
                                code: 200,
                                message: 'Data retrieved successfully',
                                data: patientRecord,
                                totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
                            });
                        } else {
                            res.json({ code: 200, message: 'No data found', data: {} });
                        }
                    })
                }
            })
        }
    })
}

function getPatientById(req, res) {
    var id = req.swagger.params.id.value;
    PatientModel.findOne({ _id: mongoose.Types.ObjectId(id) }, { firstName: 1, lastName: 1, email: 1, contact_no: 1, location: 1, sute: 1, city: 1, state: 1, zipcode: 1, network: 1 })
        .lean()
        .exec(function (err, patientInfo) {
            if (err) {
                res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
            } else {
                utility.decryptedRecord(patientInfo, fieldNotToSkip, function (patientRecord) {
                    if (patientRecord) {
                        res.json({ code: 200, message: 'Patient info fetched successfully.', data: patientRecord });
                    } else {
                        res.json({ code: 200, message: 'No data found', data: {} });
                    }
                })
            }
        });
}

function updatePatient(req, res) {
    var updatePatientRecord = {
        firstName: (req.body.firstName) ? utility.getEncryptText(req.body.firstName) : '',
        lastName: (req.body.lastName) ? utility.getEncryptText(req.body.lastName) : '',
        email: (req.body.email) ? utility.getEncryptText(req.body.email.toLowerCase()) : '',
        contact_no: (req.body.contact_no) ? utility.getEncryptText(req.body.contact_no) : '',
        location: (req.body.location) ? utility.getEncryptText(req.body.location.toLowerCase()) : '',
        sute: (req.body.sute) ? utility.getEncryptText(req.body.sute) : '',
        city: (req.body.city) ? utility.getEncryptText(req.body.city.toLowerCase()) : '',
        state: (req.body.state) ? utility.getEncryptText(req.body.state) : '',
        zipcode: (req.body.zipcode) ? utility.getEncryptText(req.body.zipcode) : '',
        network: req.body.network
    }
    PatientModel.findOne({ _id: { $ne: mongoose.Types.ObjectId(req.body._id) } }, function (err, patientData) {
        if (err) {
            res.json({
                code: 401,
                message: "Internal error"
            })
        } else {
            PatientModel.update({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: updatePatientRecord }, function (err) {
                if (err) {
                    res.json({ code: 401, message: 'Request could not be processed. Please try again.', data: err });
                } else {
                    res.json({ code: 200, message: 'Patient updated successfully.', id: req.body._id });
                }
            })
        }
    });
}


function deletePatient(req, res) {
    PatientModel.remove({ _id: mongoose.Types.ObjectId(req.body.id) }, function (err) {
        if (err) {
            res.json({ code: 401, message: 'Request could not be processed. Please try again.' });
        } else {
            res.json({ code: 200, message: 'Patient removed  from network.' });
        }
    });
}

function updatePatientStatus(req, res) {
    var updateUserRecord = {
        status: req.body.status
    }
    PatientModel.update({ _id: mongoose.Types.ObjectId(req.body.id) }, { $set: updateUserRecord }, function (err) {
        if (err) {
            res.json({ code: 401, message: 'Internal Error Occured' });
        } else {
            res.json({ code: 200, message: 'Status updated successfully.' });
        }
    });
}



/**
*Patients exact search
* @param Key in patients collection
* @val exact value 
*/
function searchPatients(req, res) {
    var key = req.body.param;
    var condition = { status: '1' };
    condition[key] = (req.body.val) ? utility.getEncryptText(req.body.val.toLowerCase()) : '';
    if (typeof req.body.accessableBy === 'string') {
        condition.accessableBy = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.accessableBy) } };
    } else if (typeof req.body.accessableBy === 'object') {
        condition.accessableBy = { $elemMatch: { $in: req.body.accessableBy.map(function (item) { return mongoose.Types.ObjectId(item) }) } };
    }
    PatientModel.findOne(condition, { firstName: 1, lastName: 1, email: 1, contact_no: 1, location: 1, sute: 1, city: 1, state: 1, zipcode: 1, network: 1 })
        .lean()
        .exec(function (err, patientInfo) {
            if (err) {
                res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
            } else {
                utility.decryptedRecord(patientInfo, fieldNotToSkip, function (patientRecord) {
                    if (patientRecord) {
                        res.json({ code: 200, message: 'Patient info fetched successfully.', data: patientRecord });
                    } else {
                        res.json({ code: 200, message: 'No data found', data: {} });
                    }
                })
            }
        });
}


/**
* Get referral history of a patient
* Created By Suman Chakraborty
* Last modified on 02-11-2017
*/
function getReferralHistory(req, res) {
    referModel.find({ patientInfo: req.body.id, isDeleted: false }, { network: 1, referredTo: 1, referredBy: 1, firstName: 1, lastName: 1, status: 1, services: 1, referredDate: 1 })
        .sort({ referredDate: -1 })
        .populate('referredTo')
        .populate('referredBy')
        .populate('services')
        .exec(function (err, referralData) {
            if (err) {
                res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
            } else {
                var resArr = referralData.map(function (item) { item.firstName = utility.getDecryptText(item.firstName); item.lastName = utility.getDecryptText(item.lastName); return item; });
                res.json({ code: 200, message: 'No data found', data: resArr });
            }
        });
}


/**
* Get referral history of a patient
* Created By Suman Chakraborty
* Last modified on 02-11-2017
*/
function getReferredCounts(req, res) {
    if (req.body.specialities.length == 0) {
        req.body.specialities = req.body.speciality;
    }
    var speciality = req.body.speciality;
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };

    var condition = { referredBy: mongoose.Types.ObjectId(req.body.referredBy), isDeleted: false };
    if (req.body.speciality) {
        condition.specialities = {
            $in: req.body.speciality.map(function (item) {
                return mongoose.Types.ObjectId(item)
            })
        }
    }
    let aggregate = [
        {
            $match: condition
        },
        {
            $project: {
                network: 1, specialities: 1, referredTo: 1, referredBy: 1, status: 1, services: 1, referredDate: 1
            }
        },
        {
            $lookup: {
                as: "referredTo",
                from: 'users',
                localField: "referredTo",
                foreignField: "_id",
            }

        },
        {
            $lookup: {
                as: "referredBy",
                from: 'users',
                localField: "referredBy",
                foreignField: "_id",
            }

        },
        {
            $lookup: {
                from: 'specialities',
                localField: "specialities",
                foreignField: "_id",
                as: "specialityInfo"
            },

        },        
        { '$group': { _id: '$referredTo',count:{$sum:1 }} },
        {
            "$sort": { count: -1 }
        },

    ];


    referModel.aggregate(aggregate).exec(function (err, referralData) {
        if (err) {
            res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
        } else {
          
            var resArr = referralData.map(function (item) { item.firstName = utility.getDecryptText(item.firstName); item.lastName = utility.getDecryptText(item.lastName); return item; });
            res.json({ code: 200, message: 'Data found', data: resArr });
        }
    });
}


