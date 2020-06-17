// Schema for Doctors within ACO network its basically for mainting log
'use strict';

var mongoose = require('mongoose');

var userNetwork = new mongoose.Schema({

    userId 		        : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    network 	        : { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
    status              : { type: String, default: '1' }, //0-Active, 1-Not-Active,
    // status           : { type: String, default: '1' }, //0-InActive, 1-Active, 2- Deactive
    isDeleted 	        : { type: Boolean, default: false },
    createdDate             : { type: Date, default: Date.now },
    modifiedDate            : { type: Date, default: Date.now },
    createdBy               : { type: String, enum: ['admin', 'user', 'staff'], default: 'admin' },
    createdById             : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, {
    timestamp: true

});

module.exports = mongoose.model('userNetwork', userNetwork);