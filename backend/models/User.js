const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  leaveBalance: { type: Number, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
