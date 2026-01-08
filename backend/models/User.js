const mongoose = require('mongoose');

// --- CONSTANTS (Source of Truth) ---
const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin'
};

const DEFAULTS = {
  LEAVE_BALANCE: 20
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { 
    type: String, 
    enum: Object.values(ROLES), // ['employee', 'manager', 'admin']
    default: ROLES.EMPLOYEE 
  },
  leaveBalance: { 
    type: Number, 
    default: DEFAULTS.LEAVE_BALANCE 
  },
  totalLeaveBalance: {
    type: Number,
    default: DEFAULTS.LEAVE_BALANCE
  }
}, { timestamps: true });

// Export Model
module.exports = mongoose.model('User', userSchema);

// Export Constants (So Controllers can use User.ROLES.MANAGER)
module.exports.ROLES = ROLES;
module.exports.DEFAULTS = DEFAULTS;