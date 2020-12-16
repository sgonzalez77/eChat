const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// User model
const User = require('../models/user');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

// express file-upload puts files inside req.filew

app.put('/upload/:type/:id', function (req, res) {
  let type = req.params.type;
  let id = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: { message: 'No files were uploaded' },
    });
  }

  //upload to diferents foders depending on the type of object
  let validTypes = ['user'];

  if (validTypes.indexOf(type) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Invalid type. Valid types are: ' + validTypes.join(', '),
        type,
      },
    });
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let myFile = req.files.myfile;
  let fileNameSplit = myFile.name.split('.');
  let fileExtension = myFile.name.split('.')[fileNameSplit.length - 1];

  //valid extensions
  let validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

  if (validExtensions.indexOf(fileExtension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          'Invalid extension. Valid extensions are: ' +
          validExtensions.join(', '),
        ext: fileExtension,
      },
    });
  }

  //Change filename, added milliseconds to cheat web browser's cache
  let fileName = `${id}-${new Date().getMilliseconds()}.${fileExtension}`;

  // Use the mv() method to place the file somewhere on your server
  //filename must be the object/document id (i.e. user)
  myFile.mv(`uploads/${type}/${fileName}`, function (err) {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: { message: 'No files were uploaded' },
      });
    }

    //The file was already uploaded
    userPicture(id, res, fileName, type);
  });
});

function userPicture(id, res, fileName, type) {
  User.findById(id, (err, userDB) => {
    if (err) {
      removeFile(fileName, type);
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!userDB) {
      removeFile(fileName, type);
      return res.status(400).json({
        ok: false,
        err: {
          message: 'The user does not exist',
        },
      });
    }

    //delete previous picture (if exists)
    removeFile(userDB.img, type);

    userDB.img = fileName;

    userDB.save((err, savedUser) => {
      res.json({
        ok: true,
        user: savedUser,
        img: fileName,
      });
    });
  });
}

function removeFile(fileName, type) {
  let pathFile = path.resolve(__dirname, `../../uploads/${type}/${fileName}`);

  if (fs.existsSync(pathFile)) {
    fs.unlinkSync(pathFile);
  }
}

module.exports = app;
