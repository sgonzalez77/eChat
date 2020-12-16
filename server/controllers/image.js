const express = require('express');
const fs = require('fs');
const path = require('path');

const { verifyTokenURL } = require('../middlewares/authentication');

const app = express();

app.get('/image/:type/:img', verifyTokenURL, (req, res) => {
  //In the future, verify that the user can only see his/her
  //own image

  let type = req.params.type;
  let img = req.params.img;
  let pathImg = `./uploads/${type}/${img}`;

  let imagePath = path.resolve(__dirname, `../../uploads/${type}/${img}`);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    let noImagePath = path.resolve(
      __dirname,
      '../../public/assets/images/user/no-image.jpg'
    );
    res.sendFile(noImagePath);
  }
});

module.exports = app;
