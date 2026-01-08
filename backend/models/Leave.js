const mongoose = require('mongoose');

// --- CONSTANTS (Source of Truth) ---
const STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const LEAVE_TYPES = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  CASUAL: 'Casual'
};

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: Object.values(LEAVE_TYPES), // Enforce specific types
    required: true
  },
  from: Date,
  to: Date,
  days: Number,
  status: { 
    type: String, 
    enum: Object.values(STATUSES), 
    default: STATUSES.PENDING 
  },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverReason: String
}, { timestamps: true });

// Export Model
module.exports = mongoose.model('Leave', leaveSchema);

// Export Constants (So Controllers can use Leave.STATUSES.APPROVED)
module.exports.STATUSES = STATUSES;
module.exports.LEAVE_TYPES = LEAVE_TYPES;