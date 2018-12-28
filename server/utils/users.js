// Class for managing users and rooms they are connected to
// We could have used the array based approach and added methods to
// it, but we'll be following ES6 classes to make our code more modern and modular

class Users {
  constructor () {
    // We don't take any args in constructor
    // The users array is intialized to be empty as instance is created when
    // Server is started
    this.users = [];
  }

  // Methods for manipulating out users array
  addUser (id, name, room) {
    var user = {id, name, room};
    this.users.push(user);
    return user;
  }

  removeUser (id) {
    // Find Index of user using id
    var userIndex = this.users.findIndex((user) => {
      return user.id === id;
    });

    if (userIndex !== -1) {
      var removedUser = this.users.splice(userIndex, 1);
      return removedUser[0];
    }
}

  getUser (id) {
    // Find Index of user using id
    var userIndex = this.users.findIndex((user) => {
      return user.id === id;
    });

    return this.users[userIndex];
  }

  getUserList (room) {
    // Filter users on basis of room
    var users = this.users.filter((user) => {
      return user.room === room;
    });

    // Only take out names of the users in the given room
    var userNames = users.map((user) => {
      return user.name;
    });

    return userNames;
  }
};

module.exports = {
  Users
}