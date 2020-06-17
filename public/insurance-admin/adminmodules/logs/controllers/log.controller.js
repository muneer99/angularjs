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
    $scope.fileName = "PHI_logs ";
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
        $scope.excelExport(newDate);
		ngTableParamsService.set('', '', undefined, '');
		$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
			getData: function($defer, params) {
                // send an ajax request to your server. in my case MyResource is a $resource.
                ngTableParamsService.set(params.page(), params.count(), params.sorting());
                $scope.paramUrl     		= params.url();
                $scope.paramUrl.dateRange 	= {start: newDate.startDate.format('YYYY-MM-DD H:m:s'), end:newDate.endDate.format('YYYY-MM-DD H:m:s')};
                $scope.tableLoader  		= true;
                $scope.dataList     		= [];
                setTimeout(function () {
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
        var dateRng = {dateRange: { start: newDate.startDate.format('YYYY-MM-DD H:m:s'), end: newDate.endDate.format('YYYY-MM-DD H:m:s') }};
        logService.getPhiLog().save(dateRng, function (response) {
            if (response.code == 200) {
                // $scope.excelExportList = response.data;
                $scope.exportData = [];
                // Headers:
                $scope.exportData.push(["Patient Name", "Activity", "Accessed By", "Time/Date"]);
                angular.forEach(response.data, function (value, key) {
                    var name        = value.patientName ? value.patientName : '';
                    var activity    = value.activityDetail? value.activityDetail : '';
                    var date        = $filter('date')(value.accessOn, "MMM d, yyyy h:mm a");
                    var accBy       = value.accessBy ? value.accessBy : '';
                    $scope.exportData.push([name, activity, accBy, date]);
                });
                // myFunction();
            }
        })
    }

    // function myFunction() {
    //     setTimeout(function () {
    //         $scope.exportData = [];
    //         // Headers:
    //         $scope.exportData.push(["Patient Name", "Activity", "Accessed By", "Time/Date"]);
    //         angular.forEach($scope.excelExportList, function (value, key) {
    //             var name        = value.patientName ? value.patientName : '';
    //             var activity    = value.activityDetail? value.activityDetail : '';
    //             var date        = $filter('date')(value.accessOn, "MMM d, yyyy h:mm a");
    //             var accBy       = value.accessBy ? value.accessBy : '';
    //             $scope.exportData.push([name, activity, accBy, date]);
    //         });
    //     }, 2000);
    // }
}])


.directive('excelExportPhi',
    function () {
        return {
            restrict: 'A',
            scope: {
                fileName: "@",
                data: "&exportData"
            },
            replace: true,
            template: '<button class="btn btn-primary btn-ef btn-ef-3 btn-ef-3c mb-10" ng-click="download()">Export to Excel <i class="fa fa-download"></i></button>',
            link: function (scope, element) {
                scope.download = function () {
                    function datenum(v, date1904) {
                        if (date1904) v += 1462;
                        var epoch = Date.parse(v);
                        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
                    };
                    function getSheet(data, opts) {
                        var ws = {};
                        var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
                        for (var R = 0; R != data.length; ++R) {
                            for (var C = 0; C != data[R].length; ++C) {
                                if (range.s.r > R) range.s.r = R;
                                if (range.s.c > C) range.s.c = C;
                                if (range.e.r < R) range.e.r = R;
                                if (range.e.c < C) range.e.c = C;
                                var cell = { v: data[R][C] };
                                if (cell.v == null) continue;
                                var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                                if (typeof cell.v === 'number') cell.t = 'n';
                                else if (typeof cell.v === 'boolean') cell.t = 'b';
                                else if (cell.v instanceof Date) {
                                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                                    cell.v = datenum(cell.v);
                                }
                                else cell.t = 's';
                                ws[cell_ref] = cell;
                            }
                        }
                        if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                        return ws;
                    };

                    function Workbook() {
                        if (!(this instanceof Workbook)) return new Workbook();
                        this.SheetNames = [];
                        this.Sheets = {};
                    }

                    var wb = new Workbook(), ws = getSheet(scope.data());
                    /* add worksheet to workbook */
                    wb.SheetNames.push(scope.fileName);
                    wb.Sheets[scope.fileName] = ws;
                    var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

                    function s2ab(s) {
                        var buf = new ArrayBuffer(s.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                        return buf;
                    }
                    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), scope.fileName + '.xlsx');
                };
            }
        };
    }
);