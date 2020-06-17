//Schem for PHI access Log
'use strict';

var mongoose = require('mongoose');

var phiAccessLogSchema = new mongoose.Schema({
    patientId 		: { type: mongoose.Schema.Types.ObjectId, ref: 'patients' },
    accessBy 		: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // referring doctor
    activityType 	: {type: String, default:1}, // 1= view, 2= update, 3 = add, 4 = refer
    activityDetail 	: {type: String, default:''}, // activity in detail text if any
    accessOn 		: { type: Date, default: Date.now }
}, {
    timestamp: true
});

module.exports = mongoose.model('logPhiAccess', phiAccessLogSchema);