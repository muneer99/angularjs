// Schema for Doctors within ACO network its basically for mainting log
'use strict';

var mongoose = require('mongoose');

var referralSchema = new mongoose.Schema({
    firstName               : { type: String },
    lastName                : { type: String },
    network                 : { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
    specialities            : [ { type: mongoose.Schema.Types.ObjectId, ref: 'specialities' } ],
    services                : [ { type: mongoose.Schema.Types.ObjectId, ref: 'services' } ],
    serviceName             : { type: String, default: '' },
    other                   : { type: String, default: '' },
    referredBy              : { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // referring doctor
    frontDeskReferredBy     : { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // referring frontdesk user
    referredTo              : { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, //referred doctor
    patientInfo             : { type: mongoose.Schema.Types.ObjectId, ref: 'patients' },
    chiefComplain           : { type: String, default: '' },
    status                  : { type: Number, default: 0 }, // status can be 'Inbox'=0, 'Appt. Scheduled'=2, 'Appt. completed'=3, 'Note sent'=4, "Note Rec'd"=5, "Reject"=6
    acknowledged            : { type: Boolean, default: false }, // once the referring doc confirm that he has rec the fax this field will be true
    attachment              : { type: String, default: '' }, // attachment file name
    comment                 : { type: String, default: '' }, // stores reason of rejecting the referral
    referredDate            : { type: Date, default: Date.now }, 
    refByOprTime            : { type: Date }, // Last time when referrd by doctor perform any operation in this referral
    refToOprTime            : { type: Date }, // Last time when referrd to doctor perform any operation in this referral
    lastOperationOn         : { type: Date, default: Date.now },
    lastUpdatedOn           : { type: Date, default: Date.now }, // Last status update time
    isDeleted               : { type: Boolean, default: false },
}, {
        timestamp: true


    });

module.exports = mongoose.model('refers', referralSchema);