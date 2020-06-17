"use strict";
var mongoose = require("mongoose"),
  User = mongoose.model("user"),
  networkModel = mongoose.model("networks"),
  contactus = mongoose.model("contactus"),
  userToken = mongoose.model("userToken"),
  jwt = require("jsonwebtoken"),
  validator = require("validator"),
  Response = require("../lib/response.js"),
  utility = require("../lib/utility.js"),
  common = require("../../config/common.js"),
  request = require("request"),
  constant = require("../lib/constants"),
  utills = require("../lib/util.js");
var async = require("async");
var generator = require("generate-password");
var currentYear = new Date().getFullYear();
var checkInactiveUserInterval;
module.exports = {
  loggedin: loggedin,
  loggedinInsurance: loggedinInsurance,
  contactUs: contactUs,
  userLogin: userLogin,
  userLogOut: userLogOut,
  verifyLink: verifyLink,
  adminLogin: adminLogin,
  insuranceLogin: insuranceLogin,
  userRegister: userRegister,
  updatePassword: updatePassword,
  userActivation: userActivation,
  forgotPassword: forgotPassword,
};

/**
 * Login API for providers
 * @return json
 * Created by Sanjeev
 * @smartData Enterprises (I) Ltd
 * Created Date 24-june-2017
 */
function loggedinInsurance(req, res) {
  var currentDate = new Date();
  if ((req.headers && req.headers.authorization) || req.query) {
    var parts = req.headers["authorization"] || req.query["api_key"];
    parts =
      parts !== "" && typeof parts !== "undefined" ? parts.split(" ") : [];
    if (parts.length == 2) {
      jwt.verify(parts[1], req.config.encryption.secret, function (err, user) {
        if (err) {
          res.json(Response(402, constant.messages.authenticationFailed));
        } else {
          if (user) {
            var id = typeof user.uid === "undefined" ? user.id : user.uid;
            networkModel.findById(id).exec(function (err, admin) {
              if (err)
                res.json(Response(402, constant.messages.authenticationFailed));
              else if (!admin)
                res.json(Response(402, constant.messages.authenticationFailed));
              else {
                // if user has password expiry date and it is greater than todays date then allow to access dashboard or take the user to password change page
                // if this user has a password expiary date field then it will be used for calculation or creation date
                var dateOfOrg = admin.passExpDate
                  ? admin.passExpDate
                  : admin.createdAt;
                if (dateOfOrg && dateOfOrg.getTime() > currentDate.getTime()) {
                  res.json({
                    code: 200,
                    status: "OK",
                    user: admin,
                    changePass: false,
                  });
                } else {
                  if (admin.firstLogin) {
                    res.json({
                      code: 200,
                      status: "OK",
                      user: admin,
                      changePass: false,
                    });
                  } else {
                    res.json({
                      code: 200,
                      status: "OK",
                      user: admin,
                      changePass: true,
                    });
                  }
                }
              }
            });
          } else {
            res.json(Response(402, constant.messages.authenticationFailed));
          }
        }
      });
    } else {
      res.json(Response(402, constant.messages.authenticationFailed));
    }
  } else {
    res.json(Response(402, constant.messages.authenticationFailed));
  }
}

/**
 * Login API for providers
 * @return json
 * Created by Sanjeev
 * @smartData Enterprises (I) Ltd
 * Created Date 24-june-2017
 */
