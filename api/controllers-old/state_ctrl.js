'use strict';

var mongoose = require('mongoose'),
    stateModel = mongoose.model('state'),
    utility = require('../lib/utility.js');
module.exports = {
    getStates: getStates,

};

function getStates(req, res) {
    var sorting = utility.getSortObj(req.body, { state: 1 });
    var condition = {};
    stateModel.find(condition)
        .sort(sorting)
        .lean().exec(function (err, data) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'Internal error'
                });
            } else if (data) {
                console.log(data);
                stateModel.find(condition)
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
                                data: data
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