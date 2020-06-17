"use strict";
var mongoose 	= require('mongoose');
var faxmodel 	= mongoose.model('faxTemplate');
module.exports 	= {
					getTemplates 	: getTemplates,
					updateTemplate 	: updateTemplate,
					getTemplateByKey: getTemplateByKey,
				}

/**
* Get template by any key in collection
* @request Object {key: value} where key should be an existing key in faxtemplates collection
* Created By Suman Chakraborty
* Last modified on 26-10-2017
*/
function getTemplateByKey(req,res){
	var keys 		= Object.keys(req.body);
	var query 		= {};
	query[keys[0]] 	= req.body[keys[0]];
	faxmodel.findOne(query,{},function(err, resp){
		if(err){
			 res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
		}else{
			res.json({ code: 200, message: 'success', data: resp});
		}
	})
}

/**
* Get all templates
* Created By Suman Chakraborty
* Last modified on 26-10-2017
*/
function getTemplates(req,res){
	faxmodel.find({},{}, function(err, resp){
		if(err){
			 res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
		}else{
			res.json({ code: 200, message: 'success', data: resp});
		}
	})
}

/**
* Update template body by ID
* @request Object {_id: value, body: value} 
* Created By Suman Chakraborty
* Last modified on 26-10-2017
*/
function updateTemplate(req,res){
	faxmodel.updateOne({_id: mongoose.Types.ObjectId(req.body._id)},{$set:{subject: req.body.subject, body: req.body.body}}, function(err, resp){
		if(err){
			 res.json({ code: 201, message: 'Request could not be processed. Please try again.', data: err });
		}else{
			res.json({ code: 200, message: 'success', data: resp});
		}
	})
}

