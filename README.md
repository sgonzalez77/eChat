Based on UDEMY's course "Node de cero a experto" by Fernando Herrera. Users created in the database can login (token validation) and chat in a general chat room (sockets).

To run it:

```
npm install
node server/server
```

TODOs (I wrote them down for me :s)

- [x] Messages stored in the DB
- Messages encrypted in the database
- User may login only a single time simultaniously with the same account
- Pop up for direct messages
- Implement classes for users in the client
- View for users CRUD
- Enable Google login
- Version using MariaDB
- Version using React
- Create chat rooms
- Use socket.io only to notify clients to read a new message from the database, less performance but clearer code
