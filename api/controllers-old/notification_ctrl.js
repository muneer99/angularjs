"use strict";
var mongoose = require("mongoose");
var User = mongoose.model("user");
var networkModel = mongoose.model("networks");
var notificationTemplate = mongoose.model("notification");
var notificationSuperAdminTemplate = mongoose.model("notificationSuperAdmin");
var utility = require("../lib/utility.js");
var generator = require("generate-password");
var d = new Date();
var currentYear = new Date().getFullYear();
var co = require("co");
var socket;

module.exports = {
  getCount: getCount,
  getCountSuperAdmin: getCountSuperAdmin,
  socketIO: socketIO,
  getTemplates: getTemplates,
  getTemplateById: getTemplateById,
  sendNotification: sendNotification,
  sendEmailInsurance: sendEmailInsurance,
  sendLoginDetailsInsurance: sendLoginDetailsInsurance,
  sendNotificationSuperAdmin: sendNotificationSuperAdmin,
  notificationDeletedByUser: notificationDeletedByUser,
  notificationReadBySuperAdmin: notificationReadBySuperAdmin,
  notificationDeletedBySuperAdmin: notificationDeletedBySuperAdmin,
};

/**
 * Get all templates
 * Created By Suman Chakraborty
 * Last modified on 16-11-2017
 */

function getTemplates(req, res) {
  notificationTemplate.find(
    { _id: mongoose.Types.ObjectId(req.subject._id) },
    {},
    function (err, resp) {
      if (!err) {
        res.json({ code: 200, message: "success", data: resp });
      } else {
        res.json({
          code: 201,
          message: "Unable to process your request. Please try again...",
          data: err,
        });
      }
    }
  );
}

/**
 * Get template by ID
 * Created By Suman Chakraborty
 * Last modified on 16-11-2017
 */
function getTemplateById(req, res) {
  notificationTemplate.findOne(
    { _id: mongoose.Types.ObjectId(req.body._id) },
    {},
    function (err, resp) {
      if (!err) {
        res.json({ code: 200, message: "success", data: resp });
      } else {
        res.json({
          code: 201,
          message: "Unable to process your request. Please try again...",
          data: err,
        });
      }
    }
  );
}

/**
 * Storing Template data to DB
 * Created By Nagarjuna Galiboina
 * Last modified on 08-03-2018
 */