function loggedin(req, res) {
  var currentDate = new Date();
  if ((req.headers && req.headers.authorization) || req.query) {
    var parts = req.headers["authorization"] || req.query["api_key"];
    parts =
      parts !== "" && typeof parts !== "undefined" ? parts.split(" ") : [];
    if (parts.length == 2) {
      jwt.verify(parts[1], req.config.encryption.secret, function (err, user) {
        if (err) {
          res.json(Response(402, constant.messages.authenticationFailed));
        } else {
          if (user) {
            var id = typeof user.uid === "undefined" ? user.id : user.uid;
            User.findById(id).exec(function (err, admin) {
              if (err)
                res.json(Response(402, constant.messages.authenticationFailed));
              else if (!admin)
                res.json(Response(402, constant.messages.authenticationFailed));
              else {
                // if user has password expiry date and it is greater than todays date then allow to access dashboard or take the user to password change page
                // if this user has a password expiary date field then it will be used for calculation or creation date
                var dateOfOrg = admin.passExpDate
                  ? admin.passExpDate
                  : admin.createdAt;
                if (dateOfOrg && dateOfOrg.getTime() > currentDate.getTime()) {
                  res.json({
                    code: 200,
                    status: "OK",
                    user: admin,
                    changePass: false,
                  });
                } else {
                  if (admin.firstLogin) {
                    res.json({
                      code: 200,
                      status: "OK",
                      user: admin,
                      changePass: false,
                    });
                  } else {
                    res.json({
                      code: 200,
                      status: "OK",
                      user: admin,
                      changePass: true,
                    });
                  }
                }
              }
            });
          } else {
            res.json(Response(402, constant.messages.authenticationFailed));
          }
        }
      });
    } else {
      res.json(Response(402, constant.messages.authenticationFailed));
    }
  } else {
    res.json(Response(402, constant.messages.authenticationFailed));
  }
}

/**
 * Function is use to sign up user account
 * @access private
 * @return json
 * Created by Sanjeev
 * @smartData Enterprises (I) Ltd
 * Created Date 24-june-2017
 */
function userRegister(req, res) {
  if (req.body.email && !validator.isEmail(req.body.email)) {
    return res.json(Response(401, constant.validateMsg.invalidEmail));
  } else {
    User.existCheck(req.body.email, "", function (err, exist) {
      if (err) {
        return res.json(Response(500, constant.validateMsg.internalError, err));
      } else {
        if (exist != true) {
          User.isRegisteredExistCheck(req.body.email, "", function (
            err,
            exist2,
            userdata
          ) {
            if (err) {
              return res.json(
                Response(500, constant.validateMsg.internalError, err)
              );
            } else {
              return res.json(Response(402, exist2, userdata));
            }
          });
        } else {
          var date = new Date();

          var gpassword = generator.generate({
            length: 10,
            numbers: true,
            excludeSimilarCharacters: true,
          });
          var obj = {
            userType: "user",
            firstname: req.body.firstname ? req.body.firstname : "",
            lastname: req.body.lastname ? req.body.lastname : "",
            email: req.body.email.toLowerCase(),

            password: utility.getEncryptText(gpassword),
          };
          new User(obj).save(function (err, userData) {
            if (err) {
              return res.json(
                Response(500, constant.validateMsg.internalError, err)
              );
            } else {
              var mailName = obj.firstname + " " + obj.lastname;
              var templateKey = "user_register";
              var replacement = {
                "{{lastname}}": obj.lastname ? obj.lastname : "",
                "{{firstname}}": obj.firstname ? obj.firstname : "",
                "{{title}}": "",
                "{{email}}": obj.email,
                "{{gpassword}}": gpassword,
                "{{webUrl}}": req.config.webUrl,
                "{{currentYear}}": currentYear,
              };
              console.log(
                "\n\n User register auth cntrller \n\n",
                obj.email,
                templateKey,
                replacement
              );
              utility.sendmailbytemplate(
                obj.email,
                templateKey,
                replacement,
                function (error, templateData) {
                  if (error) {
                  } else {
                  }
                  res.json({
                    code: 200,
                    message:
                      "Congratulations, you have registered successfully. Initial password is sent to your email id!",
                    data: { _id: userData._id },
                  });
                }
              );
            }
          });
        }
      }
    });
  }
}

/**
 * Function is use to login user
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 25-June-2017
 */
