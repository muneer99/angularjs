// Schema for Doctors within ACO network its basically for mainting log
'use strict';

var mongoose = require('mongoose');

var referralSchema = new mongoose.Schema({
    referralId 	: { type: mongoose.Schema.Types.ObjectId, ref: 'refers' },
    status 		: { type: Number, default: 0 }, // status can be In Box = 0, Sheduled=1, completed =2
    updatedBy 	: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // referring doctor
    updateOn 	: { type: Date, default: Date.now },
}, {
    timestamp: true
});

module.exports = mongoose.model('logReferral', referralSchema);