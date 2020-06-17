'use strict';

var mongoose        = require('mongoose'),
    hospitalModel   = mongoose.model('hospitals'),
    constant        = require('../lib/constants'),
    utility         = require('../lib/utility.js');

    module.exports  = {
                        addHospital         : addHospital,
                        getHospitalList     : getHospitalList,
                        getHospital         : getHospital,
                        deleteHospital      : deleteHospital,
                        getHospitalByState  : getHospitalByState,
                    };

/**
 * Add/update Hospital
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 18-12-2017
 */
function addHospital(req, res) {
    if(!Array.isArray(req.body)){
        req.body = [req.body]
    }
    var dataArr = [];
    var states = constant.states1d;
    req.body.forEach((item) => {
        if(item.hasOwnProperty('hospital_name') || item.hasOwnProperty('HospitalName')){
            var iteration           = {};
            var name                = (item.hasOwnProperty('hospital_name'))?item.hospital_name:item.hasOwnProperty('HospitalName')?item.HospitalName:'';
            iteration.hospital_name = name;
            iteration.searchKey     = name.replace(/\s+/g, '');
            if((item.phone_no && item.phone_no.length ===10) || (item.PhoneNo && item.PhoneNo.length ===10)){
                var ccode           = (item.ccode)?item.ccode:'+1';
                var phno            = (item.phone_no)?item.phone_no:item.PhoneNo;
                iteration.phone_no  = ccode +phno ;
            }
            if(item.hasOwnProperty('RegistrationNo') || item.hasOwnProperty('reg_no')){}
            if(item.hasOwnProperty('address') || item.hasOwnProperty('Address')){}
            var state           = (item.state)? item.state:(item.State)?item.State:'';
            iteration.reg_no    = (item.hasOwnProperty('RegistrationNo'))? item.RegistrationNo:(item.hasOwnProperty('reg_no'))?item.reg_no:'';
            iteration.address   = (item.hasOwnProperty('address'))? item.address:(item.hasOwnProperty('Address'))?item.Address:''
            iteration.city      = (item.city)?item.city:(item.City)?item.City:'';
            iteration.state     = (state) ? states.hasOwnProperty(state.toUpperCase()) ? state.toUpperCase() : '' : '';

            // If this is an update request
            if(item.hasOwnProperty('_id') && item.hasOwnProperty('hospital_name')) {
                hospitalModel.update({ _id: mongoose.Types.ObjectId(item._id) }, { $set: iteration }, function(err) {
                    if (err) {
                        res.json({ code: 401, message: "Data not Addded" })
                    } else {
                        res.json({ code: 200, message: "Hospital updated successfully.", data: {} })
                    }
                });
            } else {
                dataArr.push(iteration);
            }
        }
    })
    if(dataArr && dataArr.length>0){
        hospitalModel.insertMany(dataArr)
        .then(function(mongooseDocuments) {
             res.json({ code: 200, message: "Hospital added successfully.", data: {}, count: mongooseDocuments.length })
        })
        .catch(function(err) {
            res.json({ code: 401, message: "Data not Addded" })
            /* Error handling */
        });
    }
}
/**
 * get hospital details
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 18-12-2017
 */

function getHospitalList(req, res) {
    var count       = req.body.count ? req.body.count : 0;
    var skip        = req.body.count * (req.body.page - 1);
    var sorting     = req.body.sorting ? req.body.sorting : { _id: -1 };
    var sorting     = utility.getSortObj(req.body);
    var condition   = {};
    if (req.body.searchText) {
        var searchText  = req.body.searchText.toLowerCase();
        var searchText  = (searchText);
        condition.$or   = [
                            { 'searchKey'   : new RegExp(searchText, 'gi') },
                            { 'phone_no'    : new RegExp(searchText, 'gi') },
                            { 'address'     : new RegExp(searchText, 'gi') },
                            { 'city'        : new RegExp(searchText, 'gi') },
                            { 'state'       : new RegExp(searchText, 'gi') },
                            { 'reg_no'      : new RegExp(searchText, 'gi') }
                        ];
    }
    hospitalModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean().exec(function(err, data) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Internal error'
                }); 
            } else if (data) {
                hospitalModel.find(condition)
                    .count()
                    .exec(function(err, totalCount) {
                        if (err) {
                            res.json({
                                code: 201,
                                message: 'Internal Error'
                            })
                        } else {
                            res.json({
                                code        : 200,
                                data        : data,
                                totalCount  : totalCount,
                                message     : 'Data retrieved',
                            })
                        }
                    });
            } else {
                res.json({

                    code    : 201,
                    message : 'No data found'
                })
            }
        })
}

/**
 * get hospital by Id
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 18-12-2017
 */
function getHospital(req, res) {
    var condition = {};
    if (req.swagger.params.id.value != '000') {
        condition = { _id: req.swagger.params.id.value };
    }
    hospitalModel.findOne(condition)
        .lean()
        .sort({ name: 1 })
        .exec(function(err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...' });
            } else {
                res.json({ code: 200, message: 'success', data: info });
            }
        });
}

/**
* Get Hospital by state
* Created By Suman Chakraborty
* last Modified on 20-12-2017
*/
function getHospitalByState(req, res) {
    hospitalModel.find({ state: req.body.state })
        .lean()
        .sort({ name: 1 })
        .exec(function(err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...' });
            } else {
                res.json({ code: 200, message: 'success', data: info });
            }
        });
}

/**
 * Delete hospital
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 18-12-2017
 */
function deleteHospital(req, res) {
    hospitalModel.remove({ _id: mongoose.Types.ObjectId(req.body.id) }, function(err, response) {
        if (err) {
            res.json({ code: 401, message: 'Unable to process your request please try again.' });
        } else {
            res.json({
                code: 200,
                message: 'Deleted Successfully',
            });
        }
    })
}