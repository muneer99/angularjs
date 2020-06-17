'use strict';

var mongoose = require('mongoose');
var faqSchema = new mongoose.Schema({
    title           : {type:String},
    page            : {type:String},
    description 	: {type:String},
    youtube_link    : {type:String},
    status	        : {type:String, default : '1'} // 1 = Active 0 = inactive
});
module.exports = mongoose.model('faqs', faqSchema);