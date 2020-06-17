"use strict";

var mongoose = require("mongoose"),
  UserModel = mongoose.model("user"),
  UserExistModel = mongoose.model("userExist"),
  UserPreferenceRating = mongoose.model("userPreferenceRating"),
  userNetworkModel = mongoose.model('userNetwork'),
  //DoctorModel = mongoose.model('doctors'),
  referModel = mongoose.model("refers"),
  userPreferenceModel = mongoose.model("userPreference"),
  // userPreferenceRatingModel = mongoose.model('userPreferenceRating'),
  specialityModel = mongoose.model("specialities"),
  logReferral = mongoose.model("logReferral"),
  invitationLogReferral = mongoose.model("invitationLogReferral"),
  faxmodel = mongoose.model("faxTemplate"),
  mailModel = mongoose.model("mailtemplates"),
  smsModel = mongoose.model("smstemplates"),
  fs = require("fs-extra"),
  path = require("path"),
  utility = require("../lib/utility.js"),
  generator = require("generate-password"),
  utills = require("../lib/util.js"),
  constant = require("../lib/constants");

var timezone = require("node-google-timezone");
var co = require("co");
var CronJob = require("cron").CronJob;
const https = require("https");
var async = require("async");
var socket;

module.exports = {
  socketIO: socketIO,
  sendAck: sendAck,
  sendSms: sendSms,
  sendMail: sendMail,
  setStatus: setStatus,
  getdoctors: getdoctors,
  getdoctorsreg: getdoctorsreg,
  getdoctorsnonreg: getdoctorsnonreg,
  delDetails: delDetails,
  addNonRegDoc: addNonRegDoc,
  addNonRegDocInsurance: addNonRegDocInsurance,
  // getReferredBy: getReferredBy,
  // getReferredTo: getReferredTo,
  getNonRegDocs: getNonRegDocs,
  getNonDocById: getNonDocById,
  getMyRatingList: getMyRatingList,
  updateNonRegDoc: updateNonRegDoc,
  cronDelAttchment: cronDelAttchment,
  deleteAttachment: deleteAttachment,
  uploadAttachments: uploadAttachments,
  setReferralStatus: setReferralStatus,
  addDoctorInNetwork: addDoctorInNetwork,
  checkDoctorsStatus: checkDoctorsStatus,
  getAvailableDoctors: getAvailableDoctors,
  getDoctorBySpeciality: getDoctorBySpeciality,
  getLocationId: getLocationId,
  getNonRegDoctorsExportList: getNonRegDoctorsExportList
};

// Fields to skip foe encription
var fieldToSkip = [
  "_id",
  "network",
  "referredTo",
  "patientInfo",
  "referredBy",
  "isDeleted",
  "referredDate",
  "attachment",
  "acknowledged",
  "status",
  "chiefComplain",
  "other",
  "services",
  "serviceName",
  "specialities",
  "refByOprTime",
  "refToOprTime",
  "lastOperationOn",
  "__v"
];

/**
* List of doctors who are not registered with WD
* Created By Suman Chakraborty
* last Modified on 17-04-2018
*/
// function getNonRegDocs(req, res) {
//   //console.log(" inside nonregdocs ", req.body);

//   var specCond = {};
//   var count = parseInt(req.body.count ? req.body.count : 0);
//   var skip = parseInt(req.body.count * (req.body.page - 1));
//   var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
//   var type = "user";
//   if (req.body.hasOwnProperty("userType")) {
//     type = req.body.userType;
//   }
//   var condition = {
//     deleted: false,
//     status: "1",
//     // isOutside: true,
//     isRegistered: false,
//     userType: {
//       $in: [type]
//     }
//   };

//   if (req.body.frontDeskReq) {
//     condition.frontdesk = {
//       $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) }
//     };
//   }

//   if (req.body.hasOwnProperty("isRegistered") && req.body.isRegistered) {
//     condition.isRegistered = req.body.isRegistered;
//   }

//   if (req.body.hasOwnProperty("emailtype")) {
//     if (req.body.emailtype == "with_mail") {
//       condition.emailAvailable = { $ne: 0 };
//     } else if (req.body.emailtype == "without_mail") {
//       condition.emailAvailable = 0;
//     }
//      // saurabh 06-June-2019
//      else{
//       condition.$or = [
//               {emailAvailable : { $ne: 0 }},
//              {emailAvailable : 0} 
//           ]

//   }
//   }

//   if (req.body.service) {
//     condition.service = {
//       $in: req.body.service.map(function (item) {
//         return mongoose.Types.ObjectId(item);
//       })
//     };
//   }
//   if (req.body.specialty) {
//     condition.speciality = {
//       $in: req.body.specialty.map(function (item) {
//         return mongoose.Types.ObjectId(item);
//       })
//     };
//   }
//   if (req.body.network) {
//     condition.network = {
//       $in: req.body.network.map(function (item) {
//         return mongoose.Types.ObjectId(item);
//       })
//     };
//   }
//   var sorting = utility.getSortObj(req.body);
//   var searchText = req.body.searchText;
//   if (req.body.searchText) {
//     console.log(" searchText ", searchText);
//     condition.$or = [
//       {
//         doctorStatus: new RegExp(searchText, "gi")
//       },
//       {
//         email: new RegExp(searchText, "gi")
//       },
//       {
//         phone_number: new RegExp(searchText, "gi")
//       },
//       {
//         fax: new RegExp(searchText, "gi")
//       },
//       {
//         cell_phone: new RegExp(searchText, "gi")
//       },
//       {
//         insfirstname: new RegExp(searchText, "gi")
//       },
//       {
//         inslastname: new RegExp(searchText, "gi")
//       },
//       {
//         centername: new RegExp(searchText, "gi")
//       },
//       {
//         poc_name: new RegExp(searchText, "gi")
//       }
//     ];
//   }

//   let aggregate = [
//     {
//       $unwind: {
//         path: "$createdById",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     {
//       $project: {
//         firstname: 1,
//         insfirstname: {
//           $toLower: "$firstname"
//         },
//         lastname: 1,
//         inslastname: {
//           $toLower: "$lastname"
//         },
//         centername: 1,
//         degree: 1,
//         poc_name: 1,
//         email: 1,
//         image: 1,
//         phone_number: 1,
//         fax: 1,
//         cell_phone: 1,
//         doctorStatus: 1,
//         speciality: 1,
//         service: 1,
//         network: 1,
//         deleted: 1,
//         userType: 1,
//         frontdesk: 1,
//         status: 1,
//         createdById: 1,
//         firstLogin: 1,
//         emailAvailable: 1,
//         showMobile: 1,
//         isRegistered: 1,
//         isOutside: 1
//       }
//     },

//     {
//       $lookup: {
//         from: "users",
//         localField: "createdById",
//         foreignField: "_id",
//         as: "createdByInfo"
//       }
//     },

//     {
//       $match: condition
//     },
//     {
//       $group: {
//         _id: "$_id",
//         firstname: {
//           $first: "$firstname"
//         },
//         insfirstname: {
//           $first: "$insfirstname"
//         },
//         lastname: {
//           $first: "$lastname"
//         },
//         inslastname: {
//           $first: "$inslastname"
//         },
//         centername: {
//           $first: "$centername"
//         },
//         degree: {
//           $first: "$degree"
//         },
//         poc_name: {
//           $first: "$poc_name"
//         },
//         doctorStatus: {
//           $first: "$doctorStatus"
//         },
//         image: {
//           $first: "$image"
//         },
//         email: {
//           $first: "$email"
//         },
//         phone_number: {
//           $first: "$phone_number"
//         },
//         fax: {
//           $first: "$fax"
//         },
//         cell_phone: {
//           $first: "$cell_phone"
//         },
//         doctorsNPI: {
//           $first: "$doctorsNPI"
//         },
//         status: {
//           $first: "$status"
//         },
//         firstLogin: {
//           $first: "$firstLogin"
//         },
//         isRegistered: {
//           $first: "$isRegistered"
//         },
//         createdById: {
//           $first: "$createdById"
//         },

//         created_by: {
//           $push: {
//             createdByInfo: "$createdByInfo"
//           }
//         },
//         emailAvailable: {
//           $first: "$emailAvailable"
//         },
//         showMobile: {
//           $first: "$showMobile"
//         }
//       }
//     }
//   ];

//   var aggregateCnt = [].concat(aggregate);
//   if (req.body.count && req.body.page) {
//     aggregate.push({
//       $sort: sorting
//     });
//     aggregate.push({
//       $skip: skip
//     });
//     aggregate.push({
//       $limit: count
//     });
//   }


//   UserModel.aggregate(aggregate)
//     .allowDiskUse(true)
//     .exec(function (err, userData) {
//       if (err) {
//         res.json({
//           code: 201,
//           message: "internal error....",
//           data: {}
//         });
//       } else if (userData) {
//         aggregateCnt.push({
//           $group: {
//             _id: null,
//             count: {
//               $sum: 1
//             }
//           }
//         });

//         UserModel.aggregate(aggregateCnt)
//           .allowDiskUse(true)
//           .exec(function (err, userDataCount) {
//             if (err) {
//               res.json({
//                 code: 201,
//                 message: "internal error.......",
//                 data: {}
//               });
//             } else if (userDataCount) {
//               var ite = 0;
//               userData.forEach(function (item, index) {
//                 ite++;
//                 referModel.count({ referredTo: item._id, status: 0 }, function (
//                   err,
//                   res
//                 ) {
//                   userData[index].inboxCount = res;
//                 });
//                 referModel.count({ referredBy: item._id, status: 3 }, function (
//                   err,
//                   res
//                 ) {
//                   userData[index].notesent = res;
//                 });
//               });
//               setTimeout(function () {
//                 return res.json({
//                   code: 200,
//                   message: "Data retrieved successfully",
//                   data: userData,
//                   totalCount: userDataCount[0] ? userDataCount[0].count : 0
//                 });
//               }, 1000);
//             }
//           });
//       }
//     });
// }

function getNonRegDocs(req, res) {


  try {


    var specCond = {};
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var type = 'user';
    if (req.body.hasOwnProperty('userType')) {
      type = req.body.userType;
    }

    var condition = {
      deleted: false,
      status: '1',
      isRegistered: false,

      userType: {
        $in: [type]
      },

    };
    if (req.body.frontDeskReq) {
      condition.frontdesk = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) } }
    }

    if (req.body.hasOwnProperty('isRegistered') && req.body.isRegistered) {
      condition.isRegistered = req.body.isRegistered;
    }

    if (req.body.hasOwnProperty('emailtype')) {
      if (req.body.emailtype == 'with_mail') { 
      //  console.log("with mail ---------");
        condition.$and = [
          {
            $or: [
              { email: { $ne: '' } },
              { email: { $not: /temp@wd.com$/ } },
            ]
          },

          { emailAvailable: 1 },

        ]
      } else if (req.body.emailtype == 'without_mail') {
        // console.log("without mail ---------");
        condition.$and = [
          {
            $or: [
              { email: /temp@wd.com$/},
              { email: { $eq: '' } }, 
            ]
          },

          { emailAvailable: 0 }

        ]
      }
   
      else {
        // console.log("else for all mails ---------");
        condition.$or = [
          { emailAvailable: { $ne: 0 } },
          { emailAvailable: 0 }
        ]

      }
    }

    if (req.body.service) {
      condition.service = {
        $in: req.body.service.map(function (item) {
          return mongoose.Types.ObjectId(item)
        })
      }
    }
    if (req.body.specialty) {
      condition.speciality = {
        $in: req.body.specialty
      }
    }

    if (req.body.zipcode) {
      condition.zipcode = req.body.zipcode;
    }

    var sorting = utility.getSortObj(req.body);
    var searchText = req.body.searchText;
    if (req.body.searchText) {
      condition.$or = [
        {
          'doctorStatus': new RegExp(searchText, 'gi')
        },
        {
          'firstname': new RegExp(searchText, 'gi')
        },
        {
          'lastname': new RegExp(searchText, 'gi')
        },
        {
          'email': new RegExp(searchText, 'gi')
        },
        {
          'phone_number': new RegExp(searchText, 'gi')
        },
        {
          'fax': new RegExp(searchText, 'gi')
        },
        {
          'cell_phone': new RegExp(searchText, 'gi')
        },
        {
          'insfirstname': new RegExp(searchText, 'gi')
        },
        {
          'inslastname': new RegExp(searchText, 'gi')
        },
        {
          'centername': new RegExp(searchText, 'gi')
        },
        {
          'poc_name': new RegExp(searchText, 'gi')
        },

      ];
    }


    // *************$$$$$***** 10th  June 2019 Saurabh Udapure Code : Optimized Code for fetching non reg doctor list******************* 
    UserModel.find(condition)
      .collation({ locale: 'en' })
      .limit(count)
      .populate({ path: 'createdById', model: 'user' })
      .sort(sorting)
      .skip(skip)
      .lean()
      .exec(function (err, userData) {
        co(function* () {
          let finalUserData = [];
          if (err) {
            console.log("\n\n\nErr in find query", err);
            res.json({
              code: 201,
              message: 'internal error.',
              data: {}
            });
          } else if (userData && userData.length) {
            // ****************** replaced code 6-June-2019 **************************

            if (req.body.network) {
              for (let i = 0; i < userData.length; i++) {
                let findUserNetworkData = {};
                if (req.body.network) {
                  findUserNetworkData = {
                    userId: userData[i]._id,
                    status: "0"
                  }
                  findUserNetworkData.network = {
                    $in: req.body.network
                  }
                }

                yield userNetworkModel.find(findUserNetworkData, function (err, userNetworkData) {
                  if (err) {
                    console.log("\n\nError", err);
                  } else {
                    if (userNetworkData.length > 0) {
                      userData[i].user_network = userNetworkData
                      finalUserData.push(userData[i]);
                    }
                  }

                });

              }
            }
            if (finalUserData.length == 0) {
              finalUserData = userData
            }

            UserModel.count(condition).exec(function (err, userDataCount) {
              if (err) {
                res.json({
                  code: 201,
                  message: 'internal error.',
                  data: {}
                });
              } else if (userDataCount) {

                var ite = 0;

                finalUserData.forEach(function (item, index) {
                  ite++;
                  referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
                    finalUserData[index].inboxCount = res;
                  })
                  referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
                    finalUserData[index].notesent = res;
                  })
                })
                setTimeout(function () {
                  return res.json({
                    code: 200,
                    message: 'Data retrieved successfully',
                    data: finalUserData,
                    totalCount: finalUserData.length == userData.length ? userDataCount : finalUserData.length//((userDataCount[0]) ? userDataCount[0].count : 0)
                  });
                }, 1000);
              }
            })

            //***************** replaced code ends *****************************

          }
          else {
            return res.json({
              code: 200,
              message: 'Data retrieved successfully',
              data: finalUserData,
            });
          }
        })

      })
  }
  catch (errrr) {
    console.log("\n\nErrororrrrrrrrr \n", errrr);
    res.json({
      code: 201,
      message: 'internal error.',
      data: {}
    });
  }
}




