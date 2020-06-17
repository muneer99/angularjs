// Doctors that are specialised within ACO network

'use strict';

var mongoose = require('mongoose');

var specialitySchema = new mongoose.Schema({
    specialityCode 	: { type: String },
    specialityDescp : { type: String },
    specialityName 	: { type: String },
    searchKey 		: { type: String},
    status 			: { type: String, default: '1' }, //0-InActive, 1-Active, 2- Deactive
    sendPtRef		: { type: String, default: '1' }, //0-InActive, 1-Active
    has_services 	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
    isDeleted 		: { type: Boolean, default: false },
});
module.exports = mongoose.model('specialities', specialitySchema);
