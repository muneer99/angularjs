// Schema for Mail Templates within ACO network

'use strict';

var mongoose = require('mongoose');
var contactusSchema = new mongoose.Schema({
    name 	: { type: String },
    email   : { type: String },
    message : { type: String }
});

module.exports = mongoose.model('contactus', contactusSchema);