function getNonRegDoctorsExportList(req, res) {



  var specCond = {};
  var count = parseInt(req.body.count ? req.body.count : 0);
  var skip = parseInt(req.body.count * (req.body.page - 1));
  var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
  var isOutside = req.body.isOutside ? req.body.isOutside : true;
  var type = "user";
  if (req.body.hasOwnProperty("userType")) {
    type = req.body.userType;
  }
  var condition = {
    deleted: false,
    status: "1",
    // isOutside: isOutside,
    isRegistered: false,
    // emailAvailable:true,
    userType: {
      $in: [type]
    }
  };
  if (req.body.frontDeskReq) {
    condition.frontdesk = {
      $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.requestingUser) }
    };
  }

  if (req.body.hasOwnProperty("isRegistered") && req.body.isRegistered) {
    condition.isRegistered = req.body.isRegistered;
  }

  if (req.body.hasOwnProperty("emailtype")) {
    if (req.body.emailtype == "with_mail") {
      condition.emailAvailable = { $ne: 0 };
    } else if (req.body.emailtype == "without_mail") {
      // console.log("without email 2 here");
      condition.emailAvailable = { $eq: 0 };
    }

  }
  // console.log("condition after adding",condition);



  if (req.body.service) {
    condition.service = {
      $in: req.body.service.map(function (item) {
        return mongoose.Types.ObjectId(item);
      })
    };
  }
  if (req.body.specialty) {
    condition.speciality = {
      $in: req.body.specialty.map(function (item) {
        return mongoose.Types.ObjectId(item);
      })
    };
  }
  if (req.body.network) {
    condition.network = {
      $in: req.body.network.map(function (item) {
        return mongoose.Types.ObjectId(item);
      })
    };
  }
  var sorting = utility.getSortObj(req.body);
  var searchText = req.body.searchText;
  if (req.body.searchText) {
    condition.$or = [
      {
        doctorStatus: new RegExp(searchText, "gi")
      },
      {
        email: new RegExp(searchText, "gi")
      },
      {
        phone_number: new RegExp(searchText, "gi")
      },
      {
        fax: new RegExp(searchText, "gi")
      },
      {
        cell_phone: new RegExp(searchText, "gi")
      },
      {
        insfirstname: new RegExp(searchText, "gi")
      },
      {
        inslastname: new RegExp(searchText, "gi")
      },
      {
        centername: new RegExp(searchText, "gi")
      },
      {
        poc_name: new RegExp(searchText, "gi")
      }
    ];
  }

  let aggregate = [
    {
      $unwind: {
        path: "$speciality",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $unwind: {
        path: "$createdById",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: "$frontdesk",
        preserveNullAndEmptyArrays: true
      }
    },

    { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        firstname: 1,
        insfirstname: {
          $toLower: "$firstname"
        },
        lastname: 1,
        inslastname: {
          $toLower: "$lastname"
        },
        centername: 1,
        degree: 1,
        poc_name: 1,
        email: 1,
        image: 1,
        phone_number: 1,
        fax: 1,
        cell_phone: 1,
        doctorStatus: 1,
        speciality: 1,
        service: 1,
        network: 1,
        frontdesk: 1,
        deleted: 1,
        userType: 1,
        frontdesk: 1,
        status: 1,
        createdById: 1,
        firstLogin: 1,
        emailAvailable: 1,
        showMobile: 1,
        isRegistered: 1,
        isOutside: 1,
        location: 1,
        sute: 1,
        city: 1,
        state: 1,
        zipcode: 1
      }
    },

    {
      $lookup: {
        from: "specialities",
        localField: "speciality",
        foreignField: "_id",
        as: "specialityInfo"
      }
    },

    {
      $lookup: {
        from: "users",
        localField: "createdById",
        foreignField: "_id",
        as: "createdByInfo"
      }
    },
    {
      $lookup: {
        from: "networks",
        localField: "network",
        foreignField: "_id",
        as: "networkInfo"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "frontdesk",
        foreignField: "_id",
        as: "frontDeskInfo"
      }
    },
    {
      $lookup: {
        from: "titles",
        localField: "degree",
        foreignField: "_id",
        as: "titleInfo"
      }
    },

    {
      $match: condition
    },
    {
      $group: {
        _id: "$_id",
        firstname: {
          $first: "$firstname"
        },
        insfirstname: {
          $first: "$insfirstname"
        },
        lastname: {
          $first: "$lastname"
        },
        inslastname: {
          $first: "$inslastname"
        },
        centername: {
          $first: "$centername"
        },
        degree: {
          $first: "$degree"
        },
        poc_name: {
          $first: "$poc_name"
        },
        doctorStatus: {
          $first: "$doctorStatus"
        },
        image: {
          $first: "$image"
        },
        email: {
          $first: "$email"
        },
        phone_number: {
          $first: "$phone_number"
        },
        fax: {
          $first: "$fax"
        },
        cell_phone: {
          $first: "$cell_phone"
        },
        doctorsNPI: {
          $first: "$doctorsNPI"
        },
        status: {
          $first: "$status"
        },
        firstLogin: {
          $first: "$firstLogin"
        },
        isRegistered: {
          $first: "$isRegistered"
        },
        createdById: {
          $first: "$createdById"
        },
        specility_data: {
          $addToSet: {
            specialityInfo: "$specialityInfo"
          }
        },
        network_data: {
          $addToSet: {
            networkInfo: "$networkInfo"
          }
        },
        frontdesk_data: {
          $addToSet: {
            frontDeskInfo: "$frontDeskInfo"
          }
        },
        created_by: {
          $push: {
            createdByInfo: "$createdByInfo"
          }
        },
        title_data: {
          $push: {
            titleInfo: "$titleInfo"
          }
        },
        emailAvailable: {
          $first: "$emailAvailable"
        },
        showMobile: {
          $first: "$showMobile"
        },
        location: {
          $first: "$location"
        },
        sute: {
          $first: "$sute"
        },
        city: {
          $first: "$city"
        },
        state: {
          $first: "$state"
        },
        zipcode: {
          $first: "$zipcode"
        }
      }
    }
  ];

  var aggregateCnt = [].concat(aggregate);
  if (req.body.count && req.body.page) {
    aggregate.push({
      $sort: sorting
    });
    aggregate.push({
      $skip: skip
    });
    aggregate.push({
      $limit: count
    });
  }

  UserModel.aggregate(aggregate)
    .allowDiskUse(true)
    .exec(function (err, userData) {
      if (err) {
        res.json({
          code: 201,
          message: "internal error.",
          data: {}
        });
      } else if (userData) {
        aggregateCnt.push({
          $group: {
            _id: null,
            count: {
              $sum: 1
            }
          }
        });
        UserModel.aggregate(aggregateCnt)
          .allowDiskUse(true)
          .exec(function (err, userDataCount) {
            if (err) {
              res.json({
                code: 201,
                message: "internal error111.",
                data: {}
              });
            } else if (userDataCount) {
              res.json({
                code: 200,
                message: "Data retrieved successfully",
                data: userData,
                totalCount: userDataCount[0] ? userDataCount[0].count : 0
              });
            }
          });
      }
    });
}

/**
* Add non-reg doctor
* Created By suman
* Last modified on 03-01-2018
*/
function addNonRegDocInsurance(req, res) {
  // console.log("\n\n\n dsghdgshdgsgdhsgddgdsh",req.body);
  
  uploadBatch3(req.body);
  res.json({ code: 200, message: "Processing import data" });
}

function uploadBatch3(data) {
  async.eachSeries(
    data,
    function (item, callback) {
      co(function* () {
        var nonRegDoc = {};
        nonRegDoc.degree = "";

        if (item.hasOwnProperty("location") && item["location"]) {
          // console.log("\n\n If condition asdsdas \n\n",item);
          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc ?  item.user_loc : [];

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            // network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            delete nonRegDoc.isOutside;
            var userId = mongoose.Types.ObjectId(item._id);

            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            // start check user is already exist or not
            // console.log("\n\n else of item._id");

            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }
            // console.log("\n\n condition",condition);
            
            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {
                          // console.log("\n\n else of count",totalCount);
                          if (totalCount == 0) {
                            var UsersRecord = new UserModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { 
                              if(err){
                                console.log("\n\n error in saving",err);
                              }
                              else{
                                // console.log("\n\n data saved sucessfully ",data);
                                if(data){
                                  let objToAdd = {
                                    userId : data._id,
                                    network : item.network
                                  }

                                  var userNetworkRecord = new userNetworkModel(objToAdd)
                                  userNetworkRecord.save(function (error, userNetwrkData) {
                                    if(error){
                                      console.log("\n\n userNetwrkData error",error);
                                    }
                                    else{
                                      // console.log("\n\n userNetwrkData saved sucessfully ",userNetwrkData);
                                    }
                                  })
                                }
                                else{

                                }
                              }
                            });
                          } else if (
                            totalCount == 1 &&
                            (resp[0].isRegistered == true ||
                              resp[0].isRegistered == false)
                          ) {
                            if (utills.notEmpty(resp[0].network)) {
                              // console.log("\n\n inside resp[0].network",resp[0].network);
                              if(resp[0].network.length){
                                nonRegDoc.network = nonRegDoc.network.concat(
                                  resp[0].network.toString().split(",")
                                );
                                nonRegDoc.network = nonRegDoc.network.filter(
                                  function (value, index, self) {
                                    return self.indexOf(value) == index;
                                  }
                                );
                              }
                              
                            }

                            if (utills.notEmpty(resp[0].speciality)) {
                              nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                resp[0].speciality.toString().split(",")
                              );
                              nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                function (value, index, self) {
                                  return self.indexOf(value) == index;
                                }
                              );
                            }

                            delete nonRegDoc.isOutside;

                            // email should not save if email is blank in csv file
                            if (
                              nonRegDoc.email == "" &&
                              utills.notEmpty(resp[0].email)
                            ) {
                              delete nonRegDoc.email;
                            }

                            // firstname should not save if firstname is blank in csv file
                            if (
                              nonRegDoc.firstname == "" &&
                              utills.notEmpty(resp[0].firstname)
                            ) {
                              delete nonRegDoc.firstname;
                            }

                            // lastname should not save if lastname is blank in csv file
                            if (
                              nonRegDoc.lastname == "" &&
                              utills.notEmpty(resp[0].lastname)
                            ) {
                              delete nonRegDoc.lastname;
                            }

                            // fax should not save if fax is blank in csv file
                            if (
                              nonRegDoc.fax == "" &&
                              utills.notEmpty(resp[0].fax)
                            ) {
                              delete nonRegDoc.fax;
                            }

                            // phone_number should not save if phone_number is blank in csv file
                            if (
                              nonRegDoc.phone_number == "" &&
                              utills.notEmpty(resp[0].phone_number)
                            ) {
                              delete nonRegDoc.phone_number;
                            }

                            // cell_phone should not save if cell_phone is blank in csv file
                            if (
                              nonRegDoc.cell_phone == "" &&
                              utills.notEmpty(resp[0].cell_phone)
                            ) {
                              delete nonRegDoc.cell_phone;
                            }

                            // centername should not save if location is blank in csv file
                            if (
                              nonRegDoc.location == "" &&
                              utills.notEmpty(resp[0].location)
                            ) {
                              delete nonRegDoc.location;
                            }

                            // city should not save if city is blank in csv file
                            if (
                              nonRegDoc.city == "" &&
                              utills.notEmpty(resp[0].city)
                            ) {
                              delete nonRegDoc.city;
                            }

                            // state should not save if state is blank in csv file
                            if (
                              nonRegDoc.state == "" &&
                              utills.notEmpty(resp[0].state)
                            ) {
                              delete nonRegDoc.state;
                            }

                            // sute should not save if sute is blank in csv file
                            if (
                              nonRegDoc.sute == "" &&
                              utills.notEmpty(resp[0].sute)
                            ) {
                              delete nonRegDoc.sute;
                            }

                            // user_loc should not save if user_loc is blank in csv file
                            if (
                              nonRegDoc.user_loc == "" &&
                              utills.notEmpty(resp[0].user_loc)
                            ) {
                              delete nonRegDoc.user_loc;
                            }

                            // emailAvailable should not save if emailAvailable is blank in csv file
                            if (
                              nonRegDoc.emailAvailable == "" &&
                              utills.notEmpty(resp[0].emailAvailable)
                            ) {
                              delete nonRegDoc.emailAvailable;
                            }

                            // doctorsNPI should not save if doctorsNPI is blank in csv file
                            if (
                              nonRegDoc.doctorsNPI == "" &&
                              utills.notEmpty(resp[0].doctorsNPI)
                            ) {
                              delete nonRegDoc.doctorsNPI;
                            }

                            nonRegDoc.userId = resp[0]._id;
                            nonRegDoc._id = resp[0]._id;

                            UserModel.update(
                              { _id: resp[0]._id },
                              nonRegDoc,
                              function (err, data) { }
                            );
                          } else if (totalCount > 1) {
                            delete nonRegDoc.isOutside;

                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;
                              nonRegDoc._id = data._id;

                              if (
                                data.isRegistered == true ||
                                data.isRegistered == false
                              ) {
                                if (utills.notEmpty(data.network)) {
                                  nonRegDoc.network = nonRegDoc.network.concat(
                                    data.network.toString().split(",")
                                  );
                                  nonRegDoc.network = nonRegDoc.network.filter(
                                    function (value, index, self) {
                                      return self.indexOf(value) == index;
                                    }
                                  );
                                }

                                if (utills.notEmpty(data.speciality)) {
                                  nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                    data.speciality.toString().split(",")
                                  );
                                  nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                    function (value, index, self) {
                                      return self.indexOf(value) == index;
                                    }
                                  );
                                }

                                // email should not save if email is blank in csv file
                                if (
                                  nonRegDoc.email == "" &&
                                  utills.notEmpty(data.email)
                                ) {
                                  delete nonRegDoc.email;
                                }

                                // firstname should not save if firstname is blank in csv file
                                if (
                                  nonRegDoc.firstname == "" &&
                                  utills.notEmpty(data.firstname)
                                ) {
                                  delete nonRegDoc.firstname;
                                }

                                // lastname should not save if lastname is blank in csv file
                                if (
                                  nonRegDoc.lastname == "" &&
                                  utills.notEmpty(data.lastname)
                                ) {
                                  delete nonRegDoc.lastname;
                                }

                                // fax should not save if fax is blank in csv file
                                if (
                                  nonRegDoc.fax == "" &&
                                  utills.notEmpty(data.fax)
                                ) {
                                  delete nonRegDoc.fax;
                                }

                                // phone_number should not save if phone_number is blank in csv file
                                if (
                                  nonRegDoc.phone_number == "" &&
                                  utills.notEmpty(data.phone_number)
                                ) {
                                  delete nonRegDoc.phone_number;
                                }

                                // cell_phone should not save if cell_phone is blank in csv file
                                if (
                                  nonRegDoc.cell_phone == "" &&
                                  utills.notEmpty(data.cell_phone)
                                ) {
                                  delete nonRegDoc.cell_phone;
                                }

                                // centername should not save if location is blank in csv file
                                if (
                                  nonRegDoc.location == "" &&
                                  utills.notEmpty(data.location)
                                ) {
                                  delete nonRegDoc.location;
                                }

                                // city should not save if city is blank in csv file
                                if (
                                  nonRegDoc.city == "" &&
                                  utills.notEmpty(data.city)
                                ) {
                                  delete nonRegDoc.city;
                                }

                                // state should not save if state is blank in csv file
                                if (
                                  nonRegDoc.state == "" &&
                                  utills.notEmpty(data.state)
                                ) {
                                  delete nonRegDoc.state;
                                }

                                // sute should not save if sute is blank in csv file
                                if (
                                  nonRegDoc.sute == "" &&
                                  utills.notEmpty(data.sute)
                                ) {
                                  delete nonRegDoc.sute;
                                }

                                // user_loc should not save if user_loc is blank in csv file
                                if (
                                  nonRegDoc.user_loc == "" &&
                                  utills.notEmpty(data.user_loc)
                                ) {
                                  delete nonRegDoc.user_loc;
                                }

                                // emailAvailable should not save if emailAvailable is blank in csv file
                                if (
                                  nonRegDoc.emailAvailable == "" &&
                                  utills.notEmpty(data.emailAvailable)
                                ) {
                                  delete nonRegDoc.emailAvailable;
                                }

                                // doctorsNPI should not save if doctorsNPI is blank in csv file
                                if (
                                  nonRegDoc.doctorsNPI == "" &&
                                  utills.notEmpty(data.doctorsNPI)
                                ) {
                                  delete nonRegDoc.doctorsNPI;
                                }

                                UserModel.update(
                                  { _id: data._id },
                                  nonRegDoc,
                                  function (err, data) { }
                                );
                                //});
                              }
                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        } else {
          console.log("\n\n Else condition asdsdas");
          
          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            //'degree'      : item.degree,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            delete nonRegDoc.isOutside;
            var userId = mongoose.Types.ObjectId(item._id);

            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }

            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {
                          if (totalCount == 0) {
                            var UsersRecord = new UserModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { });
                          } else if (
                            totalCount == 1 &&
                            (resp[0].isRegistered == true ||
                              resp[0].isRegistered == false)
                          ) {

                            if (utills.notEmpty(resp[0].network)) {
                              nonRegDoc.network = nonRegDoc.network.concat(
                                resp[0].network.toString().split(",")
                              );
                              nonRegDoc.network = nonRegDoc.network.filter(
                                function (value, index, self) {
                                  return self.indexOf(value) == index;
                                }
                              );
                            }

                            if (utills.notEmpty(resp[0].speciality)) {
                              nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                resp[0].speciality.toString().split(",")
                              );
                              nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                function (value, index, self) {
                                  return self.indexOf(value) == index;
                                }
                              );
                            }

                            delete nonRegDoc.isOutside;

                            // email should not save if email is blank in csv file
                            if (
                              nonRegDoc.email == "" &&
                              utills.notEmpty(resp[0].email)
                            ) {
                              delete nonRegDoc.email;
                            }

                            // firstname should not save if firstname is blank in csv file
                            if (
                              nonRegDoc.firstname == "" &&
                              utills.notEmpty(resp[0].firstname)
                            ) {
                              delete nonRegDoc.firstname;
                            }

                            // lastname should not save if lastname is blank in csv file
                            if (
                              nonRegDoc.lastname == "" &&
                              utills.notEmpty(resp[0].lastname)
                            ) {
                              delete nonRegDoc.lastname;
                            }

                            // fax should not save if fax is blank in csv file
                            if (
                              nonRegDoc.fax == "" &&
                              utills.notEmpty(resp[0].fax)
                            ) {
                              delete nonRegDoc.fax;
                            }

                            // phone_number should not save if phone_number is blank in csv file
                            if (
                              nonRegDoc.phone_number == "" &&
                              utills.notEmpty(resp[0].phone_number)
                            ) {
                              delete nonRegDoc.phone_number;
                            }

                            // cell_phone should not save if cell_phone is blank in csv file
                            if (
                              nonRegDoc.cell_phone == "" &&
                              utills.notEmpty(resp[0].cell_phone)
                            ) {
                              delete nonRegDoc.cell_phone;
                            }

                            // centername should not save if location is blank in csv file
                            if (
                              nonRegDoc.location == "" &&
                              utills.notEmpty(resp[0].location)
                            ) {
                              delete nonRegDoc.location;
                            }

                            // city should not save if city is blank in csv file
                            if (
                              nonRegDoc.city == "" &&
                              utills.notEmpty(resp[0].city)
                            ) {
                              delete nonRegDoc.city;
                            }

                            // state should not save if state is blank in csv file
                            if (
                              nonRegDoc.state == "" &&
                              utills.notEmpty(resp[0].state)
                            ) {
                              delete nonRegDoc.state;
                            }

                            // sute should not save if sute is blank in csv file
                            if (
                              nonRegDoc.sute == "" &&
                              utills.notEmpty(resp[0].sute)
                            ) {
                              delete nonRegDoc.sute;
                            }

                            // user_loc should not save if user_loc is blank in csv file
                            if (
                              nonRegDoc.user_loc == "" &&
                              utills.notEmpty(resp[0].user_loc)
                            ) {
                              delete nonRegDoc.user_loc;
                            }

                            // emailAvailable should not save if emailAvailable is blank in csv file
                            if (
                              nonRegDoc.emailAvailable == "" &&
                              utills.notEmpty(resp[0].emailAvailable)
                            ) {
                              delete nonRegDoc.emailAvailable;
                            }

                            // doctorsNPI should not save if doctorsNPI is blank in csv file
                            if (
                              nonRegDoc.doctorsNPI == "" &&
                              utills.notEmpty(resp[0].doctorsNPI)
                            ) {
                              delete nonRegDoc.doctorsNPI;
                            }

                            nonRegDoc.userId = resp[0]._id;
                            nonRegDoc._id = resp[0]._id;

                            UserModel.update(
                              { _id: resp[0]._id },
                              nonRegDoc,
                              function (err, data) { }
                            );
                          } else if (totalCount > 1) {
                            delete nonRegDoc.isOutside;
                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;
                              nonRegDoc._id = data._id;
                              if (
                                data.isRegistered == true ||
                                data.isRegistered == false
                              ) {

                                if (utills.notEmpty(data.network)) {
                                  nonRegDoc.network = nonRegDoc.network.concat(
                                    data.network.toString().split(",")
                                  );
                                  nonRegDoc.network = nonRegDoc.network.filter(
                                    function (value, index, self) {
                                      return self.indexOf(value) == index;
                                    }
                                  );
                                }

                                if (utills.notEmpty(data.speciality)) {
                                  nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                    data.speciality.toString().split(",")
                                  );
                                  nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                    function (value, index, self) {
                                      return self.indexOf(value) == index;
                                    }
                                  );
                                }

                                // email should not save if email is blank in csv file
                                if (
                                  nonRegDoc.email == "" &&
                                  utills.notEmpty(data.email)
                                ) {
                                  delete nonRegDoc.email;
                                }

                                // firstname should not save if firstname is blank in csv file
                                if (
                                  nonRegDoc.firstname == "" &&
                                  utills.notEmpty(data.firstname)
                                ) {
                                  delete nonRegDoc.firstname;
                                }

                                // lastname should not save if lastname is blank in csv file
                                if (
                                  nonRegDoc.lastname == "" &&
                                  utills.notEmpty(data.lastname)
                                ) {
                                  delete nonRegDoc.lastname;
                                }

                                // fax should not save if fax is blank in csv file
                                if (
                                  nonRegDoc.fax == "" &&
                                  utills.notEmpty(data.fax)
                                ) {
                                  delete nonRegDoc.fax;
                                }

                                // phone_number should not save if phone_number is blank in csv file
                                if (
                                  nonRegDoc.phone_number == "" &&
                                  utills.notEmpty(data.phone_number)
                                ) {
                                  delete nonRegDoc.phone_number;
                                }

                                // cell_phone should not save if cell_phone is blank in csv file
                                if (
                                  nonRegDoc.cell_phone == "" &&
                                  utills.notEmpty(data.cell_phone)
                                ) {
                                  delete nonRegDoc.cell_phone;
                                }

                                // centername should not save if location is blank in csv file
                                if (
                                  nonRegDoc.location == "" &&
                                  utills.notEmpty(data.location)
                                ) {
                                  delete nonRegDoc.location;
                                }

                                // city should not save if city is blank in csv file
                                if (
                                  nonRegDoc.city == "" &&
                                  utills.notEmpty(data.city)
                                ) {
                                  delete nonRegDoc.city;
                                }

                                // state should not save if state is blank in csv file
                                if (
                                  nonRegDoc.state == "" &&
                                  utills.notEmpty(data.state)
                                ) {
                                  delete nonRegDoc.state;
                                }

                                // sute should not save if sute is blank in csv file
                                if (
                                  nonRegDoc.sute == "" &&
                                  utills.notEmpty(data.sute)
                                ) {
                                  delete nonRegDoc.sute;
                                }

                                // user_loc should not save if user_loc is blank in csv file
                                if (
                                  nonRegDoc.user_loc == "" &&
                                  utills.notEmpty(data.user_loc)
                                ) {
                                  delete nonRegDoc.user_loc;
                                }

                                // emailAvailable should not save if emailAvailable is blank in csv file
                                if (
                                  nonRegDoc.emailAvailable == "" &&
                                  utills.notEmpty(data.emailAvailable)
                                ) {
                                  delete nonRegDoc.emailAvailable;
                                }

                                // doctorsNPI should not save if doctorsNPI is blank in csv file
                                if (
                                  nonRegDoc.doctorsNPI == "" &&
                                  utills.notEmpty(data.doctorsNPI)
                                ) {
                                  delete nonRegDoc.doctorsNPI;
                                }
                                UserModel.update(
                                  { _id: data._id },
                                  nonRegDoc,
                                  function (err, data) { }
                                );
                              }
                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        }
      }).then(
        function (value) {
        },
        function (err) {
          console.error(err.stack);
        }
      );
    },
    function (err) {
      console.log(err);
      if (err) {
        var msg = "Data upload failed";
      } else {
        var msg = "Data uploaded successfully";
      }
      var send = new socketIO(socket, msg);
      send.broadcast(socket, msg);
    }
  );
}

