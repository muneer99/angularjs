'use strict';

var mongoose        = require('mongoose'),
    faqModel        = mongoose.model('faqs'),
    constant        = require('../lib/constants'),
    utility         = require('../lib/utility.js');

    module.exports  = {
                        addFaq         : addFaq,
                        getFaqList     : getFaqList,
                        getFaq         : getFaq,
                        deleteFaq      : deleteFaq,
                        getHelpContent : getHelpContent
                    };

/**
 * Add/update Faq
 * Created by Soumalya Gan
 * @smartData Enterprises (I) Ltd
 * Created Date 15-05-2018
 */

function addFaq(req, res) {
    if (req.body.hasOwnProperty('_id')) {
        var objId = req.body._id;
        delete req.body._id;
        faqModel.update({ _id: mongoose.Types.ObjectId(objId) }, { $set: req.body }, function(err) {
            if (err) {
                res.json({ code: 401, message: "Data not Addded" })
            } else {
                res.json({ code: 200, message: "Faq updated successfully.", data: {} })
            }
        });
    } else {
        req.body.title      = (req.body.title)? req.body.title:'';
        var faqInfo         = new faqModel(req.body);
        faqInfo.save(function(err, data) {
            if (err) {
                res.json({ code: 201, message: "Data not Addded" })
            } else {
                res.json({ code: 200, message: "Data Added", data: data })
            }
        });
    }
}
/**
 * get faq details
 * Created by Soumalya Gan
 * @smartData Enterprises (I) Ltd
 * Created Date 15-05-2018
 */

function getFaqList(req, res) {
    var count       = req.body.count ? req.body.count : 0;
    var skip        = req.body.count * (req.body.page - 1);
    var sorting     = req.body.sorting ? req.body.sorting : { _id: -1 };
    var sorting     = utility.getSortObj(req.body);
    var condition   = {};
    if (req.body.searchText) {
        var searchText  = req.body.searchText.toLowerCase();
        var searchText  = (searchText);
        condition.$or   = [
                            { 'title'   : new RegExp(searchText, 'gi') }
                        ];
    }
    faqModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean()
        .exec(function(err, data) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Internal error'
                });
            } else if (data) {
                faqModel.find(condition)
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
 * get faq by Id
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 18-12-2017
 */
function getFaq(req, res) {
    var condition = {};
    if (req.swagger.params.id.value != '000') {
        condition = { _id: req.swagger.params.id.value };
    }
    faqModel.findOne(condition)
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
 * Delete faq
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Created Date 18-12-2017
 */

function deleteFaq(req, res) {
    faqModel.remove({ _id: mongoose.Types.ObjectId(req.body.id) }, function(err, response) {
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
 * get faq Content by page
 * Created by Soumalya Gan
 * @smartData Enterprises (I) Ltd
 * Created Date 18-06-2018
 */
function getHelpContent(req, res) {
    var condition = {};
    if (req.query.page != '') {
        condition = { page: req.query.page };
    }
    faqModel.findOne(condition)
        .exec(function(err, info) {
            if (err) {
                res.json({ code: 201, message: 'Unable to process your request. Please try again...' });
            } else {
                res.json({ code: 200, message: 'success', data: info });
            }
        });
}