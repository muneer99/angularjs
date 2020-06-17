'use strict';
const cluster       = require('cluster');
const http          = require('http');
const https         = require('https');
// const numCPUs       = require('os').cpus().length;
const numCPUs       = 1;
var SwaggerExpress  = require('swagger-express-mw');
var express         = require('express');
var helmet          = require('helmet'); 
var path            = require('path');
var fs              = require('fs');
var app             = express();
var bodyParser      = require('body-parser');
module.exports      = app; // for testing
//custom files
require('./config/db');
var utils = require('./api/lib/util');
var utility = require('./api/lib/utility');
var controller = require('./api/controllers/notification_ctrl.js');  
var doccontroller = require('./api/controllers/doctor_ctrl.js');  
var appconfig;
var confFile;

if(process.env.NODE_ENV != 'production'){
    confFile = '/home/sumanc/config.js';
}else {
    confFile = '/home/ubuntu/whichdocs/config/config.js';
}
app.use(helmet());
app.disable('x-powered-by'); 
app.use('/images', express.static(path.join(__dirname, './images')));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/users')));

app.use(express.static(path.join(__dirname, 'public/admin')));
app.use(express.static(path.join(__dirname, 'public/super-admin')));
var config = {
    appRoot: __dirname // required config
};
// Making the user directory as public i.e everyone can access the stuff of it....

app.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, 'public/users/index.html'));
});
app.get('/admin', function (req, res, next) {
    res.sendFile(path.join(__dirname, 'public/admin/adminindex.html'));
});

app.get('/super-admin', function (req, res, next) {
    res.sendFile(path.join(__dirname, 'public/super-admin/superadminindex.html'));
});

// Handle un handle rejection and uncaught exception
process.on('unhandledRejection', (reason, p) => {
console.error(reason, 'Unhandled Rejection at Promise', p);
}).on('uncaughtException', err => {
console.error(err, 'Uncaught Exception thrown');
process.exit(1);
});

// Read config file 
fs.readFile(confFile, "utf8",  function read(err, data) {
    if (!err) {
        appconfig = JSON.parse(data);
        SwaggerExpress.create(config, function (err, swaggerExpress) {
            if (err) {
                throw err;
            }
            // Set config details in request object
            app.use(function (req, res, next) {
              req.config = appconfig
              next()
            })
            // All api requests
            app.use(function (req, res, next) {
                // CORS headers
                res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                // Set custom headers for CORS
                res.setHeader("Strict-Transport-Security", "max-age=31536000");
                res.setHeader("X-Frame-Options", "sameorigin");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("Pragma", "no-cache");
                res.setHeader("Expires", "0");
                res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token,X-Key,If-Modified-Since,Authorization');
                
                if (req.method == 'OPTIONS') {
                    res.status(200).end();
                } else {
                    next();
                }
            });

            // Check to call web services where token is not required //
            app.use('/api/*', function (req, res, next) {

                var freeAuthPath = [
                    '/api/userRegister',
                    '/api/userLogin',
                    '/api/existMember',
                    '/api/forgotPassword',
                    '/api/adminLogin',
                    '/api/loggedin',
                    '/api/userLogOut',
                    '/api/userActivation/*',
                    '/api/images',
                    '/api/changePass',
                    '/api/validateFrontDeskAccess',
                    '/api/contactUs',
                    '/api/addUserActivity',
                    '/api/cronDelAttchment'
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
            app.use(swaggerExpress.runner.swaggerTools.swaggerUi());

            // install middleware
            app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
            app.use(bodyParser.urlencoded({ extended: true }));

            swaggerExpress.register(app);
            var httpPort = process.env.PORT || ((process.env.NODE_ENV == 'production')?'80':5068);
            var httpsPort = process.env.PORT || 443;
            if (process.env.NODE_ENV == 'production') {
                // Clustering on production
                if (cluster.isMaster) {
                  console.log(`Master process running pid ${process.pid} `);
                  // Fork workers.
                  for (let i = 0; i < numCPUs; i++) {
                    cluster.fork();
                  }
                  cluster.on('exit', (worker, code, signal) => {
                    console.log(`worker ${worker.process.pid} died`);
                    cluster.fork();
                  });
                } else {
                    //HTTP Connection
                    var http_app = express();
                    http_app.set('port', httpPort);
                    http_app.all('/*', function (req, res, next) {
                        if (/^http$/.test(req.protocol)) {
                            var host = (req.headers.host)?req.headers.host.replace(/:[0-9]+$/g, ""):appconfig.host; // strip the port # if any
                            return res.redirect(301, "https://" + host + req.url);
                        } else {
                            return next();
                        }
                    });
                    var httpServer = http.createServer(http_app).listen(httpPort, function () {
                        console.log('process id http server', process.pid)

                        console.log("http server started at port " + httpPort);
                    });
                    //HTTPS Connection
                    const options = {
                        key: fs.readFileSync('/home/nw-admin/ssl/whichdocs.key'),
                        cert: fs.readFileSync('/home/nw-admin/ssl/d68513561792ed5e.crt')
                    };
                    var httpsServer = https.createServer(options, app).listen(httpsPort, function() {
                        console.log('process id https server', process.pid)
                        console.log("https server started at port " + httpsPort);
                    });
                    var io = require('socket.io')(httpsServer);
                    io.sockets.on('connection', controller.socketIO );
                    io.sockets.on('connection', doccontroller.socketIO );
                    httpsServer.on('error', function(e) {
                        // Handle error 
                        console.log('Https error: ', e);
                    });
                }
            } else {
                var httpServer = http.createServer(app).listen(httpPort, function () {
                    console.log('process id local', process.pid)
                    console.log("http server started at port " + httpPort);
                });
                var io = require('socket.io')(httpServer); 
                io.sockets.on('connection', controller.socketIO );     
                io.sockets.on('connection', doccontroller.socketIO );
                httpServer.on('error', function (e) {
                    // Handle error 
                    console.log('Http error: ', e);
                });
            }
        });

    }
});