const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    required: true,
  },
  body: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('SavedRequest', requestSchema);
