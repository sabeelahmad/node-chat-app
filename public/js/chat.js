// The above loaded external script provides us with this func
// This initializes a connection request by the client to the server
var socket = io();

function scrollToBottom () {
  // Selectors
  var messages = $('#msgs');
  var newMessage = messages.children('li:last-child');
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
};

// When connection is established by client with server
socket.on('connect', function() {
    // Take data from query string and pass to server
    // By emitting an event for joining a room to which
    // server will listen and handle it
    var params = $.deparam(window.location.search);

    socket.emit('join', params, function (err) {
      // Handle Acknowledgment / error
      if (err) {
        // Alert user
        alert(err);
        // Redirect back to join page
        window.location.href = '/';
      } else {
        console.log('No error');
      }
    });
});

// Custom event - client listening for emit of data from server
socket.on('newMessage', function(message) {
  // console.log('New Message', message);
  // Creating timestamp using moment
  var formattedTime = moment(message.createdAt).format('h:mm a');

  // Render message to screen in ol when a newMessage is emitted by another client and
  // emitted by server
  var template = $('#msg-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  $('#msgs').append(html);

  scrollToBottom();
   // var li = $('<li></li>');
  // li.text(`${message.from} ${formattedTime}: ${message.text}`);
  // $('#msgs').append(li);
});

$('#msg-form').on('submit', function (e) {
  // Prevent default form submission
  e.preventDefault();

  var msgTxtBox = $('[name=msg]');
  // Now take the value of form text field and emit that message from client side
  socket.emit('createMessage', {
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

  var template = $('#location-msg-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    createdAt: formattedTime,
    url: message.url
  });

  $('#msgs').append(html);

  scrollToBottom();
  // var li = $('<li></li>');
  // var a = $('<a target="_blank">My Current Location</a>')
  // li.text(`${message.from} ${formattedTime}: `);
  // a.attr('href', message.url);
  // li.append(a);
  // $('#msgs').append(li);
});

// Refreshing userList
socket.on('updateUserList', function (users) {
  // Create an ordered list of users
  var ol = $('<ol></ol>');

  // Iterate over the users currently in room
  users.forEach(function(user) {
    // Add li to ol
    ol.append($('<li></li>').text(user));
  });

  // Change html of users in dom (not just append)
  $('#users').html(ol);
});

// When connection drops on server end
socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});