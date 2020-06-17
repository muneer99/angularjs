"use strict";
angular.module("Invitation", [])

nwdApp.controller('InvitationLogViewController', [
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
    function (
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


        $scope.invitationUserActvDate = {
            startDate: null,//moment().subtract(30, "days"),
            endDate: null//moment()
        };

        $scope.fileName = "user_actvity";
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
        * Export report to excel
        * Created By Suman Chakraborty
        * Last Modified on 23-03-2018
        */
        $scope.excelExport = function (newDate) {
            var dateRng = { dateRange: { start: newDate.startDate.format('YYYY-MM-DD H:m:s'), end: newDate.endDate.format('YYYY-MM-DD H:m:s') } };
            logService.getInvitationLog().save(dateRng, function (response) {
                if (response.code == 200) {
                    // $scope.excelExportList = response.data;
                    $scope.exportData = [];
                    // Headers:
                    $scope.exportData.push(["Name", "Activity", "Status", "Time/Date"]);
                    angular.forEach(response.data, function (value, key) {
                        var name = value.name ? value.name : '';
                        var activity = value.detail ? value.detail : '';
                        var date = $filter('date')(value.createdOn, "MMM d, yyyy h:mm a");
                        var status = value.status ? value.status : '';
                        $scope.exportData.push([name, activity, status, date]);
                    });
                    //myFunction();
                }
            })
        }
        /**
       * invitation log listing 
       * Created By Arvind Singh
       * Last Modified on 01-11-2018
       */
        $scope.$watch('invitationUserActvDate', function (newDate) {
            // $scope.getInvitationList = function () {
            //$rootScope.loading = true;
            var tt = $state.params.id;
            $scope.tableLoader = true;
            // $scope.excelExport(newDate);
            //console.log(" inside getInvitationList controller ", tt);//die;
            // $scope.paramUrl = params.url();

            ngTableParamsService.set('', '', undefined, '');
            //console.log(" get getInvitationList===>  ", newDate); //die;
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    //console.log(" inside........... ", $scope.tableParams);
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), params.sorting());
                    $scope.paramUrl = params.url();
                    if(newDate && newDate.hasOwnProperty('startDate') && newDate.startDate && newDate 
                        && newDate.hasOwnProperty('endDate') && newDate.endDate){

                     $scope.paramUrl.dateRange = { start: newDate.startDate.format('YYYY-MM-DD H:m:s'), end: newDate.endDate.format('YYYY-MM-DD H:m:s') };
                    }
                    $scope.tableLoader = true;
                    $scope.dataList = [];
                    setTimeout(function () {
                        //console.log('$scope.paramUrl', $scope.paramUrl);
                        logService.getInvitationList(tt).save($scope.paramUrl, function (response) {
                            if (response.code == 200) {
                                $scope.InvitationList = response.data;
                                $scope.tableLoader = false;
                                var data = response.data;
                                $scope.totalCount = response.totalCount;
                                params.total(response.totalCount);
                                $defer.resolve(data);
                            } else {
                                logger.logError(response.message);
                            }
                        });
                    }, 2000);
                }
            })



            // }
        })




        function myFunction() {
            setTimeout(function () {
                $scope.exportData = [];
                // Headers:
                $scope.exportData.push(["Name", "Activity", "Status", "Time/Date"]);
                angular.forEach($scope.excelExportList, function (value, key) {
                    var name = value.name ? value.name : '';
                    var activity = value.detail ? value.detail : '';
                    var date = $filter('date')(value.createdOn, "MMM d, yyyy h:mm a");
                    var status = value.status ? value.status : '';
                    $scope.exportData.push([name, activity, status, date]);
                });
            }, 2000);
        }
    }])
