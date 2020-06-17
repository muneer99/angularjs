"use strict";
angular.module("referral", [])

nwdApp.controller('referralsController', [
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
    'referralsService',
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
        referralsService
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
                applyClass      : 'btn-green',
                applyLabel      : "Apply",
                fromLabel       : "From",
                format          : 'MM/DD/YYYY',
                toLabel         : "To",
                cancelLabel     : 'Cancel',
                customRangeLabel: 'Custom range'
            },
            ranges: {
                'Last 7 Days'   : [moment().subtract(6, 'days'), moment()],
                'Last 15 Days'  : [moment().subtract(14, 'days'), moment()],
                'Last 30 Days'  : [moment().subtract(29, 'days'), moment()]
            }

        };

        $scope.fileName         = "referrals";
        $scope.referralsList    = [];
        $scope.excelExportList  = [];
        /**
        * Referrals list populate based on date range selection
        * Created By Suman Chakraborty
        * Last Modified on 21-03-2018
        */
        $scope.$watch('date', function (newDate) {
            $scope.tableLoader = true;
            ngTableParamsService.set('', '', undefined, '');
            $scope.excelExport(newDate);
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function ($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), params.sorting());
                    $scope.paramUrl             = params.url();
                    $scope.paramUrl.dateRange   = { start: newDate.startDate.format('YYYY-MM-DD H:m:s'), end: newDate.endDate.format('YYYY-MM-DD H:m:s') };
                    $scope.tableLoader          = true;
                    $scope.dataList             = [];
                    setTimeout(function () {
                        referralsService.getReferralsList().save($scope.paramUrl, function (response) {
                            if (response.code == 200) {
                                $scope.referralsList = response.data;
                                $scope.tableLoader  = false;
                                var data            = response.data;
                                $scope.totalCount   = response.totalCount;
                                params.total(response.totalCount);
                                $defer.resolve(data);
                            } else {
                                logger.logError(response.message);
                            }
                        });
                    },2000);
                }
            })
        }, false);

        /**
        * Export report to excel
        * Created By Suman Chakraborty
        * Last Modified on 23-03-2018
        */
        $scope.excelExport = function (newDate) {
            $scope.dateRange = { start: newDate.startDate.format('YYYY-MM-DD H:m:s'), end: newDate.endDate.format('YYYY-MM-DD H:m:s') };
            referralsService.exportReferralsList().save($scope.dateRange, function (response) {
                if (response.code == 200) {
                    //$scope.excelExportList = response.data;
                    $scope.exportData = [];
                    // Headers:
                    $scope.exportData.push(["Sending Provider", "Receiving Provider", "Insurance", "Time/Date", "Specialty", "Service"]);
                    // Data:
                    angular.forEach(response.data, function (value, key) {
                        var referredBy_Name = (value.referredBy)? value.referredBy.firstname ? value.referredBy.firstname + " " + value.referredBy.lastname : '': '';
                        var referredTo_Name = (value.referredTo)? value.referredTo.firstname ? value.referredTo.firstname + " " + value.referredTo.lastname : '':'';
                        var referredDate    = $filter('date')(value.referredDate, "MMM d, yyyy h:mm a");
                        var network         = value.network ? value.network.name : '';
                        var specialities    = value.specialities.length != 0 ? value.specialities[0].specialityName : '';
                        var service         = (value.serviceName)?value.serviceName:'';
                        $scope.exportData.push([referredBy_Name, referredTo_Name, network, referredDate, specialities, service]);
                    });
                    // myFunction();
                }
            })
        }


        // function myFunction() {
        //     setTimeout(function () {
        //         // $scope.exportData = [];
        //         // // Headers:
        //         // $scope.exportData.push(["Sending Provider", "Receiving Provider", "Insurance", "Time/Date", "Specialty", "Service"]);
        //         // // Data:
        //         // angular.forEach($scope.excelExportList, function (value, key) {
        //         //     var referredBy_Name = value.referredBy.firstname ? value.referredBy.firstname + " " + value.referredBy.lastname : '';
        //         //     var referredTo_Name = value.referredTo.firstname ? value.referredTo.firstname + " " + value.referredTo.lastname : '';
        //         //     var referredDate    = $filter('date')(value.referredDate, "MMM d, yyyy h:mm a");
        //         //     var network         = value.network ? value.network.name : '';
        //         //     var specialities    = value.specialities.length != 0 ? value.specialities[0].specialityName : '';
        //         //     var service         = (value.serviceName)?value.serviceName:'';
        //         //     $scope.exportData.push([referredBy_Name, referredTo_Name, network, referredDate, specialities, service]);
        //         // });
        //     }, 1);
        // }
    }]);