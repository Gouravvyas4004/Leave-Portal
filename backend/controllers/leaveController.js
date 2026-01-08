const Leave = require('../models/Leave');
const User = require('../models/User');

// --- INTERNAL HELPERS (DRY Fix) ---
// 1. Centralized Role Check
const isManager = (req) => req.user.role === 'manager' || req.user.role === 'admin';

// 2. Safe Cache Retrieval (Get or Set)
const getOrSetCache = async (key, fetchFn, ttl = 30) => {
  try {
    const r = require('../lib/redisClient');
    const cached = await r.getJson(key);
    if (cached) return cached;
  } catch (e) { /* Ignore Redis errors */ }

  const data = await fetchFn();

  try {
    if (data) {
      const r = require('../lib/redisClient');
      await r.setJson(key, data, ttl);
    }
  } catch (e) { /* Ignore Redis errors */ }
  
  return data;
};

// 3. Safe Cache Clearing
const clearCache = (...keys) => {
  try {
    const r = require('../lib/redisClient');
    // Filter out undefined keys and delete in background (don't block response)
    const valid = keys.filter(k => k);
    if (valid.length) {
      valid.forEach(k => {
        r.del(k).catch(e => console.warn('clearCache: failed to delete', k, e && e.message ? e.message : e));
      })
      console.log('clearCache: scheduled invalidation for', valid);
    }
  } catch (e) { /* Ignore Redis errors */ }
};

// --- CONTROLLERS ---

exports.applyLeave = async (req, res) => {
  try {
    const { type, from, to, days, userId: bodyUserId } = req.body;
    // Use helper for role check
    const userId = (isManager(req) && bodyUserId) ? bodyUserId : req.user.id;

    console.log('applyLeave: received request for user', userId, { type, from, to, days });
    const l = new Leave({ userId, type, from, to, days, status: 'pending' });
    await l.save();
    const saved = l.toObject();

    // DRY Cache Invalidation (ensure refreshes see the new data)
    await clearCache(
      'leaves:all', 
      `leaves:user:${userId}`, 
      `leaves:user:${req.user.id}`
    );
    console.log('applyLeave: saved and invalidated cache for user', userId, 'leaveId', saved._id);

    // Add a debug header so the client can confirm receipt
    res.set('X-Debug-Apply', 'ok')
    res.status(201).json({ message: 'Leave applied', leave: saved })
    console.log('applyLeave: response sent for leaveId', saved._id);
  } catch(err) {
    console.error('applyLeave error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Error applying leave', error: err.message });
  }
};

exports.listLeaves = async (req, res) => {
  try {
    const { userId } = req.query;
    const adminView = isManager(req);
    const currentId = req.user.id;
    const force = req.query.force === '1' || req.query.force === 'true';

    // If caller asked to bypass cache, fetch directly from DB
    if (force) {
      console.log('listLeaves: bypassing cache (force=true) for', { userId, currentId, adminView });
      if (adminView) {
        const filter = userId ? { userId } : {};
        const items = await Leave.find(filter)
          .populate('userId', 'name email role')
          .populate('approverId', 'name')
          .lean();
        res.set('X-Cache', 'bypass')
        return res.json(items);
      }
      const items = await Leave.find({ userId: currentId }).lean();
      res.set('X-Cache', 'bypass')
      return res.json(items);
    }

    // Determine Cache Key
    const cacheKey = adminView 
      ? (userId ? `leaves:user:${userId}` : 'leaves:all') 
      : `leaves:user:${currentId}`;

    // DRY Cache Fetch
    const items = await getOrSetCache(cacheKey, async () => {
      if (adminView) {
        const filter = userId ? { userId } : {};
        return await Leave.find(filter)
          .populate('userId', 'name email role')
          .populate('approverId', 'name')
          .lean();
      }
      return await Leave.find({ userId: currentId }).lean();
    }, 20);

    res.json(items);
  } catch(err) {
    res.status(500).json({ message: 'Error listing leaves', error: err.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    if (!isManager(req)) return res.status(403).json({ message: 'Forbidden' });
    
    const { id } = req.params;
    const { reason } = req.body;
    
    const l = await Leave.findById(id);
    if (!l) return res.status(404).json({ message: 'Not found' });
    if (l.status === 'approved') return res.status(400).json({ message: 'Already approved' });
    
    l.status = 'approved';
    l.approverId = req.user.id;
    l.approverReason = reason || '';
    await l.save();
    
    // Update Balance
    const user = await User.findById(l.userId);
    if (user) {
      user.leaveBalance = Math.max(0, (user.leaveBalance || 20) - (l.days || 0));
      await user.save();
    }
    
    const updated = l.toObject();

    // DRY Cache Invalidation (ensure clients see updated leave & balance)
    await clearCache(
      'leaves:all', 
      `leaves:user:${l.userId}`, 
      `balance:user:${l.userId}`
    );
    console.log('approveLeave: updated leave', l._id, 'and cleared cache for user', l.userId);

    res.json({ message: 'Approved', leave: updated });
  } catch(err) {
    res.status(500).json({ message: 'Error approving', error: err.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    if (!isManager(req)) return res.status(403).json({ message: 'Forbidden' });
    
    const { id } = req.params;
    const { reason } = req.body;
    
    const l = await Leave.findById(id);
    if (!l) return res.status(404).json({ message: 'Not found' });
    
    l.status = 'rejected';
    l.approverId = req.user.id;
    l.approverReason = reason || '';
    await l.save();
    
    const updated = l.toObject();

    // DRY Cache Invalidation (ensure immediate refetch returns latest)
    await clearCache('leaves:all', `leaves:user:${l.userId}`);
    console.log('rejectLeave: updated leave', l._id, 'and cleared cache for user', l.userId);

    res.json({ message: 'Rejected', leave: updated });
  } catch(err) {
    res.status(500).json({ message: 'Error rejecting', error: err.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    // Use helper for role logic
    if (req.user.id !== userId && !isManager(req)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const cacheKey = `balance:user:${userId}`;

    // DRY Cache Fetch
    const balance = await getOrSetCache(cacheKey, async () => {
      const user = await User.findById(userId);
      return user ? user.leaveBalance : null;
    }, 30);

    if (balance === null) return res.status(404).json({ message: 'Not found' });
    
    res.json({ userId, balance });
  } catch(err) {
    res.status(500).json({ message: 'Error fetching balance', error: err.message });
  }
};