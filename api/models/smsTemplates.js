// Schema for Mail Templates within ACO network

'use strict';

var mongoose = require('mongoose');
var smstemplateSchema = new mongoose.Schema({
    key         : { type: String },
    subject     : { type: String },
    body        : { type: String }
});

module.exports = mongoose.model('smstemplates', smstemplateSchema);