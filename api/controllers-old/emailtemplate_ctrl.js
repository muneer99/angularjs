"use strict"
var mongoose 	 = require('mongoose');
var mailTemplate = mongoose.model('mailtemplates');
module.exports 	 = {
	getMailTemplates 	: getMailTemplates,
	updateMailTemplate 	: updateMailTemplate,
	editMailTemplate : editMailTemplate,
	getEmailTemplateByKey : getEmailTemplateByKey
}

/**
* Get all templates
* Created By Suman Chakraborty
* Last modified on 16-11-2017
*/

function getMailTemplates(req,res){
	mailTemplate.find({},{}, function(err,resp){
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
* Last modified on 16-11-2017
*/
function editMailTemplate(req,res){
	mailTemplate.findOne({_id: mongoose.Types.ObjectId(req.body._id)},{}, function(err,resp){
		if(!err){
			res.json({ code: 200, message: 'success', data: resp});
		}else {
			res.json({ code: 201, message: 'Unable to process your request. Please try again...', data: err});
		}
	})
}

/**
* Get template by any key in collection
* @request Object {key: value} where key should be an existing key in faxtemplates collection
* Created By Suman Chakraborty
* Last modified on 26-10-2017
*/
function getEmailTemplateByKey(req,res){
	
	var keys 		= Object.keys(req.body);
	var query 		= {};
	query[keys[0]] 	= req.body[keys[0]];
	mailTemplate.findOne(query,{},function(err, resp){
		if(err){
			 res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
		}else{
			
			res.json({ code: 200, message: 'success', data: resp});
		}
	})
}

/**
* Update template by ID
* Created By Suman Chakraborty
* Last modified on 16-11-2017
*/
function updateMailTemplate(req,res){
	mailTemplate.updateOne({_id: mongoose.Types.ObjectId(req.body._id)}, {$set:{subject: req.body.subject, body: req.body.body}}, function(err,resp){
		if(!err){
			res.json({ code: 200, message: 'Updated successfully.'});
		}else {
			res.json({ code: 201, message: 'Unable to process your request. Please try again...', data: err});
		}
	})
}