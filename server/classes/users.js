class Users {
  constructor() {
    this.users = [];
  }

  addUser(id, username, role, enabled, google, img, _id, room, token) {
    let user = {
      id,
      username,
      role,
      enabled,
      google,
      img,
      _id,
      room,
      token,
    };

    this.users.push(user);

    return this.users;
  }

  getUser(id) {
    let user = this.users.filter((user) => user.id === id)[0];

    return user;
  }

  getUsers() {
    return this.users;
  }

  getUsersPerRoom(room) {
    let usersInRoom = this.users.filter((user) => user.room === room);
    return usersInRoom;
  }

  removeUser(id) {
    let removedUser = this.getUser(id);

    this.users = this.users.filter((user) => user.id != id);

    return removedUser;
  }
}

module.exports = {
  Users,
};