function sendEmailInsurance(req, res) {
  if (req.body.provider && req.body.provider.length > 0) {
    req.body.sendto = req.body.provider;

    delete req.body.provider;

    var dataArray = {};
    var obj = req.body;
    dataArray = obj;

    //Task #546 start
    if (req.body.provider != "") {
      if (dataArray.sendto.length > 0) {
        dataArray.sendto.forEach((item) => {
          User.findOne(
            {
              _id: mongoose.Types.ObjectId(item),
            },
            function (err, userRecord) {
              if (err) {
                res.json({
                  code: 201,
                  message: "Request could not be processed. Please try again.",
                });
              } else {
                if (userRecord.email.length > 0) {
                  var userInfo = {};
                  userInfo = {
                    userId: userRecord._id,
                    firstname: userRecord.firstname,
                    lastname: userRecord.lastname,
                    email: userRecord.email,
                    firstLogin: userRecord.firstLogin,
                  };
                  var gpassword = utility.getDecryptText(userRecord.password);
                  co(function* () {
                    var templateKey = "invitation_email_insurance_members";
                    let usrDegree = userRecord.degree
                      ? yield utility.getTitleById(userRecord.degree)
                      : "";
                    let frmSvpDeg = userRecord.degree
                      ? yield utility.getTitleById(userRecord.degree)
                      : "";
                    var InsuranceID = req.body.insuranceProvider;
                    var lastname = userRecord.lastname
                      ? userRecord.lastname
                      : "";
                    var firstname = userRecord.firstname
                      ? userRecord.firstname
                      : "";
                    var degree =
                      userRecord.degree && userRecord.degree != ""
                        ? ", " + usrDegree
                        : "";
                    var centername = userRecord.centername
                      ? userRecord.centername
                      : "";
                    var link =
                      req.config.webUrl +
                      "#/loginAsUser/" +
                      userInfo.userId +
                      "/" +
                      InsuranceID;
                    var replacement = {
                      "{{toSvpLname}}": lastname,
                      "{{toSvpFname}}": firstname,
                      "{{title}}": degree,
                      "{{toSvpCenter}}": centername,
                      "{{notificationSubject}}":
                        req.body.senderName + "(" + req.body.senderEmail + ")",
                      "{{notificationBody}}": "",
                      "{{mailBody}}": req.body.mailBody
                        ? req.body.mailBody
                        : "",
                      "{{webUrl}}": req.config.webUrl ? req.config.webUrl : "",
                      "{{email}}": userInfo.email,
                      "{{gpassword}}": gpassword,
                      "{{year}}": currentYear,
                      "{{InsuranceName}}":
                        req.body.senderName + "(" + req.body.senderEmail + ")",
                      "{{InsuranceEmail}}": req.body.senderEmail,
                      "{{link}}": link, //
                    };
                    utility.sendmailbytemplate(
                      userInfo.email,
                      templateKey,
                      replacement,
                      function (error, templateData) {
                        if (templateData) {
                          res.json({
                            code: 200,
                            data: "Mail Sent Sucessfully",
                          });
                        }
                      }
                    );
                  }).then(
                    function (value) {
                      //console.log(value);
                    },
                    function (err) {
                      console.error(err.stack);
                    }
                  );
                } else {
                }
              }
            }
          );
        });
      }
    } else {
      return res.json(Response(402, "Email didn't Sent Successfully"));
    }
    //Task #546 end
  }
}

/**
 * Storing Template data to DB
 * Created By Nagarjuna Galiboina
 * Last modified on 08-03-2018
 */

function sendLoginDetailsInsurance(req, res) {
  if (req.body.provider && req.body.provider.length > 0) {
    req.body.sendto = req.body.provider;

    delete req.body.provider;

    var dataArray = {};
    var obj = req.body;
    dataArray = obj;
    //Task #546 start
    if (req.body.provider != "") {
      if (dataArray.sendto.length > 0) {
        dataArray.sendto.forEach((item) => {
          networkModel.findOne(
            {
              _id: mongoose.Types.ObjectId(item),
            },
            function (err, userRecord) {
              if (err) {
                res.json({
                  code: 201,
                  message: "Request could not be processed. Please try again.",
                });
              } else {
                if (
                  userRecord.email &&
                  userRecord.email.length > 0 &&
                  userRecord.verified
                ) {
                  var userInfo = {};
                  userInfo = {
                    userId: userRecord._id,
                    firstname: userRecord.name,
                    email: userRecord.email,
                  };

                  var gpassword = generator.generate({
                    length: 10,
                    numbers: true,
                    excludeSimilarCharacters: true,
                  });
                  var passExpOn = new Date();
                  passExpOn.setDate(passExpOn.getDate() + 90);
                  var Encpassword = utility.getEncryptText(gpassword);
                  var updateUserRecord = {
                    password: Encpassword,
                    passExpDate: passExpOn,
                    isLoggedIn: false,
                  };
                  networkModel.update(
                    { _id: mongoose.Types.ObjectId(userRecord._id) },
                    { $set: updateUserRecord },
                    function (err) {
                      if (err) {
                        res.json({
                          code: 201,
                          message:
                            "Request could not be processed. Please try again.",
                        });
                      } else {
                        co(function* () {
                          var templateKey =
                            "login_details_email_insurance_admin";
                          var firstname = userRecord.name
                            ? userRecord.name
                            : "";

                          var replacement = {
                            "{{toSvpLname}}": "",
                            "{{toSvpFname}}": firstname,
                            "{{notificationSubject}}": firstname,
                            "{{notificationBody}}": "",
                            "{{mailBody}}": req.body.mailBody
                              ? req.body.mailBody
                              : "",
                            "{{webUrl}}": req.config.webUrl
                              ? req.config.webUrl + "/insurance-admin/"
                              : "",
                            "{{email}}": userInfo.email,
                            "{{gpassword}}": gpassword,
                            "{{year}}": currentYear,
                          };
                          utility.sendmailbytemplate(
                            userInfo.email,
                            templateKey,
                            replacement,
                            function (error, templateData) {
                              if (templateData) {
                                res.json({
                                  code: 200,
                                  data: "Mail Sent Sucessfully",
                                });
                              }
                            }
                          );
                        }).then(
                          function (value) {
                            //console.log(value);
                          },
                          function (err) {
                            console.error(err.stack);
                          }
                        );
                      }
                    }
                  );
                } else {
                }
              }
            }
          );
        });
      }
    } else {
      return res.json(Response(402, "Email didn't Sent Successfully"));
    }
    //Task #546 end
  }
}

