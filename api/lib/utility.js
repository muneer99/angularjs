'use strict';
/*
 * Utility - utility.js
 * Author: smartData Enterprises
 * Date: 3rd June 2017
 */

var constantsObj = require('./constants');
var mongoose = require('mongoose');
var crypto = require('crypto'),
    algorithm,
    secret,
    password;
var fs = require("fs");
var path = require('path');
var config;
var nodemailer = require('nodemailer');
var async = require('async');
var FCM = require('fcm-node');
var apn = require('apn');
process.env.DEBUG = 'apn';
var shortid = require('shortid');
var User = require('../models/users');
var co = require("co");
var jwt = require('jsonwebtoken');
var fs = require('fs');
var sorty = require('sorty');
const https = require('https');
var utility = {};
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
        algorithm = config.encryption.cryptoAlgorithm,
            password = config.encryption.cryptoPassword;
        secret = config.encryption.secret;
    }
})

utility.getEncryptText = function (text) {

    var cipher = crypto.createCipher(algorithm, password);
    try {
        text = cipher.update(text, 'utf8', 'hex');
        text += cipher.final('hex');
        return text;
    } catch (ex) {
        return;
    }
};

//It is recommended to derive a key using crypto.pbkdf2() or crypto.scrypt() and to use crypto.createCipheriv() and crypto.createDecipheriv() to obtain the Cipher and Decipher objects respectively.

utility.getDecryptText = function (text) {
    var decipher = crypto.createDecipher(algorithm, password);
    try {
        text = decipher.update(text, 'hex', 'utf8');
        text += decipher.final('utf8');
        return text;
    } catch (ex) {
        return;
    }
};

utility.readTemplateSendMail = function (to, subject, userData, templateFile, callback) {
    var filePath = path.join(__dirname, '/email_templates/' + templateFile + '.html');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function (err, data) {
        if (!err) {
            var template = data
                .replace(/{baseUrl}/g, config.webUrl)
                .replace(/{email}/g, userData.email)
                .replace(/{firstname}/g, utility.capitalize(userData.firstname))
                .replace(/{lastname}/g, utility.capitalize(userData.lastname))
                .replace(/{password}/g, userData.password)
                .replace(/{verifying_token}/g, userData.verifying_token);

            utility.sendmail(userData.email, subject, template, function (mailErr, resp) {
                if (err)
                    callback(mailErr);
                else
                    callback(null, true);
            });
        } else {
            callback(err);
        }
    });
}

var replaceString = utility.replaceString = function (str, repalcement) {
    var re = new RegExp(Object.keys(repalcement).join("|"), "gi");
    str = str.replace(re, function (matched) {
        return repalcement[matched];
    });
    return str;
};

var getTemplate = function (str, repalcement, callback) {
    var mailTemplateModel = mongoose.model('mailtemplates');
    mailTemplateModel.findOne({ key: str }, function (err, templateInfo) {
        if (err) {
            callback(err, null)
        } else {
            var subjct = (repalcement && repalcement.mailSubject) ? repalcement.mailSubject : (templateInfo && templateInfo.subject) ? templateInfo.subject : 'Which Docs';

            var retData = {
                subject: replaceString(subjct, repalcement),
                body: replaceString(templateInfo.body, repalcement)
            };
            callback(null, retData)
        }
    });
};

utility.sendmailbytemplate = function (to, mailKey, repalcement, callback) {
    getTemplate(mailKey, repalcement, function (err, mailData) {
        if (err) {
            callback(err, null);
        } else {
            var transporter = nodemailer.createTransport(config.SMTP);

            var mailOptions = {
                to: to,
                from: config.EMAIL_FROM,
                subject: mailData.subject,
                html: mailData.body
            };
            transporter.sendMail(mailOptions, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, true);
                }
            });
        }
    });
};

utility.sendmail = function (to, subject, message, callback) {
    var transporter = nodemailer.createTransport(config.SMTP);

    var mailOptions = {
        to: to,
        from: config.EMAIL_FROM,
        subject: subject,
        html: message
    };
    console.log("mailOptions",mailOptions);
    transporter.sendMail(mailOptions, function (err) {
        console.log("mail error",err);       
        if (err) {
            callback(err, null);
        } else {
            callback(null, true);
        }
    });
};

utility.uploadImage = function (imageBase64, imageName, callback) {
    if (imageBase64 && imageName) {
        var timestamp = Number(new Date()); // current time as number
        var filename = +timestamp + '_' + imageName;
        var imagePath = "./public/assets/uploads/" + filename;
        fs.writeFile(path.resolve(imagePath), imageBase64, 'base64', function (err) {
            if (!err) {
                callback(config.webUrl + "/assets/uploads/" + filename);
            } else {
                callback(config.webUrl + "/assets/images/default-image.png");
            }
        });
    } else {
        callback(false);
    }
};

