'use strict';

var mongoose = require('mongoose');
var networkSchema = new mongoose.Schema({
    name 		: { type: String },
    email       : { type: String, lowercase: true /*, required: true, unique: true*/ },
    password                : { type: String },
    passExpDate             : { type: Date }, // When password should exp
    token                   : { type: String, default: '' },
    verifying_token         : { type: String },
    passwordResetToken      : { type: String, default: '' },
    // image                   : { type: String, default: 'noUser.png' },
    // phone_number            : { type: String, default: '' }, // office phone number
    // fax                     : { type: String, default: '' },
    // cell_phone              : { type: String, default: '' }, // provider mobile number        
    // location                : { type: String, default: '' }, //Address line 1
    // sute                    : { type: String, default: '' }, //Address line 2
    // city                    : { type: String, default: '' }, //City
    // state                   : { type: String, default: '' }, // ST
    // zipcode                 : { type: String, default: '' }, // Zip code
    // country                 : { type: String, default: null },
    status                  : { type: String, default: '1' }, //0-InActive, 1-Active, 2- Deactive
    isRegistered            : { type: Boolean, default: false },
    isLoggedIn              : { type: Boolean, default: false },
    privateGroup            : { type: Boolean, default: false },
    createdDate             : { type: Date, default: Date.now },
    modifiedDate            : { type: Date, default: Date.now },
    searchKey 	: { type: String },
    desc 		: { type: String, default: '' },
    verified 	: { type: Boolean, default: true }
});
module.exports = mongoose.model('networks', networkSchema);