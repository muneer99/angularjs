'use strict';

var mongoose = require('mongoose');
var hospitalSchema = new mongoose.Schema({
    hospital_name : {type:String},
    searchKey 	  : {type:String},
    reg_no        : {type:String},
    address       : {type:String},
    city          : {type:String},
    state         : {type:String},
    phone_no      : {type:String},
    status	      : {type:String, default : '1'} // 1 = Active 0 = inactive
});
module.exports = mongoose.model('hospitals', hospitalSchema);