/**
 * Storing Template data to DB
 * Created By Nagarjuna Galiboina
 * Last modified on 08-03-2018
 */

function sendNotification(req, res) {
  console.log("req body---1212", req.body);

  if (req.body.provider && req.body.provider.length > 0) {
    req.body.sendto = req.body.provider;
    delete req.body.speciality;
    delete req.body.insurance;
    delete req.body.provider;
    delete req.body.state;
    var dataArray = {};
    var obj = req.body;
    var notification = new notificationTemplate(obj);
    dataArray = obj;
    notification.save(function (err, notificationData) {
      if (err) {
        res.json({
          code: 200,
          message: "Updated successfully",
          _id: notification._id,
        });
      } else {
        var send = new socketIO(socket, notificationData);
        send.broadcast(socket, notificationData);
        //Task #546 start
        if (req.body.provider != "") {
          if (dataArray.sendto.length > 0) {
            dataArray.sendto.forEach((item) => {
              User.findOne(
                {
                  _id: mongoose.Types.ObjectId(item),
                },
                function (err, userRecord) {
                  if (err) {
                    res.json({
                      code: 201,
                      message:
                        "Request could not be processed. Please try again.",
                    });
                  } else {
                    if (userRecord) {
                      var userInfo = {};

                      userInfo = {
                        userId: userRecord._id,
                        firstname: userRecord.firstname,
                        lastname: userRecord.lastname,
                        email: userRecord.email,
                        firstLogin: userRecord.firstLogin,
                      };
                      var gpassword = utility.getDecryptText(
                        userRecord.password
                      );
                      co(function* () {
                        var templateKey = "notification_members";
                        let usrDegree = userRecord.degree
                          ? yield utility.getTitleById(userRecord.degree)
                          : "";
                        let frmSvpDeg = userRecord.degree
                          ? yield utility.getTitleById(userRecord.degree)
                          : "";
                        var lastname = userRecord.lastname
                          ? userRecord.lastname
                          : "";
                        var firstname = userRecord.firstname
                          ? userRecord.firstname
                          : "";
                        var degree =
                          userRecord.degree && userRecord.degree != ""
                            ? ", " + usrDegree
                            : "";
                        var centername = userRecord.centername
                          ? userRecord.centername
                          : "";
                        var replacement = {
                          "{{toSvpLname}}": lastname,
                          "{{toSvpFname}}": firstname,
                          "{{title}}": degree,
                          "{{toSvpCenter}}": centername,
                          "{{notificationSubject}}": req.body.subject,
                          "{{notificationBody}}": req.body.body,
                          "{{mailBody}}": req.body.mailBody
                            ? req.body.mailBody
                            : "",
                          "{{webUrl}}": req.config.webUrl
                            ? req.config.webUrl
                            : "",
                          "{{email}}": userInfo.email,
                          "{{currentYear}}": currentYear,
                        };
                        utility.sendmailbytemplate(
                          userInfo.email,
                          templateKey,
                          replacement,
                          function (error, templateData) {}
                        );
                      }).then(
                        function (value) {
                          //console.log(value);
                        },
                        function (err) {
                          console.error(err.stack);
                        }
                      );
                    }
                  }
                }
              );
            });
          }
        } else {
          return res.json(Response(402, "Email didn't Sent Successfully"));
        }
        //Task #546 end

        res.json({
          code: 200,
          data: notificationData,
        });
      }
    });
  } else {
    var condition = {};
    var flagCond = false;
    if (req.body.speciality) {
      condition.speciality = {
        $in: req.body.speciality.map(function (o) {
          return mongoose.Types.ObjectId(o);
        }),
      };
      flagCond = true;
    }

    if (req.body.insurance) {
      condition.network = {
        $in: req.body.insurance.map(function (o) {
          return mongoose.Types.ObjectId(o);
        }),
      };
      flagCond = true;
    }

    if (req.body.state) {
      condition.state = req.body.state;
      flagCond = true;
    }
    if (flagCond) {
      co(function* () {
        yield User.find(condition, { _id: 1 }, function (err, userIds) {
          if (err) {
            res.json({
              code: 401,
              message: "Request could not be processed. Please try again.",
              err: err,
            });
          } else {
            if (userIds.length > 0) {
              userIds.forEach((item) => {
                req.body.sendto.push(item._id);
                //Task #546 start
                User.findOne(
                  {
                    _id: mongoose.Types.ObjectId(item._id),
                  },
                  function (err, userRecord) {
                    if (err) {
                      res.json({
                        code: 201,
                        message:
                          "Request could not be processed. Please try again.",
                      });
                    } else {
                      if (userRecord) {
                        var userInfo = {};
                        userInfo = {
                          userId: userRecord._id,
                          firstname: userRecord.firstname,
                          lastname: userRecord.lastname,
                          email: userRecord.email,
                          firstLogin: userRecord.firstLogin,
                        };
                        var gpassword = utility.getDecryptText(
                          userRecord.password
                        );
                        co(function* () {
                          var templateKey = "notification_members";
                          let usrDegree = userRecord.degree
                            ? yield utility.getTitleById(userRecord.degree)
                            : "";
                          let frmSvpDeg = userRecord.degree
                            ? yield utility.getTitleById(userRecord.degree)
                            : "";
                          var lastname = userRecord.lastname
                            ? userRecord.lastname
                            : "";
                          var firstname = userRecord.firstname
                            ? userRecord.firstname
                            : "";
                          var degree =
                            userRecord.degree && userRecord.degree != ""
                              ? ", " + usrDegree
                              : "";
                          var centername = userRecord.centername
                            ? userRecord.centername
                            : "";
                          var replacement = {
                            "{{toSvpLname}}": lastname,
                            "{{toSvpFname}}": firstname,
                            "{{title}}": degree,
                            "{{toSvpCenter}}": centername,
                            "{{notificationSubject}}": req.body.subject,
                            "{{notificationBody}}": req.body.body,
                            "{{mailBody}}": req.body.mailBody
                              ? req.body.mailBody
                              : "",
                            "{{webUrl}}": req.config.webUrl
                              ? req.config.webUrl
                              : "",
                            "{{email}}": userInfo.email,

                            "{{currentYear}}": currentYear,
                          };
                          utility.sendmailbytemplate(
                            userInfo.email,
                            templateKey,
                            replacement,
                            function (error, templateData) {}
                          );
                        }).then(
                          function (value) {
                            //console.log(value);
                          },
                          function (err) {
                            console.error(err.stack);
                          }
                        );
                      }
                    }
                  }
                );
                //Task #546 end
              });
            } else {
              res.json({
                code: 201,
                message: "No user found based on selection.",
              });
            }
          }
        });

        if (req.body.sendto.length > 0) {
          delete req.body.speciality;
          delete req.body.insurance;
          delete req.body.provider;
          delete req.body.state;
          var obj = req.body;
          var notification = new notificationTemplate(obj);
          notification.save(function (err, notificationData) {
            if (err) {
              res.json({
                code: 200,
                message: "Updated successfully",
                _id: notification._id,
              });
            } else {
              var send = new socketIO(socket, notificationData);
              send.broadcast(socket, notificationData);
              res.json({
                code: 200,
                data: notificationData,
              });
            }
          });
        }
      }).then(
        function (value) {
          //console.log(value);
        },
        function (error) {
          console.error(error.stack);
        }
      );
    } else {
      res.json({ code: 201, message: "Error on selection." });
    }
  }
}
function getCountSuperAdmin(req, res) {
  var notificationCount = {};
  if (req.query.notification_id) {
    notificationSuperAdminTemplate.update(
      { _id: mongoose.Types.ObjectId() },
      { $addToSet: { sentTo: req.query.user_id } },
      function (err, data, count) {
        if (err) {
          res.json({
            code: 201,
            message: "Unable to process your request. Please try again...",
            data: err,
          });
        } else {
          var cond = { isDeleted: 0 };
          cond.$or = [
            {
              sentTo: { $in: [req.query.user_id] },
            },
            {
              sentTo: [],
            },
          ];
          notificationSuperAdminTemplate.find(cond, function (
            err,
            data,
            count
          ) {
            if (err) {
              res.json({
                code: 201,
                message: "Unable to process your request. Please try again...",
                data: err,
              });
            } else {
              var cond2 = { isDeleted: 0 };
              cond2.$or = [
                {
                  sentTo: { $in: [req.query.user_id] },
                },
                {
                  sentTo: [],
                },
              ];
              notificationSuperAdminTemplate.count(cond2, function (
                err,
                count
              ) {
                res.json({
                  code: 200,
                  message: "NotificationCount.",
                  count: count,
                  data: data,
                });
              });
            }
          });
        }
      }
    );
  } else {
    if (req.query.searchTxt) {
      var cond = { isDeleted: 0, status: 0 };
    } else {
      var cond = { isDeleted: 0 };
    }

    cond.$or = [
      {
        sentTo: { $in: [req.query.user_id] },
      },
      {
        sentTo: [],
      },
    ];
    notificationSuperAdminTemplate.find(cond, function (err, data, count) {
      if (err) {
        res.json({
          code: 201,
          message: "Unable to process your request. Please try again...",
          data: err,
        });
      } else {
        if (req.query.searchTxt) {
          var cond2 = { isDeleted: 0, status: 0 };
        } else {
          var cond2 = { isDeleted: 0 };
        }

        cond2.$or = [
          {
            sentTo: { $in: [req.query.user_id] },
          },
          {
            sentTo: [],
          },
        ];
        notificationSuperAdminTemplate.count(cond2, function (err, count) {
          res.json({
            code: 200,
            message: "NotificationCount.",
            count: count,
            data: data,
          });
        });
      }
    });
  }
}

