"use strict";

var mongoose = require("mongoose"),
  SpecialityModel = mongoose.model("specialities"),
  specialityModel = mongoose.model("specialities"),
  utility = require("../lib/utility.js"),
  ServiceModel = mongoose.model("services");
module.exports = {
  addSpeciality: addSpeciality,
  getSpeciality: getSpeciality,
  deleteSpeciality: deleteSpeciality,
  getSpecialityList: getSpecialityList,
  getSpecialityById: getSpecialityById,
  addSpecialityService: addSpecialityService,
  updateSpecialityStatus: updateSpecialityStatus,
  specialityServiceDelete: specialityServiceDelete,
  specialityServiceStatus: specialityServiceStatus,
  updateSpecialityByAdmin: updateSpecialityByAdmin,
  getSpecialityServiceList: getSpecialityServiceList,
  updatePatientNotificationStatus: updatePatientNotificationStatus,
};
/**
 * Function is use to add Speciality by Admin
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Modified Date 12-12-2017
 */

function addSpeciality(req, res) {
  req.body.specialityName = req.body.specialityName
    ? req.body.specialityName
    : "";
  req.body.searchKey = req.body.specialityName
    ? req.body.specialityName.toLowerCase().replace(/\s+/g, "")
    : "";
  specialityModel
    .findOne({
      specialityName: { $regex: new RegExp(req.body.specialityName, "i") },
      isDeleted: false,
    })
    .lean()
    .exec(function (err, specialityData) {
      if (err) {
        res.json({
          code: 201,
          message: "Internal error",
        });
      } else if (specialityData) {
        res.json({
          code: 202,
          message:
            "Entered speciality name already exist! Try with different name.",
        });
      } else {
        var specialityInfo = new SpecialityModel(req.body);
        specialityInfo.save(function (err, data) {
          if (err) {
            res.json({ code: 201, message: "Data not Addded" });
          } else {
            res.json({ code: 200, message: "Data Added", data: data });
          }
        });
      }
    });
}

/**
 * Function is use to get all Speciality
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 25-July-2017
 */

function getSpeciality(req, res) {
  var condition = { isDeleted: false };
  var searchText = req.query.searchText;
  if (req.query.searchText) {
    var searchText = searchText;
    condition.$or = [
      { specialityNo: new RegExp(searchText, "gi") },
      { specialityDescp: new RegExp(searchText, "gi") },
      { specialityName: new RegExp(searchText, "gi") },
      { searchKey: new RegExp(searchText.replace(/\s+/g, ""), "gi") },
    ];
  }
  specialityModel
    .find(condition)
    .sort({ specialityName: -1 })
    .exec(function (err, data) {
      if (err) {
        res.json({ code: 201, message: "Error in fetching Details", data: {} });
      } else {
        if (data) {
          res.json({
            code: 200,
            message: "Data has been retrieved Successfully",
            data: data,
          });
        } else {
          res.json({ code: 201, message: "No Record Available", data: {} });
        }
      }
    });
}

function compare(a, b) {
  if (a.specialityName < b.specialityName) {
    return -1;
  }
  if (a.specialityName > b.specialityName) {
    return 1;
  }
  return 0;
}

/**
 * Function is use to Get Speciality List for Admin Dashboard
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 25-July-2017
 */

