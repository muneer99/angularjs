'use strict';

var mongoose = require('mongoose'),
    activeModel = mongoose.model('networks'),
    userNetworkModel = mongoose.model('userNetwork'),
    async = require('async'),
    utility = require('../lib/utility.js');
var co = require('co');

module.exports = {
    getUserNetwork: getUserNetwork,
    getUserSpecificNetworkData: getUserSpecificNetworkData,
    getNetwork: getNetwork,
    addNetwork: addNetwork,
    deleteNetwork: deleteNetwork,
    getNetworkList: getNetworkList,
    getSelectedNetwork: getSelectedNetwork
};


/**
 * Add/update Insurance Network
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 12-12-2017
 */
function addNetwork(req, res) {
    var dataArray = {};
    if (req.body.name) {
        var name = req.body.name.toLowerCase();
        req.body.searchKey = name.replace(/\s+/g, '');
    }
    if (req.body.hasOwnProperty('_id')) {
        var objId = req.body._id;
        delete req.body._id;
        activeModel.update({ _id: mongoose.Types.ObjectId(objId) }, { $set: req.body }, function (err) {
            if (err) {
                res.json({ code: 401, message: "Data not Addded" })
            } else {
                res.json({ code: 200, message: "Insurance updated successfully.", data: {} })
            }
        });
    } else {
        var str = req.body.name;
        if (str.indexOf(',') != -1) {
            var myarray = str.split(',');

            async.eachSeries(myarray, function (item, callback) {
                co(function* () {

                    var prefRat = {
                        name: item,
                        verified: false
                    }

                    var prefRatData = new activeModel(prefRat);

                    yield prefRatData.save(function (error, prefuserData) {
                        if (error) {
                            //console.log(error);
                        } else {
                            if (req.body.added_by) {
                                // sent email to whichdocs super admin

                                var obj = {
                                    name: item,
                                    provider_name: req.body.user_first_name + ' ' + req.body.user_last_name,
                                    message: 'Kindly approve it.'
                                }
                                var msg = "<b>&nbsp;</b>";
                                msg += "<b>Unlisted Insurance Request</b>";
                                msg += "<p>Insurance Name:&nbsp;" + obj.name + "</p>";
                                msg += "<p>Requested by provider :&nbsp;" + obj.provider_name + "</p>";
                                msg += "<p>&nbsp;" + obj.message + "</p><br />";

                                // info-whichdocs@yopmail.com
                                // info@whichdocs.com
                                utility.sendmail('iotiedsdn@gmail.com', 'Which Docs Unlisted Insurance requested', msg, function (err, res) {
                                    if (err) {
                                        console.log(error);
                                    } else {
                                        console.log(" res ", res);
                                        // return res.json({ code: 200, message: 'Thank you for added unlisted network. We will get in touch with you.' });
                                    }

                                });

                            }

                        }
                    });
                    // rating--;
                    callback();
                }).then(function (value) {
                    //console.log(value);
                }, function (err) {
                    console.error(err.stack);
                });
            }, function (err) {
                res.json({
                    code: 200,
                    message: "Insurance added successfully."
                });
            });




        } else {
            var network = new activeModel(req.body);

            network.save(function (err, data) {
                if (err) {
                    res.json({ code: 401, message: "Data not Addded" })
                } else {
                    res.json({ code: 200, message: "Insurance added successfully.", data: data })
                }
            });
        }
    }
}

/**
 * get service all or by ID Insurance Network
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 12-12-2017
 */
function getNetwork(req, res) {

    var condition = {};
   

    // console.log("req.body======>>",req.query.searchText);
    // console.log("req.swagger.params.id.value",condition);

    if (req.swagger.params.id.value != '000') {
        condition = { _id: req.swagger.params.id.value };
    } else {
        condition.verified = true;
    }
    // //code added by pooja
    if (req.query.searchText) {
        var searchText  = (req.query.searchText);
        condition.$or   = [
                { 'name': new RegExp(searchText, 'gi') },
                { 'searchKey': new RegExp(searchText.replace(/\s+/g, ''), 'gi') }
            ];
    }

    
    // //code added by pooja
    //     if (req.body.id != '000') {
    //         condition = { _id: req.body.id };
    //     } else {
    //         condition.verified = true;
    //     }

    activeModel.find(condition, { name: 1, desc: 1, searchKey: 1, email: 1, password: 1, passExpDate: 1, isLoggedIn: 1, privateGroup: 1, verified: 1 })
        .sort({ name: 1 })
        .collation({ locale: 'en' })
        .lean()
        .exec(function (err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...' });
            } else {

                if (info) {
                    res.json({
                        code: 200,
                        message: 'Data has been retrieved Successfully',
                        data_count: info.length,
                        data: info
                    });
                } else {
                   
                    res.json({ code: 201, message: 'No Record Available', data: {} });
                }

            }
        });
}
 
/**
 * Delete insurance network by ID Insurance Network
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 17-08-2017
 */
function deleteNetwork(req, res) {
    activeModel.remove({ _id: mongoose.Types.ObjectId(req.body.id) }, function (err, response) {
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

/**
 * get Insurance Network global search search
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 17-08-2017
 */

function getNetworkList(req, res) {
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);

    // var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    // var sorting = utility.getSortObj(req.body);

    let sorting = {};
    if (req.body.sortValue && req.body.sortOrder) {
        sorting[req.body.sortValue] = req.body.sortOrder;
    } else {
        sorting = { _id: -1 };
    }
    var condition = {};
    if (req.body.searchText) {
        var searchText = req.body.searchText.toLowerCase();
        var searchText = (searchText);
        condition.$or = [
            { 'name': new RegExp(searchText, 'gi') },
            { 'desc': new RegExp(searchText, 'gi') },
            { 'searchKey': new RegExp(searchText.replace(/\s+/g, ''), 'gi') },
        ];
    }
    
    activeModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean()
        .exec(function (err, data) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Internal error'
                });
            } else if (data) {
                activeModel.find(condition)
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
                                data: data,
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
        })
}


function getUserNetwork(req, res) {
    let findObj = {};
    if (req.swagger.params.id.value) {
        findObj.userId = req.swagger.params.id.value
    }
    userNetworkModel.find(findObj, { userId: 1, status: 1, network: 1 })
        .populate({
            path: 'userId',
            model: 'user'
        })
        .lean()
        .exec(function (err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...' });
            } else {
                res.json({ code: 200, message: 'success', data: info });
            }
        });

}


function getUserSpecificNetworkData(req, res) {
    // console.log("swagger params is",req.swagger.params);
    // console.log("req.body is",req.body);
    // console.log("req.path",req.path);
    // console.log("req.params",req.params);


    var condition = {
        userId: mongoose.Types.ObjectId(req.swagger.params.id.value),
        isDeleted: false,
        status: '0'
    };

    userNetworkModel.find(condition, { userId: 1, status: 1, network: 1 })
        .populate({
            path: 'userId',
            model: 'user'
        })
        .lean()
        .exec(function (err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...' });
            } else {
                res.json({ code: 200, message: 'success', data: info });
            }
        });

}


function getSelectedNetwork(req, res) {
    let findObj = {};
    if (req.swagger.params.id.value) {
        findObj.userId = req.swagger.params.id.value
    }
    userNetworkModel.find(findObj, { userId: 1, status: 1, network: 1 })
        .populate('network')
        .lean()
        .exec(function (err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...', err: err });
            } else {
                res.json({
                    code: 200,
                    message: 'success',
                    data: info
                });
            }
        });
}
