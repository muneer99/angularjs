var mongoose        = require('mongoose'),
    User            = mongoose.model('user'),
    utility         = require('../lib/utility.js');
    module.exports  = {
                        deleteOfficeAdmin : deleteOfficeAdmin,
                        getOfficeAdminList: getOfficeAdminList,
                    };
/**
 * Function is use to get front desk list
 * @access private
 * @return json
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Last modified on 07-Mar-2017
 */

//  sss
function getOfficeAdminList(req, res) {
    
        var specCond    = {};
        var count       = parseInt(req.body.count ? req.body.count : 0);
        var skip        = parseInt(req.body.count * (req.body.page - 1)); 
        var sorting     = req.body.sorting ? req.body.sorting : {_id: -1};
        var type        = 'officeAdmin';
        if (req.body.hasOwnProperty('officeAdmin')) {
            type = req.body.userType;
    
        }
        var condition   = {
                            deleted: false,
                            status: '1',
                            userType: {
                                $in: [type]
                                }
                        };
                      
                        
        // if (req.body.service) {
        //     condition.service = {
        //         $in: req.body.service
        //         // .map(function (item) {
        //         //     return mongoose.Types.ObjectId(item)
        //         // })
        //     }
        // }
        // if (req.body.specialty) {
        //     condition.speciality = {
        //         $in: req.body.specialty
        //         // .map(function (item) {
        //         //     return mongoose.Types.ObjectId(item)
        //         // })
        //     }
        // }

        // if (req.body.network) {
        //     condition.network = {
        //         $in: req.body.network
        //         // .map(function (item) {
        //         //     return mongoose.Types.ObjectId(item)
        //         // })
        //     }
        // }

        // On doctor's portal a doctor can see only the doctor not yet completed registration.
        
        if (req.body.hasOwnProperty('requestingUser')) {
        }

        var sorting     = utility.getSortObj(req.body);
        var searchText  = req.body.searchText;
        if (req.body.searchText) {
            condition.$or = [{
                    'doctorStatus': new RegExp(searchText, 'gi')
                },
                {
                    'email': new RegExp(searchText, 'gi')
                },
                {
                    'phone_number': new RegExp(searchText, 'gi')
                },
                {
                    'insfirstname': new RegExp(searchText, 'gi')
                },
                {
                    'inslastname': new RegExp(searchText, 'gi')
                }
            ];
        }
    
        let aggregate = [
    
            // {
            //     $unwind: {
            //         path: "$speciality",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     $unwind: {
            //         path: "$service",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     $unwind: {
            //         path: "$createdById",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
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
                    from: 'users',
                    localField: "createdById",
                    foreignField: "_id",
                    as: "createdByInfo"
                },
    
            },
            {
                $lookup: {
                    from: 'services',
                    localField: "service",
                    foreignField: "_id",
                    as: "serviceInfo"
                },
    
            },
            // {
            //     $lookup: {
            //         from: 'networks',
            //         localField: "network",
            //         foreignField: "_id",
            //         as: "networkInfo"
            //     }
    
            // },
            
            {
                $match: condition
            },
            {
                $sort: sorting
            }, {
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
                    doctorStatus: {
                        $first: '$doctorStatus'
                    },
                    email: {
                        $first: '$email'
                    },
                    phone_number: {
                        $first: '$phone_number'
                    },
                    isVerified: {
                        $first: '$isVerified'
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
                    createdById: {
                        $first: '$createdById'
                    },
                    specility_data: {
                        $push: {
                            specialityInfo: '$specialityInfo',
                        }
                    },
                    service_data: {
                        $push: {
                            serviceInfo: '$serviceInfo',
                        }
                    },
                    network_data: {
                        $push: {
                            networkInfo: '$networkInfo',
                        }
                    },
                    created_by: {
                        $push: {
                            createdByInfo: '$createdByInfo',
                        }
                    }
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
                    email       : 1,
                    phone_number: 1,
                    doctorStatus: 1,
                    speciality  : 1,
                    service     : 1,
                    network     : 1,
                    deleted     : 1,
                    userType    : 1,
                    status      : 1,
                    createdById : 1,
                    firstLogin  : 1,
                    isVerified  : 1
                }
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
       // console.log("this is aggregate===",aggregate);
        
        User.aggregate(aggregate)
        .exec(function (err, userData) {
            if (err) {
                res.json({
                    code: 201,
                    message: 'internal error.',
                    data: {}
                });
            } 
            else if (userData) {
                aggregateCnt.push({
                    $group: {
                        _id: null,
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
                    } 
                    else if (userDataCount) {
                        return res.json({
                            code: 200,
                            message: 'Data retrieved successfully',
                            data: userData,
                            totalCount: ((userDataCount[0]) ? userDataCount[0].count : 0)
                        });
                    }
                })
            }
        })
    
   
        // console.log("\n\nErrororrrrrrrrr \n", errrr);
        // res.json({
        //     code: 201,
        //     message: 'internal error.',
        //     data: {}
        // });
    

    
}


/*Delete officeAdmin */
function deleteOfficeAdmin(req, res) {
    UserModel.remove({
        email: req.body.email
    }, function (err, data) {
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