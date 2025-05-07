const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullName: String,
  company: String,
  jobTitle: String,
  website: String,
  address: String,
});

module.exports = mongoose.model('User', userSchema);
