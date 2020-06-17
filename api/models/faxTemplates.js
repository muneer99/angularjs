"use strict";
var mongoose = require('mongoose');
var faxTemplateSchema = new mongoose.Schema({
	key         : { type: String },
    subject     : { type: String },
    body        : { type: String }
});
mongoose.exports = mongoose.model('faxTemplate',faxTemplateSchema);