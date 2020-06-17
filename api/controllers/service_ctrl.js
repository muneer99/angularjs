'use strict';

var mongoose = require('mongoose'),
    SpecialityModel = mongoose.model('specialities'),
    utility = require('../lib/utility.js'),
    serviceModel = mongoose.model('services');
var co = require('co');
    
module.exports = {
    addService: addService,
    getServices: getServices,
    addServices: addServices,
    deleteService: deleteService,
    getServiceById: getServiceById,
    deleteServices: deleteServices,
    getServiceList: getServiceList,
    getSpecialityNames: getSpecialityNames,
    updateServiceStatus: updateServiceStatus,
    updateServicesService: updateServicesService,
};

/**
 * Function is use to add Speciality by Admin
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 27-06-2017
 */

function addService(req, res) {
    req.body.serviceName = (req.body.serviceName) ? req.body.serviceName : '';
    var serviceInfo = new serviceModel(req.body);
    serviceInfo.save(function (err, data) {
        if (err) {
            res.json({ code: 201, message: "Data not Addded" })
        } else {
            res.json({ code: 200, message: "Data Added", data: data })
        }
    });
}

/**
 * Function is use to get all Speciality
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 05-07-2017
 */
function getServices(req, res) {
    co(function* () {
        serviceModel.find({ isDeleted: false, verified: true })
            .sort({ serviceName: 1 })
            .exec(function (err, data) {
                if (err) {
                    res.json({ code: 201, message: 'Error in fetching Details', data: {} });
                } else {
                    if (data) {
                        res.json({
                            code: 200,
                            message: 'Data has been retrieved Successfully',
                            data: data
                        });
                    } else {
                        res.json({ code: 201, message: 'No Record Available', data: {} });
                    }
                }
            })
    }).then(function (value) {
        //console.log(value);
    }, function (err) {
        console.error(err.stack);
    });
}

function deleteServices(req, res) {
    serviceModel.remove({ _id: mongoose.Types.ObjectId(req.body.id) }, function (err, response) {
        if (err) {
            throw err;
        } else {
            var logdata = {
                id: req.body.id,
                "activity_name": "A Speciality has been deleted"
            }
            var log = new AuditModel(logdata);
            logdata.save();
        }
    })
}

function getServiceList(req, res) {
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { serviceName: 1 };
    var sorting = utility.getSortObj(req.body);
    var condition = { isDeleted: false };
    var searchText = req.body.searchText;
    if (req.body.searchText) {
        var searchText = (searchText);
        condition.$or = [
            { 'serviceCode': new RegExp(searchText, 'gi') },
            { 'serviceDescrip': new RegExp(searchText, 'gi') },
            { 'serviceName': new RegExp(searchText, 'gi') },
            { 'searchKey': new RegExp(searchText.replace(/\s+/g, ''), 'gi') },
        ];
    }
    serviceModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean().exec(function (err, serviceData) {
            if (err) {
                res.json({
                    code: 401,
                    message: 'Internal error'
                });
            } else if (serviceData) {
                serviceModel.find(condition)
                    .count()
                    .exec(function (err, totalCount) {
                        if (err) {
                            res.json({
                                code: 401,
                                message: 'Internal Error'
                            })
                        } else {
                            res.json({
                                code: 200,
                                message: 'Service data retrieved',
                                data: serviceData,
                                totalCount: totalCount
                            })
                        }
                    });
            } else {
                res.json({
                    code: 401,
                    message: 'No data found'
                })
            }
        })
}

/**
 * Function is use to Add Service in Speciality
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 12-12-2018
 */
function addServices(req, res) {
    var bodydata = {};
    bodydata.serviceName = (req.body.serviceName) ? req.body.serviceName : '';
    bodydata.searchKey = (req.body.serviceName) ? req.body.serviceName.replace(/\s+/g, '') : '';
    serviceModel.findOne({ serviceName: bodydata.serviceName, isDeleted: false }).exec(function (err, resService) {
        if (err) {
            res.json({ code: 201, message: 'Internal Error' })
        } else if (resService) {
            res.json({ code: 201, message: 'Service name exists.' })
        } else {
            var serviceData = new serviceModel(bodydata);
            serviceData.save(function (err, response) {
                if (err) {
                    res.json({ code: 201, message: 'Internal Error' })
                } else {
                    if (response) {
                        res.json({ code: 200, message: 'Service has been added to speciality' });
                    } else { }

                }
            })
        }
    })
}
/**
 * Function is use to get SpecialityNames
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 26-July-2017
 */
function getSpecialityNames(req, res) {
    SpecialityModel.find({})
        .exec(function (err, data) {
            if (err) {
                res.json({ code: 201, message: 'Error in fetching Details', data: {} });
            } else {
                if (data) {
                    res.json({
                        code: 200,
                        message: 'Data has been retrieved Successfully',
                        data: data
                    });
                } else {
                    res.json({ code: 201, message: 'No Record Available', data: {} });
                }
            }
        })
}

function deleteService(req, res) {
    serviceModel.update({ _id: req.body.id }, { $set: { isDeleted: true } }, function (err) {
        if (err) {
            res.json({ code: 201, message: 'Request could not be processed. Please try again.' });
        } else {
            res.json({ code: 200, message: 'Service removed  from network.' });
        }
    });
}

function getServiceById(req, res) {
    var id = req.swagger.params.id.value;
    serviceModel.findOne({ _id: mongoose.Types.ObjectId(id) }, { serviceCode: 1, serviceDescrip: 1, serviceName: 1 })
        .lean()
        .exec(function (err, serviceInfo) {
            if (err) {
                res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
            } else {
                res.json({ code: 200, message: 'Speciality info fetched successfully.', data: serviceInfo });
            }
        });
}

function updateServiceStatus(req, res) {
    var updateServiceRecord = {
        status: req.body.status
    }
    serviceModel.update({ _id: mongoose.Types.ObjectId(req.body.id) }, { $set: updateServiceRecord }, function (err) {
        if (err) {
            res.json({ code: 201, message: 'Internal Error Occured' });
        } else {
            res.json({ code: 200, message: 'Status updated successfully.' });
        }
    });
}


function updateServicesService(req, res) {
    var updateServiceRecord = {};
    var name = (req.body.serviceName) ? req.body.serviceName : '';
    updateServiceRecord.serviceName = name;
    if (req.body.verified) {
        updateServiceRecord.verified = true;
    } else {

        updateServiceRecord = {
            serviceCode: req.body.serviceCode,
            serviceDescrip: req.body.serviceDescrip,
            serviceName: name,
            searchKey: name.replace(/\s+/g, '')
        }
    }

    serviceModel.findOne({ serviceName: { $regex: new RegExp(req.body.serviceName, "i") }, isDeleted: false, _id: { $ne: req.body._id } }).exec(function (err, serviceData) {
        if (err) {
            res.json({
                code: 201,
                message: 'Internal error'
            })
        } else if (serviceData) {
            res.json({ code: 202, message: 'Entered Service name already exist ! Try with different name.' });
        } else {
            serviceModel.update({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: updateServiceRecord }, function (err) {
                if (err) {
                    res.json({ code: 201, message: 'Request could not be processed. Please try again.' });
                } else {
                    res.json({ code: 200, message: 'Service updated successfully.' });
                }
            })
        }
    })
}