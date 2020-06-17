// Schema for User Preference Rating within ACO network its basically for mainting preference rating
'use strict';

var mongoose = require('mongoose');

var prefSchema = new mongoose.Schema({

    userId 		        : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    speciality 	        : { type: mongoose.Schema.Types.ObjectId, ref: 'specialities' },
    preferenceUserId 	: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    preferenceRating 	: { type: Number, default: 0 }
}, {
    timestamp: true

});

module.exports = mongoose.model('userPreferenceRating', prefSchema);