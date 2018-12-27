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

// Send location listener
var locationBtn = $('#loc-btn');

locationBtn.on('click', function () {
  // If browser doesn't support geoLocation
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
  };

  // Get location of user
  navigator.geolocation.getCurrentPosition(function (position) {
    // Emit a message from client side socket to all that will send location via server to all connected peers
    socket.emit('createLocation', {
      longitude: position.coords.longitude,
      latitude: position.coords.latitude
    });
  }, function () {
    // Error handler
    alert("Cannot fetch your location.");
  });
});

// Listen for location send on client side so that it can
// Recieve location of other user that is emitted by client - server and then server - rest
socket.on('newLocationMessage', function (message) {
  // console.log(locationURL);
  var li = $('<li></li>');
  var a = $('<a target="_blank">My Current Location</a>')
  li.text(`${message.from}: `);
  a.attr('href', message.url);
  li.append(a);
  $('#msgs').append(li);
});