/**
* Add non-reg doctor
* Created By Suman Chakraborty
* Last modified on 17-04-2018
*/
function addNonRegDoc(req, res) {
  //uploadBatch4(req.body); //for task #591 to update speciality
  uploadBatch5(req.body); //for task to update mis-spelled speciality only

  res.json({ code: 200, message: "Processing import data" });
}

function uploadBatch5(data) {
  async.eachSeries(
    data,
    function (item, callback) {
      co(function* () {
        var nonRegDoc = {};
        nonRegDoc.degree = "";

        if (item.hasOwnProperty("location") && item["location"]) {
          let locResData = {};

          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            speciality: item.speciality
          };
          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);
          } else {
            // start check user is already exist or not
            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }
            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {

                          if (totalCount == 0) {
                            // var UsersRecord = new UserModel(nonRegDoc);
                            // UsersRecord.save(function (err, data) { });

                            // &&  resp[0].isRegistered == false

                          } else if (
                            totalCount == 1

                          ) {

                            // concat speciality
                            if (utills.notEmpty(resp[0].speciality)) {
                              nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                resp[0].speciality.toString().split(",")
                              );

                              nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                function (value, index, self) {
                                  return self.indexOf(value) == index;
                                }
                              );
                            }

                            nonRegDoc.userId = resp[0]._id;
                            nonRegDoc._id = resp[0]._id;
                            UserModel.update(
                              { _id: resp[0]._id },
                              nonRegDoc,
                              function (err, data) { }
                            );
                          } else if (totalCount > 1) {
                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;
                              nonRegDoc._id = data._id;
                              if (utills.notEmpty(data.speciality)) {
                                nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                  data.speciality.toString().split(",")
                                );
                                nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                  function (value, index, self) {
                                    return self.indexOf(value) == index;
                                  }
                                );
                              }

                              UserModel.update(
                                { _id: data._id },
                                nonRegDoc,
                                function (err, data) { }
                              );
                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        } else {
          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            speciality: item.speciality,
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);
            delete item._id;
          } else {
            // start check user is already exist or not

            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }
            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {
                          if (totalCount == 0) {

                          } else if (
                            totalCount == 1
                          ) {
                            nonRegDoc.userId = resp[0]._id;
                            nonRegDoc._id = resp[0]._id;

                            // concat speciality
                            if (utills.notEmpty(resp[0].speciality)) {
                              nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                resp[0].speciality.toString().split(",")
                              );

                              nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                function (value, index, self) {
                                  return self.indexOf(value) == index;
                                }
                              );
                            }
                            UserModel.update(
                              { _id: resp[0]._id },
                              nonRegDoc,
                              function (err, data) { }
                            );
                          } else if (totalCount > 1) {


                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;
                              nonRegDoc._id = data._id;
                              if (utills.notEmpty(data.speciality)) {
                                nonRegDoc.speciality = nonRegDoc.speciality.concat(
                                  data.speciality.toString().split(",")
                                );
                                nonRegDoc.speciality = nonRegDoc.speciality.filter(
                                  function (value, index, self) {
                                    return self.indexOf(value) == index;
                                  }
                                );
                              }

                              UserModel.update(
                                { _id: data._id },
                                nonRegDoc,
                                function (err, data) { }
                              );

                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        }
      }).then(
        function (value) { },
        function (err) {
          console.error(err.stack);
        }
      );
    },
    function (err) {
      console.log(err);
      if (err) {
        var msg = "Data upload failed";
      } else {
        var msg = "Data uploaded successfully";
      }
      var send = new socketIO(socket, msg);
      send.broadcast(socket, msg);
    }
  );
}

function uploadBatch4(data) {
  async.eachSeries(
    data,
    function (item, callback) {
      co(function* () {
        var nonRegDoc = {};
        nonRegDoc.degree = "";

        if (item.hasOwnProperty("location") && item["location"]) {
          let locResData = {};

          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);

            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            // start check user is already exist or not
            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }

            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {
                          if (totalCount == 0) {
                            var UsersRecord = new UserModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { });
                          } else if (
                            totalCount == 1 &&
                            resp[0].isRegistered == false
                          ) {
                            nonRegDoc.userId = resp[0]._id;
                            nonRegDoc._id = resp[0]._id;
                            UserModel.update(
                              { _id: resp[0]._id },
                              nonRegDoc,
                              function (err, data) { }
                            );
                          } else if (totalCount > 1) {
                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;
                              nonRegDoc._id = data._id;
                              if (data.isRegistered == false) {
                                resp[0].network.forEach(function (item) {
                                  UserModel.update(
                                    { _id: data._id },
                                    nonRegDoc,
                                    function (err, data) { }
                                  );
                                });
                              }
                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        } else {
          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);
            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            // start check user is already exist or not

            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }

            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {
                          if (totalCount == 0) {
                            var UsersRecord = new UserModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { });
                          } else if (
                            totalCount == 1 &&
                            (resp[0].isRegistered == true ||
                              resp[0].isRegistered == false)
                          ) {
                            nonRegDoc.userId = resp[0]._id;
                            nonRegDoc._id = resp[0]._id;
                            UserModel.update(
                              { _id: resp[0]._id },
                              nonRegDoc,
                              function (err, data) { }
                            );
                          } else if (totalCount > 1) {
                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;
                              nonRegDoc._id = data._id;
                              if (
                                data.isRegistered == true ||
                                data.isRegistered == false
                              ) {
                                resp[0].network.forEach(function (item) {
                                  UserModel.update(
                                    { _id: data._id },
                                    nonRegDoc,
                                    function (err, data) { }
                                  );
                                });
                              }
                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        }
      }).then(
        function (value) { },
        function (err) {
          console.error(err.stack);
        }
      );
    },
    function (err) {
      if (err) {
        var msg = "Data upload failed";
      } else {
        var msg = "Data uploaded successfully";
      }
      var send = new socketIO(socket, msg);
      send.broadcast(socket, msg);
    }
  );
}

function uploadBatch2(data) {
  async.eachSeries(
    data,
    function (item, callback) {
      co(function* () {
        var nonRegDoc = {};
        nonRegDoc.degree = "";

        if (item.hasOwnProperty("location") && item["location"]) {

          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);

            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            // start check user is already exist or not

            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }

            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {
                          if (totalCount == 0) {
                            var UsersRecord = new UserModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { });
                          } else if (
                            totalCount == 1 &&
                            resp[0].isRegistered == true
                          ) {
                            nonRegDoc.userId = resp[0]._id;

                            var UsersRecord = new UserExistModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { });
                          } else if (totalCount > 1) {
                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;

                              if (data.isRegistered == true) {
                                var UsersRecord = new UserExistModel(nonRegDoc);
                                UsersRecord.save(function (err, data) { });
                              }
                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        } else {
          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);

            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            // start check user is already exist or not

            var searchText = true;

            var condition = {};
            if (searchText) {
              if (utills.notEmpty(item.email)) {
                var EmailLower = item.email.toLowerCase();
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { email: EmailLower }
                ];
              } else if (utills.notEmpty(item.fax)) {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { fax: item.fax }
                ];
              } else {
                condition.$and = [
                  { firstname: item.firstname },
                  { lastname: item.lastname },
                  { centername: item.centername }
                ];
              }
            }

            UserModel.find(condition)
              .lean()
              .exec(function (err, resp) {
                if (!err) {
                  if (resp) {
                    UserModel.find(condition)
                      .count()
                      .exec(function (err, totalCount) {
                        if (err) {
                          res.json({
                            code: 201,
                            message: "Internal Error"
                          });
                        } else {
                          if (totalCount == 0) {
                            var UsersRecord = new UserModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { });
                          } else if (
                            totalCount == 1 &&
                            resp[0].isRegistered == true
                          ) {
                            nonRegDoc.userId = resp[0]._id;

                            var UsersRecord = new UserExistModel(nonRegDoc);
                            UsersRecord.save(function (err, data) { });
                          } else if (totalCount > 1) {
                            resp.forEach(data => {
                              nonRegDoc.userId = data._id;

                              if (data.isRegistered == true) {
                                var UsersRecord = new UserExistModel(nonRegDoc);
                                UsersRecord.save(function (err, data) { });
                              }
                            });
                          } else {
                          }
                        }
                      });
                  } else {
                  }
                } else {
                }
              });
          }

          callback();
        }
      }).then(
        function (value) {
          //console.log(value);
        },
        function (err) {
          console.error(err.stack);
        }
      );
    },
    function (err) {
      if (err) {
        var msg = "Data upload failed";
      } else {
        var msg = "Data uploaded successfully";
      }
      var send = new socketIO(socket, msg);
      send.broadcast(socket, msg);
    }
  );
}

function uploadBatch(data) {
  async.eachSeries(
    data,
    function (item, callback) {
      co(function* () {
        var nonRegDoc = {};
        nonRegDoc.degree = "";

        if (item.hasOwnProperty("location") && item["location"]) {
          let locResData = {};
          locResData = yield utility.getLocationDetails(item.location);

          if (utills.notEmpty(locResData)) {
            var location = locResData.location
              ? locResData.location
              : item.location;
            var city = locResData.city ? locResData.city : item.city;
            var state = locResData.state ? locResData.state : item.state;
            var zipcode = locResData.zipcode
              ? locResData.zipcode
              : item.zipcode;
            var user_loc = locResData.user_loc
              ? locResData.user_loc.reverse()
              : [];
          } else {
            var location = item.location;
            var city = item.city;
            var state = item.state;
            var zipcode = item.zipcode;
            var user_loc = item.user_loc;
          }

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);
            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            var UsersRecord = new UserModel(nonRegDoc);
            UsersRecord.save(function (err, data) { });
          }
          callback();
        } else {
          var location = item.location;
          var city = item.city;
          var state = item.state;
          var zipcode = item.zipcode;
          var user_loc = item.user_loc;

          nonRegDoc = {
            doctorsNPI: item.doctorsNPI,
            firstname: item.firstname,
            lastname: item.lastname,
            centername: item.centername,
            email: item.email,
            phone_number: item.phone_number,
            fax: item.fax,
            cell_phone: item.cell_phone,
            location: location,
            city: city,
            state: state,
            sute: item.sute,
            zipcode: zipcode,
            network: item.network,
            speciality: item.speciality,
            user_loc: user_loc,
            emailAvailable: item.emailAvailable,
            isOutside: true
          };
          if (item.degree) nonRegDoc.degree = item.degree;

          if (item._id) {
            var userId = mongoose.Types.ObjectId(item._id);
            delete item._id;
            UserModel.update({ _id: userId }, nonRegDoc, function (
              err,
              data
            ) { });
          } else {
            var UsersRecord = new UserModel(nonRegDoc);
            UsersRecord.save(function (err, data) { });
          }
          callback();
        }
      }).then(
        function (value) {
          //console.log(value);
        },
        function (err) {
          console.error(err.stack);
        }
      );
    },
    function (err) {
      if (err) {
        var msg = "Data upload failed";
      } else {
        var msg = "Data uploaded successfully";
      }
      var send = new socketIO(socket, msg);
      send.broadcast(socket, msg);
    }
  );
}

function socketIO(getSocket, data) {
  socket = getSocket;
  this.data = data;
  this.broadcast = function (socket, data) {
    socket.emit("broadcast", data);
  };
}

/**
* Update non-reg doctor
* Created By Suman Chakraborty
* Last modified on 17-04-2018
*/
function updateNonRegDoc(req, res) {
  var userId = mongoose.Types.ObjectId(req.body._id);
  delete req.body._id;
  UserModel.update({ _id: userId }, req.body, function (err, data) {
    if (err) {
      res.json({ code: 201, message: "Data not Addded" });
    } else {
      res.json({ code: 200, message: "Data updated successfully." });
    }
  });
}

/**
* Get Non-reg doctor detail 
* Created By Suman Chakraborty
* Last Modified on 03-04-2018
*/
function getNonDocById(req, res) {
  UserModel.findOne(
    { _id: mongoose.Types.ObjectId(req.swagger.params.id.value) },
    function (err, resp) {
      if (err) {
        res.json({
          code: 201,
          message: "Request could not be processed. Please try again."
        });
      } else {
        res.json({
          code: 200,
          message: "User fetched successfully.",
          data: resp
        });
      }
    }
  );
}

/**
* Get all other providers ratings who have given ratings to any provider
* Created By suman
* Last Modified on 16-10-2018
*/
function getMyRatingList(req, res) {
  UserPreferenceRating.find({
    preferenceUserId: mongoose.Types.ObjectId(req.swagger.params.id.value)
  })
    .populate(
      "userId",
      "gender firstname lastname email phone_number centername"
    )
    .populate("preferenceUserId", "firstname lastname email")
    .populate("speciality")
    .exec(function (err, resp) {
      if (err) {
        res.json({
          code: 201,
          message: "Request could not be processed. Please try again."
        });
      } else {
        res.json({
          code: 200,
          message: "User fetched successfully.",
          data: resp
        });
      }
    });
}

/**
* Delete non-registered doctors
* Creted By Suman Chakraborty
* Last Modified on 19-04-2018
*/
function delDetails(req, res) {
  UserModel.remove(
    {
      _id: mongoose.Types.ObjectId(req.body._id)
    },
    function (err) {
      if (err) {
        res.json({
          code: 201,
          message: "Request could not be processed. Please try again."
        });
      } else {
        res.json({
          code: 200,
          message: "User removed successfully."
        });
      }
    }
  );
}

/**
* Add New Doctor
* Created By Suman Chakraborty
* Last Modified on 04-08-2017
*/
function addDoctorInNetwork(req, res) {
  var doctorInfo = new UserModel(req.body);
  doctorInfo.save(function (err, data) {
    if (err) {
      res.json({ code: 401, message: "Data not Addded" });
    } else {
      var obj = {
        firstname: data.firstname,
        lastname: data.lastname,
        centername: data.centername,
        email: req.body.email.toLowerCase(),
        password: utility.getEncryptText(req.body.password),
        verifying_token: verifingLink
      };

      var logdata = {
        addedby: req.user.email,
        addedto: data._id,
        addedDate: new Date(),
        activity_name: "Doctor added to network"
      };
      var log = new AuditModel(logdata);
      log.save();
      res.json({ code: 200, message: "Data Added", data: doctorInfo });
    }
  });
}

/**
* Update doctor status
* Created By Suman Chakrabort
* Last Modified on 05-08-2017
*/
function setStatus(req, res) {
  UserModel.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    { $set: { doctorStatus: req.body.doctorStatus } },
    function (err, data) {
      if (err) {
        res.json({ code: 401, message: "Error in updating status", data: {} });
      } else {
        res.json({
          code: 200,
          message: "Status has been updated successfully",
          data: data
        });
      }
    }
  );
}

