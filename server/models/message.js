const mongoose = require('mongoose');
//to make more understandable unique email constraint error
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let messageSchema = new Schema({
  sender: {
    type: String,
    required: [true, 'The id of the sender is required'],
  },
  receiver: {
    type: String,
    required: [true, 'A receiver (or chat room) is required'],
  },
  content: {
    type: String,
    required: [true, 'A content for the message is required'],
  },
  iv: {
    // Mandatory for encryption with crypto
    type: String,
    required: [true, 'Mandatory field'],
  },
  timestamp: {
    type: Number, //Decimal128
    required: [true, 'A message must have a timestamp'],
  },
});

module.exports = mongoose.model('Message', messageSchema);
