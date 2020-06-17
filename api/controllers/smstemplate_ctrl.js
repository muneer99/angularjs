"use strict"
var mongoose = require('mongoose');
var smsTemplate = mongoose.model('smstemplates');
module.exports ={
	getSmsTemplates 	: getSmsTemplates,
	updateSmsTemplate 	: updateSmsTemplate,
	getTemplateById : getTemplateById,
}

/**
* Get all templates
* Created By Suman Chakraborty
* Last modified on 08-01-2018
*/

function getSmsTemplates(req,res){
	smsTemplate.find({},{}, function(err,resp){
		if(!err){
			res.json({ code: 200, message: 'success', data: resp});
		}else {
			res.json({ code: 201, message: 'Unable to process your request. Please try again...', data: err});
		}
	})
}

/**
* Get template by ID
* Created By Suman Chakraborty
* Last modified on 08-01-2018
*/
function getTemplateById(req,res){
	smsTemplate.findOne({_id: mongoose.Types.ObjectId(req.body._id)},{}, function(err,resp){
		if(!err){
			res.json({ code: 200, message: 'success', data: resp});
		}else {
			res.json({ code: 201, message: 'Unable to process your request. Please try again...', data: err});
		}
	})
}

/**
* Update template by ID
* Created By Suman Chakraborty
* Last modified on 08-01-2018
*/
function updateSmsTemplate(req,res){
	smsTemplate.updateOne({_id: mongoose.Types.ObjectId(req.body._id)}, {$set:{body: req.body.body}}, function(err,resp){
		if(!err){
			res.json({ code: 200, message: 'Updated successfully.'});
		}else {
			res.json({ code: 201, message: 'Unable to process your request. Please try again...', data: err});
		}
	})
}