function getCount(req, res) {
  var notificationCount = {};
  if (req.query.notification_id) {
    notificationTemplate.update(
      { _id: mongoose.Types.ObjectId(req.query.notification_id) },
      { $addToSet: { user_ids: req.query.user_id } },
      function (err, data, count) {
        if (err) {
          res.json({
            code: 201,
            message: "Unable to process your request. Please try again...",
            data: err,
          });
        } else {
          var cond = { deleted_by: { $nin: [req.query.user_id] } };
          cond.$or = [
            {
              sendto: { $in: [req.query.user_id] },
            },
            {
              sendto: [],
            },
          ];
          notificationTemplate.find(cond, function (err, data, count) {
            if (err) {
              res.json({
                code: 201,
                message: "Unable to process your request. Please try again...",
                data: err,
              });
            } else {
              var cond2 = {
                user_ids: { $nin: [req.query.user_id] },
                deleted_by: { $nin: [req.query.user_id] },
              };

              cond2.$or = [
                {
                  sendto: { $in: [req.query.user_id] },
                },
                {
                  sendto: [],
                },
              ];
              notificationTemplate.count(cond2, function (err, count) {
                res.json({
                  code: 200,
                  message: "NotificationCount.",
                  count: count,
                  data: data,
                });
              });
            }
          });
        }
      }
    );
  } else {
    var cond = { deleted_by: { $nin: [req.query.user_id] } };
    if (req.query.searchTxt) {
      cond.subject = new RegExp(req.query.searchTxt, "gi");
    }
    cond.$or = [
      {
        sendto: { $in: [req.query.user_id] },
      },
      {
        sendto: [],
      },
    ];
    notificationTemplate.find(cond, function (err, data, count) {
      if (err) {
        res.json({
          code: 201,
          message: "Unable to process your request. Please try again...",
          data: err,
        });
      } else {
        var cond2 = {
          user_ids: { $nin: [req.query.user_id] },
          deleted_by: { $nin: [req.query.user_id] },
        };

        cond2.$or = [
          {
            sendto: { $in: [req.query.user_id] },
          },
          {
            sendto: [],
          },
        ];
        notificationTemplate.count(cond2, function (err, count) {
          res.json({
            code: 200,
            message: "NotificationCount.",
            count: count,
            data: data,
          });
        });
      }
    });
  }
}

