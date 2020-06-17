'use strict';
var mongoose = require('mongoose'),
    phiLogModel = mongoose.model('logPhiAccess'),
    referralsModel = mongoose.model('refers'),
    userActvModel = mongoose.model('logUserActivity'),
    UserModel = mongoose.model('user'),
    invitationLogReferralModel = mongoose.model('invitationLogReferral'),
    utility = require('../lib/utility.js');
module.exports = {
    getPhiLog: getPhiLog,
    getUserActvLog: getUserActvLog,
    getInvitationLog: getInvitationLog,
    getInvitationList: getInvitationList,
    getInvitationListById: getInvitationListById,
    getSuperAdminId: getSuperAdminId,
    getReferralsList: getReferralsList,
    exportReferralsList: exportReferralsList,
}

/**
* Get PHI access log
* Created By Suman Chakraborty
* Last modified on 07-12-2017
*/
function getPhiLog(req, res) {
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var sorting = utility.getSortObj(req.body);
    var condition = {};
    // based on date range selection update contact details
    if (req.body.dateRange) {
        condition.accessOn = { $lte: req.body.dateRange.end, $gte: req.body.dateRange.start };
    }
    phiLogModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .populate('accessBy')
        .populate('patientId')
        .lean()
        .exec(function (err, resp) {
            if (!err) {
                if (resp) {
                    var respArr = [];
                    phiLogModel.find(condition)
                        .count()
                        .exec(function (err, totalCount) {
                            if (err) {
                                res.json({
                                    code: 201,
                                    message: 'Internal Error'
                                })
                            } else {
                                // console.log("respArr ",respArr)
                                res.json({
                                    code: 200,
                                    message: 'Data retrieved',
                                    data: respArr,
                                    totalCount: totalCount
                                })
                            }
                        });
                    resp.forEach(item => {
                        let ite = {
                            _id: item._id,
                            patientName: (item.patientId) ? utility.getDecryptText(item.patientId.firstName) + " " + utility.getDecryptText(item.patientId.lastName) : '',
                            accessBy: (item.accessBy) ? item.accessBy.firstname + ' ' + item.accessBy.lastname : '',
                            activityDetail: item.activityDetail,
                            accessOn: item.accessOn
                        };
                        respArr.push(ite);
                    })
                } else {
                    res.json({
                        code: 201,
                        message: 'No data found'
                    })
                }
            } else {
                res.json({
                    code: 201,
                    message: 'Internal error'
                });
            }
        })
}


/**
* Get User activity log
* Created By Suman Chakraborty
* Last modified on 07-12-2017
*/
function getUserActvLog(req, res) {
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var sorting = utility.getSortObj(req.body);
    var condition = {};
    // based on date range selection update contact details
    if (req.body.dateRange) {
        condition.createdOn = { $lte: req.body.dateRange.end, $gte: req.body.dateRange.start };
    }
    console.log("=====",req.body)
    userActvModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .populate('userId')
        .lean()
        .exec(function (err, resp) {
            if (!err) {
                if (resp) {
                    var respArr = [];
                    userActvModel.find(condition)
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
                                    message: 'Data retrieved',
                                    data: respArr,
                                    totalCount: totalCount
                                })
                            }
                        });
                    resp.forEach(item => {
                        let ite = {
                            _id: item._id,
                            name: (item.userId) ? item.userId.firstname + ' ' + item.userId.lastname : '',
                            detail: item.detail,
                            status: (item.success) ? 'Success' : 'Failure',
                            createdOn: item.createdOn
                        };
                        respArr.push(ite);
                    })
                } else {
                    res.json({
                        code: 201,
                        message: 'No data found'
                    })
                }
            } else {
                res.json({
                    code: 201,
                    message: 'Internal error'
                });
            }
        })
}


/** var count=result.length;
* Get all invitation list who have invited to provider
* Created By suman
* Last Modified on 02-11-2018
*/
function getInvitationList(req, res) {

    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var sorting = utility.getSortObj(req.params);

    var condition = {};
    if (req.swagger.params['id']['value'] !== 'undefined') {
        condition = { sentTo: mongoose.Types.ObjectId(req.swagger.params.id.value) };
    }

    if (req.body.dateRange) {
        condition.invitationDate = { $lte: req.body.dateRange.end, $gte: req.body.dateRange.start };
    }
    invitationLogReferralModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .populate('sentTo', 'gender firstname lastname email phone_number centername')
        .populate('sentBy', 'gender  firstname lastname email phone_number centername')

        .exec(function (err, resp) {

            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {

                invitationLogReferralModel.find(condition)
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
                                message: 'User fetched successfully.',
                                data: resp,
                                totalCount: totalCount
                            })
                        }
                    });

            }
        });
}



