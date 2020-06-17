// Schema for Mail Templates within ACO network

'use strict';

var mongoose = require('mongoose');
var mailtemplateSchema = new mongoose.Schema({
    key             : { type: String },
    template_name   : { type: String },
    subject         : { type: String },
    body            : { type: String }
});

module.exports = mongoose.model('mailtemplates', mailtemplateSchema);