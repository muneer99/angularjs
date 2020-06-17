"use strict"
angular.module('emailtemplate')
nwdApp.controller('emailtemplateController', [
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
    'emailService',
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
    	emailService
    	){
    	$scope.templateArr = [];
    	$scope.template;

    	/**
    	Get list of all templates
    	Created By Suman Chakraborty
	  	Last modified on 16-11-2017
    	*/
	  	$scope.getTemplates = function () {
			emailService.getTemplates().save({},function(resp){
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
	  	Last modified on 16-11-2017
	  	*/
	  	$scope.getTemplateById = function (req) {
            $rootScope.loading      = true;
			emailService.getTemplateById().save({_id: $state.params.id},function(resp){
				if (resp.code == 200) {
                    $rootScope.loading         = false;
					resp.data.subject          = resp.data.subject;
                	$scope.template            = resp.data;
                    $scope.templateVariables   = emailTemplateVariables[resp.data.key];
                } else {
                    $rootScope.loading = false;
                    logger.logError(resp.message);
                }
			})
	  	};

	  	/**
	  	Update template body by id
	  	Created By Suman Chakraborty
	  	Last modified on 17-11-2017
	  	*/
	  	$scope.updateTemplate = function(req){
            $rootScope.loading = true;
	  		emailService.updateTemplate().save({_id: req._id, subject: req.subject, body: req.body},function(resp){
				if (resp.code == 200) {
                    $rootScope.loading = false;
					logger.logSuccess(resp.message);
					$state.go('email')
                } else {
                    $rootScope.loading = false;
                    logger.logError(resp.message);
                }
			})

	  	}
    }
])
