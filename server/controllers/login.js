const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const app = express();

app.post('/login', (req, res) => {
  let body = req.body;

  User.findOne({ username: body.username }, (err, userDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!userDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Wrong user/password',
        },
      });
    }

    if (!bcrypt.compareSync(body.password, userDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Wrong user/password',
        },
      });
    }

    let token = jwt.sign(
      {
        user: userDB,
      },
      process.env.SEED,
      {
        expiresIn: process.env.TOKEN_EXPIRATION,
      }
    );

    res.json({
      ok: true,
      user: userDB,
      token,
    });
  });
});

module.exports = app;
