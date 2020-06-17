"use strict";
angular.module('smstemplate')
.factory('smsService', ['$http','$resource', function($http, $resource){
	

	/**
	Get list of all templates
	Created By Suman Chakraborty
  	Last modified on 08-01-2018
	*/
	var getTemplates = function(){
		return $resource('/api/getSmsTemplates', null, {
			save:{
				method: 'POST'
			}
		})
	};

	/**
  	Get template by ID
  	Created By Suman Chakraborty
  	Last modified on 08-01-2018
  	*/
	var getTemplateById = function() {
		return $resource('/api/editSmsTemplate', null, {
			save:{
				method:'POST'
			}
		})
	}

	/**
  	Update template body by id
  	Created By Suman Chakraborty
  	Last modified on 08-01-2018
  	*/
	var updateTemplate = function() {
		return $resource('/api/updateSmsTemplate', null, {
			save:{
				method:'POST'
			}
		})
	}

	return {
		getTemplateById:getTemplateById,
		getTemplates:getTemplates,
		updateTemplate:updateTemplate
	}

}]);