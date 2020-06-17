"use strict";
const cluster = require("cluster");
const http = require("http");
const https = require("https");
// const numCPUs       = require('os').cpus().length;
const numCPUs = 1;
var SwaggerExpress = require("swagger-express-mw");
var express = require("express");
var helmet = require("helmet");
var path = require("path");
var fs = require("fs");
var app = express();
var bodyParser = require("body-parser");
// var device = require('express-device');
module.exports = app; // for testing
//custom files
require("./config/db");
var utils = require("./api/lib/util");
var utility = require("./api/lib/utility");
var controller = require("./api/controllers/notification_ctrl.js");
var doccontroller = require("./api/controllers/doctor_ctrl.js");
var appconfig;
var confFile;

if (process.env.NODE_ENV != "production") {
  //confFile = '/home/sumanc/config.js'; push this code
  // confFile = "/home/ACO/config/config.js";
  if (process.env.NODE_ENV == undefined) {
    //confFile = '/home/arvindsingh/Projects/MEAN/ACOs_sdgit/config.js';
    // confFile = '/home/sampathyemjala/DayUsers/Sampath/Projects/MEAN-NOWAITDOC/config.js';
    confFile = "./config.js";
  }
} else {
  console.log("\n\n Check production environment.......");
  // confFile = '/home/ubuntu/whichdocs/config/config.js';
  confFile = "/home/ubuntu/appconfig/config.js"; // for development (staging)
  // confFile = '/home/ubuntu/whichdocs/config/config.js'; //for live server (production)
}
app.use(helmet());
app.disable("x-powered-by");
app.use("/images", express.static(path.join(__dirname, "./images")));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/users")));

app.use(express.static(path.join(__dirname, "public/admin")));
app.use(express.static(path.join(__dirname, "public/super-admin")));

app.use(express.static(path.join(__dirname, "public/insurance-admin")));
var config = {
  appRoot: __dirname, // required config
};
// Making the user directory as public i.e everyone can access the stuff of it....
// app.use(device.capture());
// device.enableViewRouting(app);

// app.get('/hello',function(req,res) {
// sss
//     res.send("Hi to "+JSON.stringify(req.device)+" User");
//   });

app.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "public/users/index.html"));
});
app.get("/admin", function (req, res, next) {
  res.sendFile(path.join(__dirname, "public/admin/adminindex.html"));
});

app.get("/super-admin", function (req, res, next) {
  res.sendFile(path.join(__dirname, "public/super-admin/superadminindex.html"));
});

app.get("/insurance-admin", function (req, res, next) {
  res.sendFile(
    path.join(__dirname, "public/insurance-admin/insuranceadminindex.html")
  );
});

// Handle un handle rejection and uncaught exception
process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });

// Read config file
fs.readFile(confFile, "utf8", function read(err, data) {
  if (!err) {
    appconfig = JSON.parse(data);
    SwaggerExpress.create(config, function (err, swaggerExpress) {
      if (err) {
        throw err;
      }
      // Set config details in request object
      app.use(function (req, res, next) {
        req.config = appconfig;
        next();
      });
      // All api requests
      app.use(function (req, res, next) {
        // CORS headers
        res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
        res.header(
          "Access-Control-Allow-Methods",
          "GET,PUT,POST,DELETE,OPTIONS"
        );
        // Set custom headers for CORS
        res.setHeader("Strict-Transport-Security", "max-age=31536000");
        res.setHeader("X-Frame-Options", "sameorigin");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type,Accept,X-Access-Token,X-Key,If-Modified-Since,Authorization"
        );

        if (req.method == "OPTIONS") {
          res.status(200).end();
        } else {
          next();
        }
      });
      // Check to call web services where token is not required //
      app.use("/api/*", function (req, res, next) {
        var freeAuthPath = [
          "/api/userRegister",
          "/api/userLogin",
          "/api/existMember",
          "/api/forgotPassword",
          "/api/adminLogin",
          "/api/insuranceLogin",
          "/api/loggedin",
          "/api/loggedinInsurance",
          "/api/userLogOut",
          "/api/userActivation/*",
          "/api/images",
          "/api/changePass",
          "/api/validateFrontDeskAccess",
          "/api/validateTokenAccess",
          "/api/contactUs",
          "/api/addUserActivity",
          "/api/cronDelAttchment",
          "/api/hello",
        ];
        var available = false;
        for (var i = 0; i < freeAuthPath.length; i++) {
          if (freeAuthPath[i] == req.baseUrl) {
            available = true;
            break;
          }
        }
        if (!available) {
          utils.ensureAuthorized(req, res, next);
        } else {
          next();
        }
      });

      // enable SwaggerUI
      //    app.use(swaggerExpress.runner.swaggerTools.swaggerUi());
      // install middleware
      app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
      app.use(bodyParser.urlencoded({ extended: true }));
      swaggerExpress.register(app);
      var httpPort =
        process.env.PORT || (process.env.NODE_ENV == "production" ? "" : 5069);
      var httpsPort = process.env.PORT || 443;
      console.log("\nprocess.env.NODE_ENV", process.env.NODE_ENV);
      if (process.env.NODE_ENV == "production") {
        // Clustering on production
        if (cluster.isMaster) {
          console.log(`Master process running pid ${process.pid} `);
          // Fork workers.
          for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
          }
          cluster.on("exit", (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            cluster.fork();
          });
        } else {
          //HTTP Connection
          var http_app = express();
          http_app.set("port", httpPort);
          http_app.all("/*", function (req, res, next) {
            if (/^http$/.test(req.protocol)) {
              var host = req.headers.host
                ? req.headers.host.replace(/:[0-9]+$/g, "")
                : appconfig.host; // strip the port # if any
              return res.redirect(301, "https://" + host + req.url);
            } else {
              return next();
            }
          });
          var httpServer = http
            .createServer(http_app)
            .listen(httpPort, function () {
              console.log("process id http server", process.pid);

              console.log("http server started at port " + httpPort);
            });
          //HTTPS Connection
          const options = {
            key: fs.readFileSync("/home/ubuntu/sslcert/nowicancu_com.key"),
            cert: fs.readFileSync("/home/ubuntu/sslcert/2ddc2c4936b9d57c.crt"),
          };
          var httpsServer = https
            .createServer(options, app)
            .listen(httpsPort, function () {
              console.log("process id https server", process.pid);
              console.log("https server started at port " + httpsPort);
            });
          var io = require("socket.io")(httpsServer);
          io.sockets.on("connection", controller.socketIO);
          io.sockets.on("connection", doccontroller.socketIO);
          httpsServer.on("error", function (e) {
            // Handle error
            console.log("Https error: ", e);
          });
        }
      } else {
        var httpServer = http.createServer(app).listen(httpPort, function () {
          console.log("process id local", process.pid);
          console.log("http server started at port " + httpPort);
        });
        var io = require("socket.io")(httpServer);
        io.sockets.on("connection", controller.socketIO);
        io.sockets.on("connection", doccontroller.socketIO);
        httpServer.on("error", function (e) {
          // Handle error
          console.log("Http error: ", e);
        });
      }
    });
  }
});
