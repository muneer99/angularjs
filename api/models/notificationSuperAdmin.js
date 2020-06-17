"use strict";
var mongoose = require('mongoose');
var notificationSuperAdminSchema = new mongoose.Schema({
    key 		: { type: String },
    subject 	: { type: String },
    body        : { type: String },
    sentTo 	    : [ { type: mongoose.Schema.Types.ObjectId,default:'', ref: 'user' }],
   // user_ids 	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'doctors' }],
    deleted_by 	: [ { type: mongoose.Schema.Types.ObjectId, default:'', ref: 'user' }],
    status      : { type: Number, default: 0 }, // status can be 'unread'=0, 'read'=1, 
    isDeleted   : { type: Number, default: 0 }, // status can be 'undeleted'=0, 'deleted'=1
    created_at 	: { type: Date, default: Date.now }
});
module.exports = mongoose.model('notificationSuperAdmin', notificationSuperAdminSchema);