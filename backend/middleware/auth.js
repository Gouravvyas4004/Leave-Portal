const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- INTERNAL HELPERS (DRY Fix) ---

// 1. Centralized Secret (Should match authController)
const SECRET = process.env.JWT_SECRET || 'devsecret';

// 2. Consistent User Shaper
// Ensures req.user always looks the same whether it comes from Token or DB
const normalizeUser = (source) => ({
  id: String(source._id || source.id),
  role: source.role,
  name: source.name
});

// 3. Token Extractor
const extractToken = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
};

// --- MIDDLEWARE ---

module.exports = async function auth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Missing auth token' });

  try {
    // 1. Verify Token
    const decoded = jwt.verify(token, SECRET);
    
    // 2. Attach basic info from token immediately (Fastest)
    req.user = normalizeUser(decoded);

    // 3. Optionally refresh from DB (More Secure)
    // We ignore errors here so the request can still proceed with token data if DB is down
    try {
      const u = await User.findById(decoded.id).lean();
      if (u) req.user = normalizeUser(u);
    } catch (dbError) { /* Warn silently if needed */ }

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};