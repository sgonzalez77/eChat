const express = require('express');
const fs = require('fs');
const path = require('path');

const { verifyTokenURL } = require('../middlewares/authentication');

const app = express();

app.get('/session/', verifyTokenURL, (req, res) => {
  //In the future, verify that the user can only see his/her
  //own image

  let token = req.params.token;

  res.json({
    ok: true,
    user: req.user,
  });
});

module.exports = app;
