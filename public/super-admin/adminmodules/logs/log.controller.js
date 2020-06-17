"use strict";
angular.module("Log",[])

nwdApp.controller('LogController', [
	'$scope',
    '$rootScope',
    '$sessionStorage',
    '$location',
    'logger',
    'logProvider',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParams',
    '$filter',
    'logService',
    function(
        $scope,
        $rootScope,
        $sessionStorage,
        $location,
        logger,
        logProvider,
        $state,
        $stateParams,
        ngTableParamsService,
        ngTableParams,
        $filter,
        logService
    ) {

    // Default start date and end date of the date picker
	$scope.date = {
	    startDate: moment().subtract(1, "days"),
	    endDate: moment()
    };
    $scope.userActvDate = {
	    startDate: moment().subtract(1, "days"),
	    endDate: moment()
    };

    $scope.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "Apply",
            fromLabel: "From",
       		format: 'MM/DD/YYYY',
            toLabel: "To",
            cancelLabel: 'Cancel',
            customRangeLabel: 'Custom range'
        },
        ranges: {
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 15 Days': [moment().subtract(14, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()]
        }
        
    };

    /**
    * PHI access list populate based on date range selection
    * Created By Suman Chakraborty
    * Last Modified on 07-12-2017
    */
    $scope.$watch('date', function(newDate) {
        $scope.tableLoader = true;
    		ngTableParamsService.set('', '', undefined, '');
    		$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
    			getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), params.sorting());
                    $scope.paramUrl     		= params.url();
                    $scope.paramUrl.dateRange 	= {start: newDate.startDate.format('YYYY-MM-DD H:m:s'), end:newDate.endDate.format('YYYY-MM-DD H:m:s')};
                    $scope.tableLoader  		= true;
                    $scope.dataList     		= [];
                   logService.getPhiLog().save($scope.paramUrl, function(response) {
                        if (response.code == 200) {
                            $scope.phiLogArr 	= response.data;
                            $scope.tableLoader  = false;
                            var data            = response.data;
                            $scope.totalCount   = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }
    		})
    }, false);
}])