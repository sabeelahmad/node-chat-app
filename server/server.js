const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');

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

  // Emitting data from server to client
  socket.emit('newMessage', {
    from: 'mike',
    text: 'Testing data'
  });

  // Listening for data from client to server
  socket.on('createMessage', (newMessage) => {
    console.log('Create Message', newMessage);
  });

  // Connection drop on client side
  // listen for individual socket drop not all
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server up at port ${port}.`);
});