function getSpecialityList(req, res) {
  var count = req.body.count ? req.body.count : 0;
  var skip = req.body.count * (req.body.page - 1);
  //var sorting = req.body.sorting ? req.body.sorting : { specialityName: -1 };
  //var sorting = utility.getSortObj(req.body);
  let sorting = {};
  if (req.body.sortValue && req.body.sortOrder) {
    sorting[req.body.sortValue] = req.body.sortOrder;
  } else {
    sorting = { _id: -1 };
  }
  var condition = { isDeleted: false };
  var searchText = req.body.searchText;
  if (req.body.searchText) {
    var searchText = searchText;
    condition.$or = [
      { specialityNo: new RegExp(searchText, "gi") },
      { specialityDescp: new RegExp(searchText, "gi") },
      { specialityName: new RegExp(searchText, "gi") },
      { searchKey: new RegExp(searchText.replace(/\s+/g, ""), "gi") },
    ];
  }
  SpecialityModel.find(condition)
    .sort(sorting)
    .skip(parseInt(skip))
    .limit(parseInt(count))
    .lean()
    .exec(function (err, speciality) {
      if (err) {
        res.json({
          code: 401,
          message: "Internal error",
        });
      } else if (speciality) {
        SpecialityModel.find(condition)
          .count()
          .exec(function (err, totalCount) {
            if (err) {
              res.json({
                code: 401,
                message: "Internal Error",
              });
            } else {
              res.json({
                code: 200,
                message: "Patient data retrieved",
                data: speciality,
                totalCount: totalCount,
              });
            }
          });
      } else {
        res.json({
          code: 201,
          message: "No data found",
        });
      }
    });
}
/**
 * Function is use to Get Speciality By id
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 25-July-2017
 */
function getSpecialityById(req, res) {
  var id = req.swagger.params.id.value;
  specialityModel
    .findOne(
      { _id: mongoose.Types.ObjectId(id) },
      { specialityCode: 1, specialityDescp: 1, specialityName: 1 }
    )
    .lean()
    .exec(function (err, specialityInfo) {
      if (err) {
        res.json({
          code: 201,
          message: "Request could not be processed. Please try again.",
          data: err,
        });
      } else {
        res.json({
          code: 200,
          message: "Speciality info fetched successfully.",
          data: specialityInfo,
        });
      }
    });
}

/**
 * Function is use to Update Speciality
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Updated Date 12-12-2017
 */
function updateSpecialityByAdmin(req, res) {
  var updateSpecialityRecord = {
    specialityCode: req.body.specialityCode ? req.body.specialityCode : "",
    specialityDescp: req.body.specialityDescp ? req.body.specialityDescp : "",
    specialityName: req.body.specialityName ? req.body.specialityName : "",
    searchKey: req.body.specialityName
      ? req.body.specialityName.toLowerCase().replace(/\s+/g, "")
      : "",
  };
  var thename = "^req.body.specialityName$";
  specialityModel
    .findOne({
      specialityName: req.body.specialityName,
      isDeleted: false,
      _id: { $ne: req.body._id },
    })
    .exec(function (err, specialityData) {
      if (err) {
        res.json({
          code: 201,
          message: "Internal error",
        });
      } else if (specialityData) {
        res.json({
          code: 202,
          message:
            "Entered speciality name already exist ! Try with different name.",
        });
      } else {
        specialityModel.update(
          { _id: mongoose.Types.ObjectId(req.body._id) },
          { $set: updateSpecialityRecord },
          function (err) {
            if (err) {
              res.json({
                code: 201,
                message: "Request could not be processed. Please try again.",
              });
            } else {
              res.json({
                code: 200,
                message: "Speciality updated successfully.",
              });
            }
          }
        );
      }
    });
}

function deleteSpeciality(req, res) {
  specialityModel.update(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    { $set: { isDeleted: true } },
    function (err) {
      if (err) {
        res.json({
          code: 201,
          message: "Request could not be processed. Please try again.",
        });
      } else {
        res.json({ code: 200, message: "Speciality removed  from network." });
      }
    }
  );
}

/**
 * Function is use to Update Speciality Status
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 25-July-2017
 */
function updateSpecialityStatus(req, res) {
  var updateSpecialityRecord = {
    status: req.body.status,
  };
  specialityModel.update(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    { $set: updateSpecialityRecord },
    function (err) {
      if (err) {
        res.json({ code: 201, message: "Internal Error Occured" });
      } else {
        res.json({ code: 200, message: "Status updated successfully." });
      }
    }
  );
}

/**
 * Function is use to Update Speciality Status
 * @access user
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 26-July-2017
 */

