"use strict";
var mongoose = require('mongoose');
var notificationSchema = new mongoose.Schema({
    key 		: { type: String },
    subject 	: { type: String },
    body        : { type: String },
    sendto 	    : [ { type: mongoose.Schema.Types.ObjectId, ref: 'doctors' }],
    user_ids 	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'doctors' }],
    deleted_by 	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'doctors' }],
    created_at 	: { type: Date, default: Date.now }
});
module.exports = mongoose.model('notification', notificationSchema);