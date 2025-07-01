const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  FullName: { type: String, required: true },
  USN: { type: String, required: true },
  year: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true }
});

module.exports = mongoose.model('login', loginSchema);