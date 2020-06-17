'use strict';

var mongoose = require('mongoose');


var patientSchema = new mongoose.Schema({
    firstName       : { type: String },
    lastName        : { type: String },
    email           : { type: String, lowercase: true, trim: true},
    contact_no      : { type: String },
    status          : { type: String, default: '1' }, //0:Inactive,1:Active
    network         : [ { type: mongoose.Schema.Types.ObjectId, ref: 'networks' }], // insurance network(s) a doctor serve or a patient is registered with
    location        : { type: String, default: '' }, //Street Address
    sute            : { type: String, default: '' }, //Suite #
    city            : { type: String, default: '' }, //City
    state           : { type: String, default: '' }, // ST
    zipcode         : { type: String, default: '' }, // Zip code
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    accessableBy    : [ {type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    isDeleted       : { type: Boolean, default: false },
}, {
    timestamps: true
});
patientSchema.statics.existCheck = function(email, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or     : [{ email: new RegExp('^' + email + '$', "i") }],
            deleted : { $ne: true },
            _id     : { $ne: id }
        };
    } else {
        where = { $or: [{ email: new RegExp('^' + email + '$', "i") }], deleted: { $ne: true } };
    }
    User.findOne(where, function(err, userdata) {
        if (err) {
            callback(err)
        } else {
            if (userdata) {
                callback(null, constantsObj.validateMsg.emailAlreadyExist);
            } else {
                callback(null, true);
            }
        }
    });
};
module.exports = mongoose.model('patients', patientSchema);