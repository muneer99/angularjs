// Schema for Doctors within ACO network its basically for maintain invitation log
'use strict';

var mongoose = require('mongoose');

var invitationReferralSchema = new mongoose.Schema({
  
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // referred doctor
    sentTo: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // referring doctor
    invitationDate: { type: Date, default: Date.now },
}, {
        timestamp: true
    });

module.exports = mongoose.model('invitationLogReferral', invitationReferralSchema);