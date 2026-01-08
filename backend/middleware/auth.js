const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function auth(req, res, next){
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing auth token' });

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    // attach user info (id & role & name) to request
    req.user = { id: decoded.id, role: decoded.role, name: decoded.name };
    // Optionally fetch up-to-date user from DB
    try{
      const u = await User.findById(decoded.id).lean();
      if (u) req.user = { id: String(u._id), role: u.role, name: u.name };
    } catch(e){ /* ignore DB read errors */ }
    return next();
  }catch(err){
    return res.status(401).json({ message: 'Invalid token' });
  }
}