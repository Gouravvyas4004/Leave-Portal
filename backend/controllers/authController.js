const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// --- INTERNAL HELPER (DRY Fix) ---
const signToken = (user) => {
  return jwt.sign(
    { id: String(user._id), role: user.role, name: user.name }, 
    process.env.JWT_SECRET || 'devsecret', 
    { expiresIn: '8h' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: String(user._id), name: user.name, email: user.email, role: user.role, leaveBalance: user.leaveBalance, totalLeaveBalance: user.totalLeaveBalance } });
  } catch (err) {
    console.error('auth.login error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, role: role || 'employee' });
    await newUser.save();

    const token = signToken(newUser);
    res.status(201).json({ token, user: { id: String(newUser._id), email: newUser.email, name: newUser.name, role: newUser.role, leaveBalance: newUser.leaveBalance, totalLeaveBalance: newUser.totalLeaveBalance } });
  } catch (err) {
    console.error('auth.register error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out (stateless JWT)' });
};