"use strict";
angular.module("notification");
nwdApp.controller("notificationController", [
  "$scope",
  "$window",
  "$rootScope",
  "$location",
  "logger",
  "$state",
  "$stateParams",
  "ngTableParamsService",
  "ngTableParams",
  "$filter",
  "notificationService",
  "doctorService",
  "insuranceService",
  function (
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
    notificationService,
    doctorService,
    insuranceService
  ) {
    $scope.templateArr = [];
    $scope.template = {};
    $scope.template.sendto = [];
    $scope.usStates = stateList;
    /**
    	Get list of all templates
    	Created By Suman Chakraborty
	  	Last modified on 16-11-2017
    	*/
    $scope.getTemplates = function () {
      notificationService.getTemplates().save({}, function (resp) {
        if (resp.code == 200) {
          $scope.templateArr = resp.data;
          logger.logSuccess(resp.message);
        } else {
          logger.logError(resp.message);
        }
      });
    };

    /**
		Get template by ID
		Created By Suman Chakraborty
		Last modified on 16-11-2017
		*/
    $scope.getTemplateById = function (req) {
      notificationService
        .getTemplateById()
        .save({ _id: $state.params.id }, function (resp) {
          if (resp.code == 200) {
            resp.data.subject = $filter("capitalize")(resp.data.subject);
            $scope.template = resp.data;
            $scope.templateVariables =
              notificationTemplateVariables[resp.data.key];
            logger.logSuccess(resp.message);
          } else {
            logger.logError(resp.message);
          }
        });
    };

    /**
		Update template body by id
		Created By Suman Chakraborty
		Last modified on 17-11-2017
		*/
    $scope.sendNotification = function (req) {
      $rootScope.loading = true;
      notificationService.sendNotification().save(req, function (resp) {
        if (resp.code == 200) {
          logger.logSuccess("Send Successfully");
          // $window.setTimeout(function () {
          // 	$window.location.reload();
          // }, 200);
          //   $scope.template = null;
          //   $rootScope.loading = false;
        } else {
          logger.logError(resp.message);
          $window.setTimeout(function () {
            $window.location.reload();
          }, 200);
          $rootScope.loading = false;
        }
      });
      $rootScope.loading = false;
    };

    $scope.getAvailableProviders = function () {
      $scope.template = {};
      $rootScope.loading = true;
      // get all providers
      doctorService.getDoctorsList().save({}, function (response) {
        if (response.code == 200) {
          // response.data.forEach(function (item) {
          // 	item['fullname'] =  item.firstname+' '+ item.lastname +' ('+item.email+')';
          // })
          //console.log(" item ", response);
          response.data.map(function (item, index) {
            item["fullname"] =
              item.firstname + " " + item.lastname + " (" + item.email + ")";
            return item;
          });

          $rootScope.loading = false;
          $scope.providerData = response.data;
        } else {
        }
      });

      insuranceService.getNetwork().get({ id: "000" }, function (response) {
        if (response.code == 200) {
          //response.data       = response.data.map(function (item) { item.name = $filter('capitalize')(item.name); return item; })
          // sort actual data alphabetically
          response.data.sort(function (a, b) {
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
          });
          $scope.networkData = response.data;
        } else {
        }
      });
      doctorService.GetSpecialty().get({}, function (response) {
        if (response.code == 200) {
          $scope.specialityData = response.data;
        } else {
        }
      });
    };
  },
]);
