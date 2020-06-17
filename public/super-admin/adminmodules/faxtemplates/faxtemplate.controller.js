"use strict"
angular.module('faxtemplate')
nwdApp.controller('faxtemplateController', [
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
    'faxService',
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
    	faxService
    	){
    	$scope.templateArr = [];
    	$scope.template;
        /**
    	Get list of all templates
    	Created By Suman Chakraborty
	  	Last modified on 26-10-2017
    	*/
	  	$scope.getTemplates = function () {
            $rootScope.loading = true;
			faxService.getTemplates().save({},function(resp){
				if (resp.code == 200) {
                    $rootScope.loading = false;
                	$scope.templateArr = resp.data;
                } else {
                    $rootScope.loading = false;
                    logger.logError(resp.message);
                }
			})
	  	};

	  	/**
	  	Get template by ID
	  	Created By Suman Chakraborty
	  	Last modified on 26-10-2017
	  	*/
	  	$scope.getTemplateById = function (req) {
            $rootScope.loading = true;
			faxService.getTemplateById().save({_id: $state.params.id},function(resp){
				if (resp.code == 200) {
                    $rootScope.loading         = false;
					resp.data.subject          = resp.data.subject;
                	$scope.template            = resp.data;
                    $scope.templateVariables   = faxTemplateVariables[resp.data.key];
                } else {
                    $rootScope.loading = false;
                    logger.logError(resp.message);
                }
			})
	  	};

	  	/**
	  	Update template body by id
	  	Created By Suman Chakraborty
	  	Last modified on 26-10-2017
	  	*/
	  	$scope.updateTemplate = function(req){
            $rootScope.loading = true;
	  		faxService.updateTemplate().save({_id: req._id, subject: req.subject, body: req.body},function(resp){
				if (resp.code == 200) {
                    $rootScope.loading = false;
					logger.logSuccess(resp.message);
					$state.go('fax')
                } else {
                    $rootScope.loading = false;
                    logger.logError(resp.message);
                }
			})

	  	}
    }
])
