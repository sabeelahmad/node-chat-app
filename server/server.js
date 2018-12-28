const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');

const {Users} = require('./utils/users');
const {isRealString} = require('./utils/validation');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const app = express();
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var server = http.createServer(app);
// Passing the http server to the socket backend as argument
// This creates a web socket server which is stored in the
// 'io' variable, and can be used for any socket functionality on the backend
var io = socketIO(server);
// Instance of users class - Intialize app with empty array
var users = new Users();

// Serving frontend directory
app.use(express.static(publicPath));

// Event - connection, is a built in event that listens for client connections
// to the Server
// The argument recieved by the callback is similar to the one present at
// the front end, it is the individual socket of the client rather
// than sockets of all clients currently connected
io.on('connection', (socket) => {
  console.log('New user connected!');

  socket.on('join', (params, callback) => {
    // Validation
    if (!isRealString(params.name) || !isRealString(params.room)) {
      // Acknowledgment with error
      return callback('Name and room name are required.');
    }

    // Make the user join the room
    socket.join(params.room);
    // Remove user from any other room before adding to new room
    users.removeUser(socket.id);
    // Add user to userList
    users.addUser(socket.id, params.name, params.room);

    // Emit the new user list to the client side for rendering
    // But emit to only the room of which the user is part of not all rooms
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));

    // Emit event for user welcome
    // socket.emit is used since it is for individual user not all
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'));

    // Emit event when user joins the chat
    // Emits to all users except current (only if in same room)
    // Brodacast.emit works almost as io.emit but doesn't send the message to curent socket
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin',` ${params.name} has joined the chat!`));

    // Everythin went well
    callback();
  });

  // Listen for location send event by any connected user and then emit it to all users
  socket.on('createLocation', (coords) => {
    io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
  });


  // Listening for data from client to server
  socket.on('createMessage', (message, callback) => {
      // as soon as data is recieved we call the emit method on io
      // calling it on io emits the message to all clients not to a single user as
      // in case of socket.emit()
      io.emit('newMessage', generateMessage(message.from, message.text));

      // Sending Acknowledgment to client that server has got the data
      callback('Got it from the server');
    });
      // Connection drop on client side
      // listen for individual socket drop not all
      socket.on('disconnect', () => {
        // Drop user from user list
        var user = users.removeUser(socket.id);

        // if any such user is found
        if (user) {
          // Update user list emit event
          io.to(user.room).emit('updateUserList', users.getUserList(user.room));
          // Emit message that user has left
          io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the chat.`));
        }
      });
});

server.listen(port, () => {
  console.log(`Server up at port ${port}.`);
});