function addSpecialityService(req, res) {
  var bodydata = {};
  bodydata.serviceName = req.body.serviceName ? req.body.serviceName : "";
  bodydata.serviceCode = req.body.serviceCode ? req.body.serviceCode : "";
  bodydata.serviceDescrip = req.body.serviceDescrip
    ? req.body.serviceDescrip
    : "";
  bodydata.specialityId = req.body.specialityId ? req.body.specialityId : "";
  ServiceModel.findOne({
    serviceName: bodydata.serviceName,
    isDeleted: false,
  }).exec(function (err, resService) {
    if (err) {
      res.json({ code: 201, message: "Internal Error" });
    } else if (resService) {
      SpecialityModel.findOne({
        _id: mongoose.Types.ObjectId(bodydata.specialityId),
      }).exec(function (err, speciality) {
        if (err) {
          throw err;
        } else {
          if (speciality.has_services.indexOf(resService._id) === -1) {
            speciality.has_services.push(resService._id);
          }
          speciality.save();
          res.json({
            code: 200,
            message: "Service has been added to speciality",
          });
        }
      });
    } else {
      var serviceData = new ServiceModel(bodydata);
      serviceData.save(function (err, response) {
        if (err) {
          res.json({ code: 201, message: "Internal Error" });
        } else {
          if (response) {
            var abc = response._id;
            SpecialityModel.findOne({
              _id: mongoose.Types.ObjectId(bodydata.specialityId),
            }).exec(function (err, speciality) {
              if (err) {
                throw err;
              } else {
                speciality.has_services.push(abc);
                speciality.save();
                res.json({
                  code: 200,
                  message: "Service has been added to speciality",
                });
              }
            });
          } else {
          }
        }
      });
    }
  });
}

/**
 * Function is use to Get Service List Of Speciality
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 27-July-2017
 */
function getSpecialityServiceList(req, res) {
  specialityModel.findOne(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    function (err, specialityData) {
      var serviceArr = [];
      specialityData.has_services.forEach(function (data) {
        serviceArr.push(data);
      });
      var count = req.body.count ? req.body.count : 0;
      var skip = req.body.count * (req.body.page - 1);
      var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
      var sorting = utility.getSortObj(req.body);
      var condition = { _id: { $in: serviceArr }, isDeleted: false };
      var searchText = req.body.searchText;
      if (req.body.searchText) {
        var searchText = searchText;
        condition.$or = [
          { serviceCode: new RegExp(searchText, "gi") },
          { serviceName: new RegExp(searchText, "gi") },
        ];
      }
      ServiceModel.find(condition)
        .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean()
        .exec(function (err, serviceData) {
          if (err) {
            res.json({
              code: 404,
              message: "Internal error",
            });
          } else if (serviceData) {
            ServiceModel.find(condition)
              .count()
              .exec(function (err, totalCount) {
                if (err) {
                  res.json({
                    code: 404,
                    message: "Internal Error",
                  });
                } else {
                  res.json({
                    code: 200,
                    message: "Speciality Service data retrieved",
                    data: serviceData,
                    totalCount: totalCount,
                  });
                }
              });
          } else {
            res.json({
              code: 404,
              message: "No data found",
            });
          }
        });
    }
  );
}

/**
 * Function is use to delete/updateStatus Service Of Speciality
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 28-July-2017
 */
function specialityServiceDelete(req, res) {
  ServiceModel.remove({ _id: mongoose.Types.ObjectId(req.body.id) }, function (
    err
  ) {
    if (err) {
      res.json({
        code: 201,
        message: "Request could not be processed. Please try again.",
      });
    } else {
      res.json({ code: 200, message: "Speciality removed  from network." });
    }
  });
}

function specialityServiceStatus(req, res) {
  var updateSpecialityRecord = {
    status: req.body.status,
  };
  ServiceModel.update(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    { $set: updateSpecialityRecord },
    function (err) {
      if (err) {
        res.json({ code: 201, message: "Internal Error Occurred" });
      } else {
        res.json({ code: 200, message: "Status updated successfully." });
      }
    }
  );
}

function updatePatientNotificationStatus(req, res) {
  var updateSpecialityRecord = {
    sendPtRef: req.body.sendPtRef,
  };
  specialityModel.update(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    { $set: updateSpecialityRecord },
    function (err) {
      if (err) {
        res.json({ code: 401, message: "Internal Error Occured" });
      } else {
        res.json({
          code: 200,
          message: "Speciality Notification updated successfully.",
        });
      }
    }
  );
}
