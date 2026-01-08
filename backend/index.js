require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leaves');

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', require('./routes/users'));

// Simple health check
app.get('/api/health', (req, res) => res.json({ ok: true, message: 'Leave Portal API healthy', time: Date.now() }))

app.get('/', (req, res) => res.json({ message: 'Leave Portal API (stubbed)'}));

const port = process.env.PORT || 4000;
// Connect to MongoDB Atlas
// const defaultUri = 'mongodb+srv://gouravvyas542_db_user:4gJYsL94aaqtHj73@cluster0.jnjusiv.mongodb.net/?appName=Cluster0'
const mongoUri = process.env.MONGODB_URI

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB Atlas')

    // Initialize Redis (optional) — non-blocking. Logs if unavailable.
    try{
      const { client } = require('./lib/redisClient')
      if (client) {
        // ensure we don't crash if redis is down; connection events are logged by the helper
      }
    }catch(e){ console.warn('Redis init error:', e && e.message ? e.message : e) }

    // Ensure default users exist (admin, manager, employee)
    try{
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      const defaults = [
        { role: 'admin', email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com', name: 'Default Admin', password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin1234!' },
        { role: 'manager', email: process.env.DEFAULT_MANAGER_EMAIL || 'manager@example.com', name: 'Default Manager', password: process.env.DEFAULT_MANAGER_PASSWORD || 'Manager1234!' },
        { role: 'employee', email: process.env.DEFAULT_EMPLOYEE_EMAIL || 'employee@example.com', name: 'Default Employee', password: process.env.DEFAULT_EMPLOYEE_PASSWORD || 'Employee1234!' }
      ]

      for (const d of defaults){
        const exists = await User.findOne({ email: d.email });
        if (!exists){
          const hashed = await bcrypt.hash(d.password, 10);
          const u = new User({ name: d.name, email: d.email, password: hashed, role: d.role });
          await u.save();
          console.log(`Created default ${d.role}: ${d.email} / ${d.password}`);
        }
      }
    }catch(err){
      console.error('Error ensuring default users:', err.message || err);
    }

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message || err);
    // Start server anyway for frontend work, but warn
    app.listen(port, () => {
      console.log(`Server listening on port ${port} (DB connection failed)`);
    });
  });

// NOTE: Redis connection and session storage placeholders can be added later.
