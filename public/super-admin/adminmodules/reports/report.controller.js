"use strict";

angular.module("Report")

nwdApp.controller("reportController", [
    '$scope',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$sessionStorage',
    '$location',
    'logger',
    '$state',
    '$stateParams',
    'ngTableParamsService',
    'ngTableParams',
    '$filter',
    'reportService',
    function(
        $scope,
        $mdDialog,
        $q,
        $rootScope,
        $sessionStorage,
        $location,
        logger,
        $state,
        $stateParams,
        ngTableParamsService,
        ngTableParams,
        $filter,
        reportService
    ) {
        $scope.currentPage  = 1;
        $scope.itemPerPage  = 10;
        $scope.statusArr    = ['Inbox', 'Scheduled', 'Completed', 'Note faxed', 'Filed'];
        $scope.pageTitle    = 'Report';
        $scope.docArr       = [];

        /**
        * Search from listing page 
        */
        $scope.searchable = function(searchTextField) {
            $scope.searchUrl = {};
            if (typeof searchTextField === 'string') {
                ngTableParamsService.set('', '', searchTextField, '');
            } else {
                if (typeof searchTextField.referringDoc !== 'undefined' && searchTextField.referringDoc !== null) {
                    $scope.searchUrl.referredBy = searchTextField.referringDoc.id;
                }
                if (typeof searchTextField.referredDoc !== 'undefined' && searchTextField.referredDoc !== null) {
                    $scope.searchUrl.referredTo = searchTextField.referredDoc.id;
                }
                if (typeof searchTextField.fromDate !== 'undefined' && typeof searchTextField.toDate !== 'undefined') {
                    $scope.searchUrl.fromDate   = searchTextField.fromDate.toISOString();
                    $scope.searchUrl.toDate     = searchTextField.toDate.toISOString();
                }
                ngTableParamsService.set('', '', '', '');
            }

            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    ngTableParamsService.set(params.page(), params.count(), searchTextField, params.sorting());
                    $scope.paramUrl     = Object.assign($scope.searchUrl, params.url());
                    $scope.tableLoader  = true;
                    $scope.dataList     = [];
                    reportService.getReferralList().save($scope.paramUrl, function(response) {
                        $scope.tableLoader  = false;
                        $scope.dataList     = response.data;
                        var data            = response.data;
                        $scope.totalCount   = data.length;
                        params.total(data.length);
                        $defer.resolve(data);
                    });
                }
            });
        };
        /**
        * Get all referral list
        */
        $scope.getReferralList = function() {
            $scope.pageTitle = 'Referral List';
            ngTableParamsService.set('', '', undefined, '');
            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
                getData: function($defer, params) {
                    // send an ajax request to your server. in my case MyResource is a $resource.
                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
                    $scope.paramUrl     = params.url();
                    $scope.tableLoader  = true;
                    $scope.dataList     = [];
                    reportService.getReferralList().save($scope.paramUrl, function(response, err) {
                        if (response.code == 200) {
                            $scope.tableLoader  = false;
                            $scope.dataList     = response.data;
                            var data            = response.data;
                            $scope.totalCount   = response.totalCount;
                            params.total(response.totalCount);
                            $defer.resolve(data);
                        } else {
                            logger.logError(response.message);
                        }
                    });
                }
            });
        }
        $scope.searchTerm;
        $scope.clearSearchTerm = function() {
            $scope.searchTerm = '';
        };

        /**
        * get user details
        */
        $scope.loadUsers = function() {
            var deferred = $q.defer();
            reportService.loadUsers().get(function(res, err) {
                if (res.code === 200) {
                    $scope.docArr = res.data.map(function(item) {
                        return {
                            id: item._id,
                            value: (item.lastname != undefined) ? item.lastname.toLowerCase() : '',
                            lastname: item.lastname,
                            userType: item.userType
                        };
                    })
                    deferred.resolve();
                }
                return deferred.promise;
            })
        }

        $scope.querySearch = function(query) {
            var results = query ? $scope.docArr.filter($scope.createFilterFor(query)) : $scope.docArr,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() { deferred.resolve(results); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        $scope.querySearchProviders = function(query) {
            var results = query ? $scope.docArr.filter($scope.createFilterFor(query)) : $scope.docArr,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() { deferred.resolve(results); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        $scope.createFilterFor = function(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.value.indexOf(lowercaseQuery) === 0);
            };
        }

        $scope.searchData = function() {
        }
        $scope.status           = '  ';
        $scope.customFullscreen = false;
        $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                    controller          : DialogController,
                    template            : "<md-dialog style='max-width: 65%; max-height: 66%;' aria-label='Mango (Fruit)'> <form ng-cloak> <md-toolbar> <div class='md-toolbar-tools'> <h2>Mango (Fruit)</h2> <span flex></span> <md-button class='md-icon-button' ng-click='cancel()'> <md-icon md-svg-src='img/icons/ic_close_24px.svg' aria-label='Close dialog'></md-icon> </md-button> </div></md-toolbar> <md-dialog-content> <div class='md-dialog-content'> <h2>Using .md-dialog-content class that sets the padding as the spec</h2> <p> The mango is a juicy stone fruit belonging to the genus Mangifera, consisting of numerous tropical fruiting trees, cultivated mostly for edible fruit. The majority of these species are found in nature as wild mangoes. They all belong to the flowering plant family Anacardiaceae. The mango is native to South and Southeast Asia, from where it has been distributed worldwide to become one of the most cultivated fruits in the tropics. </p><img style='margin: auto; max-width: 100%;' alt='Lush mango tree' src='img/mangues.jpg'> <p> The highest concentration of Mangifera genus is in the western part of Malesia (Sumatra, Java and Borneo) and in Burma and India. While other Mangifera species (e.g. horse mango, M. foetida) are also grown on a more localized basis, Mangifera indica&mdash;the 'common mango' or 'Indian mango'&mdash;is the only mango tree commonly cultivated in many tropical and subtropical regions. </p><p> It originated in Indian subcontinent (present day India and Pakistan) and Burma. It is the national fruit of India, Pakistan, and the Philippines, and the national tree of Bangladesh. In several cultures, its fruit and leaves are ritually used as floral decorations at weddings, public celebrations, and religious ceremonies. </p></div></md-dialog-content> <md-dialog-actions layout='row'> <md-button href='http://en.wikipedia.org/wiki/Mango' target='_blank' md-autofocus> More on Wikipedia </md-button> <span flex></span> <md-button ng-click='answer()'> Not Useful </md-button> <md-button ng-click='answer()'> Useful </md-button> </md-dialog-actions> </form></md-dialog>",
                    parent              : angular.element(document.body),
                    targetEvent         : ev,
                    clickOutsideToClose : true,
                    fullscreen          : $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }

    }


]);