/**
* Check status of doctor
* Created By Suman Chakraborty
* Last Modified on 26-04-2017
*/

function checkDoctorsStatus(req, res) {
  UserModel.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    { status: 0 },
    function (err, userInfo) {
      if (err) {
        res.json({
          code: 401,
          message: "Error in fetching details Check your status",
          data: null
        });
      } else {
        res.json({
          code: 200,
          message: "Information Retrieved successfully",
          data: userInfo
        });
      }
    }
  );
}

/* 
function:retrieves all doctors who's status is (available waiting or not available)
*/
function getAvailableDoctors(req, res) {
  UserModel.find(
    { status: req.query.status, userType: { $in: ["user"] } },
    function (err, data) {
      if (err) {
        res.json({
          code: 401,
          message: "Error in fetching details",
          data: null
        });
      } else {
        if (!data || data == null) {
          res.json({ code: 304, message: "Nothing to Show" });
        } else {
          res.json({
            code: 200,
            message: "Data has been Retrieved successfully",
            data: data
          });
        }
      }
    }
  );
}

function setAvailability(req, res) {
  UserModel.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(req.query.id) },
    { $set: { status: req.query.status } },
    function (err, data) {
      if (err) {
        res.json({ code: 401, message: "Something went wrong" });
      } else {
        res.json({ code: 200, message: "Status has been changed", data: data });
      }
    }
  );
}

function addSpeciality(req, res) {
  var speciality = new specialityModel(req.body);
  speciality.save(function (err) {
    UserModel.update(
      { _id: mongoose.Types.ObjectId(req.user.id) },
      { $push: { speciality: speciality } },
      function (err, data) {
        if (err) {
          res.json({ code: 401, message: "Something went wrong" });
        } else {
          res.json({
            code: 200,
            message: "Speciality has been assinged",
            data: data
          });
        }
      }
    );
  });
}

/* 
 * Get doctors by insurance, specialty, service
 * Created By Suman Chakraborty
 * Last Modified on 30-03-2018
 */
function getdoctors(req, res) {
  var cond = {};
  var cond2 = { isImported: false }; // for non registered doctor list
  var reqParam;
  var count = parseInt(req.body.count ? req.body.count : 0);
  var skip = parseInt(req.body.count * (req.body.page - 1));

  var sorting = utility.getSortObj(req.body);

  var searchText = req.body.search
    ? req.body.search.firstName ? req.body.search.firstName.toLowerCase() : ""
    : "";
  if (searchText !== "") {
    cond = {
      $or: [
        { firstname: { $regex: searchText, $options: "i" } },
        { lastname: { $regex: searchText, $options: "i" } },
        { centername: { $regex: searchText, $options: "i" } }
      ]
    };
    cond2 = {
      $or: [
        { firstname: { $regex: searchText, $options: "i" } },
        { lastname: { $regex: searchText, $options: "i" } },
        { centername: { $regex: searchText, $options: "i" } }
      ]
    };
  }
  cond2.isImported = false;

  if (req.body.speciality) {
    var spec = {
      $in: req.body.speciality.map(function (o) {
        return mongoose.Types.ObjectId(o);
      })
    };
    reqParam = {
      speciality: {
        $in: req.body.speciality.map(function (o) {
          return mongoose.Types.ObjectId(o);
        })
      },
      deleted: false,
      status: 1,
      $and: [cond],
      userType: { $in: ["user"] },
      _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
    };
    // If network is given and it is not self pay (self pay insturanve id is 1 and 2 is not listed insurance) then only insurance will come in condition
    if (req.body.network && [1, 2].indexOf(req.body.network) == -1) {
      reqParam.network = { $in: [mongoose.Types.ObjectId(req.body.network)] };
    }

    if (req.body.state) {
      reqParam.state = req.body.state;
    } else {
    }

    if (req.body.searchRegistered == 1) {
      reqParam.isRegistered = true;
    } else {
    }

    // Take service in count if selected
    if (req.body.services && req.body.services !== 1) {
      // When service and specialty both are selected then provider having specilty or service should come in result
      delete reqParam.speciality;
      var serv = {
        $in: req.body.services.map(function (o) {
          return mongoose.Types.ObjectId(o);
        })
      };
      reqParam.speciality = spec;
      reqParam.service = serv;
    }
  } else {
    reqParam = {
      deleted: false,
      status: 1,
      $and: [cond],
      userType: { $in: ["user"] },
      _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
    };
    if (req.body.state) {
      reqParam.state = req.body.state;
    } else {
    }
    if (req.body.searchRegistered == 1) {
      reqParam.isRegistered = true;
    } else {
    }
  }
  // if this is a request from the front desk admin then fetch only the list of the doctors who has allowed access to this user
  if (req.body.frontDeskReq && !req.body.getAll) {
    reqParam.frontdesk = {
      $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.userId) }
    };
  }
  if (req.body.getOutsideDocs) {
    if (req.body.state) {
      reqParam.state = req.body.state;
    } else {
      reqParam;
    }
    if (req.body.searchRegistered == 1) {
      reqParam.isRegistered = true;
    } else {
      reqParam.isRegistered = false;
    }

    UserModel.find(reqParam, { password: 0 })
      .sort(sorting)
      .skip(parseInt(skip))
      .limit(parseInt(count))
      .lean()
      .exec(function (err, userInfo) {
        if (err) {
          res.json({
            code: 401,
            message: "Request could not be processed. Please try again.",
            err: err
          });
        } else {
          UserModel.find(reqParam, { password: 0 })
            .count()
            .lean()
            .exec(function (err, totalCount) {
              if (err) {
                res.json({
                  code: 401,
                  message: "Request could not be processed. Please try again.",
                  err: err
                });
              } else {
                reqParam.isRegistered = false;
                UserModel.find(reqParam, { password: 0 })
                  .sort(sorting)
                  .skip(parseInt(skip))
                  .limit(parseInt(count))
                  .lean()
                  .exec(function (er, unregUserInfo) {
                    if (!er) {
                      UserModel.find(reqParam, { password: 0 })
                        .count()
                        .exec(function (er, unregUsertotalCount) {
                          if (!er) {
                            res.json({
                              code: 200,
                              message: "success",
                              data: userInfo,
                              outside: unregUserInfo,
                              totalCount: totalCount,
                              unregUsertotalCount: unregUsertotalCount
                            });
                          }
                        });
                    }
                  });
              }
            });
        }
      });
  } else {
    if (req.body.userLoc && req.body.range) {

      if (req.body.searchRegistered == 1) {
        reqParam.isRegistered = true;
      } else {
      }

      var calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers

      UserModel.find(reqParam, { password: 0 })
        .where("user_loc")
        .nearSphere({
          center: req.body.userLoc,
          maxDistance: calculatedMaxDistance
        })
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean()
        .exec(function (err, userInfo) {
          if (err) {
            res.json({
              code: 401,
              message: "Request could not be processed. Please try again.",
              err: err
            });
          } else {
            UserModel.find(reqParam, { password: 0 })
              .where("user_loc")
              .nearSphere({
                center: req.body.userLoc,
                maxDistance: calculatedMaxDistance
              })
              .count()
              .lean()
              .exec(function (err, totalCount) {
                if (err) {
                  res.json({
                    code: 401,
                    message:
                      "Request could not be processed. Please try again.",
                    err: err
                  });
                } else {
                  res.json({
                    code: 200,
                    message: "success",
                    data: userInfo,
                    totalCount: totalCount
                  });
                }
              });
          }
        });
    } else {
      if (req.body.searchRegistered == 1) {
        reqParam.isRegistered = true;
      } else {
      }

      UserModel.find(reqParam, { password: 0 })
        .where("user_loc")
        .nearSphere({ center: req.body.userLoc })
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean()
        .exec(function (err, userInfo) {
          if (err) {
            res.json({
              code: 401,
              message: "Request could not be processed. Please try again.",
              err: err
            });
          } else {
            UserModel.find(reqParam, { password: 0 })
              .where("user_loc")
              .nearSphere({ center: req.body.userLoc })
              .count()
              .lean()
              .exec(function (err, totalCount) {
                if (err) {
                  res.json({
                    code: 401,
                    message:
                      "Request could not be processed. Please try again.",
                    err: err
                  });
                } else {
                  res.json({
                    code: 200,
                    message: "success",
                    data: userInfo,
                    totalCount: totalCount
                  });
                }
              });
          }
        });
    }
  }
}

/* 
 * Get doctors by insurance, specialty, service
 * Created By Suman Chakraborty
 * Last Modified on 30-03-2018
 */


// function getdoctorsreg(req, res) {
//   co(function* () {
//   var cond = {};
//   var reqParam;
//   // Created by Saurabh 
//   var finalCondition = {} ; // 8 May 2019
//   var count = parseInt(req.body.count ? req.body.count : 0);
//   var skip = parseInt(req.body.count * (req.body.page - 1));

//   var sorting = req.body.sorting
//     ? req.body.sorting
//     : { doctorStatus: 1, lastname: 1, firstname: 1, centername: 1 };//{ "dist.calculated" : 1};

//   var searchText = req.body.search
//     ? req.body.search.firstName ? req.body.search.firstName.toLowerCase() : ""
//     : "";
//   if (searchText !== "") {
//     cond = {
//       $or: [
//         { firstname: { $regex: searchText, $options: "i" } },
//         { lastname: { $regex: searchText, $options: "i" } },
//         { centername: { $regex: searchText, $options: "i" } }
//       ]
//     };
//   }

//   let condition = {
//     deleted: false,
//     status: '1',
//     userType: "user",
//     _id : {$ne : mongoose.Types.ObjectId(req.body.userId)}
//   };

//   if (req.body.speciality) {

//     condition.speciality = {
//       $in: req.body.speciality.map(function (item) {
//         return mongoose.Types.ObjectId(item)
//       })
//     }

//     //Created by Saurabh - 8-May-2019
//     if (req.body.state) {
//       condition.state = req.body.state;
//     } else {
//     }

//     if (req.body.searchRegistered == 1) {
//       condition.isRegistered = true;
//     } else {
//     }

//     if (req.body.searchRegisteredRef == 1) {
//       condition.isRegistered = true;
//     } else {
//     }

//      //Created by Saurabh - 8-May-2019
//     if (req.body.services && req.body.services !== 1) {
//       // When service and specialty both are selected then provider having specilty or service should come in result
//       delete condition.speciality;
//       var serv = {
//         $in: req.body.services.map(function (o) {
//           return mongoose.Types.ObjectId(o);
//         })
//       };
//       condition.speciality = spec;
//       condition.service = serv;
//     }

//     if(req.body.zipcode){
//       // co(function* () {
//        yield  UserModel.findOne({zipcode : String(req.body.zipcode)})
//         .exec(function (err, data) {
//           if (err) {
//             res.json({ code: 401, message: "Error in updating", data: {} });
//           } else {
//             if(data){
//               console.log("\n\n req.body.userLoc",req.body.userLoc); 
//               req.body.userLoc = []
//               req.body.userLoc = data.user_loc
//               console.log("\n\n New zipcode user data 2",req.body.userLoc);
//             }
//             else{
//               console.log("\n\n else part getDocReg 1")
//               req.body.userLoc = []
//               condition.zipcode = req.body.zipcode
//             }
//           }
//         })
//       // })   

//     }

//     finalCondition = condition
//   }
//   else {
//     reqParam = {
//       deleted: false,
//       status: '1',
//       $and: [cond],
//       userType: { $in: ["user"] },
//       _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
//     };
//     if (req.body.state) {
//       reqParam.state = req.body.state;
//     } else {
//     }
//     if (req.body.searchRegistered == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }
//     if (req.body.searchRegisteredRef == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }

//     if(req.body.zipcode){
//       // co(function* () {
//        yield UserModel.findOne({zipcode : String(req.body.zipcode) , state : req.body.state})
//         .exec(function (err, data) {
//           if (err) {
//             res.json({ code: 401, message: "Error in updating", data: {} });
//           } else {
//             if(data){
//               console.log("\n\n req.body.userLoc",req.body.userLoc); 
//               req.body.userLoc = []
//               req.body.userLoc = data.user_loc
//               console.log("\n\n New zipcode user data 2",data.user_loc);
//             }
//             else{
//               console.log("\n\n else part getDocReg 2")
//               req.body.userLoc = []
//               reqParam.zipcode = req.body.zipcode
//             }
//           }
//         })
//       // })

//     }

//     //Created by Saurabh - 8-May-2019
//     finalCondition = reqParam
//   }


//   if (req.body.network != 1) {
//     // let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
//     let calculatedMaxDistance = req.body.range* 1300//1500//1609.34 // 1.60934;
//     let aggregate = [
//       // {
//       //   $geoNear: {
//       //       near: { type: "Point",coordinates: [req.body.userLoc[0],req.body.userLoc[1]]},
//       //       key: "user_loc",
//       //       distanceField: "dist.calculated",
//       //       spherical: true,
//       //     }
//       // },
//      {
//         $geoNear: {
//         near: {
//         type: "Point",
//         coordinates: [parseFloat(req.body.userLoc[0]),parseFloat(req.body.userLoc[1])]
//         // coordinates: [79.0136364, 21.040194]

//         },
//         distanceField: "dist.calculated",
//         maxDistance: calculatedMaxDistance, // miles to meter
//         // distanceMultiplier: 0.000621371, // meter to miles 1m = 0.000621371 miles
//         includeLocs: "dist.location",
//         //	num: 18,
//         spherical: true
//         } 
//       },
//       {
//         $lookup: {
//           from: 'usernetworks',
//           localField: "_id",
//           foreignField: "userId",
//           as: "userNetworkInfo"
//         },
//       },
//       {
//         $unwind: {
//           path: "$userNetworkInfo",
//           preserveNullAndEmptyArrays: true // optional
//         }
//       },
//       {
//         $match :{
//                 "userNetworkInfo.status":"0",
//                 "userNetworkInfo.network":mongoose.Types.ObjectId(req.body.network),
//         }

//       },
//       {
//         $match: finalCondition //condition 
//       },
//       {
//         $sort: sorting
//       }

//     ]

//     if(!req.body.userLoc.length){
//       aggregate.splice(0,1);
//     }

//     let aggregateCnt = [].concat(aggregate);
//     if (req.body.count && req.body.page) {
//       aggregate.push({
//         $sort: sorting
//       });
//       aggregate.push({
//         $skip: skip
//       });
//       aggregate.push({
//         $limit: count
//       });
//     }
//     UserModel.aggregate(aggregate).exec(function (err, userData) {
//       if (err) {

//         res.json({
//           code: 201,
//           message: 'internal error.',
//           data: {}
//         });
//       } else if (userData) {       
//           res.json({
//             code: 200,
//             message: "success",
//             data: userData,
//           });

//       }
//     })
//   } 
//   else{   // Created by Saurabh - 8-May-2019  (for listing registered providers for self-pay insurance network (refer a patient component))

//     // let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
//     let calculatedMaxDistance = req.body.range* 1300//1500//1609.34;// 1.60934;
//     let aggregate = [
//       {
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates: [parseFloat(req.body.userLoc[0]),parseFloat(req.body.userLoc[1])]
//             // coordinates: [79.0136364, 21.040194]

//           },
//           distanceField: "dist.calculated",
//           maxDistance: calculatedMaxDistance, // miles to meter
//           // distanceMultiplier: 0.000621371, // meter to miles 1m = 0.000621371 miles
//           includeLocs: "dist.location",
//           //	num: 18,
//           spherical: true
//         }
//       },
//       {
//         $match: finalCondition //condition 
//       },
//       {
//         $sort: sorting
//       }

//     ]
//     console.log("\nreq.body.user_loc.length",req.body.userLoc.length,"boolean",!req.body.userLoc.length);
//     if(!req.body.userLoc.length){
//       aggregate.splice(0,1);
//     }
//     let aggregateCnt = [].concat(aggregate);
//     if (req.body.count && req.body.page) {
//       aggregate.push({
//         $sort: sorting
//       });
//       aggregate.push({
//         $skip: skip
//       });
//       aggregate.push({
//         $limit: count
//       });
//     }
// console.log('\n\n\n\naggregate',JSON.stringify(aggregate),"\n\n\n");

// UserModel.aggregate(aggregate).exec(function (err, userData) {
//       if (err) {

//         res.json({
//           code: 201,
//           message: 'internal error.',
//           data: {}
//         });
//       } else if (userData) {

//           res.json({
//             code: 200,
//             message: "success",
//             data: userData,
//           });

//       }
//     })
//   } 
// })
// }

// function getdoctorsreg(req, res) {
//   //console.log(" getdoctorsreg ", req.body);
//   var cond = {};
//   // var cond2 = { isImported: false }; // for non registered doctor list
//   var reqParam;
//   var count = parseInt(req.body.count ? req.body.count : 0);
//   var skip = parseInt(req.body.count * (req.body.page - 1));

//   // var sorting = utility.getSortObj(req.body);
//   var sorting = req.body.sorting
//     ? req.body.sorting
//     : { doctorStatus: 1, lastname: 1, firstname: 1, centername: 1 };

//   var searchText = req.body.search
//     ? req.body.search.firstName ? req.body.search.firstName.toLowerCase() : ""
//     : "";
//   if (searchText !== "") {
//     cond = {
//       $or: [
//         { firstname: { $regex: searchText, $options: "i" } },
//         { lastname: { $regex: searchText, $options: "i" } },
//         { centername: { $regex: searchText, $options: "i" } }
//       ]
//     };
//     //cond2 = { '$or': [{ 'firstname': { "$regex": searchText, "$options": "i" } }, { 'lastname': { "$regex": searchText, "$options": "i" } }, { 'centername': { "$regex": searchText, "$options": "i" } }] };
//   }

//   if (req.body.speciality) {
//     var spec = {
//       $in: req.body.speciality.map(function (o) {
//         return mongoose.Types.ObjectId(o);
//       })
//     };
//     reqParam = {
//       speciality: {
//         $in: req.body.speciality.map(function (o) {
//           return mongoose.Types.ObjectId(o);
//         })
//       },
//       deleted: false,
//       // isRegistered: true,
//       status: 1,
//       $and: [cond],
//       userType: { $in: ["user"] },
//       _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
//     };
//     // If network is given and it is not self pay (self pay insturanve id is 1 and 2 is not listed insurance) then only insurance will come in condition
//     if (req.body.network && [1, 2].indexOf(req.body.network) == -1) {
//       reqParam.network = { $in: [mongoose.Types.ObjectId(req.body.network)] };
//     }

