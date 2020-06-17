'use strict';

var mongoose = require('mongoose');
var stateSchema = new mongoose.Schema({
    state 		: { type: String },    
    stateFullName 		: { type: String, default: '' }
});
module.exports = mongoose.model('state', stateSchema);