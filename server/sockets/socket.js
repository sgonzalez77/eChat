const { io } = require('../server');
const { Users } = require('../classes/users');

const { createMessage } = require('../utils/utils');

const users = new Users();

io.on('connection', (client) => {
  /*
    When a new user is connected his/her data is addded to the users array
    and all the data is broadcasted to all the clients (with an administrator's message
    noticing that)
  */
  client.on('loginChat', (userConnected, callback) => {
    //all the data inside the database of the user in the database
    //arrives here, but we don't have the client id of the socket
    if (!userConnected.username || !userConnected.room) {
      return callback({
        error: true,
        mensaje: 'A chat room is mandatory',
      });
    }

    client.join(userConnected.room);

    users.addUser(
      client.id, //update id and token inside the database?
      userConnected.room,
      userConnected.token,
      userConnected.role,
      userConnected.enabled,
      userConnected.google,
      userConnected._id,
      userConnected.username,
      userConnected.email,
      userConnected.img
    );

    client.broadcast
      .to(userConnected.room)
      .emit('userList', users.getUsersPerRoom(userConnected.room));

    client.broadcast
      .to(userConnected.room)
      .emit(
        'createMessage',
        createMessage(
          'Administrator',
          userConnected.room,
          `${userConnected.username} joins the chat`
        )
      );

    callback(users.getUsersPerRoom(userConnected.room));
  });

  client.on('createMessage', (data, callback) => {
    //Sending the messages to all the clients
    let user = users.getUser(client.id);

    let message = createMessage(user._id, user.room, data.content);

    client.broadcast.to(user.room).emit('createMessage', message);

    callback(message);
  });

  client.on('disconnect', () => {
    let removedUser = users.removeUser(client.id);

    client.broadcast
      .to(removedUser.room)
      .emit(
        'createMessage',
        createMessage(
          'Administrator',
          removedUser.room,
          `${removedUser.username} exits the chat`
        )
      );
    client.broadcast
      .to(removedUser.room)
      .emit('userList', users.getUsersPerRoom(removedUser.room));
  });

  // Private messages (between two users)
  // client.on('privateMissage', (data) => {
  //   let user = users.getUser(client.id);
  //   client.broadcast
  //     .to(data.to)
  //     .emit('privateMissage', createMessage(user.username, data.msgcontent));
  // });
});