//     if (req.body.state) {
//       reqParam.state = req.body.state;
//     } else {
//     }

//     if (req.body.searchRegistered == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }

//     if (req.body.searchRegisteredRef == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }

//     // Take service in count if selected
//     if (req.body.services && req.body.services !== 1) {
//       // When service and specialty both are selected then provider having specilty or service should come in result
//       delete reqParam.speciality;
//       var serv = {
//         $in: req.body.services.map(function (o) {
//           return mongoose.Types.ObjectId(o);
//         })
//       };
//       reqParam.speciality = spec;
//       reqParam.service = serv;
//     }
//   } else {
//     reqParam = {
//       deleted: false,
//       // isRegistered: true,
//       status: 1,
//       $and: [cond],
//       userType: { $in: ["user"] },
//       _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
//     };
//     if (req.body.state) {
//       reqParam.state = req.body.state;
//     } else {
//     }
//     if (req.body.searchRegistered == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }
//     if (req.body.searchRegisteredRef == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }
//   }
//   // if this is a request from the front desk admin then fetch only the list of the doctors who has allowed access to this user
//   if (req.body.frontDeskReq && !req.body.getAll) {
//     reqParam.frontdesk = {
//       $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.userId) }
//     };
//   }
//   if (req.body.getOutsideDocs) {
//     if (req.body.state) {
//       reqParam.state = req.body.state;
//     } else {
//       userInfo;
//       reqParam;
//     }
//     if (req.body.searchRegistered == 1) {
//       reqParam.isRegistered = true;
//     } else {
//       reqParam.isRegistered = false;
//     }
//     if (req.body.searchRegisteredRef == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }

//     //console.log(" reqParam1 ", reqParam);
//     UserModel.find(reqParam, { password: 0 })
//       .sort(sorting)
//       .skip(parseInt(skip))
//       .limit(parseInt(count))
//       .exec(function (err, userInfo) {
//         if (err) {
//           res.json({
//             code: 401,
//             message: "Request could not be processed. Please try again.",
//             err: err
//           });
//         } else {
//           UserModel.find(reqParam, { password: 0 })
//             .count()
//             .exec(function (err, totalCount) {
//               if (err) {
//                 res.json({
//                   code: 401,
//                   message: "Request could not be processed. Please try again.",
//                   err: err
//                 });
//               } else {
//                 UserModel.find(reqParam, { password: 0 })
//                   .sort(sorting)
//                   .skip(parseInt(skip))
//                   .limit(parseInt(count))
//                   .exec(function (er, unregUserInfo) {
//                     if (!er) {
//                       UserModel.find(reqParam, { password: 0 })
//                         .count()
//                         .exec(function (er, unregUsertotalCount) {
//                           if (!er) {
//                             res.json({
//                               code: 200,
//                               message: "success",
//                               data: userInfo,
//                               outside: unregUserInfo,
//                               totalCount: totalCount,
//                               unregUsertotalCount: unregUsertotalCount
//                             });
//                           }
//                         });
//                     }
//                   });
//               }
//             });
//         }
//       });
//   } else {
//     // console.log(" reqParam2 ", reqParam);
//     if (req.body.userLoc && req.body.range) {
//       // console.log(" userloc ", req.body);

//       if (req.body.searchRegistered == 1) {
//         reqParam.isRegistered = true;
//       } else {
//       }
//       if (req.body.searchRegisteredRef == 1) {
//         reqParam.isRegistered = true;
//       } else {
//       }

//       var calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
//       // console.log(" reqParam3 ", reqParam);
//       UserModel.find(reqParam, { password: 0 })
//         .where("user_loc")
//         .nearSphere({
//           center: req.body.userLoc,
//           maxDistance: calculatedMaxDistance
//         })
//         .skip(parseInt(skip))
//         .limit(parseInt(count))
//         .exec(function (err, userInfo) {
//           //  console.log(" userInfo ",userInfo);

//           if (err) {
//             res.json({
//               code: 401,
//               message: "Request could not be processed. Please try again.",
//               err: err
//             });
//           } else {
//             //console.log(" reqParam4 ", reqParam);
//             UserModel.find(reqParam, { password: 0 })
//               .where("user_loc")
//               .nearSphere({
//                 center: req.body.userLoc,
//                 maxDistance: calculatedMaxDistance
//               })
//               .count()
//               .exec(function (err, totalCount) {
//                 if (err) {
//                   res.json({
//                     code: 401,
//                     message:
//                     "Request could not be processed. Please try again.",
//                     err: err
//                   });
//                 } else {
//                   res.json({
//                     code: 200,
//                     message: "success",
//                     data: userInfo,
//                     totalCount: totalCount
//                   });
//                 }
//               });
//           }
//         });
//     } else {
//       //console.log(" range ", req.body.range);
//       if (req.body.range > 0) {
//         if (req.body.searchRegistered == 1) {
//           reqParam.isRegistered = true;
//         } else {
//         }
//         if (req.body.searchRegisteredRef == 1) {
//           reqParam.isRegistered = true;
//         } else {
//         }

//         //console.log(" reqParam5 ", reqParam);
//         UserModel.find(reqParam, { password: 0 })
//           .where("user_loc")
//           .nearSphere({ center: req.body.userLoc })
//           .skip(parseInt(skip))
//           .limit(parseInt(count))
//           .exec(function (err, userInfo) {
//             //console.log(" userInfo ",userInfo);
//             if (err) {
//               res.json({
//                 code: 401,
//                 message: "Request could not be processed. Please try again.",
//                 err: err
//               });
//             } else {
//               //console.log(" reqParam6 ", reqParam);
//               UserModel.find(reqParam, { password: 0 })
//                 .where("user_loc")
//                 .nearSphere({ center: req.body.userLoc })
//                 .count()
//                 .exec(function (err, totalCount) {
//                   if (err) {
//                     res.json({
//                       code: 401,
//                       message:
//                       "Request could not be processed. Please try again.",
//                       err: err
//                     });
//                   } else {
//                     res.json({
//                       code: 200,
//                       message: "success",
//                       data: userInfo,
//                       totalCount: totalCount
//                     });
//                   }
//                 });
//             }
//           });
//       } else {
//         var userInfo = {};
//         var totalCount = 0;
//         res.json({
//           code: 200,
//           message: "success",
//           data: userInfo,
//           totalCount: totalCount
//         });
//       }
//     }
//   }
// }


// ==============================================================================
// working code July 3 2019
// function getdoctorsreg(req, res) {
//   co(function* () {
//   var cond = {};
//   var reqParam;
//   // Created by Saurabh 
//   var finalCondition = {} ; // 8 May 2019
//   var count = parseInt(req.body.count ? req.body.count : 0);
//   var skip = parseInt(req.body.count * (req.body.page - 1));

//   var sorting = req.body.sorting
//     ? req.body.sorting
//     : {"dist.calculated" : 1}//{ lastname: 1, firstname: 1, centername: 1 }// doctorStatus: 1, { "dist.calculated" : 1};

//   var searchText = req.body.search
//     ? req.body.search.firstName ? req.body.search.firstName.toLowerCase() : ""
//     : "";
//   if (searchText !== "") {
//     cond = {
//       $or: [
//         { firstname: { $regex: searchText, $options: "i" } },
//         { lastname: { $regex: searchText, $options: "i" } },
//         { centername: { $regex: searchText, $options: "i" } }
//       ]
//     };
//   }

//   let condition = {
//     deleted: false,
//     status: '1',
//     userType: "user",
//     _id : {$ne : mongoose.Types.ObjectId(req.body.userId)}
//   };

//   if (req.body.speciality) {
//     condition.speciality = {
//       $in: req.body.speciality.map(function (item) {
//         return mongoose.Types.ObjectId(item)
//       })
//     }

//     //Created by Saurabh - 8-May-2019
//     if (req.body.state) {
//       condition.state = req.body.state;
//     } else {
//     }

//     if (req.body.searchRegistered == 1) {
//       condition.isRegistered = true;
//     } else {
//     }

//     if (req.body.searchRegisteredRef == 1) {
//       condition.isRegistered = true;
//     } else {
//     }

//      //Created by Saurabh - 8-May-2019
//     if (req.body.services && req.body.services !== 1) {
//       // When service and specialty both are selected then provider having specilty or service should come in result
//       delete condition.speciality;
//       var serv = {
//         $in: req.body.services.map(function (o) {
//           return mongoose.Types.ObjectId(o);
//         })
//       };
//       condition.speciality = spec;
//       condition.service = serv;
//     }

//     // if(req.body.zipcode){
//     //   // co(function* () {
//     //    yield  UserModel.findOne({
//     //      zipcode : String(req.body.zipcode) , 
//     //      state : req.body.state,
//     //      deleted: false,
//     //      status: '1',
//     //      userType: "user",
//     //      isRegistered : true})
//     //     .exec(function (err, data) {
//     //       if (err) {
//     //         res.json({ code: 401, message: "Error in updating", data: {} });
//     //       } else {
//     //         if(data){
//     //           console.log("\n\n req.body.userLoc",req.body.userLoc); 
//     //           req.body.userLoc = []
//     //           req.body.userLoc = data.user_loc
//     //           console.log("\n\n New zipcode user data 2",data.user_loc);
//     //         }
//     //         else{
//     //           console.log("\n\n else part getDocReg 1")
//     //           req.body.userLoc = []
//     //           condition.zipcode = req.body.zipcode
//     //         }
//     //       }
//     //     })
//     //   // })   

//     // }
//     // else{
//     //   console.log("\nelse of zipcode 111111111111111");
//     //   yield UserModel.findOne({
//     //     deleted: false,
//     //     _id : mongoose.Types.ObjectId(req.body.userId)
//     //   })
//     //    .exec(function (err, data) {
//     //     console.log("\ndata",data);
//     //     if(err){
//     //       console.log("\nErrror",err);
//     //     }
//     //     else{
//     //       if(data){
//     //         condition.zipcode = data.zipcode;
//     //         req.body.userLoc = []
//     //       }
//     //     }
//     //    })
//     // }

//     finalCondition = condition
//   }
//   else {
//     reqParam = {
//       deleted: false,
//       status: '1',
//       $and: [cond],
//       userType: { $in: ["user"] },
//       _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
//     };
//     if (req.body.state) {
//       reqParam.state = req.body.state;
//     } else {
//     }
//     if (req.body.searchRegistered == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }
//     if (req.body.searchRegisteredRef == 1) {
//       reqParam.isRegistered = true;
//     } else {
//     }

//     // if(req.body.zipcode){
//     //   // co(function* () {
//     //    yield UserModel.findOne({
//     //     //  zipcode : String(req.body.zipcode) ,
//     //     //   state : req.body.state,
//     //     zipcode : String(req.body.zipcode) , 
//     //      state : req.body.state,
//     //      deleted: false,
//     //      status: '1',
//     //      userType: "user",
//     //      isRegistered : true
//     //     })
//     //     .exec(function (err, data) {
//     //       if (err) {
//     //         res.json({ code: 401, message: "Error in updating", data: {} });
//     //       } else {
//     //         if(data){
//     //           console.log("\n\n req.body.userLoc",req.body.userLoc); 
//     //           req.body.userLoc = []
//     //           req.body.userLoc = data.user_loc
//     //           console.log("\n\n New zipcode user data 2",data.user_loc);
//     //         }
//     //         else{
//     //           console.log("\n\n else part getDocReg 2")
//     //           reqParam.zipcode = req.body.zipcode
//     //           req.body.userLoc = []
//     //         }
//     //       }
//     //     })
//     //   // })

//     // }
//     // else{
//     //   console.log("\nelse of zipcode 222222222222222");
//     //   UserModel.findOne({
//     //     deleted: false,
//     //     _id : mongoose.Types.ObjectId(req.body.userId)
//     //   }).exec(function (err, data) {
//     //     if(err){
//     //       console.log("\nErrror",err);
//     //     }
//     //     else{
//     //       console.log("\ndata",data);
//     //       if(data){
//     //         reqParam.zipcode = data.zipcode;
//     //       }
//     //     }
//     //    })
//     // }

//     //Created by Saurabh - 8-May-2019
//     finalCondition = reqParam
//   }


//   if (req.body.network != 1) {
//     // let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
//     let calculatedMaxDistance = req.body.range* 1300//1500//1609.34 // 1.60934;
//     let aggregate = [
//       // {
//       //   $geoNear: {
//       //       near: { type: "Point",coordinates: [req.body.userLoc[0],req.body.userLoc[1]]},
//       //       key: "user_loc",
//       //       distanceField: "dist.calculated",
//       //       spherical: true,
//       //     }
//       // },
//      {
//         $geoNear: {
//         near: {
//         type: "Point",
//         coordinates: [req.body.userLoc[0],req.body.userLoc[1]]
//         // coordinates: [79.0136364, 21.040194]

//         },
//         distanceField: "dist.calculated",
//         maxDistance: calculatedMaxDistance, // miles to meter
//         // distanceMultiplier: 0.000621371, // meter to miles 1m = 0.000621371 miles
//         includeLocs: "dist.location",
//         //	num: 18,
//         spherical: true
//         } 
//       },
//       {
//         $lookup: {
//           from: 'usernetworks',
//           localField: "_id",
//           foreignField: "userId",
//           as: "userNetworkInfo"
//         },
//       },
//       {
//         $unwind: {
//           path: "$userNetworkInfo",
//           preserveNullAndEmptyArrays: true // optional
//         }
//       },
//       {
//         $match :{
//                 "userNetworkInfo.status":"0",
//                 "userNetworkInfo.network":mongoose.Types.ObjectId(req.body.network),
//         }

//       },
//       {
//         $match: finalCondition //condition 
//       },
//       {
//         $sort: sorting
//       }

//     ]

//     if(!req.body.userLoc.length){
//       aggregate.splice(0,1);
//     }

//     let aggregateCnt = [].concat(aggregate);
//     if (req.body.count && req.body.page) {
//       aggregate.push({
//         $sort: sorting
//       });
//       aggregate.push({
//         $skip: skip
//       });
//       aggregate.push({
//         $limit: count
//       });
//     }
//     console.log("\nAggregate ",JSON.stringify(aggregate));
//     UserModel.aggregate(aggregate).exec(function (err, userData) {
//       if (err) {

//         res.json({
//           code: 201,
//           message: 'internal error.',
//           data: {}
//         });
//       } else if (userData) {       
//           res.json({
//             code: 200,
//             message: "success",
//             data: userData,
//           });

//       }
//     })
//   } 
//   else{   // Created by Saurabh - 8-May-2019  (for listing registered providers for self-pay insurance network (refer a patient component))

//     // let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
//     let calculatedMaxDistance = req.body.range* 1300//1500//1609.34;// 1.60934;
//     let aggregate = [
//       {
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates: [req.body.userLoc[0],req.body.userLoc[1]]
//             // coordinates: [79.0136364, 21.040194]

//           },
//           distanceField: "dist.calculated",
//           maxDistance: calculatedMaxDistance, // miles to meter
//           // distanceMultiplier: 0.000621371, // meter to miles 1m = 0.000621371 miles
//           includeLocs: "dist.location",
//           //	num: 18,
//           spherical: true
//         }
//       },
//       {
//         $match: finalCondition //condition 
//       },
//       {
//         $sort: sorting
//       }

//     ]
//     console.log("\nreq.body.user_loc.length",req.body.userLoc.length,"boolean",!req.body.userLoc.length);
//     if(!req.body.userLoc.length){
//       aggregate.splice(0,1);
//     }
//     let aggregateCnt = [].concat(aggregate);
//     if (req.body.count && req.body.page) {
//       aggregate.push({
//         $sort: sorting
//       });
//       aggregate.push({
//         $skip: skip
//       });
//       aggregate.push({
//         $limit: count
//       });
//     }
// console.log('\n\n\n\naggregate',JSON.stringify(aggregate),"\n\n\n");

// UserModel.aggregate(aggregate).exec(function (err, userData) {
//       if (err) {

//         res.json({
//           code: 201,
//           message: 'internal error.',
//           data: {}
//         });
//       } else if (userData) {

//           res.json({
//             code: 200,
//             message: "success",
//             data: userData,
//           });

//       }
//     })
//   } 
// })
// }


