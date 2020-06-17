"use strict";
angular.module('faxtemplate')
.factory('faxService', ['$http','$resource', function($http, $resource){
	

	/**
	Get list of all templates
	Created By Suman Chakraborty
  	Last modified on 26-10-2017
	*/
	var getTemplates = function(){
		return $resource('/api/getTemplates', null, {
			save:{
				method: 'POST'
			}
		})
	};

	/**
  	Get template by ID
  	Created By Suman Chakraborty
  	Last modified on 26-10-2017
  	*/
	var getTemplateById = function(){
		return $resource('/api/getTemplateByKey', null, {
			save:{
				method:'POST'
			}
		})
	}

	/**
  	Update template body by id
  	Created By Suman Chakraborty
  	Last modified on 26-10-2017
  	*/
	var updateTemplate = function(){
		return $resource('/api/updateTemplate', null, {
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