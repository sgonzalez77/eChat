require('./config/config');

const express = require('express');
const socketIO = require('socket.io');
const http = require('http'); //socket.io

const mongoose = require('mongoose');

const app = express();
let server = http.createServer(app); //socket.io

// const bodyParser = require('body-parser');

//importing the controllers (or routes)
app.use(require('./controllers/index'));

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
// app.use(bodyParser.json());

const path = require('path');

//defining public path
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

//connecting to MongoDB using mongoose
mongoose.connect(
  process.env.URLDB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err, res) => {
    if (err) throw err;

    console.log(`Connected to the database (${process.env.NODE_ENV})`);
  }
);

// IO is the way back-end communicates
module.exports.io = socketIO(server);
require('./sockets/socket');

server.listen(process.env.PORT, () => {
  console.log(
    `Listening to requests on port (${process.env.NODE_ENV}) ${process.env.PORT}`
  );
});