function getInvitationListById(req, res) {

    invitationLogReferralModel.find({ sentTo: mongoose.Types.ObjectId(req.swagger.params.id.value) })
        .populate('sentTo', 'firstname lastname email phone_number centername')

        .exec(function (err, resp) {

            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'User fetched successfully.',
                    data: resp
                });
            }
        });
}

function getSuperAdminId(req, res) {

    var userTypecond = 'superAdmin';
    UserModel.findOne({ userType: userTypecond })

        .exec(function (err, resp) {

            if (err) {
                res.json({
                    code: 201,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'User fetched successfully.',
                    data: resp
                });
            }
        });
}


/**
* Get User invitation log
* Created By suman
* Last modified on 01-11-2018
*/
function getInvitationLog(req, res) {

    var count = req.body.count ? req.body.count : 0
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };

    var condition = {};
    // based on date range selection update contact details
    if (req.body.dateRange) {
        //condition.invitationDate = { $lte: new Date(req.body.dateRange.end), $gte: new Date(req.body.dateRange.start) };
    }

    const aggregate = [
        { $match: condition },

        {
            $lookup: {
                from: "users", localField: "sentTo",
                foreignField: "_id", as: "sentTo"
            }
        },
        {
            $group: { _id: "$sentTo", count: { $sum: 1 } }
        }

    ];
    aggregate.push({ $sort: sorting })
    aggregate.push({ $skip: skip })
    aggregate.push({ $limit: parseInt(count) })
    invitationLogReferralModel.aggregate(aggregate)
        .then(function (results) {
            if (results) {
                if (results) {
                    var respArr = [];
                    results.forEach((item, index) => {
                        if (item._id[0]) {
                            let ite = {
                                _id: item._id[0]._id,
                                providerName: item._id[0]._id ? item._id[0].firstname + ' ' + item._id[0].lastname : '',
                                providerEmail: item._id[0]._id ? item._id[0].email : '',
                                sentTo: item._id[0]._id,
                                count: item.count

                            };
                            //})
                            respArr.push(ite);

                        }
                    });
                    //Counting records
                    invitationLogReferralModel.aggregate([
                        { $match: condition },
                        {
                            $lookup: {
                                from: "users", localField: "sentTo",
                                foreignField: "_id", as: "sentTo"
                            }
                        },
                        { $group: { _id: "$sentTo", count: { $sum: 1 } } },


                    ])
                        .then(function (totalCount) {

                            if (totalCount) {
                                res.json({
                                    code: 200,
                                    message: 'Data retrieved',
                                    data: respArr,
                                    totalCount: (totalCount instanceof Array) ? totalCount.length : 0
                                })
                            } else {

                                res.json({
                                    code: 201,
                                    message: 'No data found'
                                })
                            }


                        })




                } else {
                    res.json({
                        code: 201,
                        message: 'Internal error'
                    });
                }

            } else {
                res.json({
                    code: 201,
                    message: 'No data found'
                })
            }
        })


}

/**
* Get Referrals access log
* Created By Suman Chakraborty
* Last modified on 21-03-2018
*/
function getReferralsList(req, res) {
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);

    let sorting = {};
    if (req.body.sortValue && req.body.sortOrder) {
        sorting[req.body.sortValue] = req.body.sortOrder;
    } else {
        sorting = { _id: -1 };
    }

    var condition = {};
    condition.isDeleted = false;
    // based on date range selection update contact details
    if (req.body.dateRange) {
        condition.referredDate = { $lte: req.body.dateRange.end, $gte: req.body.dateRange.start };
    }
    console.log("condition",req.body.dateRange)
    referralsModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .populate('network')
        .populate('specialities')
        .populate('services')
        .populate('referredBy')
        .populate('referredTo')
        .populate('frontDeskReferredBy')
        .lean()
        .exec(function (err, resp) {
            if (!err) {
                if (resp) {
                    var respArr = [];
                    referralsModel.find(condition)
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
                                    message: 'Data retrieved',
                                    data: resp,
                                    totalCount: totalCount
                                })
                            }
                        });
                } else {
                    res.json({
                        code: 201,
                        message: 'No data found'
                    })
                }
            } else {
                res.json({
                    code: 201,
                    message: 'Internal error'
                });
            }
        })
}





function exportReferralsList(req, res) {
    var condition = {};
    condition.isDeleted = false;
    // based on date range selection update contact details
    if (req.body) {
        condition.referredDate = { $lte: req.body.end, $gte: req.body.start };
    }
    referralsModel.find(condition)
        .populate('network')
        .populate('specialities')
        .populate('services')
        .populate('referredBy')
        .populate('referredTo')
        .populate('frontDeskReferredBy')
        .lean()
        .exec(function (err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...' });
            } else {
                res.json({ code: 200, message: 'success', data: info });
            }
        });
}