/**
 * prototyping for socket io
 * Created By Prakash Kumar Soni
 * Last modified on 06-04-2018
 */

function socketIO(getSocket, data) {
  socket = getSocket;
  this.data = data;
  console.log("inside socket------", data);

  this.broadcast = function (socket, data) {
    console.log("socket---", socket);

    console.log("data1111---", data);
    socket.emit("broadcast", data);
  };
}

/**
 * Delete Notification by User Id And Notification Id
 * Created By Prakash Kumar Soni
 * Last modified on 06-04-2018
 */
function notificationDeletedByUser(req, res) {
  var notificationCount = {};
  if (req.query.notification_id && req.query.user_id) {
    notificationTemplate.update(
      { _id: mongoose.Types.ObjectId(req.query.notification_id) },
      { $addToSet: { deleted_by: req.query.user_id } },
      function (err, data, count) {
        if (err) {
          res.json({
            code: 201,
            message: "Unable to process your request. Please try again...",
            data: err,
          });
        } else {
          var cond = { deleted_by: { $nin: [req.query.user_id] } };
          cond.$or = [
            {
              sendto: { $in: [req.query.user_id] },
            },
            {
              sendto: [],
            },
          ];
          notificationTemplate.find(cond, function (err, data, count) {
            if (err) {
              res.json({
                code: 201,
                message: "Unable to process your request. Please try again...",
                data: err,
              });
            } else {
              var cond2 = {
                user_ids: { $nin: [req.query.user_id] },
                deleted_by: { $nin: [req.query.user_id] },
              };
              cond2.$or = [
                {
                  sendto: { $in: [req.query.user_id] },
                },
                {
                  sendto: [],
                },
              ];
              notificationTemplate.count(cond2, function (err, count) {
                res.json({
                  code: 200,
                  message: "NotificationCount.",
                  count: count,
                  data: data,
                });
              });
            }
          });
        }
      }
    );
  } else {
    deleted_by: {
      $nin: [req.query.user_id];
    }
    return res.json(Response(401, constant.validateMsg.requiredFieldsMissing));
  }
}