// Convert whole aggregation function into find query
function getdoctorsreg(req, res) {
  co(function* () {
    try {

      var cond = {};
      var reqParam;
      // Created by Saurabh 
      var finalCondition = {}; // 8 May 2019
      var count = parseInt(req.body.count ? req.body.count : 0);
      var skip = parseInt(req.body.count * (req.body.page - 1));

      var sorting = req.body.sorting
        ? req.body.sorting
        : { "dist.calculated": 1 }//{ lastname: 1, firstname: 1, centername: 1 }// doctorStatus: 1, { "dist.calculated" : 1};

      var searchText = req.body.search
        ? req.body.search.firstName ? req.body.search.firstName.toLowerCase() : ""
        : "";
      if (searchText !== "") {
        cond = {
          $or: [
            { firstname: { $regex: searchText, $options: "i" } },
            { lastname: { $regex: searchText, $options: "i" } },
            { centername: { $regex: searchText, $options: "i" } }
          ]
        };
      }

      let condition = {
        deleted: false,
        status: '1',
        userType: "user",
        _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
      };

      if (req.body.speciality) {
        condition.speciality = {
          $in: req.body.speciality
          // .map(function (item) {
          //   return mongoose.Types.ObjectId(item)
          // })
        }

        //Created by Saurabh - 8-May-2019
        if (req.body.state) {
          condition.state = req.body.state;
        } else {
        }

        if (req.body.searchRegistered == 1) {
          condition.isRegistered = true;
        } else {
        }

        if (req.body.searchRegisteredRef == 1) {
          condition.isRegistered = true;
        } else {
        }

        //Created by Saurabh - 8-May-2019
        if (req.body.services && req.body.services !== 1) {
          // When service and specialty both are selected then provider having specilty or service should come in result
          delete condition.speciality;
          var serv = {
            $in: req.body.services.map(function (o) {
              return mongoose.Types.ObjectId(o);
            })
          };
          condition.speciality = spec;
          condition.service = serv;
        }

        if (req.body.zipcode) {
          // co(function* () {
          yield UserModel.findOne({
            zipcode: String(req.body.zipcode),
            state: req.body.state,
            deleted: false,
            status: '1',
            userType: "user",
            isRegistered: true
          })
            .exec(function (err, data) {
              if (err) {
                res.json({ code: 401, message: "Error in updating", data: {} });
              } else {
                if (data) {
                  console.log("\n\n req.body.userLoc", req.body.userLoc);
                  req.body.userLoc = []
                  req.body.userLoc = data.user_loc
                  console.log("\n\n New zipcode user data 2", data.user_loc);
                }
                else {
                  console.log("\n\n else part getDocReg 1")
                  req.body.userLoc = []
                  condition.zipcode = req.body.zipcode
                }
              }
            })
          // })   

        }
        // else{
        //   console.log("\nelse of zipcode 111111111111111");
        //   yield UserModel.findOne({
        //     deleted: false,
        //     _id : mongoose.Types.ObjectId(req.body.userId)
        //   })
        //    .exec(function (err, data) {
        //     console.log("\ndata",data);
        //     if(err){
        //       console.log("\nErrror",err);
        //     }
        //     else{
        //       if(data){
        //         condition.zipcode = data.zipcode;
        //         req.body.userLoc = []
        //       }
        //     }
        //    })
        // }

        if (req.body.userLoc.length) {
          //  let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
          let calculatedMaxDistance = parseFloat(req.body.range) * 1300// 1500//1609.34;// 1.60934;
          condition.user_loc = {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: [req.body.userLoc[0], req.body.userLoc[1]],
              },
              // $minDistance: 1000,
              $maxDistance: calculatedMaxDistance //5000 in meters 
            }
          }
        }

        finalCondition = condition
      }
      else {
        reqParam = {
          deleted: false,
          status: '1',
          $and: [cond],
          userType: { $in: ["user"] },
          _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
        };
        if (req.body.state) {
          reqParam.state = req.body.state;
        }
        if (req.body.searchRegistered == 1) {
          reqParam.isRegistered = true;
        }
        if (req.body.searchRegisteredRef == 1) {
          reqParam.isRegistered = true;
        }

        if (req.body.zipcode) {
          // co(function* () {
          yield UserModel.findOne({
            //  zipcode : String(req.body.zipcode) ,
            //   state : req.body.state,
            zipcode: String(req.body.zipcode),
            state: req.body.state,
            deleted: false,
            status: '1',
            userType: "user",
            isRegistered: true
          })
            .exec(function (err, data) {
              if (err) {
                res.json({ code: 401, message: "Error in updating", data: {} });
              } else {
                if (data) {
                  console.log("\n\n req.body.userLoc", req.body.userLoc);
                  req.body.userLoc = []
                  req.body.userLoc = data.user_loc
                  console.log("\n\n New zipcode user data 2", data.user_loc);
                }
                else {
                  console.log("\n\n else part getDocReg 2")
                  reqParam.zipcode = req.body.zipcode
                  req.body.userLoc = []
                }
              }
            })
          // })

        }
        // else{
        //   console.log("\nelse of zipcode 222222222222222");
        //   UserModel.findOne({
        //     deleted: false,
        //     _id : mongoose.Types.ObjectId(req.body.userId)
        //   }).exec(function (err, data) {
        //     if(err){
        //       console.log("\nErrror",err);
        //     }
        //     else{
        //       console.log("\ndata",data);
        //       if(data){
        //         reqParam.zipcode = data.zipcode;
        //       }
        //     }
        //    })
        // }

        if (req.body.userLoc.length) {
          //  let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
          let calculatedMaxDistance = parseFloat(req.body.range) * 1300// 1500//1609.34;// 1.60934;
          reqParam.user_loc = {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: [req.body.userLoc[0], req.body.userLoc[1]],
              },
              // $minDistance: 1000,
              $maxDistance: calculatedMaxDistance //5000 in meters 
            }
          }

        }

        //Created by Saurabh - 3-July-2019
        finalCondition = reqParam
      }


      if (req.body.network != 1) {
        if (!req.body.userLoc.length) {
          delete finalCondition['user_loc'];
        }

        UserModel.find(finalCondition)
          .limit(count)
          .populate({ path: 'createdById', model: 'user' })
          .sort(sorting)
          .skip(skip)
          .lean()
          .exec(function (err, userData) {
            co(function* () {
              let finalUserData = [];
              if (err) {
                console.log("\n\n\nErr in find query", err);
                res.json({
                  code: 201,
                  message: 'internal error.',
                  data: {}
                });
              } else if (userData && userData.length) {
            //    console.log("\n\n2222  sucessfully got data\n\n", userData.length);
                if (req.body.network) {
                  for (let i = 0; i < userData.length; i++) {
                    let findUserNetworkData = {};
                    if (req.body.network) {
                      findUserNetworkData = {
                        userId: userData[i]._id,
                        status: "0"
                      }
                      findUserNetworkData.network = {
                        $in: req.body.network
                        // $elemMatch: { $eq : req.body.specialty[0].toString() }
                      }
                    }

                    yield userNetworkModel.find(findUserNetworkData, function (err, userNetworkData) {
                      if (err) {
                        console.log("\n\nError", err);
                      } else {
                        if (userNetworkData.length > 0) {
                          userData[i].user_network = userNetworkData
                          finalUserData.push(userData[i]);
                        }
                      }

                    });

                  }
                }
                if (finalUserData.length == 0) {
                  finalUserData = userData
                }

                UserModel.count(condition).exec(function (err, userDataCount) {
                  if (err) {
                    res.json({
                      code: 201,
                      message: 'internal error.',
                      data: {}
                    });
                  } else if (userDataCount) {

                    var ite = 0;

                    finalUserData.forEach(function (item, index) {
                      ite++;
                      referModel.count({ referredTo: item._id, status: 0 }, function (err, res) {
                        finalUserData[index].inboxCount = res;
                      })
                      referModel.count({ referredBy: item._id, status: 3 }, function (err, res) {
                        finalUserData[index].notesent = res;
                      })
                    })
                    setTimeout(function () {
                      return res.json({
                        code: 200,
                        message: 'Data retrieved successfully',
                        data: finalUserData,
                        totalCount: finalUserData.length == userData.length ? userDataCount : finalUserData.length //((userDataCount[0]) ? userDataCount[0].count : 0)
                      });
                    }, 1000);
                  }
                })
              }
              else {
                return res.json({
                  code: 200,
                  message: 'Data retrieved successfully',
                  data: finalUserData,
                  totalCount: finalUserData.length == userData.length ? userDataCount : finalUserData.length //((userDataCount[0]) ? userDataCount[0].count : 0)
                });
              }
            })

          })
      }
      else {

        if (!req.body.userLoc.length) {
          delete finalCondition['user_loc'];
        }

        UserModel.find(finalCondition)
          .limit(count)
          // .populate({ path: 'createdById', model: 'user' })
          .sort(sorting)
          .skip(skip)
          .lean()
          .exec(function (err, userData) {
            co(function* () {
              let finalUserData = [];
              if (err) {
                console.log("\n\n\nErr in find query", err);
                res.json({
                  code: 201,
                  message: 'internal error.',
                  data: {}
                });
              } else if (userData && userData.length) {
            //    console.log("\n\n2222  sucessfully got data\n\n", userData.length);
                return res.json({
                  code: 200,
                  message: "Data retrieved successfully",
                  data: userData,
                  totalCount: userData.length//finalUserData.length== userData.length ? userDataCount : finalUserData.length //((userDataCount[0]) ? userDataCount[0].count : 0)
                });

              }
              else {
                return res.json({
                  code: 200,
                  message: 'Data retrieved successfully',
                  data: finalUserData,
                  totalCount: 0
                });
              }
            })

          })
      }

    }
    catch (errrr) {
      console.log("\n\nErrororrrrrrrrr \n", errrr);
      res.json({
        code: 201,
        message: 'internal error.',
        data: {}
      });
    }

  })
}

/* 
 * Get doctors by insurance, specialty, service
 * Created By Suman Chakraborty
 * Last Modified on 30-03-2018
 */
function getdoctorsnonreg(req, res) {
  co(function* () {
    var cond = {};
    var reqParam;
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));

    var sorting = req.body.sorting
      ? req.body.sorting
      : { doctorStatus: 1, lastname: 1, firstname: 1, centername: 1 };

    var searchText = req.body.search
      ? req.body.search.firstName ? req.body.search.firstName.toLowerCase() : ""
      : "";
    if (searchText !== "") {
      cond = {
        $or: [
          { firstname: { $regex: searchText, $options: "i" } },
          { lastname: { $regex: searchText, $options: "i" } },
          { centername: { $regex: searchText, $options: "i" } }
        ]
      };
    }

    if (req.body.speciality) {
      var spec = {
        $in: req.body.speciality.map(function (o) {
          return mongoose.Types.ObjectId(o);
        })
      };
      reqParam = {
        speciality: {
          $in: req.body.speciality.map(function (o) {
            return mongoose.Types.ObjectId(o);
          })
        },
        deleted: false,
        status: 1,
        $and: [cond],
        userType: { $in: ["user"] },
        _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
      };
      // If network is given and it is not self pay (self pay insturanve id is 1 and 2 is not listed insurance) then only insurance will come in condition
      if (req.body.network && [1, 2].indexOf(req.body.network) == -1) {
        reqParam.network = { $in: [mongoose.Types.ObjectId(req.body.network)] };
      }

      if (req.body.state) {
        reqParam.state = req.body.state;
      } else {
      }

      if (req.body.searchRegistered == 1) {
        reqParam.isRegistered = true;
      } else {
      }

      if (req.body.searchRegisteredRef == 1) {
        reqParam.isRegistered = true;
      } else {
      }

      //Saurabh 25 June 2019
      if (req.body.zipcode) {
        // co(function* () {
        yield UserModel.findOne({ zipcode: String(req.body.zipcode), state: req.body.state })
          .lean()
          .exec(function (err, data) {
            if (err) {
              res.json({ code: 401, message: "Error in updating", data: {} });
            } else {
              if (data) {
                req.body.userLoc = []
                req.body.userLoc = data.user_loc
              }
              else {
                req.body.userLoc = []
                reqParam.zipcode = req.body.zipcode
              }
            }
          })
        // })         
      }

      if (req.body.userLoc) {
        //  let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
        let calculatedMaxDistance = parseFloat(req.body.range) * 1300// 1500//1609.34;// 1.60934;
        reqParam.user_loc = {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [req.body.userLoc[0], req.body.userLoc[1]],
            },
            // $minDistance: 1000,
            $maxDistance: calculatedMaxDistance //5000 in meters 
          }
          // $near: {
          //   $geometry: {
          //     type: "user_loc",
          //     coordinates: [parseFloat(req.body.userLoc[0]), parseFloat(req.body.userLoc[1])],
          //   },
          //   $maxDistance: calculatedMaxDistance
          // }

        }

      }
      // Take service in count if selected
      if (req.body.services && req.body.services !== 1) {
        // When service and specialty both are selected then provider having specilty or service should come in result
        delete reqParam.speciality;
        var serv = {
          $in: req.body.services.map(function (o) {
            return mongoose.Types.ObjectId(o);
          })
        };
        reqParam.speciality = spec;
        reqParam.service = serv;
      }
    } else {
      reqParam = {
        deleted: false,
        status: 1,
        $and: [cond],
        userType: { $in: ["user"] },
        _id: { $ne: mongoose.Types.ObjectId(req.body.userId) }
      };
      if (req.body.state) {
        reqParam.state = req.body.state;
      } else {
      }
      if (req.body.searchRegistered == 1) {
        reqParam.isRegistered = true;
      } else {
      }
      if (req.body.searchRegisteredRef == 1) {
        reqParam.isRegistered = true;
      } else {
      }

      // 25 June 2019
      if (req.body.zipcode) {
        // co(function* () {
        yield UserModel.findOne({ zipcode: String(req.body.zipcode) })
          .lean()
          .exec(function (err, data) {
            if (err) {
              res.json({ code: 401, message: "Error in updating", data: {} });
            } else {
              if (data) {
                req.body.userLoc = []
                req.body.userLoc = data.user_loc
              }
              else {
                req.body.userLoc = []
                reqParam.zipcode = req.body.zipcode
              }
            }
          })
        // })         
      }

      if (req.body.userLoc) {
        // let calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
        let calculatedMaxDistance = parseFloat(req.body.range) * 1300//1500//1609.34;// 1.60934;

        reqParam.user_loc = {
          $nearSphere: {
            $geometry: {
              type: "user_loc",
              coordinates: [req.body.userLoc[0], req.body.userLoc[1]],
            },
            // $minDistance: 1000,
            $maxDistance: calculatedMaxDistance //5000 in meters 
          }

          // $near: {
          //   $geometry: {
          //     type: "user_loc",
          //     coordinates: [parseFloat(req.body.userLoc[0]), parseFloat(req.body.userLoc[1])]
          //   },
          //   $maxDistance: calculatedMaxDistance
          // }
        }
      }

    }
    // if this is a request from the front desk admin then fetch only the list of the doctors who has allowed access to this user
    if (req.body.frontDeskReq && !req.body.getAll) {
      reqParam.frontdesk = {
        $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.userId) }
      };
    }
    if (req.body.getOutsideDocs) {
      if (req.body.state) {
        reqParam.state = req.body.state;
      } else {
      }
      // if (req.body.zipcode) {
      //   reqParam.zipcode = req.body.zipcode;
      // } else {
      // }
      if (req.body.searchRegistered == 1) {
        reqParam.isRegistered = true;
      } else {
        reqParam.isRegistered = false;
      }
      if (req.body.searchRegisteredRef == 1) {
        reqParam.isRegistered = true;
      } else {
        reqParam.isRegistered = false;
      }

      var userInfoWithoutZip = [];
      var totalCountWithoutZip = 0;

      // if (req.body.zipcode) {
      //   reqParam.zipcode = req.body.zipcode;
      // } else {
      // }

      if (!req.body.userLoc ) {
        delete reqParam['user_loc'];
      //  reqParam.splice(0,1);
      }

      console.log("\n\nZipcode test", reqParam);
      UserModel.find(reqParam, { password: 0 })
        // .sort(sorting)
        .skip(parseInt(skip))
        .limit(parseInt(count))
        .lean()
        .exec(function (err, userInfo) {
          if (err) {
            console.log("\n\n Error ", err);
            res.json({
              code: 401,
              message: "Request could not be processed. Please try again.",
              err: err
            });
          } else {
            UserModel.find(reqParam, { password: 0 })
              .count()
              .lean()
              .exec(function (err, totalCount) {
                if (err) {
                  res.json({
                    code: 401,
                    message: "Request could not be processed. Please try again.",
                    err: err
                  });
                } else {
                  // delete reqParam.zipcode;
                  UserModel.find(reqParam, { password: 0 })
                    .sort(sorting)
                    .skip(parseInt(skip))
                    .limit(parseInt(count))
                    .lean()
                    .exec(function (err, userInfo2) {
                      if (err) {
                        res.json({
                          code: 401,
                          message:
                            "Request could not be processed. Please try again.",
                          err: err
                        });
                      } else {
                        UserModel.find(reqParam, { password: 0 })
                          .count()
                          .lean()
                          .exec(function (err, totalCount2) {
                            if (err) {
                              res.json({
                                code: 401,
                                message:
                                  "Request could not be processed. Please try again.",
                                err: err
                              });
                            } else {

                              userInfoWithoutZip = userInfo2;
                              totalCountWithoutZip = totalCount2;
                              userInfo = userInfo.concat(userInfo2);

                              res.json({
                                code: 200,
                                message: "success",
                                data: userInfo,
                                totalCount: totalCount + totalCount2
                              });
                            }
                          });
                      }
                    });
                }
              });
          }
        });
    }
  })

}

// get doctors by speciality
function getDoctorBySpeciality(req, res) {
  var prefrenceInfo = {};
  var userId = req.body.userId;
  userPreferenceModel.find(
    {
      userId: req.body.userId,
      isDeleted: false,
      speciality: {
        $in: req.body.speciality
      }
    },
    {
      isDeleted: 0,
      _id: 0,
      userId: 0
    },
    function (err, prefrenceInfo) {
      if (err) {
        res.json({
          code: 401,
          message: "Request could not be processed. Please try again.",
          err: err
        });
      } else {
        var condition = {};
        var conditionAll = {};
        var userInfoPref = [];

        condition["speciality"] = {
          $in: req.body.speciality
        };
        condition.userType = { $in: ["user"] };
        condition.deleted = false;
        if (req.body.state) {
          condition.state = req.body.state;
        } else {
        }
        if (prefrenceInfo.length > 0) {
          prefrenceInfo.forEach(item => {
            var userIds = [];
            item.preference.forEach(itemId => {
              userIds.push(new mongoose.Types.ObjectId(itemId)); // for the Mongo query
            });
            if (userIds.length > 0) {
              condition["_id"] = {
                $ne: mongoose.Types.ObjectId(req.body.userId)
              };
              conditionAll["_id"] = {
                $ne: mongoose.Types.ObjectId(req.body.userId),
                $in: userIds
              };

              UserModel.find(conditionAll, { password: 0 }, function (
                err,
                userInfoAll
              ) {
                if (err) {
                } else {
                  userInfoPref = userInfoAll;
                }
              });
            } else {
              condition["_id"] = {
                $ne: mongoose.Types.ObjectId(req.body.userId)
              };
            }
          });
        } else {
          condition["_id"] = { $ne: mongoose.Types.ObjectId(req.body.userId) };
        }


        if (req.body.userLoc && req.body.range) {
          // var calculatedMaxDistance = parseFloat(req.body.range) / 3963.2; // 3,963.2 miles or 6,378.1 kilometers
          let calculatedMaxDistance = parseFloat(req.body.range) * 1300// 1500//1609.34;// 1.60934;
          condition.user_loc = {
            $nearSphere: {
              $geometry: {
                type: "user_loc",
                coordinates: [req.body.userLoc[0], req.body.userLoc[1]],
              },
              // $minDistance: 1000,
              $maxDistance: calculatedMaxDistance //5000 in meters 
            }
          }
          console.log("\n\nInside If condition of userLoc");
          UserModel.find(condition, { password: 0 })

            .exec(function (err, userInfo) {
              if (err) {
                res.json({
                  code: 401,
                  message: "Request could not be processed. Please try again.",
                  err: err
                });
              } else {
                userInfo = userInfo.concat(userInfoPref);
                res.json({ code: 200, message: "success", data: userInfo });
              }
            });
        } else {
          console.log("\n\nInside else condition of userLoc");
          UserModel.find(condition, { password: 0 }, function (err, userInfo) {
            if (err) {
              res.json({
                code: 401,
                message: "Request could not be processed. Please try again."
              });
            } else {
              userInfo = userInfo.concat(userInfoPref);
              res.json({ code: 200, message: "success", data: userInfo });
            }
          });
        }
      }
    }
  );
}

