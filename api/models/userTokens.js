// Schema for Doctors within ACO network its basically for mainting log
'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({

    userId 			: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    token 			: { type: String, default:''},
    lastActivityTime: { type: Date }
}, {
    timestamp: true
});

module.exports = mongoose.model('userToken', schema);