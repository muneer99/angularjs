//Schem for PHI access Log
'use strict';

var mongoose = require('mongoose');

var logUserActivitySchema = new mongoose.Schema({
    userId 		: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // User id
    type 		: { type: String, default:1}, // 1 = Registration 2 = login, 3 = logout 4 = view, 5 = create, 6 = update, 7 = refer, 8 = forget password, 9=change password 10 =reset password 11= resend invitation 12 = doctor change availability 13= delete
    detail 		: { type: String, default:''}, // activity in detail text if any
    success 	: { type: Boolean, default: false}, // if the activity is success then true or false
    createdOn 	: { type: Date, default: Date.now }
}, {
    timestamp: true
});

module.exports = mongoose.model('logUserActivity', logUserActivitySchema);