function uploadAttachments(req, res) {
  var timestamp = Number(new Date());
  var file = req.swagger.params.attachmentFile.value;
  var filename = +timestamp + "_" + file.originalname;
  var imagePath = "./images/user/" + timestamp + "_" + file.originalname;
  fs.writeFile(path.resolve(imagePath), file.buffer, function (err) {
    if (err) {
      res.json({
        code: 401,
        message: "Request could not be processed. Please try again."
      });
    } else {
      var filepath = req.config.webUrl + "/images/user/" + filename;
      var filepath = filename;
      res.json({ code: 200, message: filepath });
    }
  });
}

/**
* Delete referral attachment
* Created By Suman Chakrabory
* Last Modified on 25-04-2018
*/
function deleteAttachment(req, res) {
  // Search if referral exists or not
  referModel.findOne(
    { _id: mongoose.Types.ObjectId(req.body.id) },
    {},
    function (err, resp) {
      if (!err) {
        var fileArr = resp.attachment.split(",");
        var fileIndex = fileArr.indexOf(req.body.fileName);
        var fileName = "./images/user/" + req.body.fileName;
        if (fileIndex > -1) {
          delete fileArr[fileIndex];
          fileArr.join(",");
          resp.update({ attachment: fileArr.join(",") }, function (err, succ) {
            if (!err) {
              fs.unlink(fileName, err => { });
              res.json({
                code: 200,
                message: "Attachment deleted successfully."
              });
            } else {
              res.json({
                code: 201,
                message: "Something went wrong. Please try again..."
              });
            }
          });
        } else {
          res.json({ code: 201, message: "Invalid request" });
        }
      } else {
        res.json({
          code: 201,
          message: "Something went wrong. Please try again..."
        });
      }
    }
  );
}

