const User = require('../models/User');
const Leave = require('../models/Leave');

// --- INTERNAL HELPER (DRY Fix) ---
const checkAdmin = (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return false; // Not admin
  }
  return true; // Is admin
};

exports.listUsers = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return; // Stop if not admin

    const users = await User.find({}, 'name email role leaveBalance createdAt');
    res.json(users);
  } catch(err) {
    res.status(500).json({ message: 'Error listing users', error: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return; // Stop if not admin

    const { id } = req.params;
    const user = await User.findById(id, 'name email role leaveBalance createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const leaves = await Leave.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ user, leaves });
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user details', error: err.message });
  }
};