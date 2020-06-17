'use strict';
var mongoose = require('mongoose'),
    async = require("async"),
    moment = require('moment');
module.exports = function (io, usernames) {
    var users = [];
    var connections = [];
    io.sockets.on('connection', function (socket) {
        connections.push(socket);

        //request to add user to chat system
        socket.on('adduser', function (username) {
            socket.username = username._id;
            usernames[username._id] = socket.id;

        });


        //send msg
        socket.on('broadcast', function (data) {
            
        });

        //new users
        socket.on('new user', function (data, callback) {
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsernames();
        });

        //Get all message
        socket.on('getHistory', function (data) {
            ChatHistory.find({
                $or: [{
                    from: data.from,
                    to: data.to
                    
                }, {
                    from: data.to,
                    to: data.from
                }]
            }).lean().exec(function (err, chatData) {
                if (err) {
                    if (err) console.log(err)
                } else {
                    io.to(usernames[data.from]).emit('getHistory', chatData);
                }
            })
        });

        /**Typing**/
        socket.on('typing', function (typing) {
            // console.log("typing", typing);
            // socket.broadcast.to(typing.to).emit('typing', {
            //     "to": typing.to,
            // });
        });

        /**Stop Typing**/
        socket.on('stop typing', function (stop_typing) {
            // console.log("stop typing", stop_typing);
            // socket.broadcast.to(stop_typing.to).emit('stop typing', {
            //     "to": stop_typing.to
            // });
        });

        /**notify**/
        socket.on('notify', function (notification) {
            // console.log("Notify", notification);// usernames[notification.videoData.receiver_id]
            // io.emit(usernames[notification.videoData.receiver_id]).emit('notify', notification);
            io.emit('notify', notification);
        });

        /**notify Disconnect**/
        socket.on('notify_disconnect', function (notification) {
            // console.log("notify_disconnect", notification);
            // io.emit(usernames[notification.videoData.receiver_id]).emit('notify_disconnect', notification);
            io.emit('notify_disconnect', notification);
        });



    });

    function updateUsernames() {
        // io.sockets.emit('get users', users);
    }

};