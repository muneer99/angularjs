"use strict"
angular.module('smstemplate')
nwdApp.controller('smstemplateController', [
	'$scope',
    '$window',
    '$rootScope',
    '$location',
    'logger',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParams',
    '$filter',
    'smsService',
    function(
    	$scope,
    	$window,
    	$rootScope,
    	$location,
    	logger,
    	$state,
    	$stateParams,
    	ngTableParamsService,
    	ngTableParams,
    	$filter,
    	smsService
    	){
    	$scope.templateArr = [];
    	$scope.template;

    	/**
    	Get list of all templates
    	Created By Suman Chakraborty
	  	Last modified on 08-01-2018
    	*/
	  	$scope.getTemplates = function () {
			smsService.getTemplates().save({},function(resp){
				if (resp.code == 200) {
                	$scope.templateArr = resp.data;
                } else {
                    logger.logError(resp.message);
                }
			})
	  	};

	  	/**
	  	Get template by ID
	  	Created By Suman Chakraborty
	  	Last modified on 08-01-2018
	  	*/
	  	$scope.getTemplateById = function (req) {
			smsService.getTemplateById().save({_id: $state.params.id},function(resp){
				if (resp.code == 200) {
					resp.data.subject          = $filter('capitalize')(resp.data.subject);
                	$scope.template            = resp.data;
                    $scope.templateVariables   = smsTemplateVariables[resp.data.key];
                } else {
                    logger.logError(resp.message);
                }
			})
	  	};

	  	/**
	  	Update template body by id
	  	Created By Suman Chakraborty
	  	Last modified on 08-01-2018
	  	*/
	  	$scope.updateTemplate = function(req){
            // Remove all html tags from the content
            req.body = req.body.replace(/<\/?[^>]+(>|$)/g, "");
	  		smsService.updateTemplate().save({_id: req._id, body: req.body},function(resp){
				if (resp.code == 200) {
					logger.logSuccess(resp.message);
					$state.go('sms-list')
                } else {
                    logger.logError(resp.message);
                }
			})

	  	}
    }
])
