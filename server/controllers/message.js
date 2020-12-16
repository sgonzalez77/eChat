const express = require('express');

//to filter fields
const _ = require('underscore');

// Message model
const Message = require('../models/message');

// Importing middleware
const { verifyToken } = require('../middlewares/authentication');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/messages', verifyToken, (req, res) => {
  // //optional parameters go inside req.query
  // let from = Number(req.query.from) || 0;
  // let limit = Number(req.query.limit) || 5;
  // let condition = {};
  // let keys = 'username email img role enabled google'; //selected keys of the documents
  // User.find(condition, keys)
  //   .skip(from)
  //   .limit(limit)
  //   .exec((err, usersDB) => {
  //     if (err) {
  //       return res.status(500).json({
  //         ok: false,
  //         err,
  //       });
  //     }
  //     User.countDocuments(condition, (err, numDocs) => {
  //       res.json({
  //         ok: true,
  //         users: usersDB,
  //         numDocs,
  //       });
  //     });
  //   });
});

app.post('/message', verifyToken, function (req, res) {
  let body = req.body;

  let message = new Message({
    sender: body.sender,
    room: body.room,
    content: body.content,
  });

  message.save((err, messageDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    //200 by default
    //password field is not returned (changed in the model)
    res.json({
      message: messageDB,
    });
  });
});

module.exports = app;