function userLogin(req, res) {
  var userInfoData = {};
  var currentDate = new Date();
  if (!req.body.email || !req.body.password) {
    return res.json(Response(402, constant.validateMsg.requiredFieldsMissing));
  } else if (req.body.email && !validator.isEmail(req.body.email)) {
    return res.json(Response(402, constant.validateMsg.invalidEmail));
  } else {
  }
  var passEnc = utility.getEncryptText(req.body.password);
  var userData = {
    email: req.body.email.toLowerCase(),
    password: passEnc,
    userType: { $in: ["admin", "user", "officeAdmin"] }, // restrict super user to log into the doctors portal
  };
  User.findOne(userData, {
    password: 0,
    updatedAt: 0,
    createdAt: 0,
    verifying_token: 0,
  }).exec(function (err, userInfo) {
    if (err) {
      res.json({
        code: 401,
        message: "Request could not be processed. Please try again.",
        data: err,
      });
    } else {
      if (userInfo != null) {
        if (userInfo.status == "0") {
          res.json({
            code: 402,
            message: "Your account is not activated yet.",
            data: {},
          });
        } else if (userInfo.deleted == true) {
          res.json({
            code: 402,
            message: "Your account has been deleted.",
            data: {},
          });
        } else if (!userInfo.isVerified) {
          res.json({
            code: 402,
            message: "Your account is not verified by admin yet.",
            data: {},
          });
        } else {
          var expirationDuration = 60 * 60 * 8 * 1; // expiration duration 8 Hours
          //var expirationDuration = 15; // expiration duration 1 minute
          var params = {
            id: userInfo._id,
          };
          var jwtToken = {};
          jwtToken = jwt.sign(params, req.config.encryption.secret, {
            expiresIn: expirationDuration,
          });
          var userTokenArr = new userToken({
            userId: userInfo._id,
            token: jwtToken,
          });
          userTokenArr.save(function (err) {
            if (err) {
              res.json({
                code: 401,
                message: "Request could not be processed. Please try again.",
                data: {},
              });
            } else {
              //if user has password expiry date and it is greater than todays date then allow to access dashboard or take the user to password change page
              var dateOfOrg = userInfo.passExpDate
                ? userInfo.passExpDate
                : userInfo.createdAt;
              if (dateOfOrg && dateOfOrg.getTime() > currentDate.getTime()) {
                userInfoData.changePass = false;
              } else {
                if (userInfo.firstLogin) {
                  userInfoData.changePass = false;
                } else {
                  userInfoData.changePass = true;
                }
              }

              userInfoData.token = "admin_bearer " + jwtToken;
              userInfoData._id = userInfo._id;
              userInfoData.doctorStatus = userInfo.doctorStatus;

              userInfoData.firstname = userInfo.firstname;
              userInfoData.lastname = userInfo.lastname;
              userInfoData.location = userInfo.location;
              userInfoData.email = userInfo.email;
              userInfoData.phone_number = userInfo.phone_number;
              userInfoData.fax = userInfo.fax;
              userInfoData.cell_phone = userInfo.cell_phone;

              userInfoData.user_loc = userInfo.user_loc;
              userInfoData.range = userInfo.range;
              userInfoData.sute = userInfo.sute;
              userInfoData.degree = userInfo.degree;
              userInfoData.centername = userInfo.centername;
              userInfoData.city = userInfo.city;
              userInfoData.state = userInfo.state;
              userInfoData.zipcode = userInfo.zipcode;
              userInfoData.emailAvailable = userInfo.emailAvailable;

              userInfoData.profile_image = userInfo.image;
              userInfoData.speciality = userInfo.speciality
                ? userInfo.speciality
                : "";
              userInfoData.service = userInfo.service ? userInfo.service : "";
              userInfoData.network = userInfo.network ? userInfo.network : "";
              userInfoData.userType = userInfo.userType;
              userInfoData.image = userInfo.image;
              userInfoData.firstLogin = userInfo.firstLogin;
              userInfoData.hasfrntdesk =
                userInfo.frontdesk.length > 0 ? true : false;

              return res.json({
                code: 200,
                message: "You have been loggedin successfully!",
                data: userInfoData,
              });
            }
          });
        }
      } else {
        res.json({
          code: 402,
          message: "User email or password are not correct.",
          data: {},
        });
      }
    }
  });
}

/**
 * Change password
 */
