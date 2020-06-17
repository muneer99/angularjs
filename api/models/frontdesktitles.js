'use strict';

var mongoose = require('mongoose');
var frontdesktitleSchema = new mongoose.Schema({
    name 		: { type: String },    
    desc 		: { type: String, default: '' }
});
module.exports = mongoose.model('frontdesktitles', frontdesktitleSchema);