function sendMail(req, res) {
  var mailOptions = {
    from: "'Which Docs' <teamnowaitdoc@gmail.co>",
    to: req.body.to,
    text: "Patient Referral"
  };

  // If this request has a pre defined template then fetch that and send mail / fax accordingly.
  if (req.body.hasTemplate) {
    // Check if the user has an email otherwise send notification via fax
    if (req.body.emailAvailable == null || req.body.emailAvailable === 1) {
      // send referral mail
      if (req.body.referralMail) {
        co(function* () {
          let frmSvpDeg = req.body.fromSvpDegree
            ? yield utility.getTitleById(req.body.fromSvpDegree)
            : "";
          let toSvpDeg = req.body.toSvpDegree
            ? yield utility.getTitleById(req.body.toSvpDegree)
            : "";


          if (
            req.body.referredUser.mail &&
            !req.body.selfRefer &&
            !req.body.referredUser.firstLogin
          ) {
            var replaceObj = {
              "{{patientName}}": "",

              "{{fromSvpFname}}": req.body.fromSvpFname,
              "{{fromSvpLname}}": req.body.fromSvpLname,
              "{{fromSvpTitle}}": req.body.fromSvpDegree
                ? ", " + frmSvpDeg
                : "",
              "{{fromSvpCenter}}": req.body.fromSvpCenter,

              "{{toSvpFname}}": req.body.toSvpFname,
              "{{toSvpLname}}": req.body.toSvpLname,
              "{{toSvpTitle}}": req.body.toSvpDegree ? ", " + toSvpDeg : "",
              "{{toSvpCenter}}": req.body.toSvpCenter,

              "{{referredProviderAddr}}": req.body.referredUser.address,
              "{{referredProviderPhone}}": req.body.referredUser.phone,

              "{{service}}": req.body.service,
              "{{webUrl}}": req.config.webUrl,
              "{{year}}": new Date().getFullYear()
            };

            mailModel.findOne({ key: "refer_referreddoc" }, {}, function (
              err,
              resp
            ) {
              if (!err) {
                if (resp) {
                  mailOptions.to = req.body.referredUser.mail;
                  mailOptions.subject = utility.replaceString(
                    resp.subject,
                    replaceObj
                  );
                  mailOptions.html = utility.replaceString(
                    resp.body,
                    replaceObj
                  );
                  // console.log("\n\n\nmailOptions",mailOptions);
                  utility.sendmail(
                    mailOptions.to,
                    mailOptions.subject,
                    mailOptions.html,
                    function (error, rs) {
                      if (error) {
                        res.json({
                          code: 343,
                          message: "Error while Sending E-mail",
                          data: error
                        });
                      } else {
                        console.log("res", rs);
                        res.json({
                          code: 200,
                          message: "Message sent: Successfully"
                        });
                      }
                    }
                  );
                }
              } else {
                res.json({
                  code: 343,
                  message: "Error while Sending E-mail",
                  data: err
                });
              }
            });
          }

          if (
            req.body.referredUser.mail &&
            !req.body.selfRefer &&
            req.body.referredUser.firstLogin
          ) {
            // Generating new password for the user
            var gpassword = generator.generate({
              length: 10,
              numbers: true,
              excludeSimilarCharacters: true
            });
            var Encpassword = utility.getEncryptText(gpassword);
            // Updating the user with new password
            UserModel.update(
              { email: req.body.referredUser.mail },
              { $set: { password: Encpassword } },
              function (err) {
                if (err) {
                  res.json({
                    code: 201,
                    message: "Request could not be processed. Please try again."
                  });
                } else {
                  var replaceObj = {
                    "{{patientName}}": "",

                    "{{fromSvpFname}}": req.body.fromSvpFname,
                    "{{fromSvpLname}}": req.body.fromSvpLname,
                    "{{fromSvpTitle}}": req.body.fromSvpDegree
                      ? ", " + frmSvpDeg
                      : "",
                    "{{fromSvpCenter}}": req.body.fromSvpCenter,

                    "{{toSvpFname}}": req.body.toSvpFname,
                    "{{toSvpLname}}": req.body.toSvpLname,
                    "{{toSvpTitle}}": req.body.toSvpDegree
                      ? ", " + toSvpDeg
                      : "",
                    "{{toSvpCenter}}": req.body.toSvpCenter,

                    "{{email}}": req.body.referredUser.mail,
                    "{{gpassword}}": gpassword,
                    "{{service}}": req.body.service,
                    "{{webUrl}}": req.config.webUrl,
                    "{{year}}": new Date().getFullYear()
                  };
                  mailModel.findOne(
                    { key: "add_and_refer_referreddoc" },
                    {},
                    function (err, resp) {
                      if (!err) {
                        if (resp) {
                          mailOptions.to = req.body.referredUser.mail;
                          mailOptions.subject = utility.replaceString(
                            resp.subject,
                            replaceObj
                          );
                          mailOptions.html = utility.replaceString(
                            resp.body,
                            replaceObj
                          );
                          utility.sendmail(
                            mailOptions.to,
                            mailOptions.subject,
                            mailOptions.html,
                            function (error, rs) {
                              if (error) {
                                res.json({
                                  code: 343,
                                  message: "Error while Sending E-mail",
                                  data: error
                                });
                              } else {
                                res.json({
                                  code: 200,
                                  message: "Message sent: Successfully"
                                });
                              }
                            }
                          );
                        }
                      } else {
                        res.json({
                          code: 343,
                          message: "Error while Sending E-mail",
                          data: err
                        });
                      }
                    }
                  );
                }
              }
            );
          }


          if (
            req.body.referringUser.mail &&
            req.body.referringUser.isRegistered
          ) {
            var gpassword = generator.generate({
              length: 10,
              numbers: true,
              excludeSimilarCharacters: true
            });
            var Encpassword = utility.getEncryptText(gpassword);
            // Updating the user with new password
            UserModel.update(
              { email: req.body.referredUser.mail },
              { $set: { password: Encpassword } },
              function (err) {
                if (err) {
                  res.json({
                    code: 201,
                    message: "Request could not be processed. Please try again."
                  });
                } else {
                  var replaceObj = {
                    "{{patientName}}": "",

                    "{{fromSvpFname}}": req.body.toSvpFname,
                    "{{fromSvpLname}}": req.body.toSvpLname,
                    "{{fromSvpTitle}}": req.body.toSvpDegree
                      ? ", " + toSvpDeg
                      : "",
                    "{{fromSvpCenter}}": req.body.toSvpCenter,

                    "{{toSvpFname}}": req.body.fromSvpFname,
                    "{{toSvpLname}}": req.body.fromSvpLname,
                    "{{toSvpTitle}}": req.body.fromSvpDegree
                      ? ", " + frmSvpDeg
                      : "",
                    "{{toSvpCenter}}": req.body.fromSvpCenter,

                    "{{email}}": req.body.referredUser.mail,
                    "{{gpassword}}": gpassword,
                    "{{service}}": req.body.service,
                    "{{webUrl}}": req.config.webUrl,
                    "{{year}}": new Date().getFullYear()
                  };
                  mailModel.findOne(
                    { key: "accept_referringdoc" },
                    {},
                    function (err, resp) {
                      if (!err) {
                        if (resp) {
                          mailOptions.to = req.body.referringUser.mail;
                          mailOptions.subject = utility.replaceString(
                            resp.subject,
                            replaceObj
                          );
                          mailOptions.html = utility.replaceString(
                            resp.body,
                            replaceObj
                          );
                          utility.sendmail(
                            mailOptions.to,
                            mailOptions.subject,
                            mailOptions.html,
                            function (error, rs) {
                              if (error) {
                                res.json({
                                  code: 343,
                                  message: "Error while Sending E-mail",
                                  data: error
                                });
                              } else {
                                res.json({
                                  code: 200,
                                  message: "Message sent: Successfully"
                                });
                              }
                            }
                          );
                        }
                      } else {
                        res.json({
                          code: 343,
                          message: "Error while Sending E-mail",
                          data: err
                        });
                      }
                    }
                  );
                }
              }
            );
          }
          ////////////// email to referring provider end ///////////////////

          //////// email to unregistred reffering provider start

          if (
            req.body.referringUser.mail &&
            req.body.referringUser.isRegistered == "false"
          ) {
            //end for invitation log

            var gpassword = generator.generate({
              length: 10,
              numbers: true,
              excludeSimilarCharacters: true
            });
            var Encpassword = utility.getEncryptText(gpassword);
            // Updating the user with new password

            UserModel.update(
              { email: req.body.referringUser.mail },
              { $set: { password: Encpassword } },
              function (err) {
                if (err) {
                  res.json({
                    code: 201,
                    message: "Request could not be processed. Please try again."
                  });
                } else {
                  var replaceObj = {
                    "{{patientName}}": "",

                    "{{fromSvpFname}}": req.body.fromSvpFname,
                    "{{fromSvpLname}}": req.body.fromSvpLname,
                    "{{fromSvpTitle}}": req.body.fromSvpDegree
                      ? ", " + frmSvpDeg
                      : "",
                    "{{fromSvpCenter}}": req.body.fromSvpCenter,

                    "{{toSvpFname}}": req.body.toSvpFname,
                    "{{toSvpLname}}": req.body.toSvpLname,
                    "{{toSvpTitle}}": req.body.toSvpDegree
                      ? ", " + toSvpDeg
                      : "",
                    "{{toSvpCenter}}": req.body.toSvpCenter,

                    "{{referredProviderAddr}}": req.body.referredUser.address,
                    "{{referredProviderPhone}}": req.body.referredUser.phone,

                    "{{email}}": req.body.referringUser.mail,
                    "{{gpassword}}": gpassword,
                    "{{service}}": req.body.service,
                    "{{webUrl}}": req.config.webUrl,
                    "{{year}}": new Date().getFullYear()
                  };

                  mailModel.findOne(
                    { key: "add_doc_take_outside_referral" },
                    {},
                    function (err, resp) {
                      if (!err) {
                        if (resp) {
                          mailOptions.to = req.body.referringUser.mail;
                          mailOptions.subject = utility.replaceString(
                            resp.subject,
                            replaceObj
                          );
                          mailOptions.html = utility.replaceString(
                            resp.body,
                            replaceObj
                          );
                          utility.sendmail(
                            mailOptions.to,
                            mailOptions.subject,
                            mailOptions.html,
                            function (error, rs) {
                              if (error) {
                                res.json({
                                  code: 343,
                                  message: "Error while Sending E-mail",
                                  data: error
                                });
                              } else {
                                res.json({
                                  code: 200,
                                  message: "Message sent: Successfully"
                                });
                              }
                            }
                          );
                        }
                      } else {
                        res.json({
                          code: 343,
                          message: "Error while Sending E-mail",
                          data: err
                        });
                      }
                    }
                  );
                }
              }
            );
          }

          ////// email to unregistred refferring provider end

          // end
        }).then(
          function (value) {
            //console.log(value);
          },
          function (err) {
            console.error(err.stack);
          }
        );
      } else if (req.body.inviteMail) {
        co(function* () {
          let frmSvpDeg = req.body.fromSvpDegree
            ? yield utility.getTitleById(req.body.fromSvpDegree)
            : "";
          let toSvpDeg = req.body.toSvpDegree
            ? yield utility.getTitleById(req.body.toSvpDegree)
            : "";

          if (req.body.toSvpMail && req.body.isRegistered) {
            var replaceObj = {
              "{{fromSvpFname}}": req.body.fromSvpFname,
              "{{fromSvpLname}}": req.body.fromSvpLname,
              "{{fromSvpTitle}}": req.body.fromSvpDegree
                ? ", " + frmSvpDeg
                : "",
              "{{fromSvpCenter}}": req.body.fromSvpCenter,

              "{{toSvpFname}}": req.body.toSvpFname,
              "{{toSvpLname}}": req.body.toSvpLname,
              "{{toSvpTitle}}": req.body.toSvpDegree ? ", " + toSvpDeg : "",
              "{{toSvpCenter}}": req.body.toSvpCenter,

              "{{service}}": req.body.service,
              "{{webUrl}}": req.config.webUrl,
              "{{year}}": new Date().getFullYear()
            };

            mailModel.findOne({ key: "invite_registereddoc" }, {}, function (
              err,
              resp
            ) {
              if (!err) {
                if (resp) {
                  mailOptions.to = req.body.toSvpMail;
                  mailOptions.subject = utility.replaceString(
                    resp.subject,
                    replaceObj
                  );
                  mailOptions.html = utility.replaceString(
                    resp.body,
                    replaceObj
                  );
                  utility.sendmail(
                    mailOptions.to,
                    mailOptions.subject,
                    mailOptions.html,
                    function (error, rs) {
                      if (error) {
                        res.json({
                          code: 343,
                          message: "Error while Sending E-mail",
                          data: error
                        });
                      } else {
                        res.json({
                          code: 200,
                          message: "Message sent: Successfully"
                        });
                      }
                    }
                  );
                }
              } else {
                res.json({
                  code: 343,
                  message: "Error while Sending E-mail",
                  data: err
                });
              }
            });
          }

          if (req.body.toSvpMail && !req.body.isRegistered) {
            // Generating new password for the user
            var gpassword = generator.generate({
              length: 10,
              numbers: true,
              excludeSimilarCharacters: true
            });
            var Encpassword = utility.getEncryptText(gpassword);
            // Updating the user with new password
            UserModel.update(
              { email: req.body.toSvpMail },
              { $set: { password: Encpassword } },
              function (err) {
                if (err) {
                  res.json({
                    code: 201,
                    message: "Request could not be processed. Please try again."
                  });
                } else {
                  var replaceObj = {
                    "{{fromSvpFname}}": req.body.toSvpFname,
                    "{{fromSvpLname}}": req.body.toSvpLname,
                    "{{fromSvpTitle}}": req.body.toSvpDegree
                      ? ", " + toSvpDeg
                      : "",
                    "{{fromSvpCenter}}": req.body.toSvpCenter,

                    "{{toSvpFname}}": req.body.fromSvpFname,
                    "{{toSvpLname}}": req.body.fromSvpLname,
                    "{{toSvpTitle}}": req.body.fromSvpDegree
                      ? ", " + frmSvpDeg
                      : "",
                    "{{toSvpCenter}}": req.body.fromSvpCenter,

                    "{{email}}": req.body.toSvpMail,
                    "{{gpassword}}": gpassword,
                    "{{service}}": req.body.service,
                    "{{webUrl}}": req.config.webUrl,
                    "{{year}}": new Date().getFullYear()
                  };
                  mailModel.findOne(
                    { key: "invite_unregistereddoc" },
                    {},
                    function (err, resp) {
                      if (!err) {
                        if (resp) {
                          mailOptions.to = req.body.toSvpMail;
                          mailOptions.subject = utility.replaceString(
                            resp.subject,
                            replaceObj
                          );
                          mailOptions.html = utility.replaceString(
                            resp.body,
                            replaceObj
                          );
                          utility.sendmail(
                            mailOptions.to,
                            mailOptions.subject,
                            mailOptions.html,
                            function (error, rs) {
                              if (error) {
                                res.json({
                                  code: 343,
                                  message: "Error while Sending E-mail",
                                  data: error
                                });
                              } else {
                                res.json({
                                  code: 200,
                                  message: "Message sent: Successfully"
                                });
                              }
                            }
                          );
                        }
                      } else {
                        res.json({
                          code: 343,
                          message: "Error while Sending E-mail",
                          data: err
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }).then(
          function (value) {
            //console.log(value);
          },
          function (err) {
            console.error(err.stack);
          }
        );
      } else if (req.body.to) {
        var gpassword = generator.generate({
          length: 10,
          numbers: true,
          excludeSimilarCharacters: true
        });
        var Encpassword = utility.getEncryptText(gpassword);
        UserModel.update(
          { email: req.body.to },
          { $set: { password: Encpassword } },
          function (err) {
            if (err) {
              res.json({
                code: 201,
                message: "Request could not be processed. Please try again."
              });
            } else {
              co(function* () {
                let frmSvpDeg = req.body.fromSvpDegree
                  ? yield utility.getTitleById(req.body.fromSvpDegree)
                  : "";
                let userDeg = req.body.degree
                  ? yield utility.getTitleById(req.body.degree)
                  : "";

                var replaceObj = {
                  "{{salutation}}": req.body.salutation,
                  "{{invitingDoc}}": req.body.invitingDoc,
                  "{{firstname}}": req.body.firstname ? req.body.firstname : "",
                  "{{lastname}}": req.body.lastname ? req.body.lastname : "",
                  "{{title}}":
                    req.body.degree && req.body.degree != ""
                      ? ", " + userDeg
                      : "",
                  "{{center}}": req.body.centername ? req.body.centername : "",
                  "{{fromSvpFname}}": req.body.fromSvpFname
                    ? req.body.fromSvpFname
                    : "",
                  "{{fromSvpLname}}": req.body.fromSvpLname
                    ? req.body.fromSvpLname
                    : "",
                  "{{fromSvpTitle}}":
                    req.body.fromSvpDegree && req.body.fromSvpDegree != ""
                      ? ", " + frmSvpDeg
                      : "",
                  "{{fromSvpCenter}}": req.body.fromSvpCenter
                    ? req.body.fromSvpCenter
                    : "",
                  "{{email}}": req.body.to,
                  "{{gpassword}}": gpassword,
                  "{{webUrl}}": req.config.webUrl,
                  "{{year}}": new Date().getFullYear()
                };
                mailModel.findOne({ key: "resend_invite" }, {}, function (
                  err,
                  resp
                ) {
                  if (!err) {
                    if (resp) {
                      mailOptions.subject = utility.replaceString(
                        resp.subject,
                        replaceObj
                      );
                      mailOptions.html = utility.replaceString(
                        resp.body,
                        replaceObj
                      );
                      utility.sendmail(
                        mailOptions.to,
                        mailOptions.subject,
                        mailOptions.html,
                        function (error, rs) {
                          if (error) {
                            res.json({
                              code: 343,
                              message: "Error while Sending E-mail",
                              data: error
                            });
                          } else {
                            res.json({
                              code: 200,
                              message: "Message sent: Successfully"
                            });
                          }
                        }
                      );
                    }
                  } else {
                    res.json({
                      code: 343,
                      message: "Error while Sending E-mail",
                      data: err
                    });
                  }
                });
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
      } else if (
        req.body.senduploadRefMail &&
        req.body.referredUser.mail != ""
      ) {
        co(function* () {
          var replaceObj = {

            "{{fromSvpFname}}": req.body.fromSvpFname,
            "{{fromSvpLname}}": req.body.fromSvpLname,
            "{{fromSvpCenter}}": req.body.fromSvpCenter,

            "{{toSvpFname}}": req.body.toSvpFname,
            "{{toSvpLname}}": req.body.toSvpLname,
            "{{toSvpCenter}}": req.body.toSvpCenter,

            "{{webUrl}}": req.config.webUrl,
            "{{year}}": new Date().getFullYear()
          };

          mailModel.findOne({ key: "upload_patientdoc" }, {}, function (
            err,
            resp
          ) {
            if (!err) {
              if (resp) {
                mailOptions.to = req.body.referredUser.mail;
                mailOptions.subject = utility.replaceString(
                  resp.subject,
                  replaceObj
                );
                mailOptions.html = utility.replaceString(resp.body, replaceObj);
                utility.sendmail(
                  mailOptions.to,
                  mailOptions.subject,
                  mailOptions.html,
                  function (error, rs) {
                    if (error) {
                      res.json({
                        code: 343,
                        message: "Error while Sending E-mail",
                        data: error
                      });
                    } else {
                      res.json({
                        code: 200,
                        message: "Message sent: Successfully"
                      });
                    }
                  }
                );
              }
            } else {
              res.json({
                code: 343,
                message: "Error while Sending E-mail",
                data: err
              });
            }
          });
        }).then(
          function (value) {
            //console.log(value);
          },
          function (err) {
            console.error(err.stack);
          }
        );
      } else {
        //end
        res.json({
          code: 343,
          message: "Error while Sending E-mail",
          data: "Mail id not found"
        });
      }
    } else {
      // Fax only being sent while re-invite doctor
      if (req.body.fax) {
        //start Task #554
        console.log("if part of fax referring mail ");
        if (req.body.referringUser.mail && req.body.emailAvailable == 0) {

          co(function* () {
            let frmSvpDeg = req.body.fromSvpDegree
              ? yield utility.getTitleById(req.body.fromSvpDegree)
              : "";
            let toSvpDeg = req.body.toSvpDegree
              ? yield utility.getTitleById(req.body.toSvpDegree)
              : "";

            var absolutePath = path.resolve();

            var logoUrl = "/public/assets/images/logo_new.png";

            var replaceObj = {
              "{{patientName}}": "",

              "{{fromSvpFname}}": req.body.toSvpFname,
              "{{fromSvpLname}}": req.body.toSvpLname,
              "{{fromSvpTitle}}": req.body.toSvpDegree ? ", " + toSvpDeg : "",
              "{{fromSvpCenter}}": req.body.toSvpCenter,

              "{{toSvpFname}}": req.body.fromSvpFname,
              "{{toSvpLname}}": req.body.fromSvpLname,
              "{{toSvpTitle}}": req.body.fromSvpDegree ? ", " + frmSvpDeg : "",
              "{{toSvpCenter}}": req.body.fromSvpCenter,
              "{{logoUrl}}": "file://" + absolutePath + logoUrl,
              "{{email}}": req.body.referredUser.mail,
              "{{service}}": req.body.service,
              "{{webUrl}}": req.config.webUrl,
              "{{year}}": new Date().getFullYear()
            };
            var faxtemplatekey = "accept_referringdoc";
            faxmodel.findOne({ key: faxtemplatekey }, {}, function (err, resp) {
              if (!err) {
                //Sending fax
                var faxContent = utility.replaceString(resp.body, replaceObj);

                utills.createfaxFile(faxContent, function (err, filePath) {
                  if (!err) {
                    utills.sendFax(req.body.fax, filePath, function (
                      err,
                      fax_id
                    ) {
                      if (!err) {
                        console.log("\n\n\Sucess 1");
                        res.json({
                          code: 200,
                          message: "Message sent: Successfully"
                        });
                      } else {
                        // res.json({
                        //   code: 200,
                        //   message: "Fax sent succefully",
                        //   data: filePath
                        // });
                        res.json({
                          code: 343,
                          message: "Error while Sending E-mail",
                          data: err
                        });
                      }
                    });
                  } else {
                    res.json({
                      code: 343,
                      message: "Error while Sending E-mail",
                      data: err
                    });
                  }
                });
              }
            });
            // } open it
          });

          //end Task #554
        } else {
          // Generating new password for the user
          var gpassword = generator.generate({
            length: 10,
            numbers: true,
            excludeSimilarCharacters: true
          });
          var Encpassword = utility.getEncryptText(gpassword);
          // Updating the user with new password
          UserModel.update(
            { email: req.body.to },
            { $set: { password: Encpassword } },
            function (err) {
              if (err) {
                res.json({
                  code: 201,
                  message: "Request could not be processed. Please try again."
                });
              } else {
                co(function* () {
                  let frmSvpDeg = req.body.fromSvpDegree
                    ? yield utility.getTitleById(req.body.fromSvpDegree)
                    : "";
                  let userDeg = req.body.degree
                    ? yield utility.getTitleById(req.body.degree)
                    : "";
                  let referUserDeg = req.body.toSvpDegree
                    ? yield utility.getTitleById(req.body.toSvpDegree)
                    : "";
                  console.log("\nreferUserDeg", referUserDeg);
                  if (
                    req.body.referredUser &&
                    req.body.referredUser.firstLogin
                  ) {
                    var absolutePath = path.resolve();
                    var logoUrl = "/public/assets/images/logo_new.png";
                    var replaceObj = {
                      "{{firstname}}": req.body.toSvpFname,
                      "{{lastname}}": req.body.toSvpLname,
                      "{{title}}":
                        req.body.degree && req.body.degree != ""
                          ? "," + userDeg
                          : "",
                      "{{center}}": req.body.centername,
                      "{{referringProviderFirstname}}": req.body.fromSvpFname,
                      "{{referringProviderLname}}": req.body.fromSvpLname,
                      "{{referringProviderTitle}}":
                        req.body.fromSvpDegree && req.body.fromSvpDegree != ""
                          ? ", " + frmSvpDeg
                          : "",
                      "{{referringProviderCenter}}": req.body.fromSvpCenter,
                      "{{email}}": req.body.to,
                      "{{gpassword}}": gpassword,
                      "{{webUrl}}": req.config.webUrl,
                      "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                      "{{year}}": new Date().getFullYear()
                    };
                    var faxtemplatekey = "add_and_refer_specialist";
                  } else {
                    var absolutePath = path.resolve();
                    var logoUrl = "/public/assets/images/logo_new.png";
                    console.log("\n\nReq body", req.body);
                    var replaceObj = {
                      "{{salutation}}": req.body.salutation,
                      "{{invitingDoc}}": req.body.invitingDoc,
                      "{{firstname}}": req.body.toSvpFname,
                      "{{lastname}}": req.body.toSvpLname,
                      "{{title}}": ", " + referUserDeg,
                      // req.body.degree && req.body.degree != ""
                      //   ? "," + referUserDeg
                      //   : "",
                      "{{center}}": req.body.centername ? req.body.centername : '',
                      "{{referringProviderFname}}": req.body.fromSvpFname,
                      "{{referringProviderLname}}": req.body.fromSvpLname,
                      "{{referringProviderTitle}}":
                        req.body.fromSvpDegree && req.body.fromSvpDegree != ""
                          ? ", " + frmSvpDeg
                          : "",
                      "{{referringProviderCenter}}": req.body.fromSvpCenter,
                      "{{email}}": req.body.to ? req.body.to : req.body.referredUser.mail,
                      "{{gpassword}}": gpassword,
                      "{{webUrl}}": req.config.webUrl,
                      "{{logoUrl}}": "file://" + absolutePath + logoUrl,
                      "{{year}}": new Date().getFullYear()
                    };
                    var faxtemplatekey = 'add_and_refer_specialist'//"resend_invitation";
                  }
                  if (faxtemplatekey) {
                    console.log("faxtemplatekey", faxtemplatekey);

                    faxmodel.findOne({ key: faxtemplatekey }, {}, function (
                      err,
                      resp
                    ) {
                      if (!err) {
                        //Sending fax
                        var faxContent = utility.replaceString(
                          resp.body,
                          replaceObj
                        );

                        utills.createfaxFile(faxContent, function (
                          err,
                          filePath
                        ) {
                          if (!err) {
                            utills.sendFax(req.body.fax, filePath, function (
                              err,
                              fax_id
                            ) {
                              if (!err) {
                                console.log("\n\n\Sucess 2");
                                res.json({
                                  code: 200,
                                  message: "Message sent: Successfully"
                                });
                              } else {
                                res.json({
                                  code: 343,
                                  message: "Error while Sending E-mail",
                                  data: err
                                });
                              }
                            });
                          } else {
                            res.json({
                              code: 343,
                              message: "Error while Sending E-mail",
                              data: err
                            });
                          }
                        });
                      }
                    });
                  } else {
                    console.log("\n\n\Sucess 3");
                    res.json({
                      code: 200,
                      message: "Message sent: Successfully"
                    });
                  }
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
        }
      } else {
        res.json({
          code: 343,
          message: "Error while Sending E-mail",
          data: "fax no not found"
        });
      }
    }
  } else {
    mailOptions.subject = req.body.subject;
    mailOptions.html = req.body.content;
    utility.sendmail(
      mailOptions.to,
      mailOptions.subject,
      mailOptions.html,
      function (error, rs) {
        if (error) {
          res.json({
            code: 343,
            message: "Error while Sending E-mail",
            data: error
          });
        } else {
          console.log("\n\n\Sucess 4");
          res.json({ code: 200, message: "Message sent: Successfully" });
        }
      }
    );
  }
}


/**
* Fetch all referral which has status as note sent and older than 7 days
* Created by Suman Chakraborty
* last modified on 08-12-2017
*/
new CronJob(
  "00 00 * * * *",
  function () {
    var expDate = new Date();
    expDate.setDate(expDate.getDate() - 7);
    referModel.find(
      {
        status: { $in: [4, 5] },
        isDeleted: false,
        lastUpdatedOn: { $lte: expDate },
        attachment: { $nin: [""] }
      },
      { _id: 1, lastUpdatedOn: 1, attachment: 1 },
      function (err, resp) {
        if (!err) {
          resp.forEach(referral => {
            let attachmentArr = referral.attachment.split(",");
            attachmentArr.forEach(item => {
              if (typeof item !== "undefined" && item.length > 0) {
                var filePath = "./images/user/" + item;
                fs.unlink(filePath, function (err, succ) {
                  if (!err) {
                  }
                });
              }
            });
          });
          referModel.update(
            {
              status: 4,
              lastUpdatedOn: { $lte: expDate },
              attachment: { $nin: [""] }
            },
            { attachment: "" },
            { multi: true },
            function (error, response) {
              if (!error) {
              }
            }
          );
        }
      }
    );
  },
  null,
  true
);

/**
* Delete referral after 2 weeks of completion or reject
* Created by Suman Chakraborty
* last modified on 15-12-2017
*/
new CronJob(
  "00 02 * * * *",
  function () {
    var expDate = new Date();
    expDate.setDate(expDate.getDate() - 14);
    referModel.update(
      { status: { $in: [4, 5] }, lastUpdatedOn: { $lte: expDate } },
      { isDeleted: true },
      { multi: true },
      function (err) {
        if (!err) {
        } else {
        }
      }
    );
  },
  null,
  true
);

new CronJob(
  "00 00 */1 * * *",
  function () {
    var reqParam = {
      deleted: false,
      //status: 1,
      userType: { $in: ["user"] },
      doctorStatus: "available"
    };

    UserModel.find(reqParam, { password: 0 }, function (err, userInfo) {
      if (err) {
        //res.json({ code: 401, message: 'Request could not be processed. Please try again.' , err:err});
      } else {
        if (userInfo.length > 0) {
          userInfo.forEach(function (item) {
            if (!item.isRegistered) {
              UserModel.update(
                { _id: item._id },
                { $set: { doctorStatus: "waiting" } },
                function (err) {
                  if (!err) {
                  } else {
                  }
                }
              );
            } else if (
              typeof item.user_loc !== "undefined" &&
              item.user_loc.length > 0
            ) {
              var timestamp = Math.round(new Date().getTime() / 1000);
              timezone.key(constant.apikeys.timezone_apikey);

              timezone.data(
                item.user_loc[1],
                item.user_loc[0],
                timestamp,
                function (err, tz) {

                  if (tz.local_timestamp) {
                    var d = new Date(tz.local_timestamp * 1000);
                    if (d.getHours() == "6" && d.getMinutes() >= "0") {
                      UserModel.update(
                        { _id: item._id },
                        { $set: { doctorStatus: "waiting" } },
                        function (err) {
                          if (!err) {
                          } else {
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
          });
        }
      }
    });
  },
  null,
  true
);

function cronDelAttchment(req, res) { }

function setReferralStatus(req, res) {
  // Update date time with server date time
  var curDate = new Date();
  if (req.body.lastUpdatedOn) {
    req.body.lastUpdatedOn = curDate;
  }
  if (req.body.lastOperationOn) {
    req.body.lastOperationOn = curDate;
  }
  if (req.body.refToOprTime) {
    req.body.refToOprTime = curDate;
  }
  if (req.body.refByOprTime) {
    req.body.refByOprTime = curDate;
  }

  if (req.body.status == 7) {
    var logData = new logReferral({
      referralId: req.body.id,
      status: req.body.status,
      updatedBy: req.body.updatedBy
    });
    logData.save(function (err, res) {
      if (err) {
      }
    });
    res.json({ code: 200, message: "Status updated successfully" });
  } else {
    referModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body.id) },
      { $set: req.body },
      { fields: { patientInfo: 1 } },
      function (err, data) {
        if (err) {
          res.json({
            code: 401,
            message: "Error in updating status",
            data: {}
          });
        } else {
          var logData = new logReferral({
            referralId: data._id,
            status: req.body.status,
            updatedBy: req.body.updatedBy
          });
          logData.save(function (err, res) {
            if (err) {
            }
          });
          res.json({
            code: 200,
            message: "Status updated successfully",
            data: data
          });
        }
      }
    );
  }
}

function sendAck(req, res) {
  referModel
    .findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body.id) },
      { $set: { acknowledged: true } }
    )
    .populate("referredTo")
    .exec(function (err, data) {
      if (err) {
        res.json({ code: 401, message: "Error in updating", data: {} });
      } else {
        var logData = new logReferral({
          referralId: data._id,
          status: 999,
          updatedBy: data.referredBy
        });
        logData.save(function (err, res) {
          if (err) {
          }
        });
        res.json({
          code: 200,
          message: "Acknowledgement sent to referring doctor.",
          data: { mail: data.referredTo.email, name: data.referredTo.lastname }
        });
      }
    });
}

function sendSms(req, res) {
  if (req.body.phno) {
    // if no country code specified then by default +1 will be used
    if (req.body.phno.split("+").length === 1) {
      req.body.phno = "+1" + req.body.phno;
    }
    smsModel.findOne({ key: req.body.key }, {}, function (err, resp) {
      if (!err) {
        if (resp) {
          var content = utility.replaceString(resp.body, req.body.paramObj);
          utills.sendSMS(req.body.phno, content, function (err, resp) {
            if (!err) {
              res.json({ code: 200, message: "Success", data: resp });
            } else {
              res.json({
                code: 201,
                message: "Unable to process your request.",
                data: err
              });
            }
          });
        }
      } else {
        res.json({ code: 343, message: "Error while sending sms", data: err });
      }
    });
  } else {
    res.json({ code: 201, message: "Unable to process your request." });
  }
}

function getLocationId(req, res) {
  co(function* () {
    let locResData = {};
    locResData = yield utility.getLocationDetails(req.body.location);
    if (utills.notEmpty(locResData))
      res.json({ code: 200, message: "Success", data: locResData });
    else res.json({ code: 201, message: "Unable to process your request." });
  }).then(
    function (value) {
      //console.log(value);
    },
    function (err) {
      res.json({ code: 201, message: err.stack });
    }
  );
}