function updatePassword(req, res) {
  var expDate = new Date();
  expDate.setDate(expDate.getDate() + 90);
  var userInfoData = {};
  if (!req.body.email || !req.body.oldPass || !req.body.newPass) {
    return res.json(Response(401, constant.validateMsg.requiredFieldsMissing));
  } else {
  }
  var passEnc = utility.getEncryptText(req.body.oldPass);
  var newPassword = utility.getEncryptText(req.body.newPass);
  var userData = {
    email: req.body.email.toLowerCase(),
    password: passEnc,
  };
  var flagIsRegistered = true;
  User.findOne(userData, {
    password: 0,
    updatedAt: 0,
    createdAt: 0,
    verifying_token: 0,
    deleted: 0,
    status: 0,
  }).exec(function (err, userInfo) {
    if (err) {
      res.json({
        code: 401,
        message: "Request could not be processed. Please try again.",
        data: err,
      });
    } else {
      if (userInfo != null) {
        if (userInfo.status == "Inactive") {
          res.json({
            code: 402,
            message: "Your account not activated yet.",
            data: {},
          });
        } else if (userInfo.deleted == true) {
          res.json({
            code: 402,
            message: "Your account has been deleted.",
            data: {},
          });
        } else {
          //Task #535 start
          if (userInfo.emailAvailable == 0) {
            flagIsRegistered = false;
          } else {
            flagIsRegistered = true;
          }
          //Task #535 end
          var updateUserRecord = {
            password: newPassword,
            passExpDate: expDate,
            firstLogin: false,
            isRegistered: flagIsRegistered, //Task #535
          };
          User.update(
            { _id: mongoose.Types.ObjectId(userInfo._id) },
            { $set: updateUserRecord },
            function (err) {
              if (err) {
                res.json({
                  code: 401,
                  message: "Request could not be processed. Please try again.",
                  data: {},
                });
              } else {
                var hasfrntdesk = userInfo.frontdesk.length > 0 ? true : false;
                var hasuserloc = utills.notEmpty(userInfo.user_loc);
                return res.json({
                  code: 200,
                  message: "Password changed successfully!",
                  data: {
                    id: userInfo._id,
                    userType: userInfo.userType,
                    firstLogin: userInfo.firstLogin,
                    hasfrntdesk: hasfrntdesk,
                    hasuserloc: hasuserloc,
                  },
                });
              }
            }
          );
        }
      } else {
        res.json({
          code: 401,
          message: "Old password is not correct.",
          data: {},
        });
      }
    }
  });
}

/**
 * Function is admin login
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 24-June-2017
 */
function adminLogin(req, res) {
  //console.log("admin login------", req);
  if (validator.isNull(req.body.email) || !req.body.email) {
    return res.json(Response(401, constant.validateMsg.emailRequired));
  } else if (req.body.email && !validator.isEmail(req.body.email)) {
    return res.json(Response(401, constant.validateMsg.invalidEmail));
  } else if (validator.isNull(req.body.password) || !req.body.password) {
    return res.json(Response(401, constant.validateMsg.passwordRequired));
  } else {
    var passEnc = utility.getEncryptText(req.body.password);
    User.findOne({
      email: req.body.email,
      password: passEnc,
      userType: "superAdmin",
    })
      .lean()
      .exec(function (err, admin) {
        console.log("res----", admin);
        if (err) {
          return res.json(
            Response(500, constant.validateMsg.internalError, err)
          );
        } else {
          if (!admin) {
            return res.json(
              Response(401, constant.validateMsg.invalidEmailOrPassword, err)
            );
          } else {
            var expirationDuration = 60 * 60 * 8 * 1; // expiration duration 8 Hours
            var params = { id: admin._id };
            var jwtToken = {};
            jwtToken = jwt.sign(params, req.config.encryption.secret, {
              expiresIn: expirationDuration,
            });
            var userTokenArr = new userToken({
              userId: admin._id,
              token: jwtToken,
            });
            userTokenArr.save(function (err) {
              if (err) {
                res.json({
                  code: 401,
                  message: "Request could not be processed. Please try again.",
                  data: {},
                });
              } else {
                admin.token = "admin_bearer " + jwtToken;
                return res.json(
                  Response(200, constant.messages.loginSuccess, admin, jwtToken)
                );
              }
            });
          }
        }
      });
  }
}

