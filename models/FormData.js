const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  media: String,  
});

module.exports = mongoose.model('FormData', formDataSchema);
