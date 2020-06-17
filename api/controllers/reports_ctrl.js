'use strict';
var mongoose    = require('mongoose'),
    User        = mongoose.model('user'),
    Referral    = mongoose.model('refers');
var logReferral = mongoose.model('logReferral');
var utility     = require('../lib/utility.js');
module.exports  = {
                    getReferralLog      : getReferralLog,
                    getReferralList     : getReferralList,
                    getReferralDetail   : getReferralDetail,                 
                };

function getReferralDetail(req, res) {
    // If details are not required then no need to populate details
    // This is executed when user select update referral for showing existing sepcialty, service etc
    if(req.body.noDetails){
        Referral.findOne({ _id: mongoose.Types.ObjectId(req.body.id) }, {})
        .exec(function (err, refInfo) {
            if (err) {
                res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
            } else {
                res.json({ code: 200, message: 'success', data: refInfo });
            }
        });
    }else {
        // Update last view date for doctor and return the result
        // reqType 1= inbound referral 2 = outbound referral
        var updateObj={};
        if(req.body.reqType === 1){
            updateObj = {refToOprTime: new Date()}
        }else if(req.body.reqType === 2){
            updateObj = {refByOprTime: new Date()}
        }
        Referral.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, {$set:updateObj})
        .populate('referredTo')
        .populate('referredBy')
        .populate('frontDeskReferredBy')
        .populate('patientInfo')
        .populate('services')
        .populate('specialities')
        .exec(function (err, refInfo) {
            if (err) {
                res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
            } else {
                refInfo.patientInfo.lastName    = utility.getDecryptText(refInfo.patientInfo.lastName);
                refInfo.patientInfo.firstName   = utility.getDecryptText(refInfo.patientInfo.firstName);
                refInfo.patientInfo.contact_no  = utility.getDecryptText(refInfo.patientInfo.contact_no);
                refInfo.patientInfo.email       = utility.getDecryptText(refInfo.patientInfo.email);
                refInfo.other = (refInfo.other)? utility.getDecryptText(refInfo.other):'';
                // 
                res.json({ code: 200, message: 'success', data: refInfo });
            }
        });
    }
}


function getReferralLog(req, res) {
    logReferral.find({ referralId: req.body.id }, { updateOn: 1, status: 1, updatedBy: 1 })
        .populate('updatedBy')
        .exec(function (err, refInfo) {
            if (err) {
                res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
            } else {
                res.json({ code: 200, message: 'success', data: refInfo });
            }
        });
}

/**
 * Get referral details
 * last modified on 01-08-2017
 */
function getReferralList(req, res) {
    var specCond    = {};
    var count       = parseInt(req.body.count ? req.body.count : 0);
    var skip        = parseInt(req.body.count * (req.body.page - 1));
    var sorting     = req.body.sorting ? req.body.sorting : { referredDate: -1 };
    var condition   = {};
    var sorting     = utility.getSortObj(req.body);
    // Search conditions
    if (typeof req.body.referredBy !== 'undefined') {
        condition.referredBy = mongoose.Types.ObjectId(req.body.referredBy);
    }
    if (typeof req.body.referredTo !== 'undefined') {
        condition.referredTo = mongoose.Types.ObjectId(req.body.referredTo);
    }
    if (typeof req.body.fromDate !== 'undefined' && typeof req.body.toDate !== 'undefined') {
        condition.referredDate = { "$gte": new Date(req.body.fromDate), "$lt": new Date(req.body.toDate) };
    }
    var searchText = req.body.searchText;
    if (req.body.searchText) {
        condition.$or = [
                            { 'insfirstname'            : new RegExp(searchText, 'gi') },
                            { 'inslastname'             : new RegExp(searchText, 'gi') },
                            { 'referredToInfo.lastname' : new RegExp(searchText, 'gi') },
                            { 'referredByInfo.lastname' : new RegExp(searchText, 'gi') },
                            { 'status'                  : new RegExp(searchText, 'gi') }
                        ];
    }
    let aggregate = [{
        $lookup: {
            from        : 'users',
            localField  : "referredTo",
            foreignField: "_id",
            as          : "referredToInfo"
        },
    },
    {
        $lookup: {
            from        : 'users',
            localField  : "referredBy",
            foreignField: "_id",
            as          : "referredByInfo"
        },
    },
    { $match: condition },
    { $sort : sorting },

    {
        $group: {
            _id: '$_id',
            firstName       : { $first: '$firstName' },
            insfirstname    : { $first: '$insfirstname' },
            lastName        : { $first: '$lastName' },
            inslastname     : { $first: '$inslastname' },
            status          : { $first: '$status' },
            referredDate    : { $first: '$referredDate' },
            referredByUser  : { $first: '$referredByInfo.lastname' },
            referredToUser  : { $first: '$referredToInfo.lastname' },
        }
    },
    { $unwind: { path: "$referredByUser", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$referredToUser", preserveNullAndEmptyArrays: true } },
    {
        $project: {
            firstName           : 1,
            insfirstname        : { "$toLower": "$firstName" },
            lastName            : 1,
            inslastname         : { "$toLower": "$lastName" },
            status              : 1,
            referredByUser      : 1,
            referredDate        : 1,
            insreferredByUser   : { $toLower: "$referredByUser" },
            referredToUser      : 1,
            insreferredToUser   : { $toLower: "$referredToUser" },
        }
    },
    ];
    var aggregateCnt = [].concat(aggregate);
    if (req.body.count && req.body.page) {
        aggregate.push({ $sort: sorting });
        aggregate.push({ $skip: skip });
        aggregate.push({ $limit: count });
    }
    Referral.aggregate(aggregate).exec(function (err, userData) {
        if (err) {
            res.json({ code: 201, message: 'internal error.', data: err });
        } else if (userData) {
            aggregateCnt.push({ $group: { _id: null, count: { $sum: 1 } } });
            Referral.aggregate(aggregateCnt).exec(function (err, userDataCount) {
                if (err) {
                    res.json({ code: 201, message: 'internal error.', data: {} });
                } else if (userDataCount) {
                    return res.json({
                        code        : 200,
                        message     : 'Data retrieved successfully',
                        data        : userData,
                        totalCount  : ((userDataCount[0]) ? userDataCount[0].count : 0)
                    });
                }
            })
        }
    })
}