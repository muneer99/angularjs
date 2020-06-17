'use strict';

var mongoose = require('mongoose');
var constantsObj = require('../lib/constants');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema({
    username: { type: String, lowercase: true }, // No longer being used in the application #
    userid:{ type:String,default:null},
    password: { type: String },
    passExpDate: { type: Date }, // When password should exp
    firstname: { type: String }, // Provier fname 
    lastname: { type: String }, // provider lname
    centername: { type: String, default: '' }, //Center Name
    email: { type: String, lowercase: true, /*required: true, unique: true*/ },
    image: { type: String, default: 'noUser.png' },
    phone_number: { type: String, default: '' }, // office phone number
    fax: { type: String, default: '' },
    cell_phone: { type: String, default: '' }, // provider mobile number
    address: { type: String, default: '' }, // No longer being used in the application #
    country: { type: String, default: null },
    device_token: { type: String, default: '' },
    doctorsNPI: { type: String }, // Sores provider NPI number
    device_type: { type: String, default: '' }, // Device type like iOS 
    status: { type: String, default: '1' }, //0-InActive, 1-Active, 2- Deactive
    degree: { type: mongoose.Schema.Types.ObjectId, ref: 'titles' },
    officeadminTitle: { type: mongoose.Schema.Types.ObjectId, ref: 'frontdesktitles' },
    deleted: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true }, // false after a doctor update its profile
    speciality: [{ type: mongoose.Schema.Types.ObjectId, ref: 'specialities' }],
    service: [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
    network: [{ type: mongoose.Schema.Types.ObjectId, ref: 'networks' }], // insurance network(s) a doctor serve or a patient is registered with
    range: { type: Number, default: 50 }, // range of operation
    user_loc: { type: [Number], index: '2dsphere' }, // user location format lon, lat
    location: { type: String, default: '' }, //Address line 1
    sute: { type: String, default: '' }, //Address line 2
    city: { type: String, default: '' }, //City
    state: { type: String, default: '' }, // ST
    zipcode: { type: String, default: '' }, // Zip code
    userType: { type: String, default: 'user' },
    poc_name: { type: String, default: '' }, //center name / practice center name
    poc_phone: { type: String, default: '' }, //center name / practice center number
    frontdesk: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    deviceId: { type: String, default: '' },
    gender: { type: String, default: '' },
    referBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    referTo: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    birthDate: { type: Date, default: null },
    workAddress: { type: String, default: '' },
    doctorStatus: { type: String, default: 'waiting' }, // available , waiting , Not available 
    joinDate: { type: Date, default: Date.now },
    permission: { type: mongoose.Schema.Types.ObjectId, ref: 'permission' },
    designation: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    createdBy: { type: String, enum: ['admin', 'user', 'staff'], default: 'user' },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    createdDate: { type: Date, default: Date.now },
    modifiedBy: { type: String, enum: ['admin', 'user', 'staff'], default: 'user' },
    modifiedById: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    modifiedDate: { type: Date, default: Date.now },
    customerId: { type: String, default: '' },
    isDeleteBy: { type: String, enum: ['admin', 'staff'], default: 'admin' },
    isDeleteById: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    userTimeZone: { type: String, default: '' },
    token: { type: String, default: '' },
    verifying_token: { type: String },
    passwordResetToken: { type: String, default: '' },
    emailAvailable: { type: Number },
    lastActivityTime: { type: Date },
    showMobile: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true }, // Super admin verify front desk admin added by doctors 
    isRegistered: { type: Boolean, default: false },
    isImported: { type: Boolean, default: false }, // true means this record already imported in users collection
    isOutside: { type: Boolean, default: false },
    emailnotificationPref: { type: Boolean, default: true },
    txtnotificationPref: { type: Boolean, default: true },
    networkstatus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userNetwork' }], // user network(s) a doctor serve or a patient is registered with

}, {
        timestamps: true
    });

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.statics.existCheck = function (email, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or: [{ email: new RegExp('^' + email + '$', "i") }],
            deleted: { $ne: true },
            _id: { $ne: id }
        };
    } else {
        where = { $or: [{ email: new RegExp('^' + email + '$', "i") }], deleted: { $ne: true } };
    }
    User.findOne(where, function (err, userdata) {
        if (err) {
            callback(err)
        } else {
            if (userdata) {
                callback(null, constantsObj.validateMsg.emailAlreadyExist, userdata);
            } else {
                callback(null, true);
            }
        }
    });
};


userSchema.statics.isRegisteredExistCheck = function (email, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or: [{ email: new RegExp('^' + email + '$', "i") }],
            deleted: { $ne: true },
            isRegistered: { $eq: false },
            _id: { $ne: id }
        };
    } else {
        where = { $or: [{ email: new RegExp('^' + email + '$', "i") }], deleted: { $ne: true }, isRegistered: { $eq: false } };
    }
    User.findOne(where, function (err, userdata) {
        if (err) {
            callback(err)
        } else {
            if (userdata) {
                //console.log("userdata", userdata);
                callback(null, constantsObj.validateMsg.memberExist, userdata);
            } else {
                callback(null, true);
            }
        }
    });
};

var User = mongoose.model('user', userSchema);
module.exports = User;
