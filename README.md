Based on UDEMY's course "Node de cero a experto" by Fernando Herrera. Users created in the database can login (token validation) and chat in a general chat room (sockets). The template used for the login screen and the chat room is:

- Template Name: Admin Pro Admin
- Author: Wrappixel

This template was given to students in the course listed above.

To run it locally:

```
npm install
node server/server
```

Deployed to Heroku:

- https://echatborja.herokuapp.com/

Specifications:

- Main chat room with messages stored in a database (if you reload the window or if you log in again, all messages will be there). But in the main room there will be messages stored with a total of 1024 bytes (it is ephimeral!).
- REST API with Express.js in Node.js.
- Connection to MongoDB database (Atlas) using Mongoose.
- Validation using tokens (middleware for authentication).
- User pictures downloaded using authentication with token.
- Messages are encrypted inside the database (and decrypted to show them in the main chat room). Messages stored within the database encrypted/decrypted using Crypto (Source: https://attacomsian.com/blog/nodejs-encrypt-decrypt-data).
- Users' password are hashed (encrypted with no way to decrypt them) using bcrypt.
- Private messages between users (not stored in the database, so if you reload or relogin eveyrthing will be lost).

TODOs (I wrote them down for me :s)

- Make my own screen for the chat.
- Mark minimized windows with unread messages.
- View for users' CRUD.
- Enable Google login.
- Version using MariaDB.
- Version using React.
- Create different chat rooms.
