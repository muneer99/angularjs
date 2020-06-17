"use strict";
angular.module('notification')
	.factory('notificationService', ['$http', '$resource', '$rootScope', function ($http, $resource, $rootScope) {


		/**
		Get list of all templates
		Created By Nagarjuna
			Last modified on 06-03-2018
		*/
		var getTemplates = function () {
			return $resource('/api/getnotificationTemplate', null, {
				save: {
					method: 'POST'
				}
			})
		};

		/**
			Get template by ID
			Created By Nagarjuna
			Last modified on 66-03-2018
			*/
		var getTemplateById = function () {
			return $resource('/api/editNotificationTemplate', null, {
				save: {
					method: 'POST'
				}
			})
		}

		/**
			Update template body by id
			Created By Nagarjuna
			Last modified on 06-03-2018
			*/
		var sendNotification = function () {
			return $resource('/api/sendnotification', null, {
				save: {
					method: 'POST'
				}
			})
		}

		return {
			getTemplateById: getTemplateById,
			getTemplates: getTemplates,
			sendNotification: sendNotification
		}

	}]);