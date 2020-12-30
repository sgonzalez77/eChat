Based on UDEMY's course "Node de cero a experto" by Fernando Herrera. Users created in the database can login (token validation) and chat in a general chat room (sockets).

To run it:

```
npm install
node server/server
```

Main characteristic:

- Main chat room with messages stored in a database (if you reload the window or of you login again all the messages will be there).
- Private messages between users (not stored in the databse, so if you reload or relogin eveyrthing will be lost).

TODOs (I wrote them down for me :s)

- Mark minimized windows with unread messages.
- View for users' CRUD.
- Enable Google login.
- Version using MariaDB.
- Version using React.
- Create different chat rooms.
