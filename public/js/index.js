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
  // console.log('New Message', message);

  // Creating timestamp using moment
  var formattedTime = moment(message.createdAt).format('h:mm a');

  // Render message to screen in ol when a newMessage is emitted by another client and
  // emitted by server
  var li = $('<li></li>');
  li.text(`${message.from} ${formattedTime}: ${message.text}`);
  $('#msgs').append(li);
});

$('#msg-form').on('submit', function (e) {
  // Prevent default form submission
  e.preventDefault();

  var msgTxtBox = $('[name=msg]');
  // Now take the value of form text field and emit that message from client side
  socket.emit('createMessage', {
    from: 'User',
    text: msgTxtBox.val()
  }, function () {
    // Acknowledgment
    // Clearing the message field for better UX
    msgTxtBox.val(' ');
  });
});

// Send location listener
var locationBtn = $('#loc-btn');

locationBtn.on('click', function () {
  // If browser doesn't support geoLocation
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
  };

  // Disable location button after clicked and fetching location is happening
  locationBtn.attr('disabled', 'disabled').text('Sending Location...');

  // Get location of user
  navigator.geolocation.getCurrentPosition(function (position) {
    // Make the location button active again
    locationBtn.removeAttr('disabled').text('Send Location');
    // Emit a message from client side socket to all that will send location via server to all connected peers
    socket.emit('createLocation', {
      longitude: position.coords.longitude,
      latitude: position.coords.latitude
    });
  }, function () {
    locationBtn.removeAttr('disabled').text('Send Location');
    // Error handler
    alert("Cannot fetch your location.");
  });
});

// Listen for location send on client side so that it can
// Recieve location of other user that is emitted by client - server and then server - rest
socket.on('newLocationMessage', function (message) {
  // console.log(locationURL);

  var formattedTime = moment(message.createdAt).format('h:mm a');

  var li = $('<li></li>');
  var a = $('<a target="_blank">My Current Location</a>')
  li.text(`${message.from} ${formattedTime}: `);
  a.attr('href', message.url);
  li.append(a);
  $('#msgs').append(li);
});