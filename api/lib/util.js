'use strict';
var jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    constant = require('./constants'),
    config,
    userToken = mongoose.model('userToken'),
    moment = require('moment-timezone');
var co = require("co");
var fs = require('fs');
var pdf = require('html-pdf');
var path = require('path');

var confFile;
if (process.env.NODE_ENV != 'production') {
    // confFile = '/home/sampathyemjala/DayUsers/Sampath/Projects/MEAN-NOWAITDOC/config.js';
    confFile = './config.js'    
    // confFile = "/home/ACO/config/config.js";
} else {
    // confFile = '/home/ubuntu/whichdocs/config/config.js';
    confFile = '/home/ubuntu/appconfig/config.js';   // for development (staging)
    // confFile = '/home/ubuntu/whichdocs/config/config.js'; //for live server (production)
}
fs.readFile(confFile, "utf8", function read(err, data) {
    if (!err) {
        config = JSON.parse(data);

    }
})
module.exports = {
    ensureAuthorized: ensureAuthorized,
    sendFax: sendFax,
    createfaxFile: createfaxFile,
    notEmpty: notEmpty,
    sendSMS: sendSMS,
    mergeObj: mergeObj
}


//------add--------------
function ensureAuthorized(req, res, next) {
    co(function* () {
        var utcMoment = moment.utc();
        var utcDate = new Date(utcMoment.format());
        var unauthorizedJson = {
            code: 402,
            'message': 'Unauthorized',
            data: {}
        };
        if (req.headers.authorization) {
            var token = req.headers.authorization;
            var splitToken = token.split(' ');
            try {
                token = splitToken[1];
                jwt.verify(token, config.encryption.secret, function (err, decoded) {
                    // console.log(decoded)
                    if (err) {
                        if (err.name == 'TokenExpiredError') {
                            if (decoded && decoded.id.match(/^[0-9a-fA-F]{24}$/)) {
                                userToken.findOne({
                                    token: token,
                                    userId: mongoose.Types.ObjectId(decoded.id)
                                }).exec(function (err, resp) {
                                    if (err || !resp) {
                                        res.json(unauthorizedJson);
                                    } else {
                                        if (resp) {
                                            var lastActivityTime = moment(resp.lastActivityTime);
                                            var minuteDiff = moment(moment.utc()).diff(lastActivityTime, 'minutes');
                                            if (minuteDiff >= 5) {
                                                res.json(unauthorizedJson);
                                            } else {
                                                resp.lastActivityTime = utcDate;
                                                resp.save();
                                                next();
                                            }
                                        } else {
                                            res.json(unauthorizedJson);
                                        }
                                    }
                                });
                            } else {
                                res.json(unauthorizedJson);
                            }
                        } else {
                            res.json(unauthorizedJson);
                        }
                    } else {
                        if (splitToken[0] == 'admin_bearer') {
                            if (decoded && decoded.id.match(/^[0-9a-fA-F]{24}$/)) {
                                userToken.findOne({
                                    token: token,
                                    userId: mongoose.Types.ObjectId(decoded.id)
                                })
                                .exec(function (err, resp) {
                                    if (err) {
                                        res.json(unauthorizedJson);
                                    } else {
                                        if (resp) {
                                            // req.user = user;
                                            resp.lastActivityTime = utcDate;
                                            resp.save();
                                            next();
                                        } else {
                                            res.json(unauthorizedJson);
                                        }
                                    }
                                })
                            } else {
                                res.json(unauthorizedJson);
                            }
                        } else {
                            res.json(unauthorizedJson);
                        }
                    }
                });
            } catch (err) {
                res.json(unauthorizedJson);
            }
        } else {
            res.json(unauthorizedJson);
        }
    }).catch(function (err) {
        res.json(unauthorizedJson);
    });
}
/*
* Send fax to a specific number
* @ fax_no receiver number with country code
* @ fax file path 
*/
function sendFax(fax_no, file, callback) {
    var InterFAX = require('interfax');
    var interfax = new InterFAX({
        username: config.fax_prd.username,
        password: config.fax_prd.password
    });
    interfax.deliver({
        faxNumber: fax_no,
        file: file
    }).then(fax => {
        callback(null, fax.id);
    }).catch(error => {
        callback(error)
    });
}

function createfaxFile(data, callback) {
    try{
       
        var filePath = path.resolve('fax_files');
        var fileName = new Date().getTime() + '.pdf';
        var fPath = filePath+'/'+fileName//path.resolve(filePath, fileName);
        // console.log("\n\n fPath",fPath,typeof(fPath),"\n",data);
        // callback(false,fPath);
        pdf.create(data, { format: 'Letter' }).toFile(fPath, function (err, resp) {
            // console.log("\n error 111",err,resp);
            if (err) {
                // console.log("\n error ttttttttt",err);
                callback(err, null);
            } else {
                callback(false,fPath);
            }
        });
    }catch(err){
       console.log(":::::::::::here is my error to solve:::::",err);
    }
   
}

function notEmpty(data) {
    var res = true;
    var dataType = typeof data;
    switch (dataType) {
        case 'object':
            res = false;
            for (var key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    res = true;
                }
            }           
            break;
        case 'array':
            if (data == null || data.length < 1)
                res = false;
            break;

        case 'undefined':
            res = false;
            break;

        case 'number':
            if (data == "")
                res = false;
            break;
        case 'string':
            if (data.trim() == "")
                res = false;
            break;
    }
    return res;
}

function sendSMS(toPhone, message, callback) {
    var AWS = require('aws-sdk');
    AWS.config.update({
        accessKeyId: config.AWS.accessKeyId,
        secretAccessKey: config.AWS.secretAccessKey,
        region: config.AWS.region
    });
    var sns = new AWS.SNS({
        apiVersion: '2017-10-25',
        region: config.AWS.region
    });
    var params = {
        Message: message,
        MessageStructure: 'string',
        PhoneNumber: toPhone,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': 'NWDOC'
            }
        }
    };
    sns.publish(params, function (err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
}

function mergeObj(obj, src) {
    var objlen = obj.length;
    for (var key in src) {
       if (src.hasOwnProperty(key)) obj[parseInt(objlen)+parseInt(key)] = src[key];
    }
    return obj;
}