const mongoose = require('mongoose');
//to make more understandable unique email constraint error
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let messageSchema = new Schema({
  sender: {
    type: String,
    required: [true, 'The id of the sender is required'],
  },
  room: {
    type: String,
    required: [true, 'The chat room is required'],
  },
  content: {
    type: String,
    required: [true, 'A content for the message is required'],
  },
});

module.exports = mongoose.model('Message', messageSchema);