/**
 * Function is admin login
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 24-June-2017
 */
function insuranceLogin(req, res) {
  console.log(" req.body insuranceLogin ", req.body);
  if (validator.isNull(req.body.email) || !req.body.email) {
    return res.json(Response(401, constant.validateMsg.emailRequired));
  } else if (req.body.email && !validator.isEmail(req.body.email)) {
    return res.json(Response(401, constant.validateMsg.invalidEmail));
  } else if (validator.isNull(req.body.password) || !req.body.password) {
    return res.json(Response(401, constant.validateMsg.passwordRequired));
  } else {
    var passEnc = utility.getEncryptText(req.body.password);
    networkModel
      .findOne({ email: req.body.email, password: passEnc })
      .lean()
      .exec(function (err, admin) {
        // console.log(" admin ", admin);
        if (err) {
          return res.json(
            Response(500, constant.validateMsg.internalError, err)
          );
        } else {
          if (!admin) {
            return res.json(
              Response(401, constant.validateMsg.invalidEmailOrPassword, err)
            );
          } else {
            var expirationDuration = 60 * 60 * 8 * 1; // expiration duration 8 Hours
            var params = { id: admin._id };
            var jwtToken = {};
            jwtToken = jwt.sign(params, req.config.encryption.secret, {
              expiresIn: expirationDuration,
            });
            var userTokenArr = new userToken({
              userId: admin._id,
              token: jwtToken,
            });
            userTokenArr.save(function (err) {
              if (err) {
                res.json({
                  code: 401,
                  message: "Request could not be processed. Please try again.",
                  data: {},
                });
              } else {
                admin.token = "admin_bearer " + jwtToken;
                return res.json(
                  Response(200, constant.messages.loginSuccess, admin, jwtToken)
                );
              }
            });
          }
        }
      });
  }
}

/**
 * Function is use to activate user account after sign up by user id
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 24-June-2017
 */
function userActivation(req, res) {
  var updateUserRecord = {
    status: 1,
  };
  User.update(
    { _id: mongoose.Types.ObjectId(req.body.userId) },
    { $set: updateUserRecord },
    function (err) {
      if (err) {
        res.json({
          code: 401,
          message: "Request could not be processed. Please try again.",
          data: {},
        });
      } else {
        res.json({
          code: 200,
          message: "Your account has been activated successfully.",
        });
      }
    }
  );
}

/**
 * Function is use to activate user account after sign up by verifying Link
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 24-June-2017
 */
function verifyLink(req, res) {
  User.findOne(
    {
      verifying_token: req.params.id,
    },
    function (err, user) {
      if (err || !user) {
        res.redirect("/#/show-message?emailSuccess=false");
      } else {
        user.status = "Active";
        user.verifying_token = null;
        user.save(function (err, data) {
          if (err) res.redirect("/#/verifying-link?success=false");
          else {
            res.redirect("/#/verifying-link?success=true");
          }
        });
      }
    }
  );
}

/**
 * Forgot password
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 24-June-2017
 */
