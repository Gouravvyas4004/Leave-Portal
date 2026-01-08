const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  from: Date,
  to: Date,
  days: Number,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverReason: String
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
