// The above loaded external script provides us with this func
// This initializes a connection request by the client to the server
var socket = io();

// When connection is established by client with server
socket.on('connect', function() {
    console.log('connected to server');
});

// When connection drops on server end
socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});

// Custom event - client listening for emit of data from server
socket.on('newMessage', function(message) {
  console.log('New Message', message);
});