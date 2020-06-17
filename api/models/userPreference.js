// Schema for Doctors within ACO network its basically for mainting log
'use strict';

var mongoose = require('mongoose');

var prefSchema = new mongoose.Schema({

    userId 		: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    speciality 	: { type: mongoose.Schema.Types.ObjectId, ref: 'specialities' },
    preference 	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    isDeleted 	: { type: Boolean, default: false },
}, {
    timestamp: true
    
});

module.exports = mongoose.model('userPreference', prefSchema);