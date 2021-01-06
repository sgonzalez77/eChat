const express = require('express');

//to encrypt fields
//to validate users by token
const bcrypt = require('bcrypt');

//to filter fields
const _ = require('underscore');

const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

// User model
const User = require('../models/user');

//Maximum number of users
const MAXUSERS = 100;

// Importing middleware
const {
  verifyToken,
  verifyAdminRole,
} = require('../middlewares/authentication');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/user', verifyToken, (req, res) => {
  //optional parameters go inside req.query
  let from = Number(req.query.from) || 0;
  let limit = Number(req.query.limit) || MAXUSERS;

  let condition = {};
  let keys = 'username email img role enabled google'; //selected keys of the documents

  User.find(condition, keys)
    .skip(from)
    .limit(limit)
    .exec((err, usersDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      User.countDocuments(condition, (err, numDocs) => {
        res.json({
          ok: true,
          users: usersDB,
          numDocs,
        });
      });
    });
});

app.post('/user', [verifyToken, verifyAdminRole], function (req, res) {
  let body = req.body;

  let user = new User({
    username: body.username,
    email: body.email,
    password: bcrypt.hashSync(body.password, saltRounds),
    role: body.role,
  });

  user.save((err, userDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    //200 by default
    //password field is not returned (changed in the model)
    res.json({
      user: userDB,
    });
  });
});

app.put('/user/:id', [verifyToken, verifyAdminRole], function (req, res) {
  let id = req.params.id;
  //field "google" won't be updated
  let selectedFields = ['username', 'email', 'img', 'role', 'enabled'];
  let body = _.pick(req.body, selectedFields);

  //to avoid updating these fields, but we implement it in the model
  //delete body.password
  //delete body.google
  //new:true -> updated field, new:false -> original field
  //runValidators:true -> validate the input of the fields

  User.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true, context: 'query' },
    (err, userDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        user: userDB,
      });
    }
  );
});

app.delete('/user/:id', [verifyToken, verifyAdminRole], function (req, res) {
  let id = req.params.id;

  User.findByIdAndRemove(id, (err, removedUser) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!removedUser) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'User not found',
        },
      });
    }

    res.json({
      ok: true,
      user: removedUser,
    });
  });
});

// ===========================
//  Search users
// ===========================
app.get('/user/search/:term', verifyToken, (req, res) => {
  let term = req.params.term;

  let regex = new RegExp(term, 'i');

  let condition = { $or: [{ username: regex }, { email: regex }] };

  let keys = 'username email img'; //selected keys of the documents

  User.find(condition, keys).exec((err, usersDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      users: usersDB,
    });
    /*
    if no results return:
    {
      "ok": true,
      "users": []
    }
    */
  });
});

module.exports = app;