utility.fileExistCheck = function (path, callback) {
    fs.exists(path, function (err) {
        if (err) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

utility.getTitleById = function (id, callback) {
    var titleModel = mongoose.model('titles');
    return new Promise(function (resolve, reject) {
        titleModel.findOne({ _id: mongoose.Types.ObjectId(id) }, function (err, titleInfo) {
            if (err) {
                resolve();
            } else {
                var title = (titleInfo) ? titleInfo.name : '';
                resolve(title);
            }
        });
    });
}

utility.getLocationDetails = function (loc, callback) {
    return new Promise(function (resolve, reject) {
        
        let url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=' + loc + '&inputtype=textquery&key=' + constantsObj.apikeys.timezone_apikey;

        https.get(url, (response) => {
            response.on('data', (d) => {

                var rs = JSON.parse(d.toString());
                if (rs.status !== 'OK'){
                    resolve({});
                }                    
                else {
                    var placeId = rs.candidates[0].place_id;
                    let locResData = {};

                    let url2 = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeId + '&fields=address_component,geometry&key=' + constantsObj.apikeys.timezone_apikey;

                    https.get(url2, (resp) => {
                        let body = '';
                        
                        resp.setEncoding('utf8');
                        resp.on('data', chunk => body += chunk);
                        resp.on('end', () => {
                            // Parsing & formating the data
                            let rsloc = JSON.parse(body.toString());

                            var componentForm = {
                                street_number: 'short_name',
                                route: 'long_name',
                                sublocality_level_1: 'long_name',
                                sublocality_level_2: 'long_name',
                                locality: 'long_name',
                                administrative_area_level_1: 'short_name',
                                postal_code: 'short_name'
                            };
                            var mapping = {
                                street_number: 'location',
                                route: 'location',
                                sublocality_level_1: 'location',
                                sublocality_level_2: 'location',
                                locality: 'city',
                                administrative_area_level_1: 'state',
                                postal_code: 'zipcode'
                            };
                            
                            if (rsloc.result) {
                                var location = rsloc.result.geometry.location;
                                var components = rsloc.result.address_components;
                                locResData.user_loc = [location.lat, location.lng];

                                for (var i = 0; i < components.length; i++) {
                                    var addressType = components[i].types[0];
                                    if (componentForm[addressType]) {
                                        var val = components[i][componentForm[addressType]];
                                        if (mapping[addressType] == 'location')
                                            locResData[mapping[addressType]] = (locResData[mapping[addressType]]) ? locResData[mapping[addressType]] + " " + val : val;
                                        else
                                            locResData[mapping[addressType]] = val;
                                    }
                                }
                                resolve(locResData);
                            } else {
                                resolve(locResData);
                            }

                        });

                    }).on('error', (e) => {
                        resolve({});
                    });
                }

            });

        }).on('error', (e) => {
            resolve({});
        });
    });
}

utility.validationErrorHandler = function (err) {
    var errMessage = constantsObj.validationMessages.internalError;
    if (err.errors) {
        for (var i in err.errors) {
            errMessage = err.errors[i].message;
        }
    }
    return errMessage;
}

utility.fileUpload = function (imagePath, buffer) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(path.resolve(imagePath), buffer, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


utility.getSortObj = function (body, defSort) {
    var sorting = (defSort) ? defSort : { _id: -1 };
    for (var key in body) {
        var reg = new RegExp("sorting", 'gi');
        if (reg.test(key)) {
            var value = body[key];
            key = key.replace(/sorting/g, '').replace(/\[/g, '').replace(/\]/g, '');
            var sorting = {};
            if (value == 1 || value == -1) {
                sorting[key] = value;
            } else {
                sorting[key] = (value == 'desc') ? -1 : 1;
            }
        }
    }
    return sorting;
}

utility.validateArray = function (array) {
    if (!array) {
        return false;
    } else {
        if (Array.isArray(array)) {
            return ((array.length) ? true : false);
        } else {
            return false;
        }
    }
}
utility.removeExpiredTokenOfUser = function (user) {
    if (user && user.deviceInfo.length > 0) {
        var deviceArr = [];
        async.eachSeries(user.deviceInfo, function (result, callback) {
            try {
                var decoded = jwt.verify(result.access_token, secret);
                deviceArr.push(result);
                callback(null);
            } catch (err) {
                callback(null);
            }
        }, function (err) {
            user.deviceInfo = deviceArr;
            user.save();
        });
    }
}

utility.capitalize = function (input) {
    if (input !== null && (typeof input !== 'undefined') && input.split(' ').length > 1) {
        return input.split(" ").map(function (input) { return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '' }).join(" ");
    } else if (input !== null && (typeof input !== 'undefined') && input.split('-').length > 1) {
        return input.split("-").map(function (input) { return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '' }).join("-");
    } else {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
}

utility.titleCase = function (str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

/**
 * Function is use to encrypt records 
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Last modified on 8-10-2017
 */
utility.encryptedRecord = function (data, field) {
    var patientObj = {};
    var fields = [];
    if (field.length > 0) {
        for (var i = 0; i < field.length; i++) {
            fields.push(field[i]);
        };
    }
    for (var key in data) {
        if (fields.indexOf(key) == -1) {
            if (data[key]) {
                if (data[key] instanceof Array) {
                    if (data[key].length > 0) {
                        patientObj[key] = [];
                        for (let j = 0; j < data[key].length; j++) {
                            patientObj[key][j] = {};
                            if (typeof (data[key][j]) == 'object') {
                                for (var arrObjkey in data[key][j]) {
                                    if (fields.indexOf(arrObjkey) == -1) {
                                        if (data[key][j][arrObjkey]) {
                                            patientObj[key][j][arrObjkey] = utility.getEncryptText(data[key][j][arrObjkey].toString());
                                        }
                                    } else {
                                        patientObj[key][j][arrObjkey] = data[key][j][arrObjkey];
                                    }
                                }
                            } else if (typeof (result[key][j]) == 'string') {
                                patientObj[key][j] = utility.getEncryptText(result[key][j].toString());
                            }
                        }
                    } else {
                        patientObj[key] = data[key];
                    }
                } else {
                    patientObj[key] = utility.getEncryptText(data[key].toString());
                }
            }
        } else {
            patientObj[key] = data[key];
        }
    }
    return patientObj;
}

utility.encryptedRecordPromise = function (data, field) {
    return new Promise(function (resolve, reject) {
        utility.encryptedRecord(data, field, function (data2) {
            resolve(data2)
        });
    })
}


/**
 * Function is use to decrypt records 
 * Created by Suman Chakraborty
 * @smartData Enterprises (I) Ltd
 * Last modified on 8-10-2017
 */
utility.decryptedRecord = function (data, field, callback1) {
    var newArr = [];
    var fields = ['_id', 'createdAt', 'updatedAt', 'is_deleted', 'status', '__v'];
    if (field.length > 0) {
        for (var i = 0; i < field.length; i++) {
            fields.push(field[i]);
        };
    }
    if (data instanceof Array) {
        async.each(data, function (result, callback) {
            var patientObj = {};
            for (var key in result) {
                if (fields.indexOf(key) == -1) {
                    if (result[key]) {
                        if (result[key] instanceof Array) {
                            if (result[key].length > 0) {
                                patientObj[key] = [];
                                for (let j = 0; j < result[key].length; j++) {
                                    patientObj[key][j] = {};
                                    if (typeof (result[key][j]) == 'object') {
                                        for (var arrObjkey in result[key][j]) {
                                            if (fields.indexOf(arrObjkey) == -1) {
                                                if (result[key][j][arrObjkey]) {
                                                    patientObj[key][j][arrObjkey] = utility.getDecryptText(result[key][j][arrObjkey].toString());
                                                }
                                            } else {
                                                patientObj[key][j][arrObjkey] = result[key][j][arrObjkey];
                                            }
                                        }
                                    } else if (typeof (result[key][j]) == 'string') {
                                        patientObj[key][j] = utility.getDecryptText(result[key][j].toString());
                                    }
                                }
                            } else {
                                patientObj[key] = result[key];
                            }
                        } else {
                            patientObj[key] = utility.getDecryptText(result[key].toString());
                        }
                    }
                } else {
                    patientObj[key] = result[key];
                }
            }
            newArr.push(patientObj);
            callback(null);
        }, function (err) {
            callback1(newArr)
        });
    } else {
        var patientObj = {};
        for (var key in data) {
            if (fields.indexOf(key) == -1) {
                if (data[key]) {
                    if (data[key] instanceof Array) {
                        if (data[key].length > 0) {
                            patientObj[key] = [];
                            for (let j = 0; j < data[key].length; j++) {
                                patientObj[key][j] = {};
                                if (typeof (data[key][j]) == 'object') {
                                    for (var arrObjkey in data[key][j]) {
                                        if (fields.indexOf(arrObjkey) == -1) {
                                            if (data[key][j][arrObjkey]) {
                                                patientObj[key][j][arrObjkey] = utility.getDecryptText(data[key][j][arrObjkey].toString());
                                            }
                                        } else {
                                            patientObj[key][j][arrObjkey] = data[key][j][arrObjkey];
                                        }
                                    }
                                } else if (typeof (result[key][j]) == 'string') {
                                    patientObj[key][j] = utility.getDecryptText(result[key][j].toString());
                                }
                            }
                        } else {
                            patientObj[key] = data[key];
                        }
                    } else {
                        patientObj[key] = utility.getDecryptText(data[key].toString());
                    }
                }
            } else {
                patientObj[key] = data[key];
            }
        }
        callback1(patientObj);
    }
}

utility.getSortedRecord = function (data, sorting, callback1) {
    var sortparam = [{ name: '_id', dir: 'desc' }];

    Object.keys(sorting).forEach(function (key) {

        var val = sorting[key];
        sortparam = [];
        if (val == '1') {
            var reg = new RegExp("Date", 'gi');
            if (reg.test(key))
                sortparam = [{ name: key, dir: 'asc', type: 'number' }];
            else
                sortparam = [{ name: key, dir: 'asc' }];
        } else if (val == '-1') {
            var reg = new RegExp("Date", 'gi');
            if (reg.test(key))
                sortparam = [{ name: key, dir: 'desc', type: 'number' }];
            else
                sortparam = [{ name: key, dir: 'desc' }];
        }
    });
    sorty(sortparam, data);

    callback1(data);
}



module.exports = utility;