/**
 * Delete Notification by User Id And Notification Id
 * Created By Prakash Kumar Soni
 * Last modified on 06-04-2018
 */
function notificationDeletedBySuperAdmin(req, res) {
  var notificationCount = {};
  var updateIsDeleted = {
    isDeleted: 1,
  };
  if (req.query.notification_id && req.query.user_id) {
    notificationSuperAdminTemplate.update(
      { _id: mongoose.Types.ObjectId(req.query.notification_id) },
      { $set: updateIsDeleted },
      { $addToSet: { deleted_by: req.query.user_id } },
      function (err, data, count) {
        if (err) {
          res.json({
            code: 201,
            message: "Unable to process your request. Please try again...",
            data: err,
          });
        } else {
          var cond = { isDeleted: 0 };
          cond.$or = [
            {
              sentTo: { $in: [req.query.user_id] },
            },
            {
              sentTo: [],
            },
          ];
          notificationSuperAdminTemplate.find(cond, function (
            err,
            data,
            count
          ) {
            if (err) {
              res.json({
                code: 201,
                message: "Unable to process your request. Please try again...",
                data: err,
              });
            } else {
              var cond2 = { isDeleted: 0 };
              cond2.$or = [
                {
                  sentTo: { $in: [req.query.user_id] },
                },
                {
                  sentTo: [],
                },
              ];
              notificationSuperAdminTemplate.count(cond2, function (
                err,
                count
              ) {
                res.json({
                  code: 200,
                  message: "NotificationCount.",
                  count: count,
                  data: data,
                });
              });
            }
          });
        }
      }
    );
  } else {
    return res.json(Response(401, constant.validateMsg.requiredFieldsMissing));
  }
}

