const mongoose = require('mongoose');
//to make more understandable unique email constraint error
const uniqueValidator = require('mongoose-unique-validator');

let validRoles = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} is not a valid role',
};

let Schema = mongoose.Schema;

let userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'The username field is required'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'The email field is required'],
  },
  password: {
    type: String,
    required: [true, 'The password field is required'],
  },
  img: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    default: 'USER_ROLE',
    enum: validRoles,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  google: {
    type: Boolean,
    default: false,
  },
  img: {
    type: String,
    required: false,
  },
});

//hide password field
userSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;

  return userObject;
};

userSchema.plugin(uniqueValidator, { message: '{PATH} already used' });

module.exports = mongoose.model('User', userSchema);
