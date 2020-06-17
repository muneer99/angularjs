'use strict';

var mongoose = require('mongoose');

var serviceSchema = new mongoose.Schema({
    serviceCode 	: { type: String },
    serviceName 	: { type: String, default: null },
    searchKey 		: { type: String, default: null },
    serviceDescrip 	: { type: String },
    status 			: { type: String, default: '1' }, //0-InActive, 1-Active, 2- Deactive
    isDeleted 		: { type: Boolean, default: false },
    verified 		: { type: Boolean, default: true }

});
module.exports = mongoose.model('services', serviceSchema);
