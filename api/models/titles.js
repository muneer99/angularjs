'use strict';

var mongoose = require('mongoose');
var titleSchema = new mongoose.Schema({
    name 		: { type: String },    
    desc 		: { type: String, default: '' }
});
module.exports = mongoose.model('titles', titleSchema);