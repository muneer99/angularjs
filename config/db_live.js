'use strict';
console.log('db.js compiled')
/* DB */
var mongoose = require('mongoose');
require('../api/models/users');
require('../api/models/userTokens');
require('../api/models/network');
require('../api/models/titles');
require('../api/models/frontdesktitles');
//require('../api/models/doctors');
require('../api/models/patient');
require('../api/models/referral');
require('../api/models/logReferral');
require('../api/models/invitationLogReferral');
require('../api/models/logPhiAccess');
require('../api/models/logUserActivities');
require('../api/models/service');
require('../api/models/speciality');
require('../api/models/userPreference');
require('../api/models/userPreferenceRating');
require('../api/models/faxTemplates');
require('../api/models/mailTemplates');
require('../api/models/smsTemplates');
require('../api/models/contactUs');
require('../api/models/hospital');
require('../api/models/faq');
require('../api/models/notification');
require('../api/models/notificationSuperAdmin');
var fs = require('fs');
var config;
var confFile;
if(process.env.NODE_ENV != 'production'){
	//confFile = '/home/sumanc/config.js';
	confFile = '/home/soumalyagan/config.js';
}else {
    confFile = '/home/nw-admin/whichdocs/config/config.js';
}
fs.readFile(confFile, "utf8",  function read(err, data) {
    if (!err) {
        config = JSON.parse(data);
		if (process.env.NODE_ENV == 'production') {
		    mongoose.connect(config.db.prd.url, {
		        user: config.db.prd.user,
		        pass: config.db.prd.pass
		    });
		} else {
			 mongoose.connect(config.db.dev.url, {
		        user: config.db.dev.user,
		        pass: config.db.dev.pass
		    });
		}
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, "connection failed"));
		db.once('open', function () {
		    console.log("Database has been  Successfully Connected!");
		});
		//mongoose.set('debug', true);
	}
})
/* end DB */