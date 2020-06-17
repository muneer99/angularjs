"use strict"

angular.module('Log')
    .factory('logService', ['$http', '$resource', function ($http, $resource) {
        var getPhiLog = function () {
            return $resource('/api/getPhiLog', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var getUserActvLog = function () {
            return $resource('/api/getUserActvLog', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var getInvitationLog = function () {
            return $resource('/api/getInvitationLog', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var getInvitationList = function (id) {
            return $resource('/api/getInvitationList/'+id, null, {
                save: {
                    method: 'POST',
                    id: '@id'
                }
            });
        }         
        var getInvitationListById = function (id) {
            return $resource('/api/getInvitationListById/:id', null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }        
        return {
            getPhiLog: getPhiLog,
            getUserActvLog: getUserActvLog,
            getInvitationLog: getInvitationLog,
            getInvitationList: getInvitationList,
            getInvitationListbyId: getInvitationListById
        }
    }])