/**
 * Delete Notification by User Id And Notification Id
 * Created By Prakash Kumar Soni
 * Last modified on 06-04-2018
 */
function notificationReadBySuperAdmin(req, res) {
  var notificationCount = {};
  var updateStatus = {
    status: 1,
  };
  if (req.query.notification_id && req.query.user_id) {
    notificationSuperAdminTemplate.update(
      { _id: mongoose.Types.ObjectId(req.query.notification_id) },
      { $set: updateStatus },
      { $addToSet: { deleted_by: req.query.user_id } },
      function (err, data, count) {
        if (err) {
          res.json({
            code: 201,
            message: "Unable to process your request. Please try again...",
            data: err,
          });
        } else {
          var cond = { isDeleted: 0 };
          cond.$or = [
            {
              sentTo: { $in: [req.query.user_id] },
            },
            {
              sentTo: [],
            },
          ];
          notificationSuperAdminTemplate.find(cond, function (
            err,
            data,
            count
          ) {
            if (err) {
              res.json({
                code: 201,
                message: "Unable to process your request. Please try again...",
                data: err,
              });
            } else {
              var cond2 = { isDeleted: 0 };
              cond2.$or = [
                {
                  sentTo: { $in: [req.query.user_id] },
                },
                {
                  sentTo: [],
                },
              ];
              notificationSuperAdminTemplate.count(cond2, function (
                err,
                count
              ) {
                res.json({
                  code: 200,
                  message: "NotificationCount.",
                  count: count,
                  data: data,
                });
              });
            }
          });
        }
      }
    );
  } else {
    return res.json(Response(401, constant.validateMsg.requiredFieldsMissing));
  }
}

/**
 * Storing Template data to DB
 * Created By Nagarjuna Galiboina
 * Last modified on 08-03-2018
 */

function sendNotificationSuperAdmin(req, res) {
  if (req.body.subject) {
    var obj = req.body;
    var notification = new notificationSuperAdminTemplate(obj);
    notification.save(function (err, notificationData) {
      if (err) {
        res.json({
          code: 200,
          message: "Updated successfully",
          _id: notification._id,
        });
      } else {
        var send = new socketIO(socket, notificationData);
        send.broadcast(socket, notificationData);
        res.json({
          code: 200,
          data: notificationData,
        });
      }
    });
  } else {
  }
}
