const express = require('express');

//to filter fields
const _ = require('underscore');

// Message model
const Message = require('../models/message');

// Importing middleware
const { verifyToken } = require('../middlewares/authentication');

const { encrypt, decrypt } = require('../utils/crypto');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/messages/:receiver', verifyToken, (req, res) => {
  //optional parameters go inside req.query
  // let from = Number(req.query.from) || 0;
  // let limit = Number(req.query.limit) || 5;
  //loading all the messages, improvement: paged

  let receiver = req.params.receiver;

  let condition = { receiver };
  let keys = 'sender receiver content iv timestamp'; //selected keys of the documents
  Message.find(condition, keys)
    // .skip(from)
    // .limit(limit)
    .exec((err, messagesDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      // for (let msg in messagesDB) {
      //   console.log(msg.toString());
      // }

      messagesDB.forEach((el) => {
        el.content = decrypt({ content: el.content, iv: el.iv });
        el.set('iv', null);
      });

      Message.countDocuments(condition, (err, numDocs) => {
        res.json({
          ok: true,
          messages: messagesDB,
          numDocs,
        });
      });
    });
});

app.post('/message', verifyToken, function (req, res) {
  let body = req.body;
  let encryptedContent = encrypt(body.content);

  let message = new Message({
    sender: body.sender,
    receiver: body.receiver,
    room: body.room,
    content: encryptedContent.content,
    iv: encryptedContent.iv,
    timestamp: body.timestamp,
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
