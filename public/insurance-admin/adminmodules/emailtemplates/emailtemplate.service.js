"use strict";
angular.module('emailtemplate')
.factory('emailService', ['$http','$resource', function($http, $resource){
	

	/**
	Get list of all templates
	Created By Suman Chakraborty
  	Last modified on 16-11-2017
	*/
	var getTemplates = function(){
		return $resource('/api/getMailTemplates', null, {
			save:{
				method: 'POST'
			}
		})
	};

	/**
  	Get template by ID
  	Created By Suman Chakraborty
  	Last modified on 16-11-2017
  	*/
	var getTemplateById = function() {
		return $resource('/api/editMailTemplate', null, {
			save:{
				method:'POST'
			}
		})
	}

	/**
  	Update template body by id
  	Created By Suman Chakraborty
  	Last modified on 16-11-2017
  	*/
	var updateTemplate = function() {
		return $resource('/api/updateMailTemplate', null, {
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