function forgotPassword(req, res) {
  if (validator.isNull(req.body.email)) {
    return res.json(Response(401, constant.validateMsg.requiredFieldsMissing));
  } else {
    var where = {
      email: req.body.email,
      status: { $eq: "1" },
      userType: { $ne: "superAdmin" },
    };
    var aggregate = [
      { $match: where },
      {
        $lookup: {
          from: "titles",
          localField: "degree",
          foreignField: "_id",
          as: "userTitle",
        },
      },
      {
        $unwind: {
          path: "$userTitle",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    User.aggregate(aggregate).exec(function (err, resData) {
      if (err) {
        return res.json(Response(500, constant.validateMsg.internalError, err));
      } else {
        if (utills.notEmpty(resData)) {
          async.each(resData, function (userInfoData) {
            if (!userInfoData) {
              return res.json(
                Response(401, constant.validateMsg.emailNotExist)
              );
            } else {
              if (userInfoData.status === "1") {
                var date = new Date();
                var token = utility.getEncryptText(
                  userInfoData.email + date.getTime()
                );
                User.update(
                  { _id: userInfoData._id },
                  { $set: { passwordResetToken: token } },
                  function (err) {
                    if (err) {
                      return res.json({
                        code: 401,
                        message:
                          "Unable to process your request. Please try again...",
                      });
                    } else {
                      var salutation = "";
                      var templateKey = "forget_password";
                      var replacement = {
                        "{{firstname}}": userInfoData.firstname
                          ? userInfoData.firstname
                          : "",
                        "{{lastname}}": userInfoData.lastname
                          ? userInfoData.lastname
                          : "",
                        "{{title}}":
                          userInfoData.degree && userInfoData.degree != ""
                            ? ", " + userInfoData.userTitle.name
                            : "",
                        "{{center}}": userInfoData.centername
                          ? userInfoData.centername
                          : "",
                        "{{webUrl}}": req.config.webUrl,
                        "{{token}}": token,
                        "{{currentYear}}": currentYear,
                      };
                      utility.sendmailbytemplate(
                        userInfoData.email,
                        templateKey,
                        replacement,
                        function (error, templateData) {
                          if (error) {
                            res.json({
                              code: 343,
                              message: "Error while Sending E-mail",
                              data: {},
                            });
                          } else {
                            return res.json({
                              code: 200,
                              message:
                                "You have been send a password reset email.",
                              data: { id: userInfoData._id },
                            });
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                return res.json({
                  code: 402,
                  message: "Your account has been de-activated by admin.",
                  data: {},
                });
              }
            }
          });
        } else {
          return res.json(Response(401, constant.validateMsg.emailNotExist));
        }
      }
    });
  }
}

/**
 * User Log out
 * @access private
 * @return json
 * Created by Sanjeev Gupta
 * @smartData Enterprises (I) Ltd
 * Created Date 24-June-2017
 */
function userLogOut(req, res) {
  if (!req.body.userId) {
    return res.json(Response(401, constant.validateMsg.requiredFieldsMissing));
  } else {
    var userId = req.body.userId;
    var tokenArr = req.body.token.split(" ");
    var token =
      tokenArr.length > 1 ? req.body.token.split(" ")[1] : req.body.token;
    userToken.remove({ userId: req.body.userId, token: token }, function (
      err,
      user
    ) {
      if (err) {
        return res.json(Response(500, constant.validateMsg.internalError, err));
      } else {
        return res.json(Response(200, constant.messages.logoutSuccess, {}));
      }
    });
  }
}

/**
 * Save contact us request
 * Created By Suman Chakraborty
 * Last Modified on 24-11-2017
 */
function contactUs(req, res) {
  var headers = {
    "User-Agent": "Super Agent/0.0.1",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  // Configure the request
  var data = {
    secret: "6LehhToUAAAAAJIdK2yNF_0qkNgnVTiad04VNmcU",
    response: req.body.gRecaptchaResponse,
  };
  var options = {
    url: "https://www.google.com/recaptcha/api/siteverify",
    method: "POST",
    headers: headers,
    form: data,
  };
  request(options, function (error, response, body) {
    var bodyObj = JSON.parse(body);
    if (bodyObj.success === true) {
      var obj = {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
      };
      var msg = "<b>Contact Request</b>";
      msg += "<br /><br /><p>Name:&nbsp;" + obj.name + "</p><br />";
      msg += "<p>Email ID:&nbsp;" + obj.email + "</p><br />";
      msg += "<p>Message:&nbsp;" + obj.message + "</p><br />";
      new contactus(obj).save(function (err, userData) {
        if (!err) {
          utility.sendmail(
            "info@whichdocs.com",
            "Which Docs Contact Us Request",
            msg,
            function (err, res) {}
          );
          return res.json({
            code: 200,
            message: "Thank you for writing us. We will get in touch with you.",
          });
        } else {
          return res.json({
            code: 201,
            message: "Unable to process your request.",
            data: err,
          });
        }
      });
    } else {
      return res.json({
        code: 201,
        message: "Authentication failed",
        data: "ssss",
      });
    }
  });
}
