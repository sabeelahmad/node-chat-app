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

  // Render message to screen in ol when a newMessage is emitted by another client and
  // emitted by server
  var li = $('<li></li>');
  li.text(`${message.from}: ${message.text}`);
  $('#msgs').append(li);
});

$('#msg-form').on('submit', function (e) {
  // Prevent default form submission
  e.preventDefault();

  // Now take the value of form text field and emit that message from client side
  socket.emit('createMessage', {
    from: 'User',
    text: $('[name=msg]').val()
  }, function () {
    // Acknowledgment
  });
});