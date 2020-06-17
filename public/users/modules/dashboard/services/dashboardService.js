"use strict"
angular.module("Dashboard")

nwdApp.factory('dashboardService', ['$http', '$resource', 'AuthenticationService', function($http, $resource, AuthenticationService) {

    var getDashboardList = function() {
        return $resource('/api/getDashboardList', null, {
            get: {
                method: 'GET'
            }
        });
    }
    var getDashboardItem = function() {
        return $resource('/api/getDashboardItem', null, {
            save: {
                method: 'POST'
            }
        });
    }

    var UserLogout = function() {
        return $resource('/api/userLogOut', null, {
            save: {
                method: 'POST'
            }
        });
    }
    var setStatus = function() {
        return $resource('/api/setStatus', null, {
            save: {
                method: 'POST'
            }
        });
    }


    var getReferralDetail = function() {
        return $resource('/api/getReferralDetail', null, {
            save: {
                method: 'POST'
            }
        });
    }
    var getReferralLog = function() {
        return $resource('/api/getReferralLog', null, {
            save: {
                method: 'POST'
            }
        });
    }

    // var getReferredTo = function() {
    //     return $resource('/api/getReferredTo', null, {
    //         save: {
    //             method: 'POST'
    //         }
    //     });
    // }
    // var getReferredBy = function() {
    //     return $resource('/api/getReferredBy', null, {
    //         save: {
    //             method: 'POST'
    //         }
    //     });
    // }

    var setReferralStatus = function() {
        return $resource('/api/setReferralStatus', null, {
            save: {
                method: 'POST'
            }
        });
    }

    var sendAck = function() {
        return $resource('/api/sendAck', null, {
            save: {
                method: 'POST'
            }
        });
    }
    var getCount = function() {
        return $resource('/api/getCount', null, {
            get: {
                method: 'GET'
            }
        });
    }

    var notificationDeletedByUser = function() {
        return $resource('/api/notificationDeletedByUser', null, {
            get: {
                method: 'GET'
            }
        });
    }

    return {
        getDashboardList: getDashboardList,
        getDashboardItem: getDashboardItem,
        UserLogout: UserLogout,
        setStatus: setStatus,
        // getReferredTo: getReferredTo,
        // getReferredBy: getReferredBy,
        setReferralStatus: setReferralStatus,
        sendAck: sendAck,
        getReferralDetail: getReferralDetail,
        getReferralLog: getReferralLog,
        getCount:getCount,
        notificationDeletedByUser:notificationDeletedByUser
    }

}]);