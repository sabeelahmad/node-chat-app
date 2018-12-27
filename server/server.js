const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');

const {generateMessage} = require('./utils/message');
const app = express();
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var server = http.createServer(app);
// Passing the http server to the socket backend as argument
// This creates a web socket server which is stored in the
// 'io' variable, and can be used for any socket functionality on the backend
var io = socketIO(server);

// Serving frontend directory
app.use(express.static(publicPath));

// Event - connection, is a built in event that listens for client connections
// to the Server
// The argument recieved by the callback is similar to the one present at
// the front end, it is the individual socket of the client rather
// than sockets of all clients currently connected
io.on('connection', (socket) => {
  console.log('New user connected!');

  // Emit event for user welcome
  // socket.emit is used since it is for individual user not all
  socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'));

  // Emit event when user joins the chat
  // Brodacast.emit works almost as io.emit but doesn't send the message to curent socket
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user has joined the chat!'));


  // Listening for data from client to server
  socket.on('createMessage', (message) => {
      // as soon as data is recieved we call the emit method on io
      // calling it on io emits the message to all clients not to a single user as
      // in case of socket.emit()
      io.emit('newMessage', generateMessage(message.from, message.text));

      // Connection drop on client side
      // listen for individual socket drop not all
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
  });
});

server.listen(port, () => {
  console.log(`Server up at port ${port}.`);
});
