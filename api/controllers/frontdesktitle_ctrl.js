"use strict";

var mongoose = require("mongoose"),
  activeModel = mongoose.model("frontdesktitles"),
  utility = require("../lib/utility.js");
module.exports = {
  getFrontdeskTitleById: getFrontdeskTitleById,
  addFrontdeskTitle: addFrontdeskTitle,
  deleteFrontdeskTitle: deleteFrontdeskTitle,
  getTitleList: getTitleList,
  getFrontdeskTitles: getFrontdeskTitles,
};

/**
 * Add/update Title / Degree
 * Created by Soumalya Gan
 * @smartData Enterprises (I) Ltd
 * Created Date 25-07-2018
 */
function addFrontdeskTitle(req, res) {
  if (req.body.name) {
    var name = req.body.name;
    req.body.name = name;
  }
  if (req.body.hasOwnProperty("_id")) {
    var objId = req.body._id;
    delete req.body._id;
    activeModel.update(
      { _id: mongoose.Types.ObjectId(objId) },
      { $set: req.body },
      function (err) {
        if (err) {
          res.json({ code: 401, message: "Data not Addded" });
        } else {
          res.json({
            code: 200,
            message: "Title / Degree updated successfully.",
            data: {},
          });
        }
      }
    );
  } else {
    var title = new activeModel(req.body);
    title.save(function (err, data) {
      if (err) {
        res.json({ code: 401, message: "Data not Addded" });
      } else {
        res.json({
          code: 200,
          message: "Title / Degree added successfully.",
          data: data,
        });
      }
    });
  }
}

/**
 * get Title / Degree by ID
 * Created by Soumalya Gan
 * @smartData Enterprises (I) Ltd
 * Created Date 25-07-2018
 */
function getFrontdeskTitleById(req, res) {
  var condition = {};
  if (req.swagger.params.id.value != "000") {
    condition = { _id: req.swagger.params.id.value };
  } else {
    condition.verified = true;
  }

  activeModel
    .find(condition, { name: 1, desc: 1 })
    .lean()
    .sort({ name: 1 })
    .exec(function (err, info) {
      if (err) {
        res.json({
          code: 201,
          message: "Unable to process your request. Please try again...",
        });
      } else {
        res.json({ code: 200, message: "success", data: info });
      }
    });
}

/**
 * Delete Title / Degree by ID
 * Created by Soumalya Gan
 * @smartData Enterprises (I) Ltd
 * Created Date 25-07-2018
 */
function deleteFrontdeskTitle(req, res) {
  activeModel.remove({ _id: mongoose.Types.ObjectId(req.body.id) }, function (
    err,
    response
  ) {
    if (err) {
      res.json({
        code: 401,
        message: "Unable to process your request please try again.",
      });
    } else {
      res.json({
        code: 200,
        message: "Deleted Successfully",
      });
    }
  });
}

/**
 * get Title / Degree global search search
 * Created by Soumalya Gan
 * @smartData Enterprises (I) Ltd
 * Created Date 25-07-2018
 */

function getTitleList(req, res) {
  var count = req.body.count ? req.body.count : 0;
  var skip = req.body.count * (req.body.page - 1);
  var sorting = utility.getSortObj(req.body, { _id: 1 });

  var condition = {};

  if (req.body.searchText) {
    var searchText = req.body.searchText.toLowerCase();
    var searchText = searchText;
    condition.$or = [
      { name: new RegExp(searchText, "gi") },
      { desc: new RegExp(searchText, "gi") },
    ];
  }
  activeModel
    .find(condition)
    .sort(sorting)
    .skip(parseInt(skip))
    .limit(parseInt(count))
    .lean()
    .exec(function (err, data) {
      if (err) {
        res.json({
          code: 201,
          message: "Internal error",
        });
      } else if (data) {
        activeModel
          .find(condition)
          .count()
          .exec(function (err, totalCount) {
            if (err) {
              res.json({
                code: 201,
                message: "Internal Error",
              });
            } else {
              res.json({
                code: 200,
                message: "Data retrieved",
                data: data,
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

function getFrontdeskTitles(req, res) {
  var sorting = utility.getSortObj(req.body, { _id: 1 });
  var condition = {};

  activeModel
    .find(condition)
    .sort(sorting)
    .lean()
    .exec(function (err, data) {
      if (err) {
        res.json({
          code: 201,
          message: "Internal error",
        });
      } else if (data) {
        activeModel
          .find(condition)
          .count()
          .exec(function (err, totalCount) {
            if (err) {
              res.json({
                code: 201,
                message: "Internal Error",
              });
            } else {
              res.json({
                code: 200,
                message: "Data retrieved